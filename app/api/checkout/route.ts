import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { checkoutRequestSchema } from "@/schemas/checkout-request";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "Stripe não configurado" },
      { status: 503 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "NEXT_PUBLIC_URL em falta" },
      { status: 503 }
    );
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "Supabase não configurado" },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { plan, email, userId } = parsed.data;

  const { data: user, error: userErr } = await supabase
    .from("users")
    .select("id, email, stripe_customer_id")
    .eq("id", userId)
    .single();

  if (userErr?.code === "PGRST116") {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  if (userErr) {
    return NextResponse.json(
      { error: "database_unavailable", message: userErr.message },
      { status: 503 }
    );
  }

  if (!user) {
    return NextResponse.json({ error: "user_not_found" }, { status: 404 });
  }

  if (String(user.email).toLowerCase() !== email.toLowerCase()) {
    return NextResponse.json(
      { error: "email_mismatch", message: "Email não coincide com o utilizador" },
      { status: 403 }
    );
  }

  const priceId = process.env.STRIPE_PRICE_PRO;

  if (!priceId) {
    return NextResponse.json(
      { error: "service_misconfigured", message: "STRIPE_PRICE_PRO em falta" },
      { status: 503 }
    );
  }

  const stripe = getStripe();

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    locale: "pt-BR",
    success_url: `${baseUrl}/sucesso?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}?canceled=true`,
    client_reference_id: userId,
    metadata: { plan, userId },
    subscription_data: {
      trial_period_days: 7,
      metadata: { plan, userId },
    },
  };

  if (user.stripe_customer_id) {
    sessionParams.customer = user.stripe_customer_id;
  } else {
    sessionParams.customer_email = email;
  }

  const session = await stripe.checkout.sessions.create(sessionParams);

  if (!session.url) {
    return NextResponse.json(
      { error: "checkout_failed", message: "Sessão sem URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: session.url });
}
