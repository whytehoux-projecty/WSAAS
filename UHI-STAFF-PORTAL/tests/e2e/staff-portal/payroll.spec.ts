import { test, expect } from '@playwright/test';
import TEST_CONFIG from '../../config/test.config';

const STAFF_PORTAL_URL = TEST_CONFIG.frontend.staffPortalUrl;
const TEST_USER = TEST_CONFIG.auth.testUsers.staff;

test.describe('Payroll E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(STAFF_PORTAL_URL);
    await page.fill('[name="email"]', TEST_USER.email);
    await page.fill('[name="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    await page.click('[data-testid="nav-payroll"]');
  });

  test('should display payroll history', async ({ page }) => {
    await expect(page.locator('[data-testid="payroll-table"]')).toBeVisible();
  });

  test('should download payslip', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-payslip-btn"]').first();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
