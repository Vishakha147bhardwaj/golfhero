import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
});

export const PLANS = {
  monthly: {
    name: 'Monthly',
    amount: 1999, // £19.99
    interval: 'month' as const,
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
  },
  yearly: {
    name: 'Yearly',
    amount: 19999, // £199.99
    interval: 'year' as const,
    priceId: process.env.STRIPE_YEARLY_PRICE_ID!,
  },
};

export function calcPrizePool(subscriberCount: number, planAmounts: { monthly: number; yearly: number; monthlyCount: number; yearlyCount: number }) {
  const monthlyPool = (planAmounts.monthlyCount * planAmounts.monthly * 0.6);
  const yearlyPool = (planAmounts.yearlyCount * (planAmounts.yearly / 12) * 0.6);
  const totalPool = monthlyPool + yearlyPool;

  return {
    total: totalPool,
    jackpot: totalPool * 0.4,
    tier4: totalPool * 0.35,
    tier3: totalPool * 0.25,
  };
}