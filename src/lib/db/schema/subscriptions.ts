import { pgTable, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { users } from './auth';

export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Subscription details
  plan: text('plan').notNull().default('trial'), // 'trial', 'premium', 'pro'
  status: text('status').notNull().default('active'), // 'active', 'canceled', 'expired', 'past_due'
  
  // Trial tracking
  trialStartedAt: timestamp('trial_started_at').defaultNow(),
  trialEndsAt: timestamp('trial_ends_at'),
  
  // Billing period
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  
  // Stripe integration
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  
  // Metadata
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  canceledAt: timestamp('canceled_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const usageTracking = pgTable('usage_tracking', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Feature tracking
  feature: text('feature').notNull(), // 'agi_messages', 'agents', 'workflows', 'storage'
  count: integer('count').notNull().default(0),
  limit: integer('limit').notNull(),
  
  // Reset tracking
  resetAt: timestamp('reset_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type InsertUsageTracking = typeof usageTracking.$inferInsert;

