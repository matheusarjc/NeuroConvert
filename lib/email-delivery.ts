import { Resend } from "resend";

function subjectFor(template: string, data: Record<string, unknown>): string {
  const score = typeof data.score === "number" ? data.score : "?";
  const url = typeof data.url === "string" ? data.url : "";
  const map: Record<string, string> = {
    welcome_paid: "Acesso Pro ativado — NeuroConvert",
    payment_failed: "Problema com o pagamento — NeuroConvert",
    free_limit_reached: `Laudo pronto — score ${score}/100`,
    welcome_free: "Bem-vindo ao NeuroConvert",
    subscription_canceled: "Subscrição cancelada — NeuroConvert",
    churn_recovery_d1: "NeuroConvert — quer pausar em vez de cancelar?",
    churn_recovery_d3: "NeuroConvert — casos de sucesso",
    churn_recovery_d7: "NeuroConvert — oferta especial",
    weekly_mrr_report: "NeuroConvert — relatório de uso",
    report_ready: url ? `Laudo: ${url}` : "Laudo pronto — NeuroConvert",
  };
  return map[template] ?? `NeuroConvert — ${template}`;
}

function htmlBody(template: string, data: Record<string, unknown>): string {
  const safe = (v: unknown) =>
    String(v ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  const inner = `<p style="font-family:system-ui,sans-serif;color:#334155">Template: <strong>${safe(template)}</strong></p><pre style="font-size:13px;background:#f1f5f9;padding:12px;border-radius:8px">${safe(JSON.stringify(data, null, 2))}</pre>`;
  return `<!DOCTYPE html><html><body style="margin:24px">${inner}</body></html>`;
}

export async function deliverTransactionalEmail(opts: {
  to: string;
  template: string;
  data: Record<string, unknown>;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!key || !from) {
    return { ok: false, message: "RESEND_API_KEY ou RESEND_FROM em falta" };
  }
  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    from,
    to: opts.to,
    subject: subjectFor(opts.template, opts.data),
    html: htmlBody(opts.template, opts.data),
  });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
