import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

/**
 * Stripe Product and Price IDs
 * These need to be created in Stripe Dashboard and added to environment variables
 * Or we can create them programmatically on first run
 */
export const STRIPE_PLANS = {
  premium: {
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    name: 'Premium',
    amount: 2900, // $29.00 in cents
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    name: 'Pro',
    amount: 9900, // $99.00 in cents
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

  // Create Premium product if it doesn't exist
  if (!premiumProduct) {
    const product = await stripe.products.create({
      name: 'Apex Agents Premium',
      description: '50 agents, 2K AGI messages, 25 workflows, 10GB storage',
      metadata: { tier: 'premium' },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: STRIPE_PLANS.premium.amount,
      recurring: { interval: 'month' },
    });

    premiumPriceId = price.id;
    console.log('Created Premium product:', product.id, 'Price:', price.id);
  } else {
    // Get the price for existing product
    const prices = await stripe.prices.list({ product: premiumProduct.id, active: true, limit: 1 });
    if (prices.data.length > 0) {
      premiumPriceId = prices.data[0].id;
    }
  }

  // Create Pro product if it doesn't exist
  if (!proProduct) {
    const product = await stripe.products.create({
      name: 'Apex Agents Pro',
      description: 'Unlimited agents, 10K AGI messages, unlimited workflows, 100GB storage',
      metadata: { tier: 'pro' },
    });

    const price = await stripe.prices.create({
      product: product.id,
      currency: 'usd',
      unit_amount: STRIPE_PLANS.pro.amount,
      recurring: { interval: 'month' },
    });

    proPriceId = price.id;
    console.log('Created Pro product:', product.id, 'Price:', price.id);
  } else {
    // Get the price for existing product
    const prices = await stripe.prices.list({ product: proProduct.id, active: true, limit: 1 });
    if (prices.data.length > 0) {
      proPriceId = prices.data[0].id;
    }
  }

  return {
    premium: premiumPriceId,
    pro: proPriceId,
  };
}

