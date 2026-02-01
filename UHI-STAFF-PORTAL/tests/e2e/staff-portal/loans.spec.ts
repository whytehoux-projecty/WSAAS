import { test, expect } from '@playwright/test';
import TEST_CONFIG from '../../config/test.config';

const STAFF_PORTAL_URL = TEST_CONFIG.frontend.staffPortalUrl;
const TEST_USER = TEST_CONFIG.auth.testUsers.staff;

test.describe('Loans E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STAFF_PORTAL_URL);
    await page.fill('[name="email"]', TEST_USER.email);
    await page.fill('[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    await page.click('[data-testid="nav-loans"]');
  });

  test('should display loan list', async ({ page }) => {
    await expect(page.locator('[data-testid="loans-table"]')).toBeVisible();
  });

  test('should apply for loan', async ({ page }) => {
    await page.click('[data-testid="apply-loan-btn"]');
    await page.fill('[name="principal"]', '5000000');
    await page.fill('[name="purpose"]', 'Home improvement');
    await page.click('[data-testid="submit-application"]');
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
