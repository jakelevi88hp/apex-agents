/**
 * Plan resolution for Stripe webhooks: price/product metadata.tier first, env price IDs as fallback.
 */
jest.mock('@/lib/db', () => ({ db: {} }));
jest.mock('@/lib/subscription/service', () => ({ SubscriptionService: {} }));
jest.mock('@/lib/cache/subscription-cache', () => ({ invalidateSubscriptionCache: jest.fn() }));
jest.mock('@/lib/stripe/stripe', () => ({
  stripe: {},
  STRIPE_PLANS: { premium: { priceId: 'price_env_premium', yearlyPriceId: '' }, pro: { priceId: 'price_env_pro', yearlyPriceId: '' } },
}));

import type Stripe from 'stripe';
import { resolvePlan, clearPlanCache } from '@/lib/stripe/webhook-handlers';

const price = (id: string, metadata: Record<string, string> = {}, product: string | Partial<Stripe.Product> = 'prod_x') =>
  ({ id, metadata, product }) as unknown as Stripe.Price;

describe('resolvePlan', () => {
  beforeEach(() => clearPlanCache());

  it('uses price.metadata.tier without an API call', async () => {
    const retrieve = jest.fn();
    expect(await resolvePlan(price('price_a', { tier: 'pro' }), retrieve)).toBe('pro');
    expect(retrieve).not.toHaveBeenCalled();
  });

  it('uses expanded product.metadata.tier without an API call', async () => {
    const retrieve = jest.fn();
    expect(await resolvePlan(price('price_b', {}, { id: 'prod_b', metadata: { tier: 'pro' } }), retrieve)).toBe('pro');
    expect(retrieve).not.toHaveBeenCalled();
  });

  it('retrieves the price with expanded product once, then caches', async () => {
    const retrieve = jest.fn().mockResolvedValue(price('price_c', {}, { id: 'prod_c', metadata: { tier: 'pro' } }));
    expect(await resolvePlan(price('price_c'), retrieve)).toBe('pro');
    expect(await resolvePlan(price('price_c'), retrieve)).toBe('pro');
    expect(retrieve).toHaveBeenCalledTimes(1);
    expect(retrieve).toHaveBeenCalledWith('price_c');
  });

  it('falls back to env price IDs when no metadata or Stripe errors', async () => {
    const none = jest.fn().mockResolvedValue(price('price_env_pro'));
    expect(await resolvePlan(price('price_env_pro'), none)).toBe('pro');
    const boom = jest.fn().mockRejectedValue(new Error('network'));
    expect(await resolvePlan(price('price_env_pro'), boom)).toBe('pro');
    expect(await resolvePlan(price('price_unknown'), boom)).toBe('premium');
    expect(await resolvePlan(undefined, boom)).toBe('premium');
  });

  it('ignores invalid tier values', async () => {
    const retrieve = jest.fn().mockResolvedValue(price('price_d', { tier: 'enterprise' }));
    expect(await resolvePlan(price('price_d', { tier: 'enterprise' }), retrieve)).toBe('premium');
  });
});
