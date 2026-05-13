import { Resend } from "resend";

function subjectFor(template: string, data: Record<string, unknown>): string {
  const score = typeof data.score === "number" ? data.score : "?";
  const url = typeof data.url === "string" ? data.url : "";
  const map: Record<string, string> = {
    welcome_paid: "Acesso Pro ativado — Klarivy",
    payment_failed: "Problema com o pagamento — Klarivy",
    free_limit_reached: `Laudo pronto — score ${score}/100`,
    welcome_free: "Bem-vindo à Klarivy",
    subscription_canceled: "Subscrição cancelada — Klarivy",
    churn_recovery_d1: "Klarivy — quer pausar em vez de cancelar?",
    churn_recovery_d3: "Klarivy — casos de sucesso",
    churn_recovery_d7: "Klarivy — oferta especial",
    weekly_mrr_report: "Klarivy — relatório de uso",
    report_ready: url ? `Laudo: ${url}` : "Laudo pronto — Klarivy",
  };
  return map[template] ?? `Klarivy — ${template}`;
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
