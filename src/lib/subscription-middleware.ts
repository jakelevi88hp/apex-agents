/**
 * Subscription Middleware
 * 
 * Handles trial expiration logic and feature gating based on subscription tiers
 */

export type SubscriptionTier = 'trial' | 'premium' | 'pro';
export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled' | 'past_due';

export interface SubscriptionLimits {
  maxAgents: number;
  maxWorkflows: number;
  maxExecutionsPerMonth: number;
  maxKnowledgeDocuments: number;
  maxTeamMembers: number;
  hasAdvancedAnalytics: boolean;
  hasAPIAccess: boolean;
  hasPrioritySupport: boolean;
  hasCustomBranding: boolean;
  hasAGIFeatures: boolean;
}

// Define limits for each subscription tier
export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  trial: {
    maxAgents: 3,
    maxWorkflows: 2,
    maxExecutionsPerMonth: 100,
    maxKnowledgeDocuments: 10,
    maxTeamMembers: 1,
    hasAdvancedAnalytics: false,
    hasAPIAccess: false,
    hasPrioritySupport: false,
    hasCustomBranding: false,
    hasAGIFeatures: false,
  },
  premium: {
    maxAgents: 10,
    maxWorkflows: 10,
    maxExecutionsPerMonth: 1000,
    maxKnowledgeDocuments: 100,
    maxTeamMembers: 5,
    hasAdvancedAnalytics: true,
    hasAPIAccess: true,
    hasPrioritySupport: false,
    hasCustomBranding: false,
    hasAGIFeatures: false,
  },
  pro: {
    maxAgents: -1, // unlimited
    maxWorkflows: -1, // unlimited
    maxExecutionsPerMonth: -1, // unlimited
    maxKnowledgeDocuments: -1, // unlimited
    maxTeamMembers: -1, // unlimited
    hasAdvancedAnalytics: true,
    hasAPIAccess: true,
    hasPrioritySupport: true,
    hasCustomBranding: true,
    hasAGIFeatures: true,
  },
};

// Trial duration in days
export const TRIAL_DURATION_DAYS = 14;

/**
 * Check if user's trial has expired
 */
export function isTrialExpired(trialEndDate: Date | null): boolean {
  if (!trialEndDate) return false;
  return new Date() > trialEndDate;
}

/**
 * Get days remaining in trial
 */
export function getTrialDaysRemaining(trialEndDate: Date | null): number {
  if (!trialEndDate) return 0;
  const now = new Date();
  const end = new Date(trialEndDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get subscription limits for a user
 */
export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier] || SUBSCRIPTION_LIMITS.trial;
}

/**
 * Check if user can perform an action based on their subscription
 */
export interface CanPerformActionParams {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentCount: number;
  action: keyof SubscriptionLimits;
}

export function canPerformAction(params: CanPerformActionParams): {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
} {
  const { tier, status, currentCount, action } = params;

  // Check if subscription is active
  if (status === 'expired' || status === 'cancelled') {
    return {
      allowed: false,
      reason: 'Your subscription has expired. Please renew to continue.',
      upgradeRequired: true,
    };
  }

  // Check if trial has features
  const limits = getSubscriptionLimits(tier);
  const limit = limits[action];

  // If it's a boolean feature, check if it's enabled
  if (typeof limit === 'boolean') {
    if (!limit) {
      return {
        allowed: false,
        reason: `This feature is not available on your ${tier} plan.`,
        upgradeRequired: true,
      };
    }
    return { allowed: true };
  }

  // If it's a numeric limit, check if under limit
  if (typeof limit === 'number') {
    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true };
    }

    if (currentCount >= limit) {
      return {
        allowed: false,
        reason: `You've reached your ${tier} plan limit of ${limit} ${action}.`,
        upgradeRequired: true,
      };
    }

    return { allowed: true };
  }

  return { allowed: true };
}

/**
 * Get upgrade message for a feature
 */
export function getUpgradeMessage(
  currentTier: SubscriptionTier,
  feature: string
): string {
  if (currentTier === 'trial') {
    return `Upgrade to Premium or Pro to unlock ${feature}.`;
  }
  if (currentTier === 'premium') {
    return `Upgrade to Pro to unlock ${feature}.`;
  }
  return `This feature requires a subscription.`;
}

/**
 * Calculate trial end date from start date
 */
export function calculateTrialEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
  return endDate;
}
