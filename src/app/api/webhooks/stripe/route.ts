import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { db } from '@/server/db';
import { subscriptions } from '@/lib/db/schema/subscriptions';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('No userId in checkout session metadata');
    return;
  }

  // Get the subscription from Stripe
  const subscriptionId = session.subscription as string;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Determine tier based on price
  const priceId = subscription.items.data[0].price.id;
  let tier: 'premium' | 'pro' = 'premium';
  
  // You'll need to match price IDs to tiers
  // This is a simplified version
  const amount = subscription.items.data[0].price.unit_amount || 0;
  if (amount >= 9900) {
    tier = 'pro';
  }

  // Update or create subscription in database
  const existingSubscription = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (existingSubscription.length > 0) {
    await db
      .update(subscriptions)
      .set({
        tier,
        status: 'active',
        stripeSubscriptionId: subscriptionId,
        stripeCustomerId: customerId,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({
      userId,
      tier,
      status: 'active',
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  }

  console.log(`Subscription created for user ${userId}: ${tier}`);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  // Determine tier
  const amount = subscription.items.data[0].price.unit_amount || 0;
  let tier: 'premium' | 'pro' = 'premium';
  if (amount >= 9900) {
    tier = 'pro';
  }

  const status = subscription.status === 'active' ? 'active' : 
                 subscription.status === 'canceled' ? 'canceled' : 
                 subscription.status === 'past_due' ? 'past_due' : 'active';

  await db
    .update(subscriptions)
    .set({
      tier,
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId));

  console.log(`Subscription updated for user ${userId}: ${tier} (${status})`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;

  if (!userId) {
    console.error('No userId in subscription metadata');
    return;
  }

  await db
    .update(subscriptions)
    .set({
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.userId, userId));

  console.log(`Subscription canceled for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Update subscription status to active
  await db
    .update(subscriptions)
    .set({
      status: 'active',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`Payment succeeded for subscription ${subscriptionId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;

  if (!subscriptionId) {
    return;
  }

  // Update subscription status to past_due
  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscriptionId));

  console.log(`Payment failed for subscription ${subscriptionId}`);
}

