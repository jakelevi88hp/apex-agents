import { test, expect } from '../fixtures/auth';

// Uses the seeded non-admin user (no agents of its own), so the page shows its empty state + templates.
test.describe('Agents Page', () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard/agents');
  });

  test('should display agents page', async ({ authenticatedPage: page }) => {
    await expect(page).toHaveURL(/\/dashboard\/agents/);
    await expect(page.getByRole('heading', { name: 'Agents', exact: true })).toBeVisible();
  });

  test('should display agent templates', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('heading', { name: 'Agent Templates' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Research Agent' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Use Template' }).first()).toBeVisible();
  });

  test('should have create agent button', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('button', { name: /Create (Your First )?Agent/ }).first()).toBeVisible();
  });

  test('should show empty state for a user with no agents', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('heading', { name: 'No agents yet' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Start with a Template' })).toBeVisible();
  });
});
