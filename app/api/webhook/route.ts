import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import { logEvent } from "@/lib/monitoring";
import { createServiceClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MRR_PRO = 297;
const MRR_AGENCY = 997;

function customerId(c: Stripe.Subscription["customer"]): string | null {
  if (typeof c === "string") return c;
  if (c && !c.deleted) return c.id;
  return null;
}

async function insertFinancialEvent(
  supabase: SupabaseClient,
  row: {
    type: "subscription_created" | "subscription_canceled";
    plan: string | null;
    mrr_impact: number;
    stripe_event_id: string;
  }
): Promise<void> {
  const { error } = await supabase.from("financial_events").insert(row);
  if (error?.code === "23505") return;
  if (error) throw error;
}

async function insertRevenueLog(
  supabase: SupabaseClient,
  row: {
    amount: number;
    currency: string;
    stripe_invoice_id: string;
    paid_at: string;
  }
): Promise<void> {
  const { error } = await supabase.from("revenue_log").insert(row);
  if (error?.code === "23505") return;
  if (error) throw error;
}

async function scheduleChurnRecovery(
  supabase: SupabaseClient,
  email: string | undefined,
  plan: string | undefined
): Promise<void> {
  if (!email) return;
  for (const day of [1, 3, 7] as const) {
    const sendAt = new Date(Date.now() + day * 86_400_000).toISOString();
    await supabase.from("email_queue").insert({
      to_email: email,
      template: `churn_recovery_d${day}`,
      data: { plan: plan ?? "unknown" },
      status: "pending",
      send_at: sendAt,
    });
  }
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return new Response("Webhook não configurado", { status: 503 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return new Response("Supabase não configurado", { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch {
    return new Response("Webhook error", { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const plan = sub.metadata?.plan;
        const userId = sub.metadata?.userId;
        if (!plan || !userId || (plan !== "pro" && plan !== "agency")) {
          await logEvent(
            "stripe_subscription_missing_metadata",
            { subscriptionId: sub.id, plan, userId },
            "warning"
          );
          break;
        }
        const credits = plan === "agency" ? 9999 : 10;
        const cid = customerId(sub.customer);

        const { error: updErr } = await supabase
          .from("users")
          .update({
            plan,
            credits_remaining: credits,
            subscription_status: sub.status,
            stripe_subscription_id: sub.id,
            stripe_customer_id: cid ?? undefined,
            subscribed_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (updErr) {
          await logEvent(
            "stripe_subscription_user_update_failed",
            { message: updErr.message, subscriptionId: sub.id },
            "critical"
          );
          break;
        }

        await insertFinancialEvent(supabase, {
          type: "subscription_created",
          plan,
          mrr_impact: plan === "agency" ? MRR_AGENCY : MRR_PRO,
          stripe_event_id: event.id,
        });

        const { data: urow } = await supabase
          .from("users")
          .select("email")
          .eq("id", userId)
          .single();

        await logEvent(
          "stripe_subscription_created",
          {
            plan,
            userId,
            mrrBrl: plan === "agency" ? MRR_AGENCY : MRR_PRO,
          },
          "info"
        );

        if (urow?.email) {
          await sendEmail({
            to: urow.email,
            template: "welcome_paid",
            data: { plan },
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await supabase
          .from("users")
          .update({ subscription_status: sub.status })
          .eq("stripe_subscription_id", sub.id);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { data: u } = await supabase
          .from("users")
          .select("email, plan")
          .eq("stripe_subscription_id", sub.id)
          .single();

        const prevPlan = u?.plan === "agency" || u?.plan === "pro" ? u.plan : "pro";
        const mrr = prevPlan === "agency" ? MRR_AGENCY : MRR_PRO;

        await supabase
          .from("users")
          .update({
            plan: "free",
            credits_remaining: 1,
            subscription_status: "canceled",
            stripe_subscription_id: null,
          })
          .eq("stripe_subscription_id", sub.id);

        await insertFinancialEvent(supabase, {
          type: "subscription_canceled",
          plan: u?.plan ?? null,
          mrr_impact: -mrr,
          stripe_event_id: event.id,
        });

        await logEvent(
          "stripe_subscription_canceled",
          { plan: u?.plan ?? null, mrrBrl: mrr },
          "info"
        );

        await scheduleChurnRecovery(supabase, u?.email, u?.plan ?? undefined);
        break;
      }

      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        const email =
          inv.customer_email ??
          (inv as Stripe.Invoice & { customer_details?: { email?: string | null } })
            .customer_details?.email ??
          null;
        await logEvent(
          "stripe_invoice_payment_failed",
          {
            invoiceId: inv.id,
            customer: typeof inv.customer === "string" ? inv.customer : undefined,
          },
          "warning"
        );
        if (email) {
          await sendEmail({
            to: email,
            template: "payment_failed",
            data: {
              amount: ((inv.amount_due ?? 0) / 100).toFixed(2),
              currency: (inv.currency ?? "brl").toUpperCase(),
            },
          });
        }
        break;
      }

      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        if (!inv.id || inv.amount_paid == null) break;
        await insertRevenueLog(supabase, {
          amount: inv.amount_paid / 100,
          currency: inv.currency ?? "brl",
          stripe_invoice_id: inv.id,
          paid_at: new Date().toISOString(),
        });
        break;
      }

      default:
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    await logEvent("stripe_webhook_handler_error", { type: event.type, message: msg }, "critical");
    return new Response("Handler error", { status: 500 });
  }

  return new Response("OK", { status: 200 });
}
