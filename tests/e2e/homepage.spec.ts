import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title (SEO: AI Revenue Engine for Local Businesses | Apex Agents)
    await expect(page).toHaveTitle(/Apex Agents/i);
    
    // Check main heading (current SEO homepage copy)
    await expect(page.locator('h1')).toContainText(/On Autopilot/i);
  });

  test('should have working navigation buttons', async ({ page }) => {
    await page.goto('/');
    
    // Check Sign In link exists and is visible (nav uses "Sign In", not "Login")
    const signInLink = page.locator('a:has-text("Sign In"), a:has-text("Login")').first();
    await expect(signInLink).toBeVisible();
    
    // Check Get Started button exists and is visible
    const getStartedButton = page.locator('a:has-text("Get Started"), button:has-text("Get Started")').first();
    await expect(getStartedButton).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    await page.goto('/');
    
    // Check for current feature cards from homepage
    await expect(page.locator('text=Autonomous AI Agents')).toBeVisible();
    await expect(page.locator('text=Local Market Domination')).toBeVisible();
    await expect(page.locator('text=Precision Lead Scoring')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click Sign In link
    const signInLink = page.locator('a:has-text("Sign In"), a:has-text("Login")').first();
    await signInLink.click();
    
    // Verify navigation to /login (not /auth/login)
    await expect(page).toHaveURL(/.*\/login/);
  });
});
