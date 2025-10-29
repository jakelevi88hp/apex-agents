import { Page } from '@playwright/test';

/**
 * Login helper for Playwright tests
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', process.env.TEST_ADMIN_EMAIL || 'jakelevi88hp@gmail.com');
  await page.fill('input[type="password"]', process.env.TEST_ADMIN_PASSWORD || 'APex2025$$');
  
  await page.click('button[type="submit"]');
  
  // Wait for successful login and redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Login helper for regular users
 */
export async function loginAsUser(page: Page, email?: string, password?: string) {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', email || process.env.TEST_USER_EMAIL || 'test@example.com');
  await page.fill('input[type="password"]', password || process.env.TEST_USER_PASSWORD || 'TestPassword123!');
  
  await page.click('button[type="submit"]');
  
  // Wait for successful login and redirect to dashboard
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out"), a:has-text("Logout")').first();
  await logoutButton.click();
  
  // Wait for redirect to login or homepage
  await page.waitForURL(/\/(login|$)/, { timeout: 5000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for token in localStorage
  const token = await page.evaluate(() => localStorage.getItem('token'));
  return !!token;
}

/**
 * Get user role from JWT token
 */
export async function getUserRole(page: Page): Promise<string | null> {
  const token = await page.evaluate(() => localStorage.getItem('token'));
  
  if (!token) return null;
  
  try {
    const payload = await page.evaluate((t) => {
      const base64Url = t.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    }, token);
    
    return payload.role || null;
  } catch {
    return null;
  }
}

