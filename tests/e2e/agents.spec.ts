import { test, expect } from '../fixtures/auth';

test.describe('Agents Page', () => {
  // TODO(e2e): these tests log in through the real auth flow, which needs a database and a
  // seeded test user. The repo has no DATABASE_URL / TEST_USER_EMAIL / TEST_USER_PASSWORD
  // Actions secrets, so login can never succeed in CI. Skip until those secrets (and a
  // seeded test user) exist; the tests re-enable automatically once they are set.
  test.skip(
    !process.env.DATABASE_URL || !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'Agents e2e needs DATABASE_URL + TEST_USER_EMAIL/PASSWORD secrets (none configured in CI)',
  );

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/agents');
  });

  test('should display agents page', async ({ authenticatedPage: page }) => {
    // Check we're on the agents page
    await expect(page).toHaveURL(/.*agents/);
    
    // Check for page heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should display agent templates', async ({ authenticatedPage: page }) => {
    // Check for agent templates or cards
    const templates = page.locator('[class*="template"], [class*="card"], [class*="agent"]');
    
    // Should have at least one template visible
    await expect(templates.first()).toBeVisible({ timeout: 10000 });
  });

  test('should have create agent button', async ({ authenticatedPage: page }) => {
    // Check for create/new agent button
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Agent"), a:has-text("Create")').first();
    await expect(createButton).toBeVisible();
  });

  test('should display agent categories', async ({ authenticatedPage: page }) => {
    // Check for category filters or tabs
    const categories = page.locator('[role="tab"], button[class*="category"], a[class*="category"]');
    
    // Should have at least one category
    if (await categories.count() > 0) {
      await expect(categories.first()).toBeVisible();
    }
  });

  test('should search agents', async ({ authenticatedPage: page }) => {
    // Check for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('test');
      
      // Wait for results to update
      await page.waitForTimeout(1000);
    }
  });
});

