import { db } from '../db';
import { subscriptions, usageTracking, users } from '../db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { PLAN_LIMITS, TRIAL_DURATION_DAYS, type SubscriptionPlan } from './config';

export class SubscriptionService {
  /**
   * Initialize a trial subscription for a new user
   */
  static async initializeTrial(userId: string) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DURATION_DAYS);

    const subscription = await db.insert(subscriptions).values({
      userId,
      plan: 'trial',
      status: 'active',
      trialStartedAt: new Date(),
      trialEndsAt,
    }).returning();

    // Initialize usage tracking for trial
    await this.initializeUsageTracking(userId, 'trial');

    return subscription[0];
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
   * Check if a user's trial has expired
   */
  static async isTrialExpired(userId: string): Promise<boolean> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

    if (!subscription || subscription.plan !== 'trial') {
      return false;
    }

    if (!subscription.trialEndsAt) {
      return false;
    }

    return new Date() > subscription.trialEndsAt;
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string) {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
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
   * Upgrade user to a paid plan
   */
  static async upgradePlan(
    userId: string,
    plan: 'premium' | 'pro',
    stripeSubscriptionId: string,
    stripePriceId: string,
    currentPeriodEnd: Date
  ) {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

    if (!subscription) {
      throw new Error('No subscription found for user');
    }

    await db.update(subscriptions)
      .set({
        plan,
        status: 'active',
        stripeSubscriptionId,
        stripePriceId,
        currentPeriodStart: new Date(),
        currentPeriodEnd,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));

    // Update usage limits
    await this.updateUsageLimits(userId, plan);
  }

  /**
   * Update usage limits when plan changes
   */
  static async updateUsageLimits(userId: string, plan: SubscriptionPlan) {
    const limits = PLAN_LIMITS[plan];

    await db.update(usageTracking)
      .set({ limit: limits.agiMessages })
      .where(and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, 'agi_messages')
      ));

    await db.update(usageTracking)
      .set({ limit: limits.agents })
      .where(and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, 'agents')
      ));

    await db.update(usageTracking)
      .set({ limit: limits.workflows })
      .where(and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, 'workflows')
      ));

    await db.update(usageTracking)
      .set({ limit: limits.storage })
      .where(and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, 'storage')
      ));
  }

  /**
   * Cancel subscription at period end
   */
  static async cancelSubscription(userId: string) {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

    if (!subscription) {
      throw new Error('No subscription found');
    }

    await db.update(subscriptions)
      .set({
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, subscription.id));
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

