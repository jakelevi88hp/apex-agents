import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Apex Agents/i);
    
    // Check main heading
    await expect(page.locator('h1')).toContainText(/The Future of Autonomous AI/i);
  });

  test('should have working navigation buttons', async ({ page }) => {
    await page.goto('/');
    
    // Check Login button exists and is visible
    const loginButton = page.locator('a:has-text("Login"), button:has-text("Login")').first();
    await expect(loginButton).toBeVisible();
    
    // Check Get Started button exists and is visible
    const getStartedButton = page.locator('a:has-text("Get Started"), button:has-text("Get Started")').first();
    await expect(getStartedButton).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for feature cards
    await expect(page.locator('text=Autonomous Agents')).toBeVisible();
    await expect(page.locator('text=Verified Results')).toBeVisible();
    await expect(page.locator('text=Proprietary Models')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login button
    const loginButton = page.locator('a:has-text("Login"), button:has-text("Login")').first();
    await loginButton.click();
    
    // Verify navigation to login page
    await expect(page).toHaveURL(/.*auth\/login/);
  });
});

