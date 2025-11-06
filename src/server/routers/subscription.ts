import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { SubscriptionService } from '@/lib/subscription/service';
import { PLAN_FEATURES, PLAN_PRICES } from '@/lib/subscription/config';

export const subscriptionRouter = router({
  /**
   * Get current user's subscription
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await SubscriptionService.getUserSubscription(ctx.user.id);
    const isExpired = await SubscriptionService.isTrialExpired(ctx.user.id);
    
    return {
      subscription,
      isExpired,
      daysRemaining: subscription?.trialEndsAt 
        ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0,
    };
  }),

  /**
   * Get usage statistics
   */
  getUsage: protectedProcedure.query(async ({ ctx }) => {
    return await SubscriptionService.getUsageStats(ctx.user.id);
  }),

  /**
   * Check if user can use a specific feature
   */
  canUseFeature: protectedProcedure
    .input(z.object({
      feature: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return await SubscriptionService.canUseFeature(ctx.user.id, input.feature);
    }),

  /**
   * Get all available plans and features
   */
  getPlans: protectedProcedure.query(() => {
    return {
      trial: {
        name: 'Free Trial',
        price: 0,
        duration: '3 days',
        features: PLAN_FEATURES.trial,
      },
      premium: {
        name: 'Premium',
        price: PLAN_PRICES.premium.monthly,
        yearlyPrice: PLAN_PRICES.premium.yearly,
        features: PLAN_FEATURES.premium,
      },
      pro: {
        name: 'Pro',
        price: PLAN_PRICES.pro.monthly,
        yearlyPrice: PLAN_PRICES.pro.yearly,
        features: PLAN_FEATURES.pro,
      },
    };
  }),

  /**
   * Create Stripe checkout session
   */
  createCheckoutSession: protectedProcedure
    .input(z.object({
      plan: z.enum(['premium', 'pro']),
      billingPeriod: z.enum(['monthly', 'yearly']),
    }))
    .mutation(async ({ ctx, input }) => {
      // This will be implemented in Phase 4 with Stripe integration
      throw new Error('Stripe integration pending');
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    await SubscriptionService.cancelSubscription(ctx.user.id);
    return { success: true };
  }),

  /**
   * Get Stripe customer portal URL
   */
  getCustomerPortal: protectedProcedure.query(async ({ ctx }) => {
    // This will be implemented in Phase 4 with Stripe integration
    throw new Error('Stripe integration pending');
  }),
});

