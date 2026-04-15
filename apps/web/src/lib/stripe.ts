// ============================================================
// PAR-KIDS — Stripe Server Singleton
// ============================================================
// Only import this file from server-side code (API routes, etc.)
// Never import into a 'use client' component.
// ============================================================
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// ── Plan definitions ─────────────────────────────────────────
// Map our internal tier name → Stripe price IDs.
// These must match the price IDs created in your Stripe dashboard.
// Store real price IDs in env vars; fall back to placeholder
// strings that fail gracefully at checkout (not at import time).

export const PLANS = {
  premium: {
    name: 'Growth',
    tier: 'premium' as const,
    priceId: process.env.STRIPE_PRICE_ID_PREMIUM ?? '',
    price: 9,
    interval: 'month' as const,
    features: [
      'Unlimited check-ins',
      'Family voting & polls',
      'City Explorer places',
      'Rewards system',
      'Insights dashboard',
      'AI-powered summaries',
    ],
  },
  family_pro: {
    name: 'Family Pro',
    tier: 'family_pro' as const,
    priceId: process.env.STRIPE_PRICE_ID_FAMILY_PRO ?? '',
    price: 19,
    interval: 'month' as const,
    features: [
      'Everything in Growth',
      'Up to 8 family members',
      'Co-parent access',
      'Priority support',
      'Custom branding',
      'Advanced analytics',
    ],
  },
} as const;

export type PlanTier = keyof typeof PLANS;
