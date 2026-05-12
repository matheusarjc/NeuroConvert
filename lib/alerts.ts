/**
 * Webhook Slack (Incoming Webhook). Corpo mínimo compatível com a API legacy.
 */
export async function sendSlackAlert(
  text: string,
  extra?: Record<string, unknown>
): Promise<void> {
  const hook = process.env.SLACK_ALERT_WEBHOOK;
  if (!hook) return;
  const body: Record<string, unknown> = { text };
  if (extra && Object.keys(extra).length > 0) {
    body.blocks = [
      {
        type: "section",
        text: { type: "mrkdwn", text: `${text}\n\`\`\`${JSON.stringify(extra, null, 2).slice(0, 2800)}\`\`\`` },
      },
    ];
  }
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // não propagar — alerta é best-effort
  }
}
