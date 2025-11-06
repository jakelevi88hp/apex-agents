import { db } from '../db';
import { subscriptions, usageTracking, PLAN_LIMITS, type Plan } from '../db/schema/subscriptions';
import { eq, and, gte, lte } from 'drizzle-orm';

/**
 * Subscription service for managing user subscriptions and usage
 */
export class SubscriptionService {
  /**
   * Get user's current subscription
   */
  static async getSubscription(userId: string) {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    return subscription;
  }

  /**
   * Create a new subscription for a user (typically on signup)
   */
  static async createSubscription(userId: string, plan: Plan = 'trial') {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + PLAN_LIMITS.trial.duration);

    const [subscription] = await db
      .insert(subscriptions)
      .values({
        userId,
        plan,
        status: 'trialing',
        trialEndsAt,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
      })
      .returning();

    // Initialize usage tracking for all features
    await this.initializeUsageTracking(userId, plan);

    return subscription;
  }

  /**
   * Initialize usage tracking for a user
   */
  static async initializeUsageTracking(userId: string, plan: Plan) {
    const limits = PLAN_LIMITS[plan].limits;
    const periodStart = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const features: Array<keyof typeof limits> = [
      'agents',
      'workflows',
      'storage',
      'apiCalls',
      'agentExecutions',
    ];

    for (const feature of features) {
      await db.insert(usageTracking).values({
        userId,
        feature,
        count: 0,
        limit: limits[feature] ?? null,
        periodStart,
        periodEnd,
      });
    }
  }

  /**
   * Check if user has access to a feature
   */
  static async hasFeatureAccess(userId: string, feature: string): Promise<boolean> {
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) {
      return false;
    }

    // Check if subscription is active
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      return false;
    }

    // Check if trial has expired
    if (subscription.status === 'trialing' && subscription.trialEndsAt) {
      if (new Date() > subscription.trialEndsAt) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if user can perform an action based on usage limits
   */
  static async canPerformAction(userId: string, feature: string): Promise<{
    allowed: boolean;
    current: number;
    limit: number | null;
    reason?: string;
  }> {
    // Get subscription
    const subscription = await this.getSubscription(userId);
    
    if (!subscription) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        reason: 'No active subscription',
      };
    }

    // Check subscription status
    if (!await this.hasFeatureAccess(userId, feature)) {
      return {
        allowed: false,
        current: 0,
        limit: 0,
        reason: 'Subscription expired or inactive',
      };
    }

    // Get current usage
    const now = new Date();
    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.feature, feature),
          lte(usageTracking.periodStart, now),
          gte(usageTracking.periodEnd, now)
        )
      )
      .limit(1);

    if (!usage) {
      // No usage record, create one
      const limits = PLAN_LIMITS[subscription.plan as Plan].limits;
      const limit = (limits as any)[feature] ?? null;
      
      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.insert(usageTracking).values({
        userId,
        feature,
        count: 0,
        limit,
        periodStart,
        periodEnd,
      });

      return {
        allowed: true,
        current: 0,
        limit,
      };
    }

    // Check if limit is reached
    if (usage.limit !== null && usage.count >= usage.limit) {
      return {
        allowed: false,
        current: usage.count,
        limit: usage.limit,
        reason: `${feature} limit reached (${usage.count}/${usage.limit})`,
      };
    }

    return {
      allowed: true,
      current: usage.count,
      limit: usage.limit,
    };
  }

  /**
   * Increment usage for a feature
   */
  static async incrementUsage(userId: string, feature: string, amount: number = 1) {
    const now = new Date();
    
    // Find current period usage
    const [usage] = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          eq(usageTracking.feature, feature),
          lte(usageTracking.periodStart, now),
          gte(usageTracking.periodEnd, now)
        )
      )
      .limit(1);

    if (usage) {
      // Update existing usage
      await db
        .update(usageTracking)
        .set({
          count: usage.count + amount,
          updatedAt: new Date(),
        })
        .where(eq(usageTracking.id, usage.id));
    } else {
      // Create new usage record
      const subscription = await this.getSubscription(userId);
      const limits = subscription ? PLAN_LIMITS[subscription.plan as Plan].limits : PLAN_LIMITS.trial.limits;
      const limit = (limits as any)[feature] ?? null;

      const periodStart = new Date();
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await db.insert(usageTracking).values({
        userId,
        feature,
        count: amount,
        limit,
        periodStart,
        periodEnd,
      });
    }
  }

  /**
   * Update subscription plan
   */
  static async updatePlan(userId: string, plan: Plan, stripeData?: {
    customerId: string;
    subscriptionId: string;
    priceId: string;
    currentPeriodEnd: Date;
  }) {
    const updateData: any = {
      plan,
      status: 'active',
      updatedAt: new Date(),
    };

    if (stripeData) {
      updateData.stripeCustomerId = stripeData.customerId;
      updateData.stripeSubscriptionId = stripeData.subscriptionId;
      updateData.stripePriceId = stripeData.priceId;
      updateData.currentPeriodEnd = stripeData.currentPeriodEnd;
      updateData.currentPeriodStart = new Date();
    }

    await db
      .update(subscriptions)
      .set(updateData)
      .where(eq(subscriptions.userId, userId));

    // Update usage limits
    await this.updateUsageLimits(userId, plan);
  }

  /**
   * Update usage limits when plan changes
   */
  static async updateUsageLimits(userId: string, plan: Plan) {
    const limits = PLAN_LIMITS[plan].limits;
    const features: Array<keyof typeof limits> = [
      'agents',
      'workflows',
      'storage',
      'apiCalls',
      'agentExecutions',
    ];

    for (const feature of features) {
      const limit = limits[feature] ?? null;
      
      await db
        .update(usageTracking)
        .set({
          limit,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(usageTracking.userId, userId),
            eq(usageTracking.feature, feature)
          )
        );
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true) {
    await db
      .update(subscriptions)
      .set({
        cancelAtPeriodEnd,
        canceledAt: cancelAtPeriodEnd ? null : new Date(),
        status: cancelAtPeriodEnd ? 'active' : 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  }

  /**
   * Get usage summary for a user
   */
  static async getUsageSummary(userId: string) {
    const now = new Date();
    const usage = await db
      .select()
      .from(usageTracking)
      .where(
        and(
          eq(usageTracking.userId, userId),
          lte(usageTracking.periodStart, now),
          gte(usageTracking.periodEnd, now)
        )
      );

    return usage.reduce((acc, item) => {
      acc[item.feature] = {
        current: item.count,
        limit: item.limit,
        percentage: item.limit ? (item.count / item.limit) * 100 : 0,
      };
      return acc;
    }, {} as Record<string, { current: number; limit: number | null; percentage: number }>);
  }
}
