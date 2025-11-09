import { db } from '../db';
import { subscriptions, usageTracking } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { PLAN_LIMITS, TRIAL_DURATION_DAYS, type SubscriptionPlan, type PlanLimits } from './config';

const USAGE_FEATURES = [
  'agi_messages',
  'agents',
  'workflows',
  'storage',
  'api_calls',
] as const;

type UsageFeature = (typeof USAGE_FEATURES)[number];

const isUsageFeature = (value: string): value is UsageFeature =>
  USAGE_FEATURES.includes(value as UsageFeature);

const FEATURE_LIMIT_KEY: Record<UsageFeature, keyof PlanLimits> = {
  agi_messages: 'agiMessages',
  agents: 'agents',
  workflows: 'workflows',
  storage: 'storage',
  api_calls: 'apiCalls',
};

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

    for (const feature of USAGE_FEATURES) {
      // Map the tracked feature to its plan limit
      const limitKey = FEATURE_LIMIT_KEY[feature];
      const limit = limits[limitKey];

      // Insert a usage row for each feature, ignoring duplicates
      await db
        .insert(usageTracking)
        .values({
          userId,
          feature,
          count: 0,
          limit,
          resetAt,
        })
        .onConflictDoNothing();
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
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

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
    return await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });
  }

  /**
   * Check if user can use a feature (within limits)
   */
  static async canUseFeature(userId: string, feature: string): Promise<boolean> {
    if (!isUsageFeature(feature)) {
      console.warn(`[SubscriptionService] Unknown feature requested: ${feature}`);
      return false;
    }

    // Load the user's subscription to determine eligibility
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      return false;
    }

    // Only active or trialing subscriptions may access gated features
    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      return false;
    }

    // Block trial users whose trial window has ended
    if (
      subscription.plan === 'trial' &&
      subscription.trialEndsAt &&
      new Date() > subscription.trialEndsAt
    ) {
      return false;
    }

    // Ensure there is a usage record for the requested feature
    const usage = await this.getOrCreateUsageRecord(
      userId,
      feature,
      (subscription.plan as SubscriptionPlan) ?? 'trial'
    );

    // Reset usage automatically when the period has expired
    if (new Date() > usage.resetAt) {
      await this.resetUsage(userId, feature);
      return true;
    }

    // Allow unlimited features by treating non-positive limits as unlimited
    if (usage.limit <= 0) {
      return true;
    }

    return usage.count < usage.limit;
  }

  /**
   * Increment usage for a feature
   */
  static async trackUsage(
    userId: string,
    feature: string,
    amount: number = 1,
    options?: { mode?: 'increment' | 'set' }
  ) {
    if (!isUsageFeature(feature)) {
      console.warn(`[SubscriptionService] Attempted to track unknown feature: ${feature}`);
      return;
    }

    // Resolve plan to keep usage aligned with the subscriber's tier
    const subscription = await this.getUserSubscription(userId);
    const plan = (subscription?.plan as SubscriptionPlan) ?? 'trial';

    // Create or load the usage row before mutating
    let usage = await this.getOrCreateUsageRecord(userId, feature, plan);

    // Refresh usage windows automatically if the period has elapsed
    if (new Date() > usage.resetAt) {
      await this.resetUsage(userId, feature);
      usage = await this.getOrCreateUsageRecord(userId, feature, plan);
    }

    // Default to incrementing but allow absolute set mode (e.g., storage sync)
    const mode = options?.mode ?? 'increment';

    if (mode === 'increment' && amount < 0) {
      throw new Error('Amount must be positive when incrementing usage.');
    }

    // Round amounts so we store integer counts in the database
    const sanitizedAmount = Math.round(amount);
    const nextCount =
      mode === 'set'
        ? Math.max(0, sanitizedAmount)
        : usage.count + sanitizedAmount;

    // Fail fast when the update would exceed the subscriber's limit
    if (usage.limit > 0 && nextCount > usage.limit) {
      throw new Error(
        `Usage limit reached for ${feature}. ` +
          `Current: ${usage.count}, Attempted: ${nextCount}, Limit: ${usage.limit}`
      );
    }

    // Persist the new usage count
    await db
      .update(usageTracking)
      .set({
        count: nextCount,
        updatedAt: new Date(),
      })
      .where(eq(usageTracking.id, usage.id));

    return {
      current: nextCount,
      limit: usage.limit,
    };
  }

  /**
   * Reset usage for a feature
   */
  static async resetUsage(userId: string, feature: UsageFeature) {
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
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

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
    const subscription = await db.query.subscriptions.findFirst({
      where: eq(subscriptions.userId, userId),
    });

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
    const usageRecords = await db.query.usageTracking.findMany({
      where: eq(usageTracking.userId, userId),
    });

    return usageRecords.map((record) => {
      const percentage =
        record.limit > 0 ? (record.count / record.limit) * 100 : 0;

      return {
        feature: record.feature,
        current: record.count,
        limit: record.limit,
        percentage,
        resetAt: record.resetAt,
      };
    });
  }

  /**
   * Get usage limits for a user in plan-specific units
   */
  static async getUsageLimits(userId: string) {
    const subscription = await this.getUserSubscription(userId);
    const plan = (subscription?.plan as SubscriptionPlan) ?? 'trial';
    const limits = PLAN_LIMITS[plan];

    // Return limits using feature keys that match the usage table
    return {
      agi_messages: limits.agiMessages,
      agents: limits.agents,
      workflows: limits.workflows,
      storage: limits.storage,
      api_calls: limits.apiCalls,
      team_members: limits.teamMembers,
    };
  }

  /**
   * Ensure usage record exists for a feature
   */
  private static async getOrCreateUsageRecord(
    userId: string,
    feature: UsageFeature,
    plan: SubscriptionPlan
  ) {
    const existing = await db.query.usageTracking.findFirst({
      where: and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, feature)
      ),
    });

    if (existing) {
      return existing;
    }

    // Create a default usage row when none exists yet
    const limitKey = FEATURE_LIMIT_KEY[feature];
    const limit = PLAN_LIMITS[plan][limitKey];
    const resetAt = this.getNextResetDate();

    const [record] = await db
      .insert(usageTracking)
      .values({
        userId,
        feature,
        count: 0,
        limit,
        resetAt,
      })
      .returning();

    return record;
  }
}

