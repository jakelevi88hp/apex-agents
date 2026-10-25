import { test, expect, openAccountMenu } from '../fixtures/auth';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      
      // Check for email and password fields
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in invalid credentials
      await page.fill('input[type="email"]', 'invalid@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for error message (login page fallback: "Invalid email or password")
      await expect(page.locator('text=/Invalid/i')).toBeVisible({ timeout: 5000 });
    });

    test('should have link to signup page', async ({ page }) => {
      await page.goto('/login');
      
      // Check for signup link
      const signupLink = page.locator('a:has-text("Sign Up"), a:has-text("sign up")').first();
      await expect(signupLink).toBeVisible();
    });
  });

  test.describe('Signup', () => {
    test('should display signup form', async ({ page }) => {
      await page.goto('/signup');
      
      // Check for required fields (name input uses id="name", not name attr)
      await expect(page.locator('input#name, input[name="name"]')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]').first()).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('should have link to login page', async ({ page }) => {
      await page.goto('/signup');
      
      // Check for login link (signup page uses "Sign In")
      const loginLink = page.locator('a:has-text("Login"), a:has-text("Sign In"), a:has-text("log in")').first();
      await expect(loginLink).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.goto('/signup');
      
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
    test('should logout successfully', async ({ authenticatedPage: page }) => {
      // Logout lives in the sidebar's "Account" menu
      await openAccountMenu(page);
      await page.getByRole('button', { name: 'Logout' }).click();

      await page.waitForURL(/\/login/, { timeout: 10000 });
      expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();

      // The dashboard is no longer reachable without a token
      await page.goto('/dashboard/agents');
      await page.waitForURL(/\/login/, { timeout: 10000 });
    });
  });
});
