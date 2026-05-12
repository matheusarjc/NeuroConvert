import { createServiceClient } from "@/lib/supabase/admin";

export type LogSeverity = "info" | "warning" | "error" | "critical";

/**
 * Eventos estruturados — persiste em `system_events` quando Supabase está configurado.
 * Evitar PII em `data` (preferir identificadores internos opacos quando possível).
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
    const { error } = await supabase.from("system_events").insert({
      event,
      data: data ?? {},
      severity,
    });
    if (error && process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[logEvent] insert falhou:", error.message);
    }
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("[logEvent] excepção:", e);
    }
  }
}
