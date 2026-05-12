import { NextResponse } from "next/server";
import { requireCronAuth } from "@/lib/cron-auth";
import { deliverTransactionalEmail } from "@/lib/email-delivery";
import { logEvent } from "@/lib/monitoring";
import { createServiceClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const { data: rows, error: qErr } = await supabase
    .from("email_queue")
    .select("id, to_email, template, data, send_at, status")
    .eq("status", "pending")
    .limit(100);

  if (qErr) {
    await logEvent("cron_email_queue_select_failed", { message: qErr.message }, "error");
    return NextResponse.json({ error: "database_error" }, { status: 503 });
  }

  const now = Date.now();
  const pending = (rows ?? [])
    .filter((j) => !j.send_at || new Date(j.send_at).getTime() <= now)
    .slice(0, 50);

  let sent = 0;
  let failed = 0;

  for (const job of pending) {
    const data = (job.data && typeof job.data === "object" ? job.data : {}) as Record<
      string,
      unknown
    >;
    const result = await deliverTransactionalEmail({
      to: job.to_email,
      template: job.template,
      data,
    });

    if (result.ok) {
      const { error: uErr } = await supabase
        .from("email_queue")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", job.id);
      if (uErr) {
        await logEvent(
          "cron_email_queue_update_failed",
          { id: job.id, message: uErr.message },
          "error"
        );
        failed++;
      } else {
        sent++;
      }
    } else {
      await supabase.from("email_queue").update({ status: "failed" }).eq("id", job.id);
      await logEvent(
        "cron_email_deliver_failed",
        { id: job.id, template: job.template, message: result.message },
        "warning"
      );
      failed++;
    }
  }

  return NextResponse.json({ attempted: pending.length, sent, failed });
}
