import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
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

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      // Update organization with Stripe customer ID
      await supabase
        .from("organizations")
        .update({
          stripe_customer_id: customerId,
          plan: "starter", // Default after checkout
        })
        .eq("stripe_customer_id", customerId);

      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const priceId = subscription.items.data[0]?.price.id;

      // Determine plan from price ID
      let plan: string = "free";
      if (priceId === process.env.STRIPE_STARTER_PRICE_ID) {
        plan = "starter";
      } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        plan = "pro";
      }

      await supabase
        .from("organizations")
        .update({ plan })
        .eq("stripe_customer_id", subscription.customer);

      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      await supabase
        .from("organizations")
        .update({ plan: "free" })
        .eq("stripe_customer_id", subscription.customer);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
