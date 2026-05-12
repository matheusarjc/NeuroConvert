import Anthropic from "@anthropic-ai/sdk";
import FirecrawlApp from "@mendable/firecrawl-js";
import { NextRequest, NextResponse } from "next/server";
import { sendSlackAlert } from "@/lib/alerts";
import { sendEmail } from "@/lib/email";
import { logEvent } from "@/lib/monitoring";
import { parseNeuroReportFromModelText } from "@/lib/report-json";
import { createServiceClient } from "@/lib/supabase/admin";
import { analyzeRequestSchema } from "@/schemas/analyze-request";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-20250514";

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

  const { url, sector, ctx, userId } = parsed.data;

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, email, plan, credits_remaining, subscription_status")
    .eq("id", userId)
    .single();

  if (userErr?.code === "PGRST116" || !user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  const u = user as UserRow;

  if (u.credits_remaining < 1) {
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
    const msg = e instanceof Error ? e.message : "unknown";
    await logEvent(
      "analysis_claude_failed",
      { url, sector, userId, message: msg },
      "critical"
    );
    await sendSlackAlert(`NeuroConvert: falha Claude em /api/analyze`, {
      url,
      userId,
      message: msg,
    });
    return NextResponse.json(
      { error: "analysis_failed", message: "Falha ao gerar laudo" },
      { status: 502 }
    );
  }

  const latencyMs = Date.now() - startTime;

  const { data: inserted, error: insertErr } = await supabase
    .from("reports")
    .insert({
      user_id: userId,
      url,
      sector,
      score: report.score,
      report_json: report,
      scraping_ok: scrapingOk,
      latency_ms: latencyMs,
    })
    .select("id")
    .single();

  if (insertErr || !inserted?.id) {
    await logEvent(
      "analysis_report_insert_failed",
      { userId, url, message: insertErr?.message },
      "critical"
    );
    await sendSlackAlert(`NeuroConvert: falha ao gravar report`, {
      userId,
      url,
      message: insertErr?.message,
    });
    return NextResponse.json(
      { error: "persist_failed", message: "Não foi possível guardar o laudo" },
      { status: 500 }
    );
  }

  const { error: updateErr } = await supabase
    .from("users")
    .update({ credits_remaining: u.credits_remaining - 1 })
    .eq("id", userId);

  if (updateErr) {
    await supabase.from("reports").delete().eq("id", inserted.id);
    await logEvent(
      "analysis_credit_update_failed",
      { userId, url, message: updateErr.message },
      "critical"
    );
    await sendSlackAlert(`NeuroConvert: falha ao debitar crédito`, {
      userId,
      message: updateErr.message,
    });
    return NextResponse.json(
      { error: "persist_failed", message: "Não foi possível atualizar créditos" },
      { status: 500 }
    );
  }

  await logEvent("analysis_completed", {
    userId,
    url,
    sector,
    score: report.score,
    latencyMs,
    scrapingOk,
    creditsAfter: u.credits_remaining - 1,
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
