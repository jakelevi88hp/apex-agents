# Apex Agents Deployment Guide

Complete guide for deploying the Apex Agents platform with subscription system to production.

## Prerequisites

- Vercel account
- Neon PostgreSQL database
- Stripe account (for payments)
- GitHub repository

## Step 1: Database Setup

### 1.1 Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project: "apex-agents-prod"
3. Copy the connection string (starts with `postgresql://`)

### 1.2 Run Migrations

```bash
# Install dependencies
npm install

# Set DATABASE_URL in .env.local
echo "DATABASE_URL=your_neon_connection_string" > .env.local

# Run subscription migrations
npx tsx scripts/migrate-subscriptions.ts
```

This will create:
- `subscriptions` table
- `usage_tracking` table
- Necessary indexes
- Initialize trial subscriptions for existing users

## Step 2: Stripe Setup

### 2.1 Get API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API Keys**
3. Copy:
   - **Secret key** (`sk_live_...`)
   - **Publishable key** (`pk_live_...`)

### 2.2 Create Products (Optional)

Products will be auto-created on first checkout, but you can create them manually:

1. Go to **Products** in Stripe Dashboard
2. Create **Premium** product:
   - Name: `Apex Agents Premium`
   - Price: $29.00 USD/month
   - Metadata: `tier = premium`
3. Create **Pro** product:
   - Name: `Apex Agents Pro`
   - Price: $99.00 USD/month
   - Metadata: `tier = pro`

## Step 3: Vercel Deployment

### 3.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New Project**
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3.2 Environment Variables

Add these in Vercel Project Settings → Environment Variables:

#### Database
```
DATABASE_URL=postgresql://...
```

#### Stripe
```
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (add after Step 4)
```

#### App Configuration
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

#### Authentication (if using NextAuth)
```
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=https://your-app.vercel.app
```

#### AI Services (if configured)
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

#### Vector Database (if using Pinecone)
```
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX=apex-agents
```

### 3.3 Deploy

Click **Deploy** and wait for the build to complete.

## Step 4: Stripe Webhook Setup

### 4.1 Register Webhook

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **Add endpoint**
3. Enter webhook URL:
   ```
   https://your-app.vercel.app/api/webhooks/stripe
   ```
4. Select events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. Click **Add endpoint**

### 4.2 Get Webhook Secret

1. Click on the webhook endpoint you just created
2. Click **Reveal** next to **Signing secret**
3. Copy the secret (starts with `whsec_...`)
4. Add to Vercel environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Redeploy the app for the new variable to take effect

## Step 5: Test the Deployment

### 5.1 Test Stripe Checkout

1. Go to your app's pricing page: `https://your-app.vercel.app/pricing`
2. Click **Upgrade to Premium**
3. Use Stripe test card: `4242 4242 4242 4242`
4. Complete checkout
5. Verify subscription appears in database

### 5.2 Test Webhooks

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click on your webhook endpoint
3. View **Recent deliveries**
4. Verify events are being received successfully

### 5.3 Test Feature Gating

1. Create agents until you hit the limit
2. Verify upgrade prompt appears
3. Try sending AGI messages until limit
4. Verify usage tracking works

## Step 6: Production Checklist

### Security
- [ ] All environment variables set correctly
- [ ] Stripe webhook secret configured
- [ ] Database connection secured with SSL
- [ ] Rate limiting enabled
- [ ] CORS configured properly

### Stripe Configuration
- [ ] Live mode API keys (not test keys)
- [ ] Products created with correct pricing
- [ ] Webhook endpoint registered and verified
- [ ] Customer portal enabled
- [ ] Email notifications configured

### Database
- [ ] Migrations run successfully
- [ ] Indexes created for performance
- [ ] Backup strategy in place
- [ ] Connection pooling configured

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Analytics tracking enabled
- [ ] Webhook delivery monitoring
- [ ] Database query performance monitoring

### User Experience
- [ ] Pricing page displays correctly
- [ ] Checkout flow works smoothly
- [ ] Trial countdown visible
- [ ] Usage limits enforced
- [ ] Upgrade prompts appear at right time

### Documentation
- [ ] API documentation updated
- [ ] User guide for subscriptions
- [ ] Admin guide for managing users
- [ ] Troubleshooting guide

## Step 7: Post-Deployment

### Monitor First Week

1. **Check Stripe Dashboard daily**
   - Verify successful payments
   - Monitor failed payments
   - Check webhook delivery success rate

2. **Monitor Error Logs**
   - Check Vercel logs for errors
   - Review Sentry error reports
   - Monitor database query performance

3. **User Feedback**
   - Monitor support tickets
   - Track conversion rates
   - Gather user feedback on pricing

### Optimization

1. **Database Performance**
   - Add indexes for slow queries
   - Optimize subscription checks
   - Cache frequently accessed data

2. **Stripe Optimization**
   - Set up automatic retries for failed payments
   - Configure dunning emails
   - Enable Smart Retries

3. **User Experience**
   - A/B test pricing page
   - Optimize upgrade prompts
   - Improve trial onboarding

## Troubleshooting

### Build Fails

**Error: Module not found**
- Check all imports are correct
- Verify packages are in `package.json`
- Clear build cache and redeploy

**Error: Environment variable not found**
- Verify all required env vars are set in Vercel
- Check variable names match exactly
- Redeploy after adding variables

### Webhook Issues

**Webhooks not being received**
- Verify webhook URL is correct and publicly accessible
- Check webhook secret is set correctly
- Review Stripe webhook logs for delivery errors

**Webhook signature verification fails**
- Ensure webhook secret matches Stripe dashboard
- Check request body is not being modified
- Verify raw body is being used for verification

### Subscription Issues

**Trial not starting**
- Check migration script ran successfully
- Verify `trialEndsAt` is being set correctly
- Check user creation flow

**Usage limits not enforcing**
- Verify middleware is being called
- Check subscription service is working
- Review usage tracking in database

**Stripe checkout fails**
- Verify Stripe API keys are correct
- Check products exist in Stripe
- Review Stripe logs for errors

## Rollback Procedure

If you need to rollback:

1. **Revert to previous deployment**
   ```bash
   # In Vercel Dashboard
   Deployments → Previous deployment → Promote to Production
   ```

2. **Rollback database changes**
   ```sql
   -- Only if necessary
   DROP TABLE IF EXISTS usage_tracking;
   DROP TABLE IF EXISTS subscriptions;
   ```

3. **Disable webhooks temporarily**
   - Go to Stripe Dashboard → Webhooks
   - Disable the webhook endpoint

## Support

- **Stripe Issues**: https://support.stripe.com
- **Vercel Issues**: https://vercel.com/support
- **Neon Issues**: https://neon.tech/docs

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure backup strategy
3. Plan marketing campaign
4. Prepare customer support
5. Monitor conversion metrics
6. Gather user feedback
7. Iterate on pricing strategy

---

**Congratulations!** 🎉 Your subscription system is now live in production!

