import { test, expect, apiLogin, hasTestUser, NO_TEST_USER_REASON, skipFirstRunOverlays } from '../fixtures/auth';

// Admin credentials come from env only; never hardcode them here. On CI they are the
// TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD Actions secrets (a dedicated admin user that exists only
// in the CI test database). Without them these tests are skipped.
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;
const ADMIN_SKIP_REASON = 'Needs TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars';

test.describe('AI Admin Page', () => {
  test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, ADMIN_SKIP_REASON);

  // Helper function to login before each test
  test.beforeEach(async ({ page }) => {
    await skipFirstRunOverlays(page);
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in admin credentials
    await page.fill('input[type="email"]', ADMIN_EMAIL!);
    await page.fill('input[type="password"]', ADMIN_PASSWORD!);
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }); // login lands on /dashboard/agents
    
    // Navigate to AI Admin page
    await page.goto('/dashboard/ai-admin');
    
    // Wait for AI Admin page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display AI Admin page', async ({ page }) => {
    // Verify we're on the AI Admin page
    expect(page.url()).toContain('/dashboard/ai-admin');
    
    // Check for AI Admin page elements
    await expect(page.getByRole('heading', { level: 1, name: 'AI Admin' })).toBeVisible();
    await expect(page.getByText('Admin Access')).toBeVisible();
  });

  // The page has no "Back to Dashboard" button any more; the dashboard sidebar is the way back.
  test('should keep the dashboard navigation visible', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Agents', exact: true }).first()).toBeVisible();
  });

  test('should navigate back to the dashboard from the sidebar', async ({ page }) => {
    await page.getByRole('link', { name: 'Agents', exact: true }).first().click();
    await page.waitForURL(/\/dashboard\/agents/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/dashboard\/agents/);
  });

  test('should display AI Admin chat interface', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'AI Admin Chat' })).toBeVisible();
    // Chat input and its (icon-only) send button, disabled until something is typed
    const chatInput = page.getByPlaceholder('Describe the changes you want to make...');
    await expect(chatInput).toBeVisible();
    const sendButton = chatInput.locator('xpath=following-sibling::button[1]');
    await expect(sendButton).toBeVisible();
    await expect(sendButton).toBeDisabled();
  });

  test('should display welcome message', async ({ page }) => {
    // Look for welcome or initialization message
    const welcomeMessage = page.locator('text=/initialized|welcome|AI Admin Agent/i').first();
    await expect(welcomeMessage).toBeVisible({ timeout: 5000 });
  });

  test('should allow sending a command', async ({ page }) => {
    // Don't call the real LLM from tests: fail the chat request; we only check the UI sends it.
    await page.route('**/api/trpc/**aiAdmin.chat**', (route) => route.abort());

    const chatInput = page.getByPlaceholder('Describe the changes you want to make...');
    await chatInput.fill('analyze the codebase structure');
    const sendButton = chatInput.locator('xpath=following-sibling::button[1]');
    await expect(sendButton).toBeEnabled();
    await sendButton.click();

    // The message is posted to the conversation and the input is cleared
    await expect(page.getByText('analyze the codebase structure')).toBeVisible();
    await expect(chatInput).toHaveValue('');
  });
});

test.describe('AI Admin Access Control', () => {
  test('should redirect signed-out users to login', async ({ page }) => {
    // The AI Admin page lives at /dashboard/ai-admin; the dashboard layout sends users without a token to /login
    await page.goto('/dashboard/ai-admin');
    await page.waitForURL('**/login**', { timeout: 10000 });
    expect(page.url()).toContain('/login');
  });

  test('should reject non-admin users at the API (FORBIDDEN)', async ({ request }) => {
    test.skip(!hasTestUser, NO_TEST_USER_REASON);
    const token = await apiLogin(request);
    const response = await request.get('/api/trpc/aiAdmin.analyzeCodebase', {
      headers: { authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(403);
    expect((await response.json()).error.json.data.code).toBe('FORBIDDEN');
  });

  test('should not show AI Admin link to non-admin users', async ({ authenticatedPage: page }) => {
    await expect(page.getByRole('link', { name: 'Agents', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'AI Admin' })).toHaveCount(0);
  });

  test('should show AI Admin link in navigation for admin users', async ({ page }) => {
    test.skip(!ADMIN_EMAIL || !ADMIN_PASSWORD, ADMIN_SKIP_REASON);
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', ADMIN_EMAIL!);
    await page.fill('input[type="password"]', ADMIN_PASSWORD!);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 }); // login lands on /dashboard/agents
    
    // Check for AI Admin link in navigation
    const aiAdminLink = page.locator('a:has-text("AI Admin")').first();
    await expect(aiAdminLink).toBeVisible();
  });
});

