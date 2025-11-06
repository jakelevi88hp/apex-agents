# Final Testing & Verification Guide

Complete guide for testing the subscription system before full launch.

---

## ✅ System Status

**All Core Components Deployed:**
- ✅ Database: Migrated and seeded
- ✅ Pricing Page: Live at https://apex-agents.vercel.app/pricing
- ✅ Stripe Integration: Webhook configured
- ✅ Backend APIs: Deployed
- ✅ Feature Gating: Implemented
- ✅ Monitoring Dashboard: Deployed (requires admin auth)

---

## 🧪 Critical Tests (Must Complete Before Launch)

### Test 1: Stripe Checkout Flow (15 minutes)

**Prerequisites:**
- Logged in to apex-agents.vercel.app
- On a trial subscription

**Steps:**
1. Navigate to https://apex-agents.vercel.app/pricing
2. Click **"Upgrade to Premium"** button
3. You should be redirected to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Enter any future expiry date (e.g., 12/25)
6. Enter any 3-digit CVC (e.g., 123)
7. Enter any ZIP code (e.g., 12345)
8. Click **"Subscribe"**
9. You should be redirected back to the app

**Expected Results:**
- ✅ Redirected to Stripe Checkout page
- ✅ Checkout form displays correctly
- ✅ Payment processes successfully
- ✅ Redirected back to app after payment
- ✅ Subscription updated in database

**Verification:**
```sql
-- Check subscription was created/updated
SELECT 
  user_id, 
  plan, 
  status, 
  stripe_customer_id,
  stripe_subscription_id,
  current_period_end
FROM subscriptions
WHERE stripe_customer_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 1;
```

**If it fails:**
- Check Stripe Dashboard → Payments for the transaction
- Check Stripe Dashboard → Webhooks for delivery status
- Check server logs for errors
- Verify STRIPE_SECRET_KEY is set correctly

---

### Test 2: Webhook Delivery (5 minutes)

**Steps:**
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click **"Send test webhook"**
4. Select event: `checkout.session.completed`
5. Click **"Send test webhook"**

**Expected Results:**
- ✅ Response status: 200 OK
- ✅ Response time: < 5 seconds
- ✅ No errors in response body

**Verification:**
Check the webhook attempt details in Stripe Dashboard:
- Status should be "Succeeded"
- Response body should show success message
- No error logs

**If it fails:**
- Check webhook URL is correct: `https://apex-agents.vercel.app/api/webhooks/stripe`
- Check STRIPE_WEBHOOK_SECRET is set correctly
- Check server logs for errors
- Verify webhook handler is deployed

---

### Test 3: Feature Gating - Agent Limits (10 minutes)

**Prerequisites:**
- Logged in as a trial user
- Know your trial agent limit (10 agents)

**Steps:**
1. Navigate to the agents page
2. Create agents one by one
3. Count how many you can create
4. Try to create the 11th agent

**Expected Results:**
- ✅ Can create up to 10 agents
- ✅ 11th agent creation blocked
- ✅ Error message: "Agent limit reached. Upgrade to create more agents."
- ✅ Upgrade button/link appears

**Verification:**
```sql
-- Check agent count
SELECT COUNT(*) as agent_count
FROM agents
WHERE user_id = 'YOUR_USER_ID';

-- Check usage tracking
SELECT feature, count, "limit"
FROM usage_tracking
WHERE user_id = 'YOUR_USER_ID' AND feature = 'agents';
```

**If it fails:**
- Check if middleware is applied to agent creation endpoint
- Check if usage tracking is updating
- Check server logs for errors

---

### Test 4: Feature Gating - AGI Message Limits (10 minutes)

**Prerequisites:**
- Logged in as a trial user
- Know your trial message limit (100 messages)

**Steps:**
1. Navigate to AI Admin or chat interface
2. Send multiple AGI messages
3. Check usage counter
4. Try to send message #101

**Expected Results:**
- ✅ Can send up to 100 messages
- ✅ Usage counter updates after each message
- ✅ 101st message blocked
- ✅ Error message: "Message limit reached. Upgrade for more messages."
- ✅ Upgrade prompt appears

**Verification:**
```sql
-- Check message usage
SELECT feature, count, "limit", last_reset
FROM usage_tracking
WHERE user_id = 'YOUR_USER_ID' AND feature = 'agi_messages';
```

**If it fails:**
- Check if AGI process route has usage tracking
- Check if usage increments correctly
- Check server logs for errors

---

### Test 5: Customer Portal Access (5 minutes)

**Prerequisites:**
- Logged in as a Premium user
- Have an active Stripe subscription

**Steps:**
1. Navigate to account settings
2. Click **"Manage Billing"** or **"Customer Portal"**
3. You should be redirected to Stripe Customer Portal

**Expected Results:**
- ✅ Redirected to Stripe Customer Portal
- ✅ Can see current subscription
- ✅ Can update payment method
- ✅ Can cancel subscription
- ✅ Can download invoices

**Verification:**
- Portal loads without errors
- Subscription details match database
- All portal features work

**If it fails:**
- Check STRIPE_SECRET_KEY is set
- Check customer ID exists in database
- Check server logs for errors

---

### Test 6: Subscription Cancellation (10 minutes)

**Prerequisites:**
- Logged in as a Premium user
- Have an active subscription

**Steps:**
1. Access Stripe Customer Portal (Test 5)
2. Click **"Cancel subscription"**
3. Confirm cancellation
4. Return to app

**Expected Results:**
- ✅ Subscription marked as `cancel_at_period_end: true`
- ✅ Access continues until period end
- ✅ Banner shows "Subscription ends on [date]"
- ✅ Webhook received and processed

**Verification:**
```sql
-- Check cancellation status
SELECT 
  plan,
  status,
  cancel_at_period_end,
  current_period_end
FROM subscriptions
WHERE user_id = 'YOUR_USER_ID';
```

**If it fails:**
- Check webhook delivery for `customer.subscription.updated`
- Check database update logic
- Check server logs

---

### Test 7: Trial Expiration (5 minutes)

**Prerequisites:**
- Have a test user with expired trial

**Steps:**
1. Manually expire a trial in database:
```sql
UPDATE subscriptions
SET trial_ends_at = NOW() - INTERVAL '1 hour'
WHERE user_id = 'TEST_USER_ID';
```
2. Log in as that user
3. Try to use any feature

**Expected Results:**
- ✅ Banner shows "Trial expired"
- ✅ All features blocked
- ✅ Upgrade prompt on every action
- ✅ Can only access pricing page

**Verification:**
- User cannot create agents
- User cannot send messages
- User cannot create workflows
- Upgrade prompts appear everywhere

**If it fails:**
- Check trial expiration logic
- Check feature gating middleware
- Check server logs

---

### Test 8: Usage Tracking Accuracy (10 minutes)

**Prerequisites:**
- Logged in as any user

**Steps:**
1. Note current usage counts
2. Perform actions:
   - Create 2 agents
   - Send 5 AGI messages
   - Create 1 workflow
3. Check usage counts again

**Expected Results:**
- ✅ Agent count increased by 2
- ✅ Message count increased by 5
- ✅ Workflow count increased by 1
- ✅ All counts accurate in database

**Verification:**
```sql
-- Check all usage tracking
SELECT 
  feature,
  count,
  "limit",
  last_reset,
  updated_at
FROM usage_tracking
WHERE user_id = 'YOUR_USER_ID'
ORDER BY feature;
```

**If it fails:**
- Check usage tracking service
- Check increment logic
- Check server logs

---

### Test 9: Monitoring Dashboard (5 minutes)

**Prerequisites:**
- Logged in as admin user

**Steps:**
1. Navigate to https://apex-agents.vercel.app/admin/monitoring
2. Dashboard should load with metrics

**Expected Results:**
- ✅ Dashboard loads without errors
- ✅ Shows MRR, ARR, ARPU
- ✅ Shows active subscriptions by tier
- ✅ Shows conversion rate and churn rate
- ✅ Shows trials expiring soon
- ✅ Shows users at limit
- ✅ Refresh button works

**Verification:**
- All metrics display correctly
- Numbers match database queries
- No console errors

**If it fails:**
- Check authentication (must be admin)
- Check monitoring API endpoint
- Check database connection
- Check server logs

---

### Test 10: Billing Period Renewal (Automated)

**Prerequisites:**
- Have a test subscription ending soon

**Steps:**
1. Set subscription to end in 1 hour:
```sql
UPDATE subscriptions
SET current_period_end = NOW() + INTERVAL '1 hour'
WHERE user_id = 'TEST_USER_ID';
```
2. Wait for Stripe to process renewal (or trigger manually)
3. Check subscription updated

**Expected Results:**
- ✅ Stripe processes renewal
- ✅ Webhook received
- ✅ `current_period_end` updated to +30 days
- ✅ Subscription remains active
- ✅ Usage limits reset (if applicable)

**Verification:**
```sql
-- Check renewal
SELECT 
  plan,
  status,
  current_period_start,
  current_period_end,
  updated_at
FROM subscriptions
WHERE user_id = 'TEST_USER_ID';
```

**If it fails:**
- Check webhook delivery
- Check renewal logic
- Check Stripe Dashboard for invoice

---

## 📊 Performance Benchmarks

Run these checks to ensure system performance:

### API Response Times

```javascript
// Test subscription API
console.time('Get Subscription');
await fetch('/api/trpc/subscription.getCurrent');
console.timeEnd('Get Subscription');
// Target: < 500ms

// Test usage API
console.time('Get Usage');
await fetch('/api/trpc/subscription.getUsage');
console.timeEnd('Get Usage');
// Target: < 500ms

// Test checkout creation
console.time('Create Checkout');
await fetch('/api/trpc/subscription.createCheckoutSession', {
  method: 'POST',
  body: JSON.stringify({ plan: 'premium', billingPeriod: 'monthly' })
});
console.timeEnd('Create Checkout');
// Target: < 1000ms
```

### Database Query Performance

```sql
-- Test subscription query
EXPLAIN ANALYZE
SELECT * FROM subscriptions WHERE user_id = 'TEST_USER_ID';
-- Target: < 10ms

-- Test usage tracking query
EXPLAIN ANALYZE
SELECT * FROM usage_tracking WHERE user_id = 'TEST_USER_ID';
-- Target: < 10ms

-- Test webhook logs query
EXPLAIN ANALYZE
SELECT * FROM webhook_logs ORDER BY created_at DESC LIMIT 20;
-- Target: < 50ms
```

### Webhook Processing Time

Check Stripe Dashboard → Webhooks → Recent deliveries:
- Target response time: < 5 seconds
- Target success rate: > 95%

---

## 🚨 Troubleshooting

### Issue: Checkout button does nothing

**Possible causes:**
- Not logged in
- JavaScript error
- API endpoint error

**Fix:**
1. Check browser console for errors
2. Verify logged in
3. Check network tab for failed requests
4. Check server logs

### Issue: Webhook not received

**Possible causes:**
- Wrong webhook URL
- Wrong webhook secret
- Endpoint not deployed

**Fix:**
1. Verify webhook URL in Stripe Dashboard
2. Verify STRIPE_WEBHOOK_SECRET env var
3. Test endpoint manually: `curl -X POST https://apex-agents.vercel.app/api/webhooks/stripe`
4. Check Vercel deployment logs

### Issue: Subscription not updating after payment

**Possible causes:**
- Webhook not processed
- Database connection error
- Logic error in webhook handler

**Fix:**
1. Check Stripe Dashboard → Webhooks for delivery status
2. Check server logs for errors
3. Manually update subscription in database
4. Retry webhook from Stripe Dashboard

### Issue: Feature limits not enforcing

**Possible causes:**
- Middleware not applied
- Usage tracking not updating
- Logic error in limit check

**Fix:**
1. Check middleware is applied to endpoints
2. Verify usage tracking updates
3. Check limit calculation logic
4. Check server logs

---

## ✅ Launch Checklist

Before announcing to users, verify:

- [ ] All 10 critical tests pass
- [ ] API response times < 500ms
- [ ] Webhook success rate > 95%
- [ ] No console errors on any page
- [ ] Mobile responsive design works
- [ ] All documentation complete
- [ ] Monitoring dashboard accessible
- [ ] Rollback plan ready
- [ ] Support team trained
- [ ] Announcement prepared

---

## 🎯 Success Metrics

Monitor these metrics daily for the first week:

**Technical:**
- Webhook delivery rate: Target > 95%
- API response time: Target < 500ms
- Error rate: Target < 1%
- Uptime: Target > 99.9%

**Business:**
- Trial conversion rate: Target > 10%
- Monthly churn rate: Target < 5%
- ARPU: Target > $30
- MRR growth: Target > 20% month-over-month

**User Experience:**
- Checkout completion rate: Target > 80%
- Customer portal usage: Monitor
- Support tickets: Monitor
- User feedback: Collect and analyze

---

## 📞 Support Contacts

**Technical Issues:**
- GitHub: Create issue at jakelevi88hp/apex-agents
- Email: dev@apexagents.com

**Billing/Stripe:**
- Stripe Dashboard: https://dashboard.stripe.com/support
- Stripe Status: https://status.stripe.com

**Database:**
- Neon Dashboard: https://console.neon.tech
- Neon Support: https://neon.tech/docs/introduction/support

**Deployment:**
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Support: https://vercel.com/support

---

## 🎉 Ready to Launch!

Once all tests pass:

1. ✅ Verify all 10 critical tests
2. ✅ Check performance benchmarks
3. ✅ Monitor for 24 hours
4. ✅ Announce to users
5. ✅ Monitor metrics daily
6. ✅ Collect feedback
7. ✅ Iterate and improve

**Good luck with your launch!** 🚀

