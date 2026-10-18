import { db } from '../db';
import { subscriptions, usageTracking, users } from '../db/schema';
import { prodSubscriptions } from '../db/schema/subscriptions-prod';
import type { Subscription } from '../db/schema/subscriptions';
import { eq, and, lt } from 'drizzle-orm';
import { PLAN_LIMITS, TRIAL_DURATION_DAYS, type SubscriptionPlan } from './config';
import { getCachedSubscription, setCachedSubscription, invalidateSubscriptionCache } from '../cache/subscription-cache';

type UserBillingRow = {
  id: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date | null;
};
type ProdSubscriptionRow = typeof prodSubscriptions.$inferSelect;

/**
 * Production keeps plan/trial state on `users` (subscription_tier, subscription_status,
 * trial_*_date, stripe_customer_id) and Stripe state on the prod-shaped `subscriptions`
 * table (tier, status, stripe_subscription_id, current_period_*, cancel_at_period_end).
 * Build the `Subscription` shape the rest of the app expects from those two rows.
 */
export function toSubscription(user: UserBillingRow, sub: ProdSubscriptionRow | null): Subscription {
  const userStatus = user.subscriptionStatus;
  const status =
    userStatus === 'cancelled' ? 'canceled'
    : userStatus === 'expired' || userStatus === 'past_due' ? userStatus
    : 'active'; // 'trial' and 'active'
  return {
    id: sub?.id ?? user.id,
    userId: user.id,
    plan: user.subscriptionTier || 'trial',
    status,
    trialStartedAt: user.trialStartDate,
    trialEndsAt: user.trialEndDate,
    currentPeriodStart: sub?.currentPeriodStart ?? null,
    currentPeriodEnd: sub?.currentPeriodEnd ?? null,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: sub?.stripeSubscriptionId ?? null,
    stripePriceId: null,
    cancelAtPeriodEnd: sub?.cancelAtPeriodEnd ?? false,
    canceledAt: null,
    createdAt: sub?.createdAt ?? user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class SubscriptionService {
  /**
   * Initialize a trial subscription for a new user
   */
  static async initializeTrial(userId: string) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

    const [subscription] = await db.insert(subscriptions).values({
      userId,
      plan: 'trial',
      status: 'active',
      trialStartedAt: new Date(),
      trialEndsAt,
    }).returning();

    // Cache the new subscription
    if (subscription) {
      setCachedSubscription(userId, subscription);
    }

    // Initialize usage tracking for trial
    await this.initializeUsageTracking(userId, 'trial');

    return subscription;
  }

  /**
   * Initialize usage tracking for a user based on their plan
   */
  static async initializeUsageTracking(userId: string, plan: SubscriptionPlan) {
    const limits = PLAN_LIMITS[plan];
    const resetAt = this.getNextResetDate();

    const features = [
      { feature: 'agi_messages', limit: limits.agiMessages },
      { feature: 'agents', limit: limits.agents },
      { feature: 'workflows', limit: limits.workflows },
      { feature: 'storage', limit: limits.storage },
      { feature: 'api_calls', limit: limits.apiCalls },
    ];

    for (const { feature, limit } of features) {
      await db.insert(usageTracking).values({
        userId,
        feature,
        count: 0,
        limit,
        resetAt,
      }).onConflictDoNothing();
    }
  }

  /**
   * Get the next reset date (first day of next month)
   */
  static getNextResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  /**
   * Check if a user's trial has expired (uses cache)
   */
  static async isTrialExpired(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription || subscription.plan !== 'trial') {
      return false;
    }

    if (!subscription.trialEndsAt) {
      return false;
    }

    return new Date() > subscription.trialEndsAt;
  }

  /**
   * Get user's current subscription (with caching)
   */
  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    // Check cache first
    const cached = getCachedSubscription(userId);
    if (cached !== undefined) {
      return cached;
    }

    // Read the columns that exist in production (see toSubscription)
    const [user] = await db
      .select({
        id: users.id,
        subscriptionTier: users.subscriptionTier,
        subscriptionStatus: users.subscriptionStatus,
        trialStartDate: users.trialStartDate,
        trialEndDate: users.trialEndDate,
        stripeCustomerId: users.stripeCustomerId,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      setCachedSubscription(userId, null);
      return null;
    }

    const [sub] = await db
      .select()
      .from(prodSubscriptions)
      .where(eq(prodSubscriptions.userId, userId))
      .limit(1);

    const subscription = toSubscription(user, sub ?? null);
    setCachedSubscription(userId, subscription);
    return subscription;
  }

  /**
   * Check if user can use a feature (within limits)
   * Returns boolean for simple checks, or object with details
   */
  static async canUseFeature(userId: string, feature: string): Promise<boolean>;
  static async canUseFeature(userId: string, feature: string, includeDetails: true): Promise<{ allowed: boolean; current: number; limit: number }>;
  static async canUseFeature(userId: string, feature: string, includeDetails?: boolean): Promise<boolean | { allowed: boolean; current: number; limit: number }> {
    const [usage] = await db.select().from(usageTracking).where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, feature)
      )
    ).limit(1);

    if (!usage) {
      const defaultResult = { allowed: true, current: 0, limit: 999999 };
      return includeDetails ? defaultResult : defaultResult.allowed;
    }

    // Check if usage needs to be reset
    if (new Date() > usage.resetAt) {
      await this.resetUsage(userId, feature);
      const resetResult = { allowed: true, current: 0, limit: usage.limit };
      return includeDetails ? resetResult : resetResult.allowed;
    }

    const result = {
      allowed: usage.count < usage.limit,
      current: usage.count,
      limit: usage.limit,
    };

    return includeDetails ? result : result.allowed;
  }

  /**
   * Increment usage for a feature
   */
  static async incrementUsage(userId: string, feature: string, amount: number = 1) {
    const [usage] = await db.select().from(usageTracking).where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, feature)
      )
    ).limit(1);

    if (!usage) {
      return;
    }

    await db.update(usageTracking)
      .set({ 
        count: usage.count + amount,
        updatedAt: new Date(),
      })
      .where(eq(usageTracking.id, usage.id));
  }

  /**
   * Reset usage for a feature
   */
  static async resetUsage(userId: string, feature: string) {
    await db.update(usageTracking)
      .set({
        count: 0,
        resetAt: this.getNextResetDate(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, feature)
      ));
  }

  /**
   * Upgrade user to a paid plan (uses cache)
   */
  static async upgradePlan(
    userId: string,
    plan: 'premium' | 'pro',
    stripeSubscriptionId: string,
    stripePriceId: string,
    currentPeriodEnd: Date
  ) {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      throw new Error('No subscription found for user');
    }

    // Write prod columns: plan/trial state on users, Stripe state on subscriptions
    await db.update(users)
      .set({ subscriptionTier: plan, subscriptionStatus: 'active', updatedAt: new Date() })
      .where(eq(users.id, userId));
    await db.update(prodSubscriptions)
      .set({ tier: plan, status: 'active', stripeSubscriptionId, currentPeriodStart: new Date(), currentPeriodEnd })
      .where(eq(prodSubscriptions.userId, userId));
    void stripePriceId; // not stored in prod schema
    invalidateSubscriptionCache(userId);

    // Update usage limits
    await this.updateUsageLimits(userId, plan);
  }

  /**
   * Update usage limits when plan changes (optimized batch update)
   */
  static async updateUsageLimits(userId: string, plan: SubscriptionPlan) {
    const limits = PLAN_LIMITS[plan];

    // Batch update all features in a single transaction
    const features = [
      { feature: 'agi_messages', limit: limits.agiMessages },
      { feature: 'agents', limit: limits.agents },
      { feature: 'workflows', limit: limits.workflows },
      { feature: 'storage', limit: limits.storage },
      { feature: 'api_calls', limit: limits.apiCalls },
    ];

    // Update all features in parallel
    await Promise.all(
      features.map(({ feature, limit }) =>
        db.update(usageTracking)
          .set({ limit, updatedAt: new Date() })
          .where(and(
            eq(usageTracking.userId, userId),
            eq(usageTracking.feature, feature)
          ))
      )
    );
  }

  /**
   * Cancel subscription at period end
   */
  static async cancelSubscription(userId: string) {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      throw new Error('No subscription found');
    }

    // NOTE: this only records the intent in the DB. It does not call Stripe, so the
    // Stripe subscription keeps billing (pre-existing gap, see report).
    await db.update(prodSubscriptions)
      .set({ cancelAtPeriodEnd: true })
      .where(eq(prodSubscriptions.userId, userId));
    
    // Invalidate cache
    invalidateSubscriptionCache(userId);
  }

  /**
   * Get usage statistics for a user
   */
  static async getUsageStats(userId: string) {
    const usageRecords = await db.select().from(usageTracking).where(eq(usageTracking.userId, userId));

    return usageRecords.map(record => ({
      feature: record.feature,
      current: record.count,
      limit: record.limit,
      percentage: (record.count / record.limit) * 100,
      resetAt: record.resetAt,
    }));
  }

  /**
   * Track usage for a feature (alias for incrementUsage for API compatibility)
   */
  static async trackUsage(userId: string, feature: string, amount: number = 1): Promise<void> {
    await this.incrementUsage(userId, feature, amount);
  }

  /**
   * Get usage limits for a user's current plan
   */
  static async getUsageLimits(userId: string): Promise<Record<string, number>> {
    const subscription = await this.getUserSubscription(userId);
    const plan = (subscription?.plan || 'trial') as SubscriptionPlan;
    const limits = PLAN_LIMITS[plan];

    return {
      agi_messages: limits.agiMessages,
      agents: limits.agents,
      workflows: limits.workflows,
      storage: limits.storage,
      api_calls: limits.apiCalls,
    };
  }
}

