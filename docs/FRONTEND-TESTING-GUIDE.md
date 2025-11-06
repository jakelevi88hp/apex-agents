# Frontend Testing Guide

Complete guide for testing the subscription system in the browser.

## Quick Start

### 1. Open Browser Console

Navigate to your deployed app and open the browser console (F12).

### 2. Run Automated Tests

```javascript
// Run all subscription tests
await window.testSubscriptions();
```

This will automatically test:
- ✅ Pricing page loads correctly
- ✅ Subscription API endpoints are accessible
- ✅ Stripe checkout can be initiated
- ✅ Usage tracking is working

---

## Manual Testing Scenarios

### Scenario 1: New User Trial

**Steps:**
1. Create a new account or log in as a new user
2. Check that you're automatically on a trial plan
3. Navigate to `/pricing` page
4. Verify trial countdown banner appears
5. Check trial expiration date (should be 3 days from signup)

**Expected Results:**
- ✅ Trial subscription created automatically
- ✅ Banner shows "X days left in trial"
- ✅ All features accessible within trial limits

**SQL Verification:**
```sql
SELECT plan, status, trial_ends_at 
FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID';
```

---

### Scenario 2: Upgrade to Premium

**Steps:**
1. Log in as a trial user
2. Go to `/pricing`
3. Click "Upgrade to Premium" button
4. Complete Stripe checkout with test card: `4242 4242 4242 4242`
5. Return to app after payment

**Expected Results:**
- ✅ Redirected to Stripe checkout
- ✅ Payment processed successfully
- ✅ Subscription updated to Premium in database
- ✅ Trial banner disappears
- ✅ Usage limits increased

**Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

**SQL Verification:**
```sql
SELECT plan, status, stripe_customer_id, current_period_end
FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID';
```

---

### Scenario 3: Usage Limit Enforcement

**Steps:**
1. Log in as a trial user
2. Create agents until you hit the limit (10 for trial)
3. Try to create one more agent
4. Verify you're blocked with upgrade prompt

**Expected Results:**
- ✅ Can create up to 10 agents
- ✅ 11th agent creation blocked
- ✅ Error message: "Agent limit reached. Upgrade to create more."
- ✅ Upgrade button appears

**SQL Verification:**
```sql
SELECT feature, count, "limit"
FROM usage_tracking 
WHERE user_id = 'YOUR_USER_ID' AND feature = 'agents';
```

---

### Scenario 4: AGI Message Tracking

**Steps:**
1. Log in as a trial user
2. Send AGI messages via the AI Admin interface
3. Check usage stats
4. Send messages until limit reached (100 for trial)

**Expected Results:**
- ✅ Each message increments counter
- ✅ Usage bar updates in real-time
- ✅ Blocked at 100 messages
- ✅ Upgrade prompt appears

**SQL Verification:**
```sql
SELECT feature, count, "limit"
FROM usage_tracking 
WHERE user_id = 'YOUR_USER_ID' AND feature = 'agi_messages';
```

---

### Scenario 5: Workflow Limits

**Steps:**
1. Log in as a trial user
2. Create workflows until limit reached (5 for trial)
3. Try to create 6th workflow
4. Verify blocking and upgrade prompt

**Expected Results:**
- ✅ Can create up to 5 workflows
- ✅ 6th workflow creation blocked
- ✅ Error message appears
- ✅ Upgrade button shown

---

### Scenario 6: Trial Expiration

**Steps:**
1. Manually expire a trial in database:
   ```sql
   UPDATE subscriptions 
   SET trial_ends_at = NOW() - INTERVAL '1 hour'
   WHERE user_id = 'YOUR_USER_ID';
   ```
2. Refresh the app
3. Try to use any feature

**Expected Results:**
- ✅ Banner shows "Trial expired"
- ✅ All features blocked
- ✅ Upgrade prompt on every action
- ✅ Can only access pricing page

---

### Scenario 7: Subscription Cancellation

**Steps:**
1. Log in as a Premium user
2. Go to account settings
3. Click "Manage Billing"
4. In Stripe portal, cancel subscription
5. Return to app

**Expected Results:**
- ✅ Redirected to Stripe customer portal
- ✅ Can cancel subscription
- ✅ Subscription marked as "cancel_at_period_end"
- ✅ Access continues until period end
- ✅ Banner shows "Subscription ends on [date]"

**SQL Verification:**
```sql
SELECT status, cancel_at_period_end, current_period_end
FROM subscriptions 
WHERE user_id = 'YOUR_USER_ID';
```

---

### Scenario 8: Webhook Processing

**Steps:**
1. Trigger a test webhook from Stripe Dashboard
2. Go to Stripe Dashboard → Webhooks
3. Select your webhook endpoint
4. Click "Send test webhook"
5. Choose event: `checkout.session.completed`

**Expected Results:**
- ✅ Webhook received (200 OK)
- ✅ Subscription updated in database
- ✅ Webhook logged in monitoring
- ✅ Processing time < 5 seconds

**Monitoring Check:**
```javascript
// Check webhook stats
const response = await fetch('/api/monitoring/metrics');
const data = await response.json();
console.log(data.webhookStats);
```

---

### Scenario 9: Payment Failure

**Steps:**
1. Use test card that declines: `4000 0000 0000 0002`
2. Try to upgrade to Premium
3. Complete checkout with declining card

**Expected Results:**
- ✅ Payment declined
- ✅ Error message shown
- ✅ Subscription not created
- ✅ User remains on trial
- ✅ Webhook logged as failed

---

### Scenario 10: Billing Period Renewal

**Steps:**
1. Manually update subscription to end soon:
   ```sql
   UPDATE subscriptions 
   SET current_period_end = NOW() + INTERVAL '1 hour'
   WHERE user_id = 'YOUR_USER_ID';
   ```
2. Wait for Stripe to process renewal (or trigger manually)
3. Check subscription updated

**Expected Results:**
- ✅ Stripe processes renewal
- ✅ Webhook received
- ✅ `current_period_end` updated
- ✅ Subscription remains active
- ✅ Usage limits reset

---

## Monitoring Dashboard

### Access Monitoring

Navigate to `/admin/monitoring` (admin access required)

**Metrics Displayed:**
- 💰 Monthly Recurring Revenue (MRR)
- 📊 Annual Recurring Revenue (ARR)
- 👥 Active subscriptions by tier
- 📈 Trial conversion rate
- 📉 Churn rate
- 🚨 System health alerts
- ⏰ Trials expiring soon
- 🚫 Users at usage limits

### Refresh Monitoring

Click the "Refresh" button or wait 5 minutes for auto-refresh.

---

## API Testing

### Test Subscription API

```javascript
// Get current subscription
const sub = await fetch('/api/trpc/subscription.getCurrent').then(r => r.json());
console.log('Current subscription:', sub);

// Get usage stats
const usage = await fetch('/api/trpc/subscription.getUsage').then(r => r.json());
console.log('Usage stats:', usage);

// Get available plans
const plans = await fetch('/api/trpc/subscription.getPlans').then(r => r.json());
console.log('Available plans:', plans);
```

### Test Stripe Checkout

```javascript
// Create checkout session
const checkout = await fetch('/api/trpc/subscription.createCheckoutSession', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    plan: 'premium',
    billingPeriod: 'monthly'
  })
}).then(r => r.json());

console.log('Checkout URL:', checkout.url);
// window.location.href = checkout.url; // Redirect to checkout
```

---

## Troubleshooting

### Issue: Subscription not updating after payment

**Check:**
1. Webhook endpoint is configured in Stripe
2. Webhook secret is correct in environment variables
3. Check webhook logs in Stripe Dashboard
4. Check server logs for errors

**Fix:**
```sql
-- Manually update subscription
UPDATE subscriptions 
SET plan = 'premium', 
    status = 'active',
    stripe_customer_id = 'cus_xxx'
WHERE user_id = 'YOUR_USER_ID';
```

### Issue: Usage limits not enforcing

**Check:**
1. Middleware is active in tRPC procedures
2. Usage tracking table has correct data
3. Check server logs for errors

**Fix:**
```sql
-- Reset usage tracking
DELETE FROM usage_tracking WHERE user_id = 'YOUR_USER_ID';
```

### Issue: Trial not expiring

**Check:**
1. `trial_ends_at` timestamp is in the past
2. Subscription status is still 'active'

**Fix:**
```sql
-- Manually expire trial
UPDATE subscriptions 
SET trial_ends_at = NOW() - INTERVAL '1 day'
WHERE user_id = 'YOUR_USER_ID';
```

---

## Performance Benchmarks

### Target Metrics

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Webhook Processing**: < 5 seconds
- **Checkout Redirect**: < 1 second

### Measure Performance

```javascript
// Measure API response time
console.time('API Call');
await fetch('/api/trpc/subscription.getCurrent');
console.timeEnd('API Call');

// Measure page load time
console.log('Page load:', performance.timing.loadEventEnd - performance.timing.navigationStart, 'ms');
```

---

## Automated Testing Script

Save this as a bookmark for quick testing:

```javascript
javascript:(async function() {
  console.clear();
  console.log('🚀 Running Subscription Tests...\n');
  
  const results = await window.testSubscriptions();
  
  if (results.failed === 0) {
    console.log('✅ ALL TESTS PASSED!');
  } else {
    console.log(`❌ ${results.failed} TESTS FAILED`);
  }
  
  console.log(`\n📊 Results: ${results.passed}/${results.passed + results.failed} passed`);
})();
```

---

## Success Criteria

Before launching to production, ensure:

- ✅ All 10 manual test scenarios pass
- ✅ Automated tests show 100% pass rate
- ✅ Webhook success rate > 95%
- ✅ API response time < 500ms
- ✅ No console errors on any page
- ✅ Mobile responsive design works
- ✅ Trial conversion tracking works
- ✅ Usage limits enforce correctly
- ✅ Stripe checkout completes successfully
- ✅ Monitoring dashboard shows accurate data

---

## Next Steps

After testing is complete:

1. ✅ Deploy to production
2. ✅ Monitor webhook delivery rate
3. ✅ Track trial conversion rate
4. ✅ Set up alerts for failures
5. ✅ Review user feedback
6. ✅ Optimize based on metrics

