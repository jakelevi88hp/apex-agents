import { test as base, Page } from '@playwright/test';

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, provide) => {
    // Navigate to login page
    await page.goto('/auth/login');
    
    // Fill in login credentials (use test user)
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard');
    
    // Use the authenticated page
    await provide(page);
  },
});

export { expect } from '@playwright/test';

