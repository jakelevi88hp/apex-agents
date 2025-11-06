# Subscription System Testing Guide

Comprehensive testing guide for the Apex Agents subscription system.

## Test Environment Setup

### 1. Use Stripe Test Mode

Always test with Stripe test keys first:

```bash
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 2. Test Cards

Stripe provides test cards for different scenarios:

| Card Number | Scenario |
|-------------|----------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | 3D Secure authentication required |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |

Use any future expiry date and any 3-digit CVC.

## Test Scenarios

### Scenario 1: New User Trial

**Objective**: Verify new users get 3-day trial automatically

**Steps**:
1. Create a new user account
2. Check database for subscription record
3. Verify trial status in dashboard
4. Confirm trial end date is 3 days from now

**Expected Results**:
- ✅ Subscription record created with `plan='trial'`
- ✅ `trialEndsAt` set to NOW() + 3 days
- ✅ Trial banner shows days remaining
- ✅ All features accessible during trial

**SQL Verification**:
```sql
SELECT 
  id, user_id, plan, status, 
  trial_started_at, trial_ends_at,
  EXTRACT(DAY FROM (trial_ends_at - NOW())) as days_remaining
FROM subscriptions 
WHERE user_id = 'your_user_id';
```

### Scenario 2: Trial Expiration

**Objective**: Verify trial expires and features are gated

**Steps**:
1. Manually set trial end date to past:
   ```sql
   UPDATE subscriptions 
   SET trial_ends_at = NOW() - INTERVAL '1 day'
   WHERE user_id = 'your_user_id';
   ```
2. Try to create a new agent
3. Try to send AGI message
4. Check for upgrade prompts

**Expected Results**:
- ✅ "Trial expired" message appears
- ✅ Feature creation blocked
- ✅ Upgrade prompt shows
- ✅ Existing data still accessible (read-only)

### Scenario 3: Premium Upgrade

**Objective**: Test checkout flow and subscription activation

**Steps**:
1. Go to `/pricing` page
2. Click "Upgrade to Premium"
3. Complete Stripe checkout with test card `4242 4242 4242 4242`
4. Verify redirect to success page
5. Check subscription updated in database

**Expected Results**:
- ✅ Redirected to Stripe checkout
- ✅ Payment processed successfully
- ✅ Webhook received and processed
- ✅ Subscription updated to `plan='premium'`, `status='active'`
- ✅ Stripe customer ID and subscription ID saved
- ✅ Usage limits updated to Premium tier
- ✅ Success banner shows in dashboard

**Database Verification**:
```sql
SELECT * FROM subscriptions WHERE user_id = 'your_user_id';
```

Should show:
- `plan = 'premium'`
- `status = 'active'`
- `stripe_customer_id` populated
- `stripe_subscription_id` populated
- `current_period_start` and `current_period_end` set

### Scenario 4: Usage Tracking

**Objective**: Verify usage limits are tracked and enforced

**Steps**:
1. Create agents until limit reached
2. Try to create one more agent
3. Check usage tracking in database
4. Verify upgrade prompt appears

**Expected Results**:
- ✅ Agent creation succeeds until limit
- ✅ Error message when limit reached
- ✅ Usage count increments in `usage_tracking` table
- ✅ Upgrade prompt shows with current usage stats

**Test for Each Feature**:

#### Agents (Premium: 50, Pro: unlimited)
```bash
# Create agents via API
for i in {1..51}; do
  curl -X POST https://your-app/api/trpc/agents.create \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Agent '$i'"}'
done
```

#### AGI Messages (Premium: 2000, Pro: 10000)
```bash
# Send AGI messages
for i in {1..2001}; do
  curl -X POST https://your-app/api/agi/process \
    -H "Content-Type: application/json" \
    -d '{"input":"Test message '$i'"}'
done
```

#### Workflows (Premium: 25, Pro: unlimited)
```bash
# Create workflows
for i in {1..26}; do
  curl -X POST https://your-app/api/trpc/workflows.create \
    -H "Content-Type: application/json" \
    -d '{"name":"Test Workflow '$i'"}'
done
```

### Scenario 5: Subscription Cancellation

**Objective**: Test subscription cancellation flow

**Steps**:
1. Go to account settings
2. Click "Manage Subscription"
3. Click "Cancel Subscription" in Stripe portal
4. Confirm cancellation
5. Verify subscription marked for cancellation

**Expected Results**:
- ✅ Redirected to Stripe customer portal
- ✅ Cancellation processed
- ✅ Webhook received
- ✅ `cancel_at_period_end = true` in database
- ✅ Access continues until period end
- ✅ Banner shows "Subscription ends on [date]"

### Scenario 6: Payment Failure

**Objective**: Test failed payment handling

**Steps**:
1. Update payment method to declined card `4000 0000 0000 0002`
2. Wait for subscription renewal (or trigger manually in Stripe)
3. Check webhook processing
4. Verify subscription status update

**Expected Results**:
- ✅ `invoice.payment_failed` webhook received
- ✅ Subscription status changed to `past_due`
- ✅ User notified of payment failure
- ✅ Retry attempted automatically
- ✅ Access temporarily maintained (grace period)

### Scenario 7: Plan Upgrade (Premium → Pro)

**Objective**: Test upgrading from Premium to Pro

**Steps**:
1. User on Premium plan
2. Go to pricing page
3. Click "Upgrade to Pro"
4. Complete checkout
5. Verify immediate upgrade

**Expected Results**:
- ✅ Prorated charge calculated correctly
- ✅ Subscription updated to Pro immediately
- ✅ Usage limits updated to Pro tier
- ✅ Webhook processed successfully
- ✅ No service interruption

### Scenario 8: Storage Limits

**Objective**: Test file upload storage limits

**Steps**:
1. Upload files until storage limit reached
2. Try to upload one more file
3. Verify error message
4. Check storage usage calculation

**Expected Results**:
- ✅ Uploads succeed until limit
- ✅ Clear error when limit reached
- ✅ Storage usage accurately calculated
- ✅ Upgrade prompt shows storage stats

**Test Upload**:
```bash
# Upload 1GB file (Premium limit: 10GB)
dd if=/dev/zero of=testfile.bin bs=1M count=1000
curl -X POST https://your-app/api/documents/upload \
  -F "file=@testfile.bin"
```

### Scenario 9: Webhook Failures

**Objective**: Test webhook retry and error handling

**Steps**:
1. Temporarily break webhook endpoint (return 500 error)
2. Trigger subscription event in Stripe
3. Check Stripe webhook logs
4. Fix endpoint
5. Manually retry webhook in Stripe

**Expected Results**:
- ✅ Stripe retries webhook automatically
- ✅ Failed webhooks logged in Stripe
- ✅ Manual retry succeeds after fix
- ✅ Subscription eventually synced correctly

### Scenario 10: Edge Cases

#### Multiple Subscriptions
**Test**: User tries to create multiple subscriptions
**Expected**: Only one active subscription per user

#### Expired Trial + New Subscription
**Test**: Trial expires, then user subscribes
**Expected**: Subscription replaces trial cleanly

#### Subscription During Trial
**Test**: User subscribes before trial ends
**Expected**: Trial ends, subscription starts immediately

#### Concurrent Usage
**Test**: Multiple requests hitting usage limit simultaneously
**Expected**: Proper locking, accurate count, no race conditions

## Automated Testing

### Unit Tests

```typescript
// Example: Test subscription service
describe('SubscriptionService', () => {
  it('should check trial expiration correctly', async () => {
    const userId = 'test-user';
    const isExpired = await SubscriptionService.isTrialExpired(userId);
    expect(isExpired).toBe(false);
  });

  it('should enforce usage limits', async () => {
    const userId = 'test-user';
    const canUse = await SubscriptionService.canUseFeature(userId, 'agents');
    expect(canUse).toBe(true);
  });
});
```

### Integration Tests

```typescript
// Example: Test checkout flow
describe('Checkout Flow', () => {
  it('should create checkout session', async () => {
    const response = await trpc.subscription.createCheckoutSession.mutate({
      plan: 'premium',
      billingPeriod: 'monthly'
    });
    expect(response.url).toContain('checkout.stripe.com');
  });
});
```

### E2E Tests

```typescript
// Example: Playwright test
test('complete subscription flow', async ({ page }) => {
  await page.goto('/pricing');
  await page.click('text=Upgrade to Premium');
  await page.fill('[name="cardNumber"]', '4242424242424242');
  await page.click('text=Subscribe');
  await expect(page).toHaveURL('/dashboard?success=true');
});
```

## Performance Testing

### Load Testing

Test concurrent subscription operations:

```bash
# Install k6
brew install k6

# Run load test
k6 run load-test.js
```

```javascript
// load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up
    { duration: '3m', target: 50 },  // Stay at 50 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
};

export default function() {
  let response = http.post('https://your-app/api/agi/process', 
    JSON.stringify({ input: 'test' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'usage tracked': (r) => r.json('success') === true,
  });
}
```

## Monitoring in Production

### Key Metrics to Monitor

1. **Subscription Metrics**
   - New subscriptions per day
   - Churn rate
   - Upgrade rate (trial → paid)
   - Downgrade rate

2. **Usage Metrics**
   - Average usage per tier
   - Users hitting limits
   - Feature adoption rates

3. **Payment Metrics**
   - Successful payments
   - Failed payments
   - Retry success rate
   - Refund rate

4. **Technical Metrics**
   - Webhook delivery success rate
   - API response times
   - Database query performance
   - Error rates

### Alerts to Set Up

- ⚠️ Webhook delivery failure rate > 5%
- ⚠️ Payment failure rate > 10%
- ⚠️ API error rate > 1%
- ⚠️ Database query time > 1s
- ⚠️ Subscription sync lag > 5 minutes

## Troubleshooting Common Issues

### Issue: Webhook not received

**Check**:
1. Webhook URL is correct and accessible
2. Webhook secret matches
3. Stripe webhook logs show delivery attempts
4. Server logs show incoming requests

**Fix**:
- Update webhook URL in Stripe
- Verify webhook secret
- Check firewall/security rules
- Manually retry failed webhooks

### Issue: Usage not tracked

**Check**:
1. Middleware is being called
2. Database connection works
3. Usage tracking table exists
4. User has subscription record

**Fix**:
- Verify middleware is applied to routes
- Check database migrations ran
- Review server logs for errors

### Issue: Limits not enforced

**Check**:
1. Subscription service is working
2. Usage limits are correct for tier
3. Middleware is checking limits
4. Cache is not stale

**Fix**:
- Verify subscription tier in database
- Check limit configuration
- Clear cache if using caching
- Review middleware logic

## Checklist Before Production

- [ ] All test scenarios pass
- [ ] Load testing completed successfully
- [ ] Webhook delivery verified
- [ ] Usage tracking accurate
- [ ] Limits enforced correctly
- [ ] Error handling works
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Documentation updated
- [ ] Team trained on troubleshooting

---

**Happy Testing!** 🧪

