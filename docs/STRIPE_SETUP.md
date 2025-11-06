# Stripe Integration Setup Guide

This guide walks you through setting up Stripe payments for the Apex Agents subscription system.

## Prerequisites

- Stripe account (create at https://stripe.com)
- App deployed to production (for webhook URL)
- Access to environment variables

## Step 1: Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API Keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_live_` or `pk_test_`)
   - **Secret key** (starts with `sk_live_` or `sk_test_`)

### Add to Environment Variables

Add these to your Vercel project environment variables or `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_live_your_key_here
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_key_here
```

**Important:** Never commit these keys to git. They should only be in environment variables.

## Step 2: Products Auto-Creation

The system will automatically create Stripe products and prices on first checkout:

- **Premium**: $29/month
- **Pro**: $99/month

Products are created with metadata `tier: 'premium'` or `tier: 'pro'` for identification.

### Manual Product Creation (Optional)

If you prefer to create products manually:

1. Go to **Products** in Stripe Dashboard
2. Click **Add product**
3. For Premium:
   - Name: `Apex Agents Premium`
   - Description: `50 agents, 2K AGI messages, 25 workflows, 10GB storage`
   - Pricing: $29.00 USD, Recurring monthly
   - Add metadata: `tier = premium`
4. For Pro:
   - Name: `Apex Agents Pro`
   - Description: `Unlimited agents, 10K AGI messages, unlimited workflows, 100GB storage`
   - Pricing: $99.00 USD, Recurring monthly
   - Add metadata: `tier = pro`
5. Copy the Price IDs and add to environment:
   ```bash
   STRIPE_PREMIUM_PRICE_ID=price_your_premium_price_id
   STRIPE_PRO_PRICE_ID=price_your_pro_price_id
   ```

## Step 3: Set Up Webhook Endpoint

Webhooks are required to sync subscription status with your database.

### 3.1 Deploy Your App

Make sure your app is deployed to production (e.g., Vercel) so you have a public URL.

### 3.2 Register Webhook in Stripe

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter your webhook URL:
   ```
   https://your-app-url.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**

### 3.3 Get Webhook Secret

After creating the endpoint:

1. Click on the webhook endpoint
2. Click **Reveal** next to **Signing secret**
3. Copy the secret (starts with `whsec_...`)
4. Add to environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

### 3.4 Test Webhook (Optional)

Use Stripe CLI to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
```

## Step 4: Configure App URL

Set your production URL for Stripe redirects:

```bash
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

This is used for:
- Success URL after checkout
- Cancel URL if user abandons checkout
- Customer portal return URL

## Step 5: Test the Integration

### Test Mode (Recommended First)

1. Use test keys (`sk_test_...` and `pk_test_...`)
2. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
3. Any future expiry date and CVC

### Live Mode

1. Switch to live keys
2. Test with a real card (you can refund immediately)
3. Verify subscription appears in database
4. Check webhook events in Stripe Dashboard

## Step 6: Enable Customer Portal

The customer portal allows users to:
- Update payment methods
- View invoices
- Cancel subscriptions
- Update billing information

It's automatically enabled when you have active subscriptions.

## Troubleshooting

### Webhook Not Receiving Events

1. Check webhook URL is correct and publicly accessible
2. Verify webhook secret is correct
3. Check Stripe Dashboard → Webhooks → Recent deliveries for errors
4. Ensure your app is deployed (webhooks don't work on localhost without Stripe CLI)

### Checkout Session Fails

1. Verify API keys are correct
2. Check products/prices exist in Stripe
3. Look at server logs for error messages
4. Ensure `NEXT_PUBLIC_APP_URL` is set correctly

### Subscription Not Updating in Database

1. Check webhook is receiving events
2. Verify `userId` is in session metadata
3. Check database connection
4. Look at webhook handler logs

## Security Best Practices

1. **Never expose secret key**: Only use in server-side code
2. **Verify webhook signatures**: Always verify using `stripe.webhooks.constructEvent`
3. **Use HTTPS**: Webhooks require HTTPS in production
4. **Rotate keys**: If compromised, rotate keys in Stripe Dashboard
5. **Monitor usage**: Set up alerts for unusual activity

## Going Live Checklist

- [ ] Switch from test keys to live keys
- [ ] Update webhook endpoint to production URL
- [ ] Test complete checkout flow with real card
- [ ] Verify webhook events are processed
- [ ] Test subscription cancellation
- [ ] Test customer portal access
- [ ] Set up Stripe email notifications
- [ ] Configure tax collection (if required)
- [ ] Review Stripe settings (branding, emails, etc.)

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test your integration: https://dashboard.stripe.com/test/dashboard

## Pricing Structure

### Free Trial
- Duration: 3 days
- Features: Full access to all features
- No credit card required
- Automatically converts to free tier after expiry

### Premium - $29/month
- 50 agents
- 2,000 AGI messages/month
- 25 workflows
- 10 GB storage
- Priority support

### Pro - $99/month
- Unlimited agents
- 10,000 AGI messages/month
- Unlimited workflows
- 100 GB storage
- Team collaboration (10 users)
- Custom integrations
- Dedicated support

## Revenue Projections

Based on the monetization strategy:

**Conservative (Year 1)**
- 1,000 users
- 10% conversion rate
- $29 average revenue per user
- **$348,000 ARR**

**Moderate (Year 2)**
- 5,000 users
- 15% conversion rate
- $35 ARPU
- **$3.15M ARR**

**Optimistic (Year 3)**
- 20,000 users
- 20% conversion rate
- $40 ARPU
- **$19.2M ARR**

