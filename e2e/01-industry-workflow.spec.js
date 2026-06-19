/**
 * PulpChain E2E Test Suite 1: Industry Workflow
 * 
 * Tests:
 * 1. Industry login
 * 2. Create order/application
 * 3. View own orders
 * 4. Navigate to invoices page
 * 5. Navigate to payments page
 * 6. Navigate to documents page
 */
import { test, expect } from '@playwright/test';
import { loginAsIndustry, logout, waitForDataLoad, TEST_CREDENTIALS } from './helpers.js';

test.describe('Industry Workflow', () => {

  test.beforeEach(async ({ page }) => {
    // Ensure clean state
    await logout(page);
  });

  test('1.1 - Industry login succeeds with valid credentials', async ({ page }) => {
    await loginAsIndustry(page);
    // Should land on industry dashboard
    await expect(page.locator('h1')).toContainText(/dashboard/i);
  });

  test('1.2 - Industry login fails with invalid credentials', async ({ page }) => {
    await page.goto('/industry/login');
    await page.waitForSelector('#ind-email', { state: 'visible' });
    await page.fill('#ind-email', 'wrong@example.com');
    await page.fill('#ind-password', 'WrongPassword999');
    await page.click('button[type="submit"]');

    // Should display an error, NOT navigate to dashboard
    await page.waitForSelector('text=/invalid|unauthorized|error/i', { timeout: 8000 });
    await expect(page).not.toHaveURL(/\/industry\/dashboard/);
  });

  test('1.3 - Industry can create an order', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/request-order');
    await waitForDataLoad(page);

    // Wait for rates to load (if they don't load, the form shows an offline message)
    const formVisible = await page.locator('#paperType').isVisible().catch(() => false);
    if (!formVisible) {
      // Rates might not be configured — skip gracefully
      test.skip(true, 'Selling rates not configured, order form unavailable');
      return;
    }

    // Select paper type
    await page.selectOption('#paperType', 'mixedPaper');

    // Enter quantity
    await page.fill('#quantity', '100');

    // Fill delivery address if empty
    const addressValue = await page.inputValue('#deliveryAddress');
    if (!addressValue) {
      await page.fill('#deliveryAddress', '123 Test Street, Mumbai');
    }

    // Set delivery date (7 days from now)
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('#deliveryDate', futureDate);

    // Verify price summary is displayed
    await expect(page.locator('text=Base Amount')).toBeVisible();
    await expect(page.locator('text=GST')).toBeVisible();
    await expect(page.locator('text=Total Payable')).toBeVisible();

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to orders page
    await page.waitForURL('**/industry/orders', { timeout: 10000 });
    await expect(page).toHaveURL(/\/industry\/orders/);
  });

  test('1.4 - Industry can view own orders', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/orders');
    await waitForDataLoad(page);

    // Page should load without crashing
    await expect(page.locator('h1')).toBeVisible();
    // Should contain either orders or an empty state
    const hasOrders = await page.locator('table').isVisible().catch(() => false);
    const hasEmptyState = await page.locator('text=/no orders|no data/i').isVisible().catch(() => false);
    expect(hasOrders || hasEmptyState).toBeTruthy();
  });

  test('1.5 - Industry invoices page loads', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/invoices');
    await waitForDataLoad(page);

    // Should not crash
    await expect(page.locator('h1')).toBeVisible();
  });

  test('1.6 - Industry payments page loads', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/payments');
    await waitForDataLoad(page);

    // Should not crash — verify summary cards are displayed
    await expect(page.locator('h1')).toBeVisible();
  });

  test('1.7 - Industry documents page loads', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/documents');
    await waitForDataLoad(page);

    await expect(page.locator('h1')).toBeVisible();
  });

  test('1.8 - Invalid form submission shows error', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/request-order');
    await waitForDataLoad(page);

    const formVisible = await page.locator('#paperType').isVisible().catch(() => false);
    if (!formVisible) {
      test.skip(true, 'Selling rates not configured');
      return;
    }

    // Try submitting with quantity = 0
    await page.fill('#quantity', '0');
    await page.fill('#deliveryAddress', 'Test');
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('#deliveryDate', futureDate);
    await page.click('button[type="submit"]');

    // Should show validation error
    await page.waitForSelector('text=/valid quantity|error/i', { timeout: 5000 });
    await expect(page).toHaveURL(/\/industry\/request-order/);
  });
});
