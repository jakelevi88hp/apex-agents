import { pgTable, text, timestamp, integer, uuid, boolean } from 'drizzle-orm/pg-core';
import { users } from '@/lib/db/schema';

/**
 * Subscription plans available in the system
 */
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Plan details
  plan: text('plan').notNull().default('trial'), // 'trial', 'premium', 'pro'
  status: text('status').notNull().default('active'), // 'active', 'canceled', 'past_due', 'trialing'
  
  // Stripe integration
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  stripePriceId: text('stripe_price_id'),
  
  // Billing periods
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  trialEndsAt: timestamp('trial_ends_at'),
  canceledAt: timestamp('canceled_at'),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Track feature usage for metered billing and limits
 */
export const usageTracking = pgTable('usage_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Feature being tracked
  feature: text('feature').notNull(), // 'agents', 'workflows', 'storage', 'api_calls', 'agent_executions'
  
  // Usage counts
  count: integer('count').notNull().default(0),
  limit: integer('limit'), // null = unlimited
  
  // Period tracking
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // Metadata
  metadata: text('metadata'), // JSON string for additional data
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Subscription plan limits and features
 */
export const PLAN_LIMITS = {
  trial: {
    name: 'Free Trial',
    price: 0,
    duration: 14, // days
    limits: {
      agents: 3,
      workflows: 2,
      storage: 100, // MB
      apiCalls: 1000,
      agentExecutions: 50,
    },
    features: [
      'Basic agent creation',
      'Simple workflows',
      'Limited storage',
      'Community support',
    ],
  },
  premium: {
    name: 'Premium',
    price: 29,
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    limits: {
      agents: 20,
      workflows: 10,
      storage: 5000, // MB
      apiCalls: 50000,
      agentExecutions: 1000,
    },
    features: [
      'Advanced agent types',
      'Visual workflow builder',
      'Priority support',
      'API access',
      'Analytics dashboard',
      'Knowledge base',
    ],
  },
  pro: {
    name: 'Professional',
    price: 99,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID,
    limits: {
      agents: null, // unlimited
      workflows: null,
      storage: 50000, // MB
      apiCalls: null,
      agentExecutions: null,
    },
    features: [
      'Everything in Premium',
      'Unlimited agents & workflows',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'White-label options',
    ],
  },
} as const;

export type Plan = keyof typeof PLAN_LIMITS;
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';

export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type UsageTracking = typeof usageTracking.$inferSelect;
export type NewUsageTracking = typeof usageTracking.$inferInsert;
