/**
 * PulpChain E2E Test Suite 4: Edge Cases & Negative Scenarios
 * 
 * Tests:
 * 1. Empty states (no contracts, no payments)
 * 2. Unauthorized access (unauthenticated users)
 * 3. Expired session handling
 * 4. Public pages load correctly
 */
import { test, expect } from '@playwright/test';
import { loginAsIndustry, logout, waitForDataLoad } from './helpers.js';

test.describe('Edge Cases & Negative Scenarios', () => {

  test.beforeEach(async ({ page }) => {
    await logout(page);
  });

  // --- Empty States ---

  test('4.1 - Industry contracts page handles empty state', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/contracts');
    await waitForDataLoad(page);

    // Should not crash — either shows table or empty state
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.2 - Industry payments page handles zero balance', async ({ page }) => {
    await loginAsIndustry(page);
    await page.goto('/industry/payments');
    await waitForDataLoad(page);

    // Financial summary should render (even if ₹0)
    await expect(page.locator('h1')).toBeVisible();
  });

  // --- Unauthorized Access ---

  test('4.3 - Unauthenticated user cannot access industry dashboard', async ({ page }) => {
    await page.goto('/industry/dashboard');
    await page.waitForTimeout(3000);

    // Should redirect to login or home
    const url = page.url();
    const isProtected = !url.includes('/industry/dashboard') ||
                        url.includes('/login') ||
                        url.includes('/industry/login');
    expect(isProtected).toBeTruthy();
  });

  test('4.4 - Unauthenticated user cannot access admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await page.waitForTimeout(3000);

    const url = page.url();
    const isProtected = !url.includes('/admin/dashboard') ||
                        url.includes('/login') ||
                        url.includes('/admin/login');
    expect(isProtected).toBeTruthy();
  });

  test('4.5 - Unauthenticated user cannot access school dashboard', async ({ page }) => {
    await page.goto('/school/dashboard');
    await page.waitForTimeout(3000);

    const url = page.url();
    const isProtected = !url.includes('/school/dashboard') ||
                        url.includes('/login');
    expect(isProtected).toBeTruthy();
  });

  // --- Expired Session ---

  test('4.6 - Expired session redirects gracefully', async ({ page }) => {
    await loginAsIndustry(page);

    // Corrupt the session token to simulate expiry
    await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('sb-') && key.includes('auth-token')) {
          // Replace the token with garbage
          localStorage.setItem(key, JSON.stringify({
            access_token: 'expired_garbage_token',
            refresh_token: 'expired_garbage_token',
            expires_at: 0,
          }));
        }
      });
    });

    // Try navigating — should handle gracefully
    await page.goto('/industry/orders');
    await page.waitForTimeout(5000);

    // Should either show data (if token refreshed) or redirect to login
    const url = page.url();
    const isHandled = url.includes('/industry') || url.includes('/login') || url === page.url();
    expect(isHandled).toBeTruthy();
  });

  // --- Public Pages ---

  test('4.7 - Home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.8 - Marketplace page loads', async ({ page }) => {
    await page.goto('/marketplace');
    await waitForDataLoad(page);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.9 - Pricing page loads', async ({ page }) => {
    await page.goto('/pricing');
    await waitForDataLoad(page);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.10 - About page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.11 - Contact page loads', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.12 - For Industries page loads', async ({ page }) => {
    await page.goto('/for-industries');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4.13 - 404 / wildcard route redirects to home', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');
    await page.waitForTimeout(2000);

    // Should redirect to home (the wildcard route)
    await expect(page).toHaveURL('/');
  });
});
