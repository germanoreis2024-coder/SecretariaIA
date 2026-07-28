import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    });
  }
  return _stripe;
}

export const PLANS = {
  free: {
    name: "Free",
    priceId: null,
    price: 0,
    messagesPerMonth: 100,
    agents: 1,
    channels: 1,
  },
  starter: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 9700, // R$ 97.00 in cents
    messagesPerMonth: 1000,
    agents: 3,
    channels: 2,
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 29700, // R$ 297.00 in cents
    messagesPerMonth: -1, // unlimited
    agents: 10,
    channels: 5,
  },
} as const;

export type PlanType = keyof typeof PLANS;
