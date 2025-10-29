# Apex Agents - E2E Testing with Playwright

This directory contains end-to-end tests for the Apex Agents platform using Playwright.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in UI mode (interactive)
```bash
npm run test:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:headed
```

### Run specific test file
```bash
npx playwright test tests/e2e/ai-admin.spec.ts
```

### Debug tests
```bash
npm run test:debug
```

### View test report
```bash
npm run test:report
```

## Test Structure

### E2E Tests (`tests/e2e/`)
- `ai-admin.spec.ts` - AI Admin page functionality and access control
- `auth.spec.ts` - Authentication flows (login, signup, logout)
- `dashboard.spec.ts` - Dashboard functionality
- `agents.spec.ts` - Agent management
- `api.spec.ts` - API endpoints
- `homepage.spec.ts` - Homepage and public pages

### Test Helpers (`tests/helpers/`)
- `auth.ts` - Authentication helpers for logging in/out during tests

## Test Credentials

Test credentials are stored in `.env.test`:
- Admin user: `jakelevi88hp@gmail.com` / `APex2025$$`
- Regular user: `test@example.com` / `TestPassword123!`

**Note:** Never commit real passwords to version control. Use environment variables in CI/CD.

## Writing Tests

### Example: Testing a button click
```typescript
import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test('should navigate when button is clicked', async ({ page }) => {
  await loginAsAdmin(page);
  
  await page.goto('/admin/ai');
  
  const button = page.locator('button:has-text("Back to Dashboard")');
  await button.click();
  
  await page.waitForURL('**/dashboard');
  expect(page.url()).toContain('/dashboard');
});
```

## CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Manual workflow dispatch

Set these environment variables in your CI/CD:
- `TEST_ADMIN_EMAIL`
- `TEST_ADMIN_PASSWORD`
- `PLAYWRIGHT_TEST_BASE_URL` (for deployed environment)

## Best Practices

1. **Use helpers** - Reuse authentication and common actions
2. **Wait for elements** - Use `waitForURL`, `waitForSelector` instead of fixed timeouts
3. **Descriptive test names** - Clearly describe what is being tested
4. **Clean up** - Reset state between tests when needed
5. **Avoid hardcoded waits** - Use Playwright's auto-waiting features
6. **Test user flows** - Test complete user journeys, not just isolated features

## Debugging Failed Tests

1. Check screenshots in `test-results/`
2. View videos in `test-results/` (on failure)
3. Run with `--debug` flag for step-by-step debugging
4. Use `page.pause()` to pause test execution
5. View HTML report with `npm run test:report`

## Coverage

Current test coverage:
- ✅ Authentication (login, signup, logout)
- ✅ AI Admin page and access control
- ✅ Dashboard navigation
- ✅ Agent management
- ✅ API endpoints
- ✅ Homepage

## Future Enhancements

- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Accessibility testing (a11y)
- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Mobile viewport testing

