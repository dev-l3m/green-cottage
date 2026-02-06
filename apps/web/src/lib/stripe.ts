import Stripe from 'stripe';

/**
 * TEST MODE ONLY. Stripe is instantiated lazily so that:
 * - next build does not require STRIPE_SECRET_KEY (e.g. on Vercel with no env at build time).
 * - Runtime code that needs Stripe calls getStripe() and handles missing config explicitly.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Configure it in the environment (TEST keys only for now).'
    );
  }
  _stripe = new Stripe(key, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
  return _stripe;
}

/**
 * Use when you need to call Stripe only if configured (e.g. optional flows).
 * Returns null if STRIPE_SECRET_KEY is missing (e.g. during build).
 */
export function getStripeIfConfigured(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key, {
    apiVersion: '2023-10-16',
    typescript: true,
  });
  return _stripe;
}
