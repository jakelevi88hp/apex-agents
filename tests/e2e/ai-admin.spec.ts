import { test, expect } from '@playwright/test';

test.describe('AI Admin Page', () => {
  // Helper function to login before each test
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in admin credentials
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'jakelevi88hp@gmail.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'APex2025$$');
    
    // Submit login form
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Navigate to AI Admin page
    await page.goto('/admin/ai');
    
    // Wait for AI Admin page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display AI Admin page', async ({ page }) => {
    // Verify we're on the AI Admin page
    expect(page.url()).toContain('/admin/ai');
    
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
  test('should redirect non-admin users to login', async ({ page }) => {
    // Try to access AI Admin without logging in
    await page.goto('/admin/ai');
    
    // Should redirect to login page
    await page.waitForURL('**/login**', { timeout: 5000 });
    expect(page.url()).toContain('/login');
  });

  test('should show AI Admin link in navigation for admin users', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'jakelevi88hp@gmail.com');
    await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'APex2025$$');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Check for AI Admin link in navigation
    const aiAdminLink = page.locator('a:has-text("AI Admin")').first();
    await expect(aiAdminLink).toBeVisible();
  });
});

