import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check for email and password fields
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Fill in invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message
      await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 5000 });
    });

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/auth/login');
      
      // Check for signup link
      const signupLink = page.locator('a:has-text("Sign Up"), a:has-text("sign up")').first();
      await expect(signupLink).toBeVisible();
    });
  });

  test.describe('Signup', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Check for required fields
      await expect(page.locator('input[name="name"], input[placeholder*="name" i]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Check for login link
      const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign In"), a:has-text("log in")').first();
      await expect(loginLink).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/auth/signup');
      
      // Fill in invalid email
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'Password123!');
      
      // Try to submit
      await page.click('button[type="submit"]');
      
      // Check for validation error (HTML5 or custom)
      const emailInput = page.locator('input[type="email"]');
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage);
      expect(validationMessage).toBeTruthy();
    });
  });

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page }) => {
      // First login
      await page.goto('/auth/login');
      await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
      await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForURL('**/dashboard', { timeout: 10000 });
      
      // Find and click logout button
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out"), a:has-text("Logout")').first();
      await logoutButton.click();
      
      // Verify redirect to login or homepage
      await page.waitForURL(/\/(auth\/login|$)/, { timeout: 5000 });
    });
  });
});

