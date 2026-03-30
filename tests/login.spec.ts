import { test, expect } from '@playwright/test';

test.describe('Full Authentication Flow', () => {

  test('User validation + signup + logout + second signup', async ({ page }) => {

    const email1 = `rgbenshi${Date.now()}@gmail.com`;
    const password1 = "rbenshi05";

    await test.step('Open Home and Navigate to Login', async () => {
      await page.goto('http://localhost:3000/');
      await page.getByRole('button', { name: 'Access Dashboard' }).click();
      await page.getByRole('button', { name: 'Sign In' }).click();
    });

    await test.step('Validate Empty Login Submit', async () => {
      await page.getByTestId('login-submit-button').click();
    });

    await test.step('Go to Signup Page', async () => {
      await page.getByTestId('signup-link').click();
    });

    await test.step('Fill Signup Form (User 1)', async () => {
      await page.getByTestId('signup-firstname-input').fill('benshi');
      await page.getByTestId('signup-lastname-input').fill('r');
      await page.getByTestId('signup-email-input').fill(email1);
      await page.getByTestId('signup-password-input').fill(password1);

      // Toggle password visibility
      await page.getByTestId('signup-toggle-password').click();
      await page.getByTestId('signup-toggle-password').click();

      await page.getByTestId('signup-submit-button').click();
    });

    await test.step('Login After Signup', async () => {
      await page.getByTestId('login-email-input').fill(email1);
      await page.getByTestId('login-password-input').fill(password1);
      await page.getByTestId('login-submit-button').click();
    });

    await test.step('Logout', async () => {
      await page.getByRole('button', { name: 'benshi r' }).click();
      await page.getByText('Log out').click();
    });

    await test.step('Navigate Forgot Password and Back to Signup', async () => {
      await page.getByTestId('forgot-password-link').click();
      await page.getByTestId('signup-link').click();
    });

    await test.step('Second Signup Flow', async () => {
      const email2 = `second${Date.now()}@gmail.com`;

      await page.goto('http://localhost:3000/');
      await page.getByRole('button', { name: 'Sign Up' }).click();

      await page.getByTestId('signup-firstname-input').fill('hgee');
      await page.getByTestId('signup-lastname-input').fill('fdfs');
      await page.getByTestId('signup-email-input').fill(email2);
      await page.getByTestId('signup-password-input').fill('jebufi123');

      await page.getByTestId('signup-submit-button').click();
    });

  });

});