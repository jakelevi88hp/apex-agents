import Stripe from 'stripe';

// Lazy initialization to prevent build-time errors
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      typescript: true,
    });
  }
  return stripeInstance;
}

export const stripe = new Proxy({} as Stripe, {
  get: (target, prop) => {
    const stripeClient = getStripe();
    const value = (stripeClient as any)[prop];
    return typeof value === 'function' ? value.bind(stripeClient) : value;
  },
});

/**
 * Stripe Product and Price IDs
 * These need to be created in Stripe Dashboard and added to environment variables
 * Or we can create them programmatically on first run
 */
export const STRIPE_PLANS = {
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    yearlyPriceId: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || '',
    name: 'Premium',
    amount: 2900,        // $29.00/month in cents
    yearlyAmount: 29000, // $290.00/year in cents (~$24.17/month)
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    yearlyPriceId: process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    name: 'Pro',
    amount: 9900,        // $99.00/month in cents
    yearlyAmount: 99000, // $990.00/year in cents (~$82.50/month)
  },
} as const;

/**
 * Create or retrieve Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string, name?: string) {
  // Search for existing customer by metadata
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      userId,
    },
  });
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  userId,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}) {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
    subscription_data: {
      metadata: {
        userId,
      },
    },
  });
}

/**
 * Create a customer portal session for managing subscriptions
 */
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(subscriptionId: string) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Get subscription details
 */
export async function getSubscription(subscriptionId: string) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Update subscription (e.g., change plan)
 */
export async function updateSubscription(subscriptionId: string, newPriceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  return await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}

/**
 * Ensure Stripe products and prices exist
 * Call this on app startup or first subscription attempt
 */
export async function ensureStripeProducts() {
  const products = await stripe.products.list({ limit: 100 });
  
  const premiumProduct = products.data.find(p => p.metadata.tier === 'premium');
  const proProduct = products.data.find(p => p.metadata.tier === 'pro');

  let premiumPriceId = STRIPE_PLANS.premium.priceId;
  let proPriceId = STRIPE_PLANS.pro.priceId;

  let premiumYearlyPriceId = STRIPE_PLANS.premium.yearlyPriceId;
  let proYearlyPriceId = STRIPE_PLANS.pro.yearlyPriceId;

  // Create Premium product if it doesn't exist
  if (!premiumProduct) {
    const product = await stripe.products.create({
      name: 'Apex Agents Premium',
      description: '50 agents, 2K AGI messages, 25 workflows, 10GB storage',
      metadata: { tier: 'premium' },
    });

    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: STRIPE_PLANS.premium.amount,
      recurring: { interval: 'month' },
    });
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: STRIPE_PLANS.premium.yearlyAmount,
      recurring: { interval: 'year' },
    });

    premiumPriceId = monthlyPrice.id;
    premiumYearlyPriceId = yearlyPrice.id;
    console.log('Created Premium product:', product.id, 'Monthly:', monthlyPrice.id, 'Yearly:', yearlyPrice.id);
  } else {
    // Get prices for existing product
    const prices = await stripe.prices.list({ product: premiumProduct.id, active: true, limit: 10 });
    const monthly = prices.data.find(p => p.recurring?.interval === 'month');
    const yearly  = prices.data.find(p => p.recurring?.interval === 'year');
    if (monthly) premiumPriceId = monthly.id;
    if (yearly)  premiumYearlyPriceId = yearly.id;
    // Create yearly price if missing
    if (!yearly) {
      const newYearly = await stripe.prices.create({
        product: premiumProduct.id,
        currency: 'usd',
        unit_amount: STRIPE_PLANS.premium.yearlyAmount,
        recurring: { interval: 'year' },
      });
      premiumYearlyPriceId = newYearly.id;
      console.log('Created missing Premium yearly price:', newYearly.id);
    }
  }

  // Create Pro product if it doesn't exist
  if (!proProduct) {
    const product = await stripe.products.create({
      name: 'Apex Agents Pro',
      description: 'Unlimited agents, 10K AGI messages, unlimited workflows, 100GB storage',
      metadata: { tier: 'pro' },
    });

    const monthlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: STRIPE_PLANS.pro.amount,
      recurring: { interval: 'month' },
    });
    const yearlyPrice = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: STRIPE_PLANS.pro.yearlyAmount,
      recurring: { interval: 'year' },
    });

    proPriceId = monthlyPrice.id;
    proYearlyPriceId = yearlyPrice.id;
    console.log('Created Pro product:', product.id, 'Monthly:', monthlyPrice.id, 'Yearly:', yearlyPrice.id);
  } else {
    // Get prices for existing product
    const prices = await stripe.prices.list({ product: proProduct.id, active: true, limit: 10 });
    const monthly = prices.data.find(p => p.recurring?.interval === 'month');
    const yearly  = prices.data.find(p => p.recurring?.interval === 'year');
    if (monthly) proPriceId = monthly.id;
    if (yearly)  proYearlyPriceId = yearly.id;
    // Create yearly price if missing
    if (!yearly) {
      const newYearly = await stripe.prices.create({
        product: proProduct.id,
        currency: 'usd',
        unit_amount: STRIPE_PLANS.pro.yearlyAmount,
        recurring: { interval: 'year' },
      });
      proYearlyPriceId = newYearly.id;
      console.log('Created missing Pro yearly price:', newYearly.id);
    }
  }

  return {
    premium:        premiumPriceId,
    premium_yearly: premiumYearlyPriceId,
    pro:            proPriceId,
    pro_yearly:     proYearlyPriceId,
  };
}

