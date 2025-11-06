/**
 * Subscription-aware tRPC Procedures
 * 
 * Extends protectedProcedure with subscription checks
 */

import { TRPCError } from '@trpc/server';
import { protectedProcedure } from './trpc';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  isTrialExpired,
  getSubscriptionLimits,
  canPerformAction,
  type SubscriptionTier,
  type SubscriptionStatus,
} from '@/lib/subscription-middleware';

/**
 * Procedure that checks if user's subscription is active
 */
export const subscriptionProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const userId = ctx.userId;

  // Get user's subscription info
  const [user] = await db
    .select({
      subscriptionTier: users.subscriptionTier,
      subscriptionStatus: users.subscriptionStatus,
      trialEndDate: users.trialEndDate,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    });
  }

  const tier = user.subscriptionTier as SubscriptionTier;
  const status = user.subscriptionStatus as SubscriptionStatus;

  // Check if trial has expired
  if (tier === 'trial' && status === 'trial' && user.trialEndDate) {
    if (isTrialExpired(user.trialEndDate)) {
      // Update user status to expired
      await db
        .update(users)
        .set({ subscriptionStatus: 'expired' })
        .where(eq(users.id, userId));

      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Your trial has expired. Please upgrade to continue using Apex Agents.',
      });
    }
  }

  // Check if subscription is active
  if (status === 'expired' || status === 'cancelled') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Your subscription is not active. Please renew to continue.',
    });
  }

  const limits = getSubscriptionLimits(tier);

  return next({
    ctx: {
      ...ctx,
      subscription: {
        tier,
        status,
        limits,
        trialEndDate: user.trialEndDate,
      },
    },
  });
});

/**
 * Helper to check if user can create more of a resource
 */
export async function checkResourceLimit(
  userId: string,
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  resource: 'agents' | 'workflows' | 'documents' | 'teamMembers',
  currentCount: number
): Promise<void> {
  const resourceLimitMap = {
    agents: 'maxAgents' as const,
    workflows: 'maxWorkflows' as const,
    documents: 'maxKnowledgeDocuments' as const,
    teamMembers: 'maxTeamMembers' as const,
  };

  const limitKey = resourceLimitMap[resource];

  const result = canPerformAction({
    tier,
    status,
    currentCount,
    action: limitKey,
  });

  if (!result.allowed) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: result.reason || 'Subscription limit reached',
      cause: {
        upgradeRequired: result.upgradeRequired,
        tier,
        resource,
        limit: getSubscriptionLimits(tier)[limitKey],
      },
    });
  }
}

/**
 * Helper to check if user has access to a feature
 */
export async function checkFeatureAccess(
  userId: string,
  tier: SubscriptionTier,
  status: SubscriptionStatus,
  feature: 'hasAdvancedAnalytics' | 'hasAPIAccess' | 'hasPrioritySupport' | 'hasCustomBranding' | 'hasAGIFeatures'
): Promise<void> {
  const result = canPerformAction({
    tier,
    status,
    currentCount: 0, // Not used for boolean features
    action: feature,
  });

  if (!result.allowed) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: result.reason || 'Feature not available on your plan',
      cause: {
        upgradeRequired: result.upgradeRequired,
        tier,
        feature,
      },
    });
  }
}
