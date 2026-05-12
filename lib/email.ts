import { createServiceClient } from "@/lib/supabase/admin";
import { logEvent } from "@/lib/monitoring";

export type EmailTemplate = "free_limit_reached" | string;

/**
 * Enfileira email (nunca envia síncrono em webhook). O cron `email-queue` processa.
 */
export async function sendEmail(opts: {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
}): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) {
    await logEvent(
      "email_queue_skipped",
      { reason: "no_supabase", template: opts.template },
      "warning"
    );
    return;
  }
  const { error } = await supabase.from("email_queue").insert({
    to_email: opts.to,
    template: opts.template,
    data: opts.data,
    status: "pending",
    send_at: new Date().toISOString(),
  });
  if (error) {
    await logEvent(
      "email_queue_insert_failed",
      { message: error.message, template: opts.template },
      "error"
    );
  }
}
