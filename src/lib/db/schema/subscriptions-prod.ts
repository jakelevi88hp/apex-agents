import { pgTable, uuid, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';

/**
 * The `subscriptions` table exactly as it exists in production
 * (Neon neon-rose-yacht / main, inspected 2026-10-17):
 *   id uuid default gen_random_uuid(), user_id uuid not null (FK users.id),
 *   tier varchar not null, status varchar not null, stripe_subscription_id varchar,
 *   current_period_start timestamp, current_period_end timestamp,
 *   cancel_at_period_end boolean default false, created_at timestamp default now()
 *
 * The `subscriptions` definition in ./subscriptions.ts (plan, trial_*, stripe_price_id,
 * updated_at, ...) does NOT match production. This mirror is used by the Stripe webhook
 * so it writes columns that actually exist. It is intentionally NOT re-exported from
 * ../schema.ts, so drizzle-kit never sees two definitions of the same table.
 */
export const prodSubscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  tier: varchar('tier').notNull(),
  status: varchar('status').notNull(),
  stripeSubscriptionId: varchar('stripe_subscription_id'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
