// @ts-check
import { defineConfig } from '@playwright/test';

/**
 * PulpChain E2E Test Configuration
 * 
 * Test credentials must be set via environment variables:
 *   TEST_INDUSTRY_EMAIL, TEST_INDUSTRY_PASSWORD
 *   TEST_INDUSTRY2_EMAIL, TEST_INDUSTRY2_PASSWORD
 *   TEST_ADMIN_EMAIL, TEST_ADMIN_PASSWORD
 * 
 * Or create a .env.test file (see .env.test.example)
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,          // Run tests sequentially — they share state
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  // Reuse the dev server that is already running
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:5173',
  //   reuseExistingServer: true,
  // },
});
