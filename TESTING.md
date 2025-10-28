# E2E Testing Guide

This document describes the end-to-end (E2E) testing infrastructure for Apex Agents using Playwright.

## Overview

The E2E test suite validates critical user flows and ensures the application works correctly from a user's perspective. Tests run automatically on every push to `main` and `staging` branches.

## Test Structure

```
tests/
├── e2e/                    # E2E test files
│   ├── homepage.spec.ts    # Homepage tests
│   ├── auth.spec.ts        # Authentication tests
│   ├── dashboard.spec.ts   # Dashboard tests
│   ├── agents.spec.ts      # Agents page tests
│   └── api.spec.ts         # API health tests
└── fixtures/
    └── auth.ts             # Authentication fixtures
```

## Running Tests

### Local Development

```bash
# Run all tests
npm test

# Run tests in UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Debug tests
npm run test:debug

# View test report
npm run test:report
```

### Environment Variables

Create a `.env.test` file with test credentials:

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
```

## Test Coverage

### 1. Homepage Tests (`homepage.spec.ts`)
- ✅ Page loads successfully
- ✅ Navigation buttons work
- ✅ Feature cards display
- ✅ Login navigation works

### 2. Authentication Tests (`auth.spec.ts`)
- ✅ Login form displays
- ✅ Invalid credentials show error
- ✅ Signup form displays
- ✅ Email validation works
- ✅ Logout functionality

### 3. Dashboard Tests (`dashboard.spec.ts`)
- ✅ Dashboard displays after login
- ✅ Stats cards render
- ✅ Navigation menu works
- ✅ All pages accessible
- ✅ User profile menu visible

### 4. Agents Tests (`agents.spec.ts`)
- ✅ Agents page displays
- ✅ Agent templates visible
- ✅ Create agent button present
- ✅ Search functionality

### 5. API Tests (`api.spec.ts`)
- ✅ tRPC API health
- ✅ Protected routes require auth
- ✅ Auth endpoints functional

## CI/CD Integration

Tests run automatically via GitHub Actions on:
- Push to `main` or `staging`
- Pull requests
- Manual trigger

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
- Installs dependencies
- Installs Playwright browsers
- Builds application
- Runs tests
- Uploads test reports
```

### Required Secrets

Add these secrets to your GitHub repository:

```
DATABASE_URL
DATABASE_URL_UNPOOLED
JWT_SECRET
TEST_USER_EMAIL
TEST_USER_PASSWORD
PLAYWRIGHT_TEST_BASE_URL (optional)
```

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/path');
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Authenticated Tests

```typescript
import { test, expect } from '../fixtures/auth';

test.describe('Protected Feature', () => {
  test('should access protected page', async ({ authenticatedPage: page }) => {
    // Page is already authenticated
    await page.goto('/dashboard/protected');
    await expect(page).toHaveURL(/.*protected/);
  });
});
```

## Best Practices

### 1. Use Semantic Selectors
```typescript
// ✅ Good - semantic, stable
await page.locator('button:has-text("Submit")').click();
await page.locator('[aria-label="Close"]').click();

// ❌ Bad - fragile, implementation-dependent
await page.locator('.btn-primary-123').click();
```

### 2. Wait for Elements
```typescript
// ✅ Good - explicit wait
await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });

// ❌ Bad - implicit wait
await page.waitForTimeout(3000);
```

### 3. Test User Flows, Not Implementation
```typescript
// ✅ Good - tests user behavior
test('user can create an agent', async ({ authenticatedPage: page }) => {
  await page.goto('/dashboard/agents');
  await page.click('button:has-text("Create Agent")');
  await page.fill('input[name="name"]', 'Test Agent');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Agent created')).toBeVisible();
});

// ❌ Bad - tests implementation details
test('createAgent API is called', async ({ page }) => {
  // Testing API directly instead of user flow
});
```

### 4. Use Fixtures for Common Setup
```typescript
// Create reusable fixtures in tests/fixtures/
export const test = base.extend<MyFixtures>({
  myFixture: async ({ page }, use) => {
    // Setup
    await page.goto('/setup');
    await use(page);
    // Teardown
  },
});
```

### 5. Keep Tests Independent
```typescript
// ✅ Good - each test is independent
test('test 1', async ({ page }) => {
  await page.goto('/');
  // Test logic
});

test('test 2', async ({ page }) => {
  await page.goto('/');
  // Test logic
});

// ❌ Bad - tests depend on each other
test('test 1', async ({ page }) => {
  await page.goto('/');
  // Creates data
});

test('test 2', async ({ page }) => {
  // Assumes data from test 1 exists
});
```

## Debugging Tests

### 1. Run in Headed Mode
```bash
npm run test:headed
```

### 2. Use Debug Mode
```bash
npm run test:debug
```

### 3. View Test Report
```bash
npm run test:report
```

### 4. Take Screenshots
```typescript
test('debug test', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'debug.png' });
});
```

### 5. Enable Trace
```typescript
// playwright.config.ts
use: {
  trace: 'on', // Always record trace
}
```

## Performance Considerations

### 1. Parallel Execution
Tests run in parallel by default. Use `test.describe.serial()` for sequential tests:

```typescript
test.describe.serial('Sequential tests', () => {
  test('runs first', async ({ page }) => {});
  test('runs second', async ({ page }) => {});
});
```

### 2. Test Timeouts
```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // Slow operations
});
```

### 3. Reuse Authentication
Use the `authenticatedPage` fixture to avoid logging in for every test.

## Continuous Improvement

### Adding New Tests
1. Identify critical user flow
2. Write test in appropriate file
3. Run locally to verify
4. Commit and push
5. Verify in CI/CD

### Maintaining Tests
1. Update selectors when UI changes
2. Add tests for new features
3. Remove tests for deprecated features
4. Keep test data realistic
5. Monitor test flakiness

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Fixtures](https://playwright.dev/docs/test-fixtures)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## Support

For questions or issues with E2E tests:
1. Check this documentation
2. Review Playwright docs
3. Check test reports in GitHub Actions
4. Contact the development team

