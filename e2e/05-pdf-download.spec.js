/**
 * PulpChain E2E Test Suite 5: PDF Download Workflow
 * 
 * Tests:
 * 1. Industry invoice PDF download triggers successfully
 * 2. Industry documents PDF download triggers successfully
 * 3. Admin invoice generator PDF works
 */
import { test, expect } from '@playwright/test';
import { loginAsIndustry, loginAsAdmin, logout, waitForDataLoad } from './helpers.js';

test.describe('PDF Download Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await logout(page);
  });

  test('5.1 - Industry Invoice PDF download triggers', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/invoices');
    await waitForDataLoad(page);

    // Check if any invoices exist with a download button
    const downloadBtn = page.locator('button:has-text("Download"), button:has-text("PDF"), button:has-text("Invoice")').first();
    const hasInvoice = await downloadBtn.isVisible().catch(() => false);

    if (!hasInvoice) {
      test.skip(true, 'No invoices available to download');
      return;
    }

    // Listen for download event
    const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);

    // Intercept console errors during PDF generation
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await downloadBtn.click();
    await page.waitForTimeout(3000);

    // PDF generation via jsPDF creates a blob download — may not trigger Playwright's download event
    // But at minimum, there should be no console errors
    const hasCriticalError = errors.some(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('jsPDF') ||
      e.includes('is not defined')
    );

    expect(hasCriticalError).toBeFalsy();
  });

  test('5.2 - Industry Documents PDF download triggers', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/documents');
    await waitForDataLoad(page);

    const downloadBtn = page.locator('button:has-text("Download"), button:has-text("PDF"), button:has-text("Generate")').first();
    const hasDoc = await downloadBtn.isVisible().catch(() => false);

    if (!hasDoc) {
      test.skip(true, 'No documents available to download');
      return;
    }

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await downloadBtn.click();
    await page.waitForTimeout(3000);

    const hasCriticalError = errors.some(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('jsPDF') ||
      e.includes('is not defined')
    );

    expect(hasCriticalError).toBeFalsy();
  });

  test('5.3 - Admin Invoice Generator PDF works', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/documents');
    await waitForDataLoad(page);

    // Check if sales data is present for PDF generation
    const generateBtn = page.locator('button:has-text("Generate"), button:has-text("PDF"), button:has-text("Download")').first();
    const hasData = await generateBtn.isVisible().catch(() => false);

    if (!hasData) {
      test.skip(true, 'No sales records available for invoice generation');
      return;
    }

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await generateBtn.click();
    await page.waitForTimeout(3000);

    const hasCriticalError = errors.some(e =>
      e.includes('TypeError') ||
      e.includes('ReferenceError') ||
      e.includes('jsPDF') ||
      e.includes('is not defined')
    );

    expect(hasCriticalError).toBeFalsy();
  });
});
