import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';

/** Non-admin e2e user (seeded by scripts/seed-ci-user.mjs). Tests that need it skip when unset. */
export const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL;
export const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD;
export const hasTestUser = !!(TEST_USER_EMAIL && TEST_USER_PASSWORD);
export const NO_TEST_USER_REASON = 'needs TEST_USER_EMAIL/TEST_USER_PASSWORD (seeded non-admin user) and a DB';

/**
 * The dashboard shows a first-run OnboardingWizard and a ProductTour as full-screen overlays,
 * which intercept clicks. Mark both as done so tests interact with the real UI underneath.
 */
export async function skipFirstRunOverlays(page: Page) {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('apex_onboarding_complete', 'true');
      localStorage.setItem('apex_tour_complete', 'true');
    } catch {
      /* some tests stub localStorage to throw */
    }
  });
}

/** Log in through the real login form; the app redirects to /dashboard/agents. */
export async function loginViaUi(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USER_EMAIL!);
  await page.fill('input[type="password"]', TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15000 });
}

/** Get a JWT for the test user via the tRPC login mutation (superjson body). */
export async function apiLogin(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/trpc/auth.login', {
    data: { json: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD } },
  });
  expect(res.status(), 'auth.login should succeed for the seeded test user').toBe(200);
  const body = await res.json();
  return body.result.data.json.token as string;
}

/** Settings and Logout live in the sidebar's collapsible "Account" menu. */
export async function openAccountMenu(page: Page) {
  await page.getByRole('button', { name: 'Account' }).click();
}

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, provide, testInfo) => {
    testInfo.skip(!hasTestUser, NO_TEST_USER_REASON);
    await skipFirstRunOverlays(page);
    await loginViaUi(page);
    await provide(page);
  },
});

export { expect };
