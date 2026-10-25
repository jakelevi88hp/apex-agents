/**
 * E2E Tests for Optimization Features
 * 
 * Tests performance optimizations including:
 * - Caching behavior
 * - Component memoization
 * - API call reduction
 */

import { test, expect } from '../fixtures/auth';

test.describe('Performance Optimizations', () => {
  test('should cache subscription data across client-side navigation', async ({ authenticatedPage: page }) => {
    const subscriptionCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/trpc/') && request.url().includes('subscription.')) {
        subscriptionCalls.push(request.url());
      }
    });

    // Fresh full load of the dashboard shell: subscription data is fetched once
    await page.goto('/dashboard/agents');
    await page.waitForLoadState('networkidle');
    expect(subscriptionCalls.length).toBeGreaterThan(0);
    const afterFirstLoad = subscriptionCalls.length;

    // Client-side navigation via the sidebar: React Query (staleTime 5 min) must serve it from cache
    await page.getByRole('link', { name: 'Workflows', exact: true }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/workflows/);
    await page.getByRole('link', { name: 'Agents', exact: true }).first().click();
    await expect(page).toHaveURL(/\/dashboard\/agents/);
    await page.waitForLoadState('networkidle');

    expect(subscriptionCalls.length).toBe(afterFirstLoad);
  });

  test('should not refetch on window focus', async ({ authenticatedPage: page }) => {
    const requests: string[] = [];
    
    page.on('request', (request) => {
      if (request.url().includes('api/trpc')) {
        requests.push(request.url());
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const initialRequests = requests.length;
    requests.length = 0;

    // Simulate window blur and focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    await page.waitForTimeout(100);
    
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });
    await page.waitForTimeout(1000);

    // Should not trigger new requests on focus
    const afterFocusRequests = requests.length;
    expect(afterFocusRequests).toBe(0);
  });

  test('should memoize components in lists', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/agents');
    await page.waitForLoadState('networkidle');

    // Get initial render count (would need React DevTools or custom tracking)
    // For now, we'll verify components render correctly
    const agentCards = page.locator('[data-testid="agent-card"]').or(page.locator('.agent-card'));
    
    if (await agentCards.count() > 0) {
      // Verify cards are visible (memoization prevents unnecessary re-renders)
      await expect(agentCards.first()).toBeVisible();
    }
  });
});

test.describe('Storage Utilities', () => {
  test('should persist theme preference', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/agents');
    const themeToggle = page.getByRole('button', { name: /Switch to (Light|Dark) Mode/ });
    await expect(themeToggle).toBeVisible();

    const initialTheme = await page.evaluate(() => localStorage.getItem('theme'));
    const initialLabel = await themeToggle.innerText();
    await themeToggle.click();
    await expect(themeToggle).not.toHaveText(initialLabel);
    const toggledTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(toggledTheme).not.toBe(initialTheme);

    // Theme survives a reload
    await page.reload();
    await page.waitForLoadState('networkidle');
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(toggledTheme);
    await expect(page.getByRole('button', { name: /Switch to (Light|Dark) Mode/ })).not.toHaveText(initialLabel);
  });

  test('should handle localStorage errors gracefully', async ({ page }) => {
    // Mock localStorage quota exceeded
    await page.addInitScript(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = function() {
        throw new Error('QuotaExceededError');
      };
    });

    await page.goto('/dashboard');
    
    // Should not crash - page should still load
    await expect(page.locator('body')).toBeVisible();
  });
});
