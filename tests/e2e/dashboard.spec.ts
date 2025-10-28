import { test, expect } from '../fixtures/auth';

test.describe('Dashboard', () => {
  test('should display dashboard after login', async ({ authenticatedPage: page }) => {
    // Check we're on the dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check for dashboard title or heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display stats cards', async ({ authenticatedPage: page }) => {
    // Check for stats cards (Active Agents, Workflows, Executions)
    const statsCards = page.locator('[class*="stat"], [class*="card"], [class*="metric"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should have navigation menu', async ({ authenticatedPage: page }) => {
    // Check for navigation items
    await expect(page.locator('a:has-text("Dashboard"), nav a:has-text("Dashboard")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Agents"), nav a:has-text("Agents")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Workflows"), nav a:has-text("Workflows")').first()).toBeVisible();
  });

  test('should navigate to Agents page', async ({ authenticatedPage: page }) => {
    // Click on Agents link
    await page.locator('a:has-text("Agents"), nav a:has-text("Agents")').first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*agents/);
  });

  test('should navigate to Workflows page', async ({ authenticatedPage: page }) => {
    // Click on Workflows link
    await page.locator('a:has-text("Workflows"), nav a:has-text("Workflows")').first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*workflows/);
  });

  test('should navigate to Knowledge page', async ({ authenticatedPage: page }) => {
    // Click on Knowledge link
    await page.locator('a:has-text("Knowledge"), nav a:has-text("Knowledge")').first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*knowledge/);
  });

  test('should navigate to Analytics page', async ({ authenticatedPage: page }) => {
    // Click on Analytics link
    await page.locator('a:has-text("Analytics"), nav a:has-text("Analytics")').first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*analytics/);
  });

  test('should navigate to Settings page', async ({ authenticatedPage: page }) => {
    // Click on Settings link
    await page.locator('a:has-text("Settings"), nav a:has-text("Settings")').first().click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*settings/);
  });

  test('should have user profile menu', async ({ authenticatedPage: page }) => {
    // Check for user profile button/icon
    const profileButton = page.locator('[aria-label*="profile" i], [aria-label*="user" i], button:has(img[alt*="profile" i])').first();
    await expect(profileButton).toBeVisible();
  });
});

