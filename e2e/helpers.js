/**
 * PulpChain E2E Test Helpers
 * Shared utilities for authentication, navigation, and assertions.
 */
import { expect } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load test credentials from .env.test (falls back to .env.test.example)
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test.example') });

export const TEST_CREDENTIALS = {
  industry: {
    email: process.env.TEST_INDUSTRY_EMAIL || 'industry1@example.com',
    password: process.env.TEST_INDUSTRY_PASSWORD || 'TestPassword123',
  },
  industry2: {
    email: process.env.TEST_INDUSTRY2_EMAIL || 'industry2@example.com',
    password: process.env.TEST_INDUSTRY2_PASSWORD || 'TestPassword123',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@pulpchain.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'AdminPassword123',
  },
};

/**
 * Login as an Industry user.
 * Navigates to /industry/login, fills credentials, submits, and waits for dashboard.
 */
export async function loginAsIndustry(page, credentials = TEST_CREDENTIALS.industry) {
  await page.goto('/industry/login');
  await page.waitForSelector('#ind-email', { state: 'visible' });
  await page.fill('#ind-email', credentials.email);
  await page.fill('#ind-password', credentials.password);
  await page.click('button[type="submit"]');
  // Wait for navigation to dashboard
  await page.waitForURL('**/industry/dashboard', { timeout: 10000 });
  await expect(page).toHaveURL(/\/industry\/dashboard/);
}

/**
 * Login as Admin.
 * Navigates to /admin/login, fills credentials, submits, and waits for dashboard.
 */
export async function loginAsAdmin(page, credentials = TEST_CREDENTIALS.admin) {
  await page.goto('/admin/login');
  await page.waitForSelector('#admin-username', { state: 'visible' });
  await page.fill('#admin-username', credentials.email);
  await page.fill('#admin-password', credentials.password);
  await page.click('button[type="submit"]');
  // Wait for navigation to dashboard
  await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

/**
 * Logout current user by clearing Supabase session from localStorage.
 */
export async function logout(page) {
  await page.evaluate(() => {
    // Clear all Supabase auth tokens
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('sb-') || key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  });
  await page.goto('/');
}

/**
 * Wait for a network-idle state (useful after page navigations with data fetching).
 */
export async function waitForDataLoad(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Format a number as INR currency string for assertion matching.
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
