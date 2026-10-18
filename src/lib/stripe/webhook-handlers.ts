import Stripe from 'stripe';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { prodSubscriptions } from '@/lib/db/schema/subscriptions-prod';
import { stripe, STRIPE_PLANS } from '@/lib/stripe/stripe';

/**
 * Stripe webhook handlers. Kept out of the route file so they can be unit/integration
 * tested; signature verification stays in src/app/api/webhooks/stripe/route.ts.
 *
 * Writes:
 *  - `subscriptions` using the columns that exist in production (see subscriptions-prod.ts)
 *  - `users.subscription_tier` / `users.subscription_status` / `users.stripe_customer_id`,
 *    which is what the app reads for access (src/server/subscription-procedure.ts).
 */

type Plan = 'premium' | 'pro';
type Periods = { current_period_start?: number; current_period_end?: number };

function planFromPriceId(priceId: string | undefined): Plan {
  if (priceId && (priceId === STRIPE_PLANS.pro.priceId || priceId === STRIPE_PLANS.pro.yearlyPriceId)) {
    return 'pro';
  }
  return 'premium';
}

const asPlan = (v: unknown): Plan | null => (v === 'pro' || v === 'premium' ? v : null);

/** Tier declared on the price itself or on its (expanded) product. */
function tierFromPrice(price: Stripe.Price | null | undefined): Plan | null {
  if (!price) return null;
  const product = typeof price.product === 'object' && price.product && !('deleted' in price.product && price.product.deleted)
    ? (price.product as Stripe.Product)
    : null;
  return asPlan(price.metadata?.tier) ?? asPlan(product?.metadata?.tier);
}

/** price id -> plan, only for metadata-resolved tiers (prices are immutable w.r.t. product). */
const planCache = new Map<string, Plan>();
export function clearPlanCache() {
  planCache.clear();
}

/**
 * Resolve the plan for a subscription price:
 *   1. price.metadata.tier / expanded product.metadata.tier (no API call)
 *   2. cache by price id
 *   3. stripe.prices.retrieve(id, { expand: ['product'] }) -> same metadata check (1 call, then cached)
 *   4. fallback: env price IDs (legacy planFromPriceId, defaults to premium)
 * A Stripe error in step 3 falls through to step 4 instead of failing the webhook.
 */
export async function resolvePlan(
  price: Stripe.Price | null | undefined,
  retrievePrice: (id: string) => Promise<Stripe.Price> = (id) => stripe.prices.retrieve(id, { expand: ['product'] }),
): Promise<Plan> {
  const id = price?.id;
  const direct = tierFromPrice(price);
  if (direct) {
    if (id) planCache.set(id, direct);
    return direct;
  }
  if (!id) return planFromPriceId(undefined);
  const cached = planCache.get(id);
  if (cached) return cached;
  try {
    const fetched = tierFromPrice(await retrievePrice(id));
    if (fetched) {
      planCache.set(id, fetched);
      return fetched;
    }
    console.warn(`[stripe] price ${id} has no metadata.tier on price or product; using env price IDs`);
  } catch (err) {
    console.error(`[stripe] could not retrieve price ${id} for tier; using env price IDs`, err);
  }
  return planFromPriceId(id);
}

function periodsOf(subscription: Stripe.Subscription) {
  // current_period_* moved to the subscription item in newer Stripe API versions.
  const top = subscription as unknown as Periods;
  const item = subscription.items?.data?.[0] as unknown as Periods | undefined;
  const start = top.current_period_start ?? item?.current_period_start;
  const end = top.current_period_end ?? item?.current_period_end;
  return {
    currentPeriodStart: start ? new Date(start * 1000) : null,
    currentPeriodEnd: end ? new Date(end * 1000) : null,
  };
}

/** Stripe status -> subscriptions.status (existing spelling kept). */
function subscriptionStatus(s: Stripe.Subscription.Status): string {
  if (s === 'canceled') return 'canceled';
  if (s === 'past_due') return 'past_due';
  return 'active';
}

/** subscriptions.status -> users.subscription_status (values used by subscription-middleware.ts). */
function userStatus(s: string): string {
  return s === 'canceled' ? 'cancelled' : s;
}

async function updateUser(userId: string, values: Partial<typeof users.$inferInsert>) {
  await db.update(users).set({ ...values, updatedAt: new Date() }).where(eq(users.id, userId));
}

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  retrieveSubscription: (id: string) => Promise<Stripe.Subscription> = (id) =>
    stripe.subscriptions.retrieve(id, { expand: ['items.data.price.product'] }),
) {
  const userId = session.metadata?.userId;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  const subscriptionId = session.subscription as string;
  const subscription = await retrieveSubscription(subscriptionId);
  const plan = await resolvePlan(subscription.items.data[0]?.price);
  const periods = periodsOf(subscription);

  const [existing] = await db
    .select({ id: prodSubscriptions.id })
    .from(prodSubscriptions)
    .where(eq(prodSubscriptions.userId, userId))
    .limit(1);

  const values = {
    tier: plan,
    status: 'active',
    stripeSubscriptionId: subscriptionId,
    ...periods,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };

  if (existing) {
    await db.update(prodSubscriptions).set(values).where(eq(prodSubscriptions.id, existing.id));
  } else {
    await db.insert(prodSubscriptions).values({ userId, ...values });
  }

  await updateUser(userId, {
    subscriptionTier: plan,
    subscriptionStatus: 'active',
    ...(customerId ? { stripeCustomerId: customerId } : {}),
  });

  console.log(`Subscription created for user ${userId}: ${plan}`);
}

export async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  const plan = await resolvePlan(subscription.items.data[0]?.price);
  const status = subscriptionStatus(subscription.status);

  await db
    .update(prodSubscriptions)
    .set({
      tier: plan,
      status,
      ...periodsOf(subscription),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    })
    .where(eq(prodSubscriptions.userId, userId));

  await updateUser(userId, { subscriptionTier: plan, subscriptionStatus: userStatus(status) });

  console.log(`Subscription updated for user ${userId}: ${plan} (${status})`);
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await db
    .update(prodSubscriptions)
    .set({ status: 'canceled' })
    .where(eq(prodSubscriptions.userId, userId));

  await updateUser(userId, { subscriptionStatus: 'cancelled' });

  console.log(`Subscription canceled for user ${userId}`);
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const inv = invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null };
  return typeof inv.subscription === 'string' ? inv.subscription : inv.subscription?.id || null;
}

async function setStatusBySubscriptionId(subscriptionId: string, status: 'active' | 'past_due') {
  const rows = await db
    .update(prodSubscriptions)
    .set({ status })
    .where(eq(prodSubscriptions.stripeSubscriptionId, subscriptionId))
    .returning({ userId: prodSubscriptions.userId });

  for (const { userId } of rows) {
    await updateUser(userId, { subscriptionStatus: status });
  }
}

export async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;
  await setStatusBySubscriptionId(subscriptionId, 'active');
  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

export async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;
  await setStatusBySubscriptionId(subscriptionId, 'past_due');
  console.log(`Payment failed for subscription ${subscriptionId}`);
}
