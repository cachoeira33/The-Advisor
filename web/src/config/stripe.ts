import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn('Stripe publishable key not found. Stripe functionality will be disabled.');
}

export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export const STRIPE_PRICE_IDS = {
  FREE: null,
  PRO: 'price_1S4R3YJwSpTywgvaLKGpsWCk', // Replace with actual Stripe price ID
  ENTERPRISE: 'price_1S4R4WJwSpTywgvaOZlbaIQ5', // Replace with actual Stripe price ID
} as const;

export const PLAN_FEATURES = {
  FREE: {
    businesses: 1,
    transactions: 100,
    forecasting: false,
    support: 'email',
  },
  PRO: {
    businesses: 5,
    transactions: 'unlimited',
    forecasting: true,
    support: 'priority',
  },
  ENTERPRISE: {
    businesses: 'unlimited',
    transactions: 'unlimited',
    forecasting: true,
    support: 'dedicated',
  },
} as const;