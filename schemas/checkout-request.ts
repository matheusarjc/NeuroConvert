import { z } from "zod";

export const checkoutRequestSchema = z.object({
  plan: z.enum(["pro", "agency"]),
  email: z.string().email(),
  userId: z.string().uuid(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
