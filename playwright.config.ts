import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Load environment variables from .env.test
 */
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  /* ── Test folder ───────────────────────────────────────── */
  testDir: './tests',

  /* 🔥 IMPORTANT: Disable parallel for local stability */
  fullyParallel: false,
  workers: 1,

  /* Retry config */
  retries: process.env.CI ? 2 : 1,

  /* Prevent test.only in CI */
  forbidOnly: !!process.env.CI,

  /* ── Reporters ─────────────────────────────────────────── */
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],

  /* ── Shared settings ───────────────────────────────────── */
  use: {
    baseURL: 'http://localhost:3000',

    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',

    navigationTimeout: 30000,
    actionTimeout: 10000,
    headless: true,
  },

  /* ── Browser Projects (Stable Order) ──────────────────── */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: ['**/login.spec.ts', '**/signup.spec.ts'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      testMatch: ['**/login.spec.ts', '**/signup.spec.ts'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      testMatch: ['**/login.spec.ts', '**/signup.spec.ts'],
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/login.spec.ts', '**/signup.spec.ts'],
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      testMatch: ['**/login.spec.ts', '**/signup.spec.ts'],
    },
  ],

  /* ── Dev Server ───────────────────────────────────────── */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
