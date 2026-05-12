import { z } from "zod";

export const analyzeRequestSchema = z.object({
  url: z.string().url({ message: "URL inválida" }),
  sector: z.string().min(1).max(120),
  ctx: z.string().max(2000).optional(),
  /** Obrigatório só quando `ANALYZE_ALLOW_BODY_USER_ID=true` (dev). Com auth JWT, é ignorado. */
  userId: z.string().uuid({ message: "userId deve ser UUID" }).optional(),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
