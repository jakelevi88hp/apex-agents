import { test, expect, openAccountMenu } from '../fixtures/auth';

test.describe('Dashboard', () => {
  test('should display dashboard after login', async ({ authenticatedPage: page }) => {
    // Login lands on /dashboard/agents
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should have a Dashboard page title', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveTitle('Dashboard | Apex Agents');
  });

  test('should display stats cards', async ({ authenticatedPage: page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Welcome to Apex Agents' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Active Agents', { exact: true })).toBeVisible();
    await expect(page.getByText('Executions Today', { exact: true })).toBeVisible();
  });

  test('should have navigation menu', async ({ authenticatedPage: page }) => {
    const nav = page.locator('aside, nav').first();
    for (const label of ['Agents', 'Workflows', 'Knowledge', 'Analytics']) {
      await expect(page.getByRole('link', { name: label, exact: true }).first()).toBeVisible();
    }
    await expect(nav).toBeVisible();
  });

  for (const [label, path] of [
    ['Agents', /\/dashboard\/agents/],
    ['Workflows', /\/dashboard\/workflows/],
    ['Knowledge', /\/dashboard\/knowledge/],
    ['Analytics', /\/dashboard\/analytics/],
  ] as const) {
    test(`should navigate to ${label} page`, async ({ authenticatedPage: page }) => {
      await page.getByRole('link', { name: label, exact: true }).first().click();
      await expect(page).toHaveURL(path);
    });
  }

  test('should navigate to Settings page', async ({ authenticatedPage: page }) => {
    await openAccountMenu(page);
    await page.getByRole('link', { name: 'Settings', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
    await expect(page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
  });

  test('should have user profile menu', async ({ authenticatedPage: page }) => {
    await openAccountMenu(page);
    await expect(page.getByRole('link', { name: 'Settings', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  });
});
