import { test, expect, apiLogin, hasTestUser, NO_TEST_USER_REASON, skipFirstRunOverlays } from '../fixtures/auth';

// Admin credentials come from env only; never hardcode them here.
// TODO(e2e): add TEST_ADMIN_EMAIL / TEST_ADMIN_PASSWORD Actions secrets (an admin user in the
// CI test DB) to run the admin tests. Until then they are skipped.
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
    await expect(page.locator('text=/AI Admin|AI Agent/i')).toBeVisible();
  });

  test('should have Back to Dashboard button', async ({ page }) => {
    // Look for the Back to Dashboard button
    const backButton = page.locator('button:has-text("Back to Dashboard"), a:has-text("Back to Dashboard")').first();
    
    // Verify the button exists and is visible
    await expect(backButton).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to dashboard when Back to Dashboard button is clicked', async ({ page }) => {
    // Find the Back to Dashboard button
    const backButton = page.locator('button:has-text("Back to Dashboard"), a:has-text("Back to Dashboard")').first();
    
    // Wait for button to be visible
    await expect(backButton).toBeVisible({ timeout: 5000 });
    
    // Click the button
    await backButton.click();
    
    // Verify navigation to dashboard
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Verify we're on the dashboard page
    expect(page.url()).toMatch(/\/dashboard$/);
  });

  test('should display AI Admin chat interface', async ({ page }) => {
    // Check for chat input
    const chatInput = page.locator('input[type="text"], textarea').filter({ hasText: '' }).first();
    await expect(chatInput).toBeVisible();
    
    // Check for send button
    const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
    await expect(sendButton).toBeVisible();
  });

  test('should display welcome message', async ({ page }) => {
    // Look for welcome or initialization message
    const welcomeMessage = page.locator('text=/initialized|welcome|AI Admin Agent/i').first();
    await expect(welcomeMessage).toBeVisible({ timeout: 5000 });
  });

  test('should allow sending a command', async ({ page }) => {
    // Find chat input
    const chatInput = page.locator('input[type="text"], textarea').filter({ hasText: '' }).first();
    
    // Type a test command
    await chatInput.fill('analyze the codebase structure');
    
    // Find and click send button
    const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first();
    await sendButton.click();
    
    // Wait for response (should show processing or response)
    await page.waitForTimeout(2000);
    
    // Verify the message was sent (input should be cleared or message appears)
    const inputValue = await chatInput.inputValue();
    expect(inputValue).toBe('');
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

