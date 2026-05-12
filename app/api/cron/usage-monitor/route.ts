import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { logEvent } from "@/lib/monitoring";
import { createServiceClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MRR_PRO = 297;
const MRR_AGENCY = 997;

export async function GET(req: Request) {
  const denied = requireCronAuth(req);
  if (denied) return denied;

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "Supabase não configurado" },
      { status: 503 }
    );
  }

  const startOfMonth = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const startIso = startOfMonth.toISOString();
  const lastHour = new Date(Date.now() - 3_600_000).toISOString();

  const alerts: string[] = [];
  const usage: Record<string, unknown> = {};

  const { count: scrapes } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startIso)
    .eq("scraping_ok", true);

  usage.firecrawl_scrapes = scrapes ?? 0;
  if ((scrapes ?? 0) >= 475) {
    alerts.push("CRÍTICO: Firecrawl próximo do limite free (scrapes no mês).");
  } else if ((scrapes ?? 0) >= 400) {
    alerts.push("AVISO: Firecrawl alto este mês — planear upgrade.");
  }

  const { count: emails } = await supabase
    .from("email_queue")
    .select("*", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("created_at", startIso);

  usage.resend_emails = emails ?? 0;
  if ((emails ?? 0) >= 2800) {
    alerts.push("CRÍTICO: volume de emails enviados alto (Resend).");
  } else if ((emails ?? 0) >= 2400) {
    alerts.push("AVISO: emails enviados a aproximar-se do limite.");
  }

  const { count: totalReports } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", startIso);

  const apiCostUSD = (totalReports ?? 0) * 0.021;
  usage.api_cost_usd = apiCostUSD.toFixed(2);
  if (apiCostUSD > 100) {
    alerts.push("AVISO: custo estimado Claude API elevado este mês.");
  }

  const { data: latencyRows } = await supabase
    .from("reports")
    .select("latency_ms")
    .gte("created_at", lastHour);

  const avgLatency =
    latencyRows && latencyRows.length > 0
      ? Math.round(
          latencyRows.reduce(
            (a, r) => a + (typeof r.latency_ms === "number" ? r.latency_ms : 0),
            0
          ) / latencyRows.length
        )
      : 0;
  usage.avg_latency_ms = avgLatency;
  if (avgLatency > 35_000) {
    alerts.push("CRÍTICO: latência média alta na última hora.");
  }

  const { data: activeUsers } = await supabase
    .from("users")
    .select("plan")
    .in("subscription_status", ["active", "trialing"]);

  const mrr =
    activeUsers?.reduce(
      (a, u) => a + (u.plan === "agency" ? MRR_AGENCY : u.plan === "pro" ? MRR_PRO : 0),
      0
    ) ?? 0;
  const apiCostBRL = apiCostUSD * 5.8;
  const infraCost = apiCostBRL + 100 + 150 + 50 + 500;
  const margin = mrr > 0 ? ((mrr - infraCost) / mrr) * 100 : 0;
  usage.mrr = mrr;
  usage.infra_cost_brl = infraCost.toFixed(0);
  usage.gross_margin_pct = margin.toFixed(1);

  if (margin < 70 && mrr > 0) {
    alerts.push("AVISO: margem bruta estimada abaixo de 70%.");
  }

  if (alerts.length > 0) {
    const severity = alerts.some((a) => a.startsWith("CRÍTICO")) ? "error" : "warning";
    await logEvent("usage_monitor", { alerts, usage }, severity);
  } else {
    await logEvent("usage_monitor", { alerts: [], usage }, "info");
  }

  return NextResponse.json({
    checked_at: new Date().toISOString(),
    alerts_count: alerts.length,
    alerts,
    usage,
  });
}
