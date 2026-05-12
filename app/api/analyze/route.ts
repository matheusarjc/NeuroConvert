import Anthropic from "@anthropic-ai/sdk";
import FirecrawlApp from "@mendable/firecrawl-js";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { sendEmail } from "@/lib/email";
import { logEvent } from "@/lib/monitoring";
import { parseNeuroReportFromModelText } from "@/lib/report-json";
import { createServiceClient } from "@/lib/supabase/admin";
import { analyzeRequestSchema } from "@/schemas/analyze-request";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";

function allowBodyUserId(): boolean {
  return process.env.ANALYZE_ALLOW_BODY_USER_ID === "true";
}

function bearerToken(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  return h.slice(7).trim() || null;
}

const NEURO_PROMPT = (url: string, sector: string, content: string, ctx: string) => `
Você é especialista em neuromarketing com 15 anos de experiência em conversão digital.

URL: ${url} | Setor: ${sector}
Contexto: ${ctx || "Não fornecido"}

CONTEÚDO REAL DA PÁGINA:
${content.slice(0, 6000)}

REGRAS: Use o conteúdo real. Cite princípios: Lei de Hick, Von Restorff, FOMO,
Ancoragem, Prova Social, Enquadramento, Fluência Cognitiva, Gestalt, Código Reptiliano.

Retorne APENAS JSON:
{
  "score": <0-100>, "score_label": "<Fraco|Regular|Bom|Excelente>",
  "benchmark": "<benchmark do setor>", "headline": "<achado principal>",
  "sections": [
    { "title": "Primeira Impressão (0-3s)", "icon": "eye",
      "severity": "<critical|warning|good>", "finding": "...", "science": "..." },
    { "title": "Gatilhos de Persuasão", "icon": "brain",
      "severity": "...", "finding": "...", "science": "..." },
    { "title": "Psicologia de Cores", "icon": "palette",
      "severity": "...", "finding": "...", "science": "..." },
    { "title": "CTAs e Decisão", "icon": "pointer",
      "severity": "...", "finding": "...", "science": "..." },
    { "title": "Carga Cognitiva", "icon": "cpu",
      "severity": "...", "finding": "...", "science": "..." }
  ],
  "quick_wins": [
    { "rank": 1, "action": "...", "science": "...", "impact": "<+X%>" },
    { "rank": 2, "action": "...", "science": "...", "impact": "..." },
    { "rank": 3, "action": "...", "science": "...", "impact": "..." }
  ]
}`;

type UserRow = {
  id: string;
  email: string;
  plan: string;
  credits_remaining: number;
  subscription_status: string | null;
};

type RpcCompleteResult = { report_id: string; credits_after: number };

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "Supabase não configurado" },
      { status: 503 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "ANTHROPIC_API_KEY em falta" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = analyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { url, sector, ctx, userId: bodyUserId } = parsed.data;

  if (allowBodyUserId() && !bodyUserId) {
    return NextResponse.json(
      { error: "validation_error", message: "userId obrigatório quando ANALYZE_ALLOW_BODY_USER_ID=true" },
      { status: 422 }
    );
  }

  let userId: string;
  if (allowBodyUserId()) {
    userId = bodyUserId as string;
  } else {
    const token = bearerToken(req);
    if (!token) {
      return NextResponse.json(
        {
          error: "unauthorized",
          message: "Envie Authorization: Bearer <access_token> do Supabase Auth",
        },
        { status: 401 }
      );
    }
    const {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser(token);
    if (authErr || !authUser) {
      return NextResponse.json(
        { error: "unauthorized", message: "Token inválido ou expirado" },
        { status: 401 }
      );
    }
    if (bodyUserId && bodyUserId !== authUser.id) {
      return NextResponse.json(
        { error: "userId_mismatch", message: "userId do corpo não coincide com o utilizador autenticado" },
        { status: 403 }
      );
    }
    userId = authUser.id;
  }

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, email, plan, credits_remaining, subscription_status")
    .eq("id", userId)
    .single();

  if (userErr?.code === "PGRST116") {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  if (userErr) {
    await logEvent(
      "analysis_user_fetch_failed",
      { code: userErr.code, message: userErr.message },
      "error"
    );
    return NextResponse.json(
      { error: "database_unavailable", message: "Não foi possível validar o utilizador" },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const u = user as UserRow;

  if (u.plan !== "agency" && u.credits_remaining < 1) {
    return NextResponse.json({ error: "no_credits" }, { status: 402 });
  }

  const firecrawlKey = process.env.FIRECRAWL_API_KEY;
  let pageContent = "";
  let scrapingOk = true;

  if (firecrawlKey) {
    try {
      const firecrawl = new FirecrawlApp({ apiKey: firecrawlKey });
      const scraped = await firecrawl.scrapeUrl(url, { formats: ["markdown"] });
      if (scraped && "success" in scraped && scraped.success === true) {
        pageContent = scraped.markdown ?? "";
      } else {
        scrapingOk = false;
        pageContent =
          "Conteúdo indisponível (Firecrawl). Analise pela URL e setor.";
        await logEvent(
          "firecrawl_scrape_failed",
          {
            url,
            err:
              scraped && "error" in scraped
                ? String(scraped.error)
                : "unknown",
          },
          "warning"
        );
      }
    } catch (e) {
      scrapingOk = false;
      pageContent = "Conteúdo indisponível. Analise pela URL e setor.";
      await logEvent(
        "firecrawl_scrape_exception",
        { url, message: e instanceof Error ? e.message : "unknown" },
        "warning"
      );
    }
  } else {
    scrapingOk = false;
    pageContent =
      "FIRECRAWL_API_KEY não configurada. Analise apenas com URL e setor.";
    await logEvent("firecrawl_disabled", { url }, "warning");
  }

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let report;
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        { role: "user", content: NEURO_PROMPT(url, sector, pageContent, ctx ?? "") },
      ],
    });
    const block = response.content[0];
    const text = block?.type === "text" ? block.text : "";
    if (!text) {
      throw new Error("Resposta Claude sem bloco de texto");
    }
    report = parseNeuroReportFromModelText(text);
  } catch (e) {
    if (e instanceof ZodError) {
      await logEvent(
        "analysis_report_schema_failed",
        { url, sector, issues: e.flatten() },
        "critical"
      );
      return NextResponse.json(
        { error: "invalid_report_shape", message: "Resposta da IA não corresponde ao formato esperado" },
        { status: 502 }
      );
    }
    const msg = e instanceof Error ? e.message : "unknown";
    await logEvent(
      "analysis_claude_failed",
      { url, sector, message: msg },
      "critical"
    );
    return NextResponse.json(
      { error: "analysis_failed", message: "Falha ao gerar laudo" },
      { status: 502 }
    );
  }

  const latencyMs = Date.now() - startTime;

  const { data: rpcRaw, error: rpcErr } = await supabase.rpc("complete_analysis", {
    p_user_id: userId,
    p_url: url,
    p_sector: sector,
    p_score: report.score,
    p_report_json: report,
    p_scraping_ok: scrapingOk,
    p_latency_ms: latencyMs,
  });

  if (rpcErr) {
    const m = rpcErr.message ?? "";
    if (m.includes("user_not_found")) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }
    if (m.includes("no_credits")) {
      return NextResponse.json({ error: "no_credits" }, { status: 402 });
    }
    await logEvent(
      "analysis_complete_analysis_rpc_failed",
      { message: rpcErr.message, code: rpcErr.code },
      "critical"
    );
    return NextResponse.json(
      { error: "persist_failed", message: "Não foi possível guardar o laudo" },
      { status: 500 }
    );
  }

  const rpcPayload = rpcRaw as RpcCompleteResult | null;
  const creditsAfter =
    rpcPayload && typeof rpcPayload === "object" && "credits_after" in rpcPayload
      ? Number((rpcPayload as RpcCompleteResult).credits_after)
      : u.plan === "agency"
        ? u.credits_remaining
        : u.credits_remaining - 1;

  await logEvent("analysis_completed", {
    url,
    sector,
    score: report.score,
    latencyMs,
    scrapingOk,
    creditsAfter,
  });

  if (u.plan === "free" && u.credits_remaining === 1) {
    await sendEmail({
      to: u.email,
      template: "free_limit_reached",
      data: { score: report.score, url },
    });
  }

  return NextResponse.json({ report });
}
