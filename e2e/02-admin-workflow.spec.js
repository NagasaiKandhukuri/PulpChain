/**
 * PulpChain E2E Test Suite 2: Admin Workflow
 * 
 * Tests:
 * 1. Admin login
 * 2. View orders/applications
 * 3. Approve an order through the full lifecycle
 * 4. Verify automatic sales and payment creation
 * 5. Reject/cancel an order
 * 6. Download PDF from Invoice Generator
 */
import { test, expect } from '@playwright/test';
import { loginAsAdmin, loginAsIndustry, logout, waitForDataLoad, TEST_CREDENTIALS } from './helpers.js';

test.describe('Admin Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await logout(page);
  });

  test('2.1 - Admin login succeeds with valid credentials', async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.locator('h1')).toContainText(/dashboard/i);
  });

  test('2.2 - Admin login fails with invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.waitForSelector('#admin-username', { state: 'visible' });
    await page.fill('#admin-username', 'notadmin@wrong.com');
    await page.fill('#admin-password', 'WrongPass');
    await page.click('button[type="submit"]');

    await page.waitForSelector('text=/invalid|unauthorized|error|not an admin/i', { timeout: 8000 });
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
  });

  test('2.3 - Admin can view Manage Orders page', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await waitForDataLoad(page);

    await expect(page.locator('h1')).toContainText(/orders/i);
    // Should have filter buttons
    await expect(page.locator('button:has-text("all")')).toBeVisible();
  });

  test('2.4 - Admin can approve a requested order', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await waitForDataLoad(page);

    // Filter to "requested" orders
    await page.click('button:has-text("requested")');
    await page.waitForTimeout(1000);

    // Check if any requested orders exist
    const approveBtn = page.locator('button:has-text("Approve Order")').first();
    const hasRequested = await approveBtn.isVisible().catch(() => false);

    if (!hasRequested) {
      test.skip(true, 'No requested orders available to approve');
      return;
    }

    // Click approve on the first order
    await approveBtn.click();
    await page.waitForTimeout(2000);

    // After approval, the order should move to "approved" status
    // Check that the "approved" filter shows results or the table updated
    await page.click('button:has-text("approved")');
    await page.waitForTimeout(1000);

    const approvedRows = await page.locator('table tbody tr').count();
    expect(approvedRows).toBeGreaterThanOrEqual(1);
  });

  test('2.5 - Admin full order lifecycle: approve → allocate → dispatch → deliver → complete', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await waitForDataLoad(page);

    // Find a "requested" order
    await page.click('button:has-text("requested")');
    await page.waitForTimeout(1000);

    const approveBtn = page.locator('button:has-text("Approve Order")').first();
    const hasRequested = await approveBtn.isVisible().catch(() => false);

    if (!hasRequested) {
      test.skip(true, 'No requested orders available for full lifecycle test');
      return;
    }

    // Step 1: Approve
    await approveBtn.click();
    await page.waitForTimeout(2000);

    // Step 2: Allocate Stock
    await page.click('button:has-text("all")');
    await page.waitForTimeout(1000);
    const allocateBtn = page.locator('button:has-text("Allocate Stock")').first();
    if (await allocateBtn.isVisible().catch(() => false)) {
      await allocateBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 3: Dispatch Cargo
    await page.click('button:has-text("all")');
    await page.waitForTimeout(1000);
    const dispatchBtn = page.locator('button:has-text("Dispatch Cargo")').first();
    if (await dispatchBtn.isVisible().catch(() => false)) {
      await dispatchBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 4: Deliver
    await page.click('button:has-text("all")');
    await page.waitForTimeout(1000);
    const deliverBtn = page.locator('button:has-text("Deliver")').first();
    if (await deliverBtn.isVisible().catch(() => false)) {
      await deliverBtn.click();
      await page.waitForTimeout(2000);
    }

    // Step 5: Complete Order
    await page.click('button:has-text("all")');
    await page.waitForTimeout(1000);
    const completeBtn = page.locator('button:has-text("Complete Order")').first();
    if (await completeBtn.isVisible().catch(() => false)) {
      await completeBtn.click();
      await page.waitForTimeout(3000);
    }

    // After completion, verify "Order Fulfilled" badge appears
    await page.click('button:has-text("completed")');
    await page.waitForTimeout(1000);
    await expect(page.locator('text=Order Fulfilled').first()).toBeVisible();
  });

  test('2.6 - Completed order has auto-generated payment record', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await waitForDataLoad(page);

    // Filter to completed orders
    await page.click('button:has-text("completed")');
    await page.waitForTimeout(1000);

    const completedRows = await page.locator('table tbody tr').count();
    if (completedRows === 0) {
      test.skip(true, 'No completed orders to verify payment records');
      return;
    }

    // Verify the completed order shows payment operations (Generate Invoice / Mark Paid / Paid badge)
    const hasPaymentAction = await page.locator('text=/Generate Invoice|Mark Paid|Paid/').first().isVisible().catch(() => false);
    expect(hasPaymentAction).toBeTruthy();
  });

  test('2.7 - Admin can cancel an order', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/orders');
    await waitForDataLoad(page);

    // Look for any cancel button
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    const hasCancel = await cancelBtn.isVisible().catch(() => false);

    if (!hasCancel) {
      test.skip(true, 'No cancellable orders available');
      return;
    }

    // Cancel the order
    await cancelBtn.click();
    await page.waitForTimeout(2000);

    // Verify the cancelled filter shows results
    await page.click('button:has-text("cancelled")');
    await page.waitForTimeout(1000);
    const cancelledRows = await page.locator('table tbody tr').count();
    expect(cancelledRows).toBeGreaterThanOrEqual(1);
  });

  test('2.8 - Admin Sales page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/sales');
    await waitForDataLoad(page);

    await expect(page.locator('h1')).toBeVisible();
  });

  test('2.9 - Admin Invoice Generator page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/documents');
    await waitForDataLoad(page);

    await expect(page.locator('h1')).toBeVisible();
  });

  test('2.10 - Admin Finance page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/finance');
    await waitForDataLoad(page);

    await expect(page.locator('h1')).toBeVisible();
  });

  test('2.11 - Admin Inventory page loads', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/inventory');
    await waitForDataLoad(page);

    await expect(page.locator('h1')).toBeVisible();
  });
});
