import { z } from "zod";

/** Formato esperado do laudo (validação pós-Claude). */
export const neuroReportSchema = z.object({
  score: z.number().min(0).max(100),
  score_label: z.string(),
  benchmark: z.string(),
  headline: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      icon: z.string(),
      severity: z.enum(["critical", "warning", "good"]),
      finding: z.string(),
      science: z.string(),
    })
  ),
  quick_wins: z.array(
    z.object({
      rank: z.number(),
      action: z.string(),
      science: z.string(),
      impact: z.string(),
    })
  ),
});

export type NeuroReport = z.infer<typeof neuroReportSchema>;

export function parseNeuroReportFromModelText(raw: string): NeuroReport {
  const cleaned = raw.replace(/```json\n?|```/g, "").trim();
  const parsed: unknown = JSON.parse(cleaned);
  return neuroReportSchema.parse(parsed);
}
