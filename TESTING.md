# 🎭 VidyaHub – Playwright E2E Testing Guide

## Overview

This document describes the end-to-end (E2E) testing strategy for the **VidyaHub** authentication flows — Login and Signup — using [Playwright](https://playwright.dev/).

| What           | Detail                                                  |
| -------------- | ------------------------------------------------------- |
| Framework      | Playwright v1.58.2                                      |
| Test runner    | `@playwright/test`                                      |
| App under test | Next.js 16 on `http://localhost:3000`                   |
| Test files     | `tests/login.spec.ts`, `tests/signup.spec.ts`           |
| Shared utils   | `tests/utils/test-helpers.ts`                           |
| Browsers       | Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari |

---

## 📁 Project Structure

```
vidyahub/
├── playwright.config.ts          # Central Playwright configuration
├── .env.test                     # ⚠️ Test credentials (NOT committed — use .env.test.example)
├── .env.test.example             # Template — copy this and fill in real values
└── tests/
    ├── login.spec.ts             # Login flow E2E tests
    ├── signup.spec.ts            # Signup flow E2E tests
    └── utils/
        └── test-helpers.ts       # Shared helper functions & page-object utilities
```

---

## ⚙️ Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Install Playwright browsers

```bash
npx playwright install
```

### 3. Configure test environment variables

```bash
# Copy the example file
cp .env.test.example .env.test

# Open .env.test and fill in your real Firebase test-account credentials:
#   TEST_USER_EMAIL       → an existing Firebase test user (for login tests)
#   TEST_USER_PASSWORD    → its password
#   TEST_SIGNUP_PASSWORD  → password for fresh-account signup tests
#   EXISTING_USER_EMAIL   → an already-registered email (for duplicate-email test)
```

> **Note:** Tests that need real Firebase credentials are **automatically skipped** when env vars are empty — the rest of the test suite still runs in full.

---

## 🚀 Running Tests

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm test`             | Run all tests (headless, all browsers)    |
| `npm run test:headed`  | Run with browser window visible           |
| `npm run test:ui`      | Interactive Playwright UI mode            |
| `npm run test:codegen` | Launch Codegen recorder on localhost:3000 |
| `npm run test:report`  | Open the last HTML report                 |

### Run a single spec file

```bash
npx playwright test tests/login.spec.ts
npx playwright test tests/signup.spec.ts
```

### Run a specific browser only

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"
```

### Run tests matching a title keyword

```bash
npx playwright test --grep "Password Visibility"
npx playwright test --grep "Invalid Credentials"
```

### Run in debug mode (step-by-step)

```bash
npx playwright test --debug
```

---

## 🧪 Test Coverage

### `tests/login.spec.ts` — 20 tests

| Suite                                         | Tests                                                                                                                                               |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **UI Rendering**                              | Page container, form, heading, description, email input, password input, submit button, forgot-password link, create-account link, no-error on load |
| **Password Visibility Toggle**                | Default `type="password"`, click once → `type="text"`, click twice → back to `type="password"`                                                      |
| **Input Field Behaviour**                     | Fill email, fill password, clear & retype email                                                                                                     |
| **Form Validation**                           | Empty email → no submit, empty password → no submit, invalid email format                                                                           |
| **Invalid Credentials** _(requires Firebase)_ | Error message shown, user stays on `/login`                                                                                                         |
| **Navigation**                                | "Create Account" → `/signup`                                                                                                                        |
| **Successful Login** _(env-gated)_            | Valid credentials → redirect to `/dashboard`                                                                                                        |
| **Accessibility**                             | Tab focus, submit button disabled-while-loading, page title                                                                                         |

### `tests/signup.spec.ts` — 22 tests

| Suite                               | Tests                                                                                                                                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **UI Rendering**                    | Page container, form, heading, description, first name, last name, email, password inputs, submit button, sign-in link, no-error on load |
| **Password Visibility Toggle**      | Default hidden, click once → revealed, click twice → hidden                                                                              |
| **Input Field Behaviour**           | Fill each field individually, fill all fields together                                                                                   |
| **Form Validation**                 | Missing first name, last name, email, password; invalid email format                                                                     |
| **Firebase Error Scenarios**        | Duplicate email _(env-gated)_, weak password (< 6 chars)                                                                                 |
| **Navigation**                      | "Sign In" → `/login`                                                                                                                     |
| **Successful Signup** _(env-gated)_ | Unique email → redirect to `/login` after 1.5 s                                                                                          |
| **Accessibility**                   | First name focusable, submit disabled while loading, page title                                                                          |

---

## 🔖 `data-testid` Selector Reference

### Login Page (`/login`)

| `data-testid`           | Element                          |
| ----------------------- | -------------------------------- |
| `login-page`            | Root container div               |
| `login-form`            | `<form>` element                 |
| `login-email-input`     | Email `<input>`                  |
| `login-password-input`  | Password `<input>`               |
| `login-toggle-password` | Eye/EyeOff toggle `<button>`     |
| `login-submit-button`   | "Sign In to VidyaHub" `<button>` |
| `login-error-message`   | Error banner `<div>`             |
| `forgot-password-link`  | "Forgot password?" `<a>`         |
| `signup-link`           | "Create Account" `<a>`           |

### Signup Page (`/signup`)

| `data-testid`            | Element                        |
| ------------------------ | ------------------------------ |
| `signup-page`            | Root container div             |
| `signup-form`            | `<form>` element               |
| `signup-firstname-input` | First name `<input>`           |
| `signup-lastname-input`  | Last name `<input>`            |
| `signup-email-input`     | Email `<input>`                |
| `signup-password-input`  | Password `<input>`             |
| `signup-toggle-password` | Eye/EyeOff toggle `<button>`   |
| `signup-submit-button`   | "Create My Account" `<button>` |
| `signup-error-message`   | Error banner `<div>`           |
| `login-link`             | "Sign In" `<a>`                |

---

## 🎬 Recording Tests with Codegen

Playwright Codegen lets you record real browser interactions and generate test code automatically.

```bash
# Start the dev server first (in a separate terminal)
npm run dev

# Then launch the Codegen recorder
npm run test:codegen
```

A browser window opens. Navigate to `/login` or `/signup`, perform actions, and Playwright generates the selector-based test code in real time. Copy-paste into your spec file and refine as needed.

---

## 🌐 Environment-Gated Tests

Some tests interact with real Firebase — creating or authenticating users. These are automatically **skipped** (`test.skip`) when the required env var is empty, with a human-readable message:

```
Skipping: TEST_USER_EMAIL / TEST_USER_PASSWORD env vars not set
```

To enable them, fill in the variables in `.env.test`.

---

## 📊 Viewing the HTML Report

After any test run, open the rich HTML report:

```bash
npm run test:report
```

This opens a browser showing pass/fail status, screenshots on failure, video recordings, and full traces.

---

## 🔄 CI / GitHub Actions Integration

To run tests in CI, set the following repository secrets and add this workflow:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm test
        env:
          CI: true
          TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
          TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}
          TEST_SIGNUP_PASSWORD: ${{ secrets.TEST_SIGNUP_PASSWORD }}
          EXISTING_USER_EMAIL: ${{ secrets.EXISTING_USER_EMAIL }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🛠️ Troubleshooting

| Problem                                                | Solution                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `Error: browserType.launch: Executable doesn't exist`  | Run `npx playwright install`                                       |
| Tests time out on page load                            | Ensure `npm run dev` is running on port 3000                       |
| Firebase tests fail with `auth/network-request-failed` | Check your internet connection and Firebase config in `.env.local` |
| Tests pass locally but fail in CI                      | Ensure all required secrets are set in your CI environment         |
| `Cannot find module 'dotenv'`                          | Run `npm install --save-dev dotenv`                                |
