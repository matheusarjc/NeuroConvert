export type LogSeverity = "info" | "warning" | "error" | "critical";

/**
 * Eventos estruturados — em produção deve persistir em `system_events` (Supabase)
 * sem PII; ver context.md.
 */
export async function logEvent(
  event: string,
  data?: Record<string, unknown>,
  severity: LogSeverity = "info"
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console -- substituído por persistência nas fases seguintes
    console.info("[logEvent]", severity, event, data ?? {});
  }
}
