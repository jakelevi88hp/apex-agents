import { TRPCError } from '@trpc/server';
import { SubscriptionService } from '@/lib/subscription/service';
import { middleware } from '../trpc';

/**
 * Middleware to check if user can perform an action based on their subscription
 * Usage: protectedProcedure.use(requireFeature('agents'))
 */
export const requireFeature = (feature: string) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to perform this action',
      });
    }

    const canUse = await SubscriptionService.canUseFeature(ctx.user.id, feature);

    if (!canUse) {
      const subscription = await SubscriptionService.getUserSubscription(ctx.user.id);
      const requiredTier = feature === 'unlimited_agents' || feature === 'unlimited_workflows' ? 'pro' : 'premium';
      
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This feature requires ${requiredTier} subscription. Please upgrade your plan.`,
      });
    }

    return next({ ctx });
  });

/**
 * Middleware to check usage limits before allowing an action
 * Usage: protectedProcedure.use(checkUsageLimit('agents', 1))
 */
export const checkUsageLimit = (feature: string, increment: number = 1) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to perform this action',
      });
    }

    const canUse = await SubscriptionService.canUseFeature(ctx.user.id, feature);

    if (!canUse) {
      const usage = await SubscriptionService.getUsageStats(ctx.user.id);
      const featureUsage = usage.find(u => u.feature === feature);
      
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `You've reached your ${feature} limit (${featureUsage?.current}/${featureUsage?.limit}). Please upgrade your plan.`,
      });
    }

    // Track the usage after successful check
    const result = await next({ ctx });
    
    // Increment usage after successful operation
    await SubscriptionService.trackUsage(ctx.user.id, feature, increment);

    return result;
  });

/**
 * Middleware to check if trial has expired
 */
export const requireActiveTrial = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to perform this action',
    });
  }

  const isExpired = await SubscriptionService.isTrialExpired(ctx.user.id);

  if (isExpired) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Your trial has expired. Please upgrade to continue using this feature.',
    });
  }

  return next({ ctx });
});

/**
 * Middleware to check minimum subscription tier
 * Usage: protectedProcedure.use(requireTier('premium'))
 */
export const requireTier = (minTier: 'trial' | 'premium' | 'pro') =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to perform this action',
      });
    }

    const subscription = await SubscriptionService.getUserSubscription(ctx.user.id);
    
    if (!subscription) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'No active subscription found. Please subscribe to continue.',
      });
    }

    const tierHierarchy = { trial: 0, premium: 1, pro: 2 };
    const userTierLevel = tierHierarchy[subscription.tier];
    const requiredTierLevel = tierHierarchy[minTier];

    if (userTierLevel < requiredTierLevel) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `This feature requires ${minTier} subscription or higher. Please upgrade your plan.`,
      });
    }

    return next({ ctx });
  });

