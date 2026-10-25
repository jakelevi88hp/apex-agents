/**
 * E2E Tests for Subscription Flows
 *
 * Runs as the seeded non-admin trial user (scripts/seed-ci-user.mjs):
 * - trial plan shown in the dashboard banner and on the pricing page
 * - usage shown in Settings > Billing
 * - limit enforcement via subscription.canUseFeature, using the seeded
 *   `e2e_limit_probe` counter that is already at its limit
 */

import { test, expect, apiLogin, hasTestUser, NO_TEST_USER_REASON } from '../fixtures/auth';

test.describe('Subscription Management', () => {
  test('should display current subscription plan', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/days? left in your free trial/)).toBeVisible({ timeout: 15000 });
  });

  test('should show usage in billing settings', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/settings');
    await page.getByRole('button', { name: 'Billing', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Current Plan' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Usage This Month' })).toBeVisible();
    await expect(page.getByText('Agent Executions')).toBeVisible();
    // Real plan limits (same copy as /pricing), not the old "Unlimited agents and executions"
    await expect(page.getByTestId('plan-limits')).toContainText('100 AI messages during the 3-day trial');
    await expect(page.getByTestId('plan-limits')).toContainText('Up to 10 agents');
    await expect(page.getByText('Unlimited agents and executions')).toHaveCount(0);
  });

  test('should report a feature at its limit as not allowed', async ({ request }) => {
    test.skip(!hasTestUser, NO_TEST_USER_REASON);
    const token = await apiLogin(request);
    const canUse = async (feature: string) => {
      const input = encodeURIComponent(JSON.stringify({ json: { feature } }));
      const res = await request.get(`/api/trpc/subscription.canUseFeature?input=${input}`, {
        headers: { authorization: `Bearer ${token}` },
      });
      expect(res.status()).toBe(200);
      return (await res.json()).result.data.json as boolean;
    };

    expect(await canUse('e2e_limit_probe')).toBe(false); // seeded at count == limit
    expect(await canUse('agi_messages')).toBe(true); // seeded at 0 / 100
  });
});

test.describe('Trial Subscription', () => {
  test('should have an active trial for the test user', async ({ request }) => {
    test.skip(!hasTestUser, NO_TEST_USER_REASON);
    const token = await apiLogin(request);
    const res = await request.get('/api/trpc/subscription.getCurrent', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(res.status()).toBe(200);
    const data = (await res.json()).result.data.json;
    expect(data.subscription.plan).toBe('trial');
    expect(data.isExpired).toBe(false);
    expect(data.daysRemaining).toBeGreaterThan(0);
  });
});

test.describe('Plan Upgrade', () => {
  test('should navigate to pricing page from the trial banner', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/agents');
    await page.getByRole('button', { name: 'View Plans' }).first().click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test('should display plan features', async ({ page }) => {
    await page.goto('/pricing');
    for (const plan of ['Free Trial', 'Premium', 'Pro']) {
      await expect(page.getByRole('heading', { name: plan, exact: true })).toBeVisible();
    }
    // The trial advertises the enforced 10-agent cap; Premium and Pro list no agent limit
    await expect(page.getByText('Up to 10 agents', { exact: true })).toHaveCount(1);
    // Signed-out visitors get trial-first CTAs
    await expect(page.getByText('Start Free, Then Premium').first()).toBeVisible();
  });
});
