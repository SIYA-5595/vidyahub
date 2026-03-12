import { Page, expect } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// VidyaHub – Shared E2E Test Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navigates to the login page and waits for it to be fully rendered.
 */
export async function gotoLogin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.waitForSelector('[data-testid="login-page"]', { timeout: 15000 });
}

/**
 * Navigates to the signup page and waits for it to be fully rendered.
 */
export async function gotoSignup(page: Page): Promise<void> {
  await page.goto('/signup');
  await page.waitForSelector('[data-testid="signup-page"]', { timeout: 15000 });
}

/**
 * Fills in the login form with the given credentials and submits it.
 *
 * @param page      - Playwright page
 * @param email     - E-mail address to use
 * @param password  - Password to use
 */
export async function fillAndSubmitLogin(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.locator('[data-testid="login-email-input"]').fill(email);
  await page.locator('[data-testid="login-password-input"]').fill(password);
  await page.locator('[data-testid="login-submit-button"]').click();
}

/**
 * Fills in the signup form and submits it.
 *
 * @param page      - Playwright page
 * @param firstName - First name
 * @param lastName  - Last name
 * @param email     - E-mail address (make unique per run using Date.now())
 * @param password  - Password (must be ≥ 6 characters for Firebase)
 */
export async function fillAndSubmitSignup(
  page: Page,
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<void> {
  await page.locator('[data-testid="signup-firstname-input"]').fill(firstName);
  await page.locator('[data-testid="signup-lastname-input"]').fill(lastName);
  await page.locator('[data-testid="signup-email-input"]').fill(email);
  await page.locator('[data-testid="signup-password-input"]').fill(password);
  await page.locator('[data-testid="signup-submit-button"]').click();
}

/**
 * Toggles the password visibility button and asserts the resulting type.
 *
 * @param page       - Playwright page
 * @param testId     - data-testid of the password <input>
 * @param toggleId   - data-testid of the visibility-toggle <button>
 * @param expectType - Expected input type after the click ('text' | 'password')
 */
export async function togglePasswordVisibility(
  page: Page,
  testId: string,
  toggleId: string,
  expectType: 'text' | 'password'
): Promise<void> {
  await page.locator(`[data-testid="${toggleId}"]`).click();
  await expect(page.locator(`[data-testid="${testId}"]`)).toHaveAttribute(
    'type',
    expectType
  );
}

/**
 * Waits for a visible error banner and (optionally) checks its message.
 *
 * @param page      - Playwright page
 * @param testId    - data-testid of the error container
 * @param textMatch - Optional string or regex to match inside the error text
 * @param timeout   - How long to wait in ms (default: 10 000)
 */
export async function expectErrorVisible(
  page: Page,
  testId: string,
  textMatch?: string | RegExp,
  timeout = 10_000
): Promise<void> {
  const errorEl = page.locator(`[data-testid="${testId}"]`);
  await expect(errorEl).toBeVisible({ timeout });
  if (textMatch !== undefined) {
    await expect(errorEl).toContainText(textMatch);
  }
}

/**
 * Asserts that the error banner is NOT rendered (or hidden) on initial load.
 *
 * @param page   - Playwright page
 * @param testId - data-testid of the error container
 */
export async function expectNoError(page: Page, testId: string): Promise<void> {
  await expect(page.locator(`[data-testid="${testId}"]`)).not.toBeVisible();
}

/**
 * Generates a unique test email address using the current timestamp.
 * Useful for Signup tests that require a fresh account every run.
 *
 * @example  uniqueTestEmail()  →  "e2e.1708361234567@vidyahub.com"
 */
export function uniqueTestEmail(): string {
  return `e2e.${Date.now()}@vidyahub.com`;
}
