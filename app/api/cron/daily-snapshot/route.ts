import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { logEvent } from "@/lib/monitoring";
import { createServiceClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MRR_PRO = 297;
const MRR_AGENCY = 997;

function yesterdayUtcDateString(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function nextDayUtc(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString();
}

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

  const dateStr = yesterdayUtcDateString();
  const dayStart = `${dateStr}T00:00:00.000Z`;
  const dayEnd = nextDayUtc(dateStr);

  const { data: activeUsers } = await supabase
    .from("users")
    .select("plan")
    .in("subscription_status", ["active", "trialing"]);

  const paying =
    activeUsers?.filter((u) => u.plan === "pro" || u.plan === "agency") ?? [];

  const mrr = paying.reduce(
    (a, u) => a + (u.plan === "agency" ? MRR_AGENCY : MRR_PRO),
    0
  );

  const { count: newSubscribers } = await supabase
    .from("financial_events")
    .select("*", { count: "exact", head: true })
    .eq("type", "subscription_created")
    .gte("created_at", dayStart)
    .lt("created_at", dayEnd);

  const { count: churnedSubscribers } = await supabase
    .from("financial_events")
    .select("*", { count: "exact", head: true })
    .eq("type", "subscription_canceled")
    .gte("created_at", dayStart)
    .lt("created_at", dayEnd);

  const { count: totalAnalyses } = await supabase
    .from("reports")
    .select("*", { count: "exact", head: true })
    .gte("created_at", dayStart)
    .lt("created_at", dayEnd);

  const { data: latencyRows } = await supabase
    .from("reports")
    .select("latency_ms")
    .gte("created_at", dayStart)
    .lt("created_at", dayEnd);

  const avgLatencyMs =
    latencyRows && latencyRows.length > 0
      ? Math.round(
          latencyRows.reduce((a, r) => a + (typeof r.latency_ms === "number" ? r.latency_ms : 0), 0) /
            latencyRows.length
        )
      : 0;

  const { error: upErr } = await supabase.from("daily_metrics").upsert(
    {
      date: dateStr,
      mrr,
      new_subscribers: newSubscribers ?? 0,
      churned_subscribers: churnedSubscribers ?? 0,
      total_active_subscribers: paying.length,
      total_analyses: totalAnalyses ?? 0,
      free_to_paid_conversions: 0,
      api_error_rate: 0,
      avg_latency_ms: avgLatencyMs,
    },
    { onConflict: "date" }
  );

  if (upErr) {
    await logEvent("cron_daily_snapshot_failed", { message: upErr.message, date: dateStr }, "error");
    return NextResponse.json({ error: "persist_failed" }, { status: 500 });
  }

  await logEvent("cron_daily_snapshot_ok", { date: dateStr, mrr }, "info");
  return NextResponse.json({
    date: dateStr,
    mrr,
    new_subscribers: newSubscribers ?? 0,
    churned_subscribers: churnedSubscribers ?? 0,
    total_active_subscribers: paying.length,
    total_analyses: totalAnalyses ?? 0,
    avg_latency_ms: avgLatencyMs,
  });
}
