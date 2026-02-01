/**
 * Staff Portal Profile E2E Tests
 * 
 * Tests REAL profile management with:
 * - Real browser interactions
 * - Real form submissions
 * - Real file uploads
 * - Real data updates
 * 
 * NO MOCKING - All tests use actual browser and application
 */

import { test, expect } from '@playwright/test';
import TEST_CONFIG from '../../config/test.config';

const STAFF_PORTAL_URL = TEST_CONFIG.frontend.staffPortalUrl;
const TEST_USER = TEST_CONFIG.auth.testUsers.staff;

test.describe('Staff Portal Profile - Real Browser Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto(STAFF_PORTAL_URL);
        await page.fill('[name="email"]', TEST_USER.email);
        await page.fill('[name="password"]', TEST_USER.password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/, { timeout: 10000 });

        // Navigate to profile
        await page.click('[data-testid="nav-profile"]');
        await page.waitForURL(/.*profile/);
    });

    test('should display profile information', async ({ page }) => {
        // Verify profile sections
        await expect(page.locator('[data-testid="personal-info"]')).toBeVisible();
        await expect(page.locator('[data-testid="contact-info"]')).toBeVisible();
        await expect(page.locator('[data-testid="employment-info"]')).toBeVisible();

        // Verify real data is loaded
        const nameText = await page.locator('[data-testid="user-name"]').textContent();
        expect(nameText).toBeTruthy();
        expect(nameText).not.toContain('Loading');
    });

    test('should edit personal information', async ({ page }) => {
        // Click edit button
        await page.click('[data-testid="edit-profile-btn"]');

        // Update phone number
        const newPhone = '+256700999888';
        await page.fill('[name="phone"]', newPhone);

        // Save changes
        await page.click('[data-testid="save-profile-btn"]');

        // Verify success message
        await expect(page.locator('[data-testid="success-message"]')).toBeVisible();

        // Verify updated value
        const phoneValue = await page.locator('[data-testid="phone-display"]').textContent();
        expect(phoneValue).toContain(newPhone);
    });

    test('should upload profile photo', async ({ page }) => {
        // Click upload photo button
        await page.click('[data-testid="upload-photo-btn"]');

        // Upload file
        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles({
            name: 'profile.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake-image-data'),
        });

        // Wait for upload
        await page.waitForSelector('[data-testid="upload-success"]', { timeout: 5000 });

        // Verify photo updated
        const profileImg = page.locator('[data-testid="profile-photo"]');
        await expect(profileImg).toBeVisible();
    });

    test('should change password', async ({ page }) => {
        // Navigate to security tab
        await page.click('[data-testid="security-tab"]');

        // Fill password form
        await page.fill('[name="currentPassword"]', TEST_USER.password);
        await page.fill('[name="newPassword"]', 'NewPassword123!');
        await page.fill('[name="confirmPassword"]', 'NewPassword123!');

        // Submit
        await page.click('[data-testid="change-password-btn"]');

        // Verify success
        await expect(page.locator('[data-testid="password-changed"]')).toBeVisible();

        // Change back
        await page.fill('[name="currentPassword"]', 'NewPassword123!');
        await page.fill('[name="newPassword"]', TEST_USER.password);
        await page.fill('[name="confirmPassword"]', TEST_USER.password);
        await page.click('[data-testid="change-password-btn"]');
    });

    test('should view employment details', async ({ page }) => {
        // Navigate to employment tab
        await page.click('[data-testid="employment-tab"]');

        // Verify employment info
        await expect(page.locator('[data-testid="employee-id"]')).toBeVisible();
        await expect(page.locator('[data-testid="department"]')).toBeVisible();
        await expect(page.locator('[data-testid="position"]')).toBeVisible();
        await expect(page.locator('[data-testid="hire-date"]')).toBeVisible();

        // Verify values are real (not placeholders)
        const employeeId = await page.locator('[data-testid="employee-id"]').textContent();
        expect(employeeId).toMatch(/EMP\d+/);
    });

    test('should validate form inputs', async ({ page }) => {
        // Click edit
        await page.click('[data-testid="edit-profile-btn"]');

        // Enter invalid email
        await page.fill('[name="email"]', 'invalid-email');

        // Try to save
        await page.click('[data-testid="save-profile-btn"]');

        // Verify validation error
        await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    });
});
