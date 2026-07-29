import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;
      const orgId =
        session.client_reference_id || session.metadata?.org_id;

      if (!orgId) {
        console.error("No org_id in checkout session");
        break;
      }

      const plan = session.metadata?.plan || "starter";

      await supabase
        .from("organizations")
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
        })
        .eq("id", orgId);

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;

      let plan = "free";
      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
        plan = "starter";
      } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        plan = "pro";
      }

      await supabase
        .from("organizations")
        .update({
          plan,
          stripe_subscription_id: subscription.id,
        })
        .eq("stripe_customer_id", subscription.customer);

      break;
    }

    case "customer.subscription.deleted": {
      const deletedSub = event.data.object as Stripe.Subscription;

      await supabase
        .from("organizations")
        .update({
          plan: "free",
          stripe_subscription_id: null,
        })
        .eq("stripe_customer_id", deletedSub.customer);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
