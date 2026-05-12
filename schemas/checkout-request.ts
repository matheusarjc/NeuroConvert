import { z } from "zod";

/** Checkout self-serve só Pro. Agência é sob consulta (fora do Stripe Checkout desta API). */
export const checkoutRequestSchema = z.object({
  plan: z.literal("pro"),
  email: z.string().email(),
  userId: z.string().uuid(),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
