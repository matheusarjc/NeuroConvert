import { createServiceClient } from "@/lib/supabase/admin";

export type LogSeverity = "info" | "warning" | "error" | "critical";

/**
 * Eventos estruturados — persiste em `system_events` quando Supabase está configurado.
 * Sem PII em `data` (ver context.md).
 */
export async function logEvent(
  event: string,
  data?: Record<string, unknown>,
  severity: LogSeverity = "info"
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.info("[logEvent]", severity, event, data ?? {});
  }
  const supabase = createServiceClient();
  if (!supabase) return;
  try {
    await supabase.from("system_events").insert({
      event,
      data: data ?? {},
      severity,
    });
  } catch {
    // nunca derrubar request por falha de log
  }
}
