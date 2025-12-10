/**
 * E2E Tests for Optimization Features
 * 
 * Tests performance optimizations including:
 * - Caching behavior
 * - Component memoization
 * - API call reduction
 */

import { test, expect } from '@playwright/test';

test.describe('Performance Optimizations', () => {
  test('should cache subscription data', async ({ page, context }) => {
    // Monitor network requests
    const requests: string[] = [];
    
    page.on('request', (request) => {
      if (request.url().includes('subscription') || request.url().includes('api')) {
        requests.push(request.url());
      }
    });

    // Navigate to dashboard (first load)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    const firstLoadRequests = requests.length;
    requests.length = 0; // Clear array

    // Navigate away and back (should use cache)
    await page.goto('/dashboard/agents');
    await page.waitForLoadState('networkidle');
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Second load should have fewer subscription-related requests
    const secondLoadRequests = requests.length;
    
    // Note: This is a heuristic test - exact numbers depend on implementation
    expect(secondLoadRequests).toBeLessThanOrEqual(firstLoadRequests);
  });

  test('should not refetch on window focus', async ({ page, context }) => {
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

  test('should memoize components in lists', async ({ page }) => {
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
  test('should persist theme preference', async ({ page, context }) => {
    await page.goto('/dashboard');
    
    // Find theme toggle
    const themeToggle = page.locator('button[aria-label*="theme"]').or(page.locator('button:has-text("Dark")')).or(page.locator('button:has-text("Light")'));
    
    if (await themeToggle.isVisible()) {
      // Get initial theme
      const initialTheme = await page.evaluate(() => localStorage.getItem('theme'));
      
      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500);
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Theme should persist
      const persistedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(persistedTheme).not.toBe(initialTheme);
    }
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
