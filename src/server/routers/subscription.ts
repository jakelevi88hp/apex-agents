import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { SubscriptionService } from '@/lib/subscription/service';
import { PLAN_FEATURES, PLAN_PRICES } from '@/lib/subscription/config';
import { getOrCreateStripeCustomer, createCheckoutSession, createCustomerPortalSession, ensureStripeProducts } from '@/lib/stripe/stripe';
import { TRPCError } from '@trpc/server';

export const subscriptionRouter = router({
  /**
   * Get current user's subscription
   */
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await SubscriptionService.getUserSubscription(ctx.userId!);
    const isExpired = await SubscriptionService.isTrialExpired(ctx.userId!);
    
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
    return await SubscriptionService.getUsageStats(ctx.userId!);
  }),

  /**
   * Check if user can use a specific feature
   */
  canUseFeature: protectedProcedure
    .input(z.object({
      feature: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      return await SubscriptionService.canUseFeature(ctx.userId!, input.feature);
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
      // Fetch user data from database
      const { db } = await import('@/lib/db');
      const { users } = await import('@/lib/db/schema');
      const { eq } = await import('drizzle-orm');
      
      const [user] = await db.select().from(users).where(eq(users.id, ctx.userId!)).limit(1);
      
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }
      
      // Ensure Stripe products exist
      const priceIds = await ensureStripeProducts();
      
      // Get or create Stripe customer
      const customer = await getOrCreateStripeCustomer(
        user.id,
        user.email || '',
        user.name || undefined
      );

      // Get the appropriate price ID
      const priceId = priceIds[input.plan];

      // Create checkout session
      const session = await createCheckoutSession({
        customerId: customer.id,
        priceId,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
        userId: user.id,
      });

      return {
        url: session.url!,
      };
    }),

  /**
   * Cancel subscription
   */
  cancelSubscription: protectedProcedure.mutation(async ({ ctx }) => {
    await SubscriptionService.cancelSubscription(ctx.userId!);
    return { success: true };
  }),

  /**
   * Get Stripe customer portal URL
   */
  getCustomerPortal: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await SubscriptionService.getUserSubscription(ctx.userId!);
    
    if (!subscription?.stripeCustomerId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No active subscription found. Please subscribe first.',
      });
    }

    const session = await createCustomerPortalSession(
      subscription.stripeCustomerId,
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
    );

    return {
      url: session.url,
    };
  }),
});

