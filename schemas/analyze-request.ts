import { z } from "zod";

export const analyzeRequestSchema = z.object({
  url: z.string().url({ message: "URL inválida" }),
  sector: z.string().min(1).max(120),
  ctx: z.string().max(2000).optional(),
  userId: z.string().uuid({ message: "userId deve ser UUID" }),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
