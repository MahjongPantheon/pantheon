import { test, expect, type APIResponse, type Dialog } from '@playwright/test';
import * as uuid from 'uuid';
import { getLastMail } from './utils/mail';
import * as process from 'process';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('AUTH-002: Visitor can open account sign-up from Tyr', async ({ page, context }) => {
  await page.goto(process.env.TYR_URL!);
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByTestId('tyr-login-signup').click({ timeout: 10_000 }),
  ]);
  await expect(newTab.getByRole('heading', { name: 'Register new account' })).toBeVisible();
});

test('AUTH-003: Visitor can open password recovery from Tyr', async ({ page, context }) => {
  await page.goto(process.env.TYR_URL!);
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByTestId('tyr-login-recovery').click(),
  ]);
  await expect(newTab.getByText(/Recover password/)).toBeVisible();
});

test('AUTH-001: Visitor can sign up, confirm their email, and log in', async ({ page }) => {
  const email = uuid.v4() + '@test.com';
  let confirmationPath: string | undefined;
  const captureConfirmation = async (dialog: Dialog) => {
    // Frey returns a code instead of sending email in development.
    confirmationPath = dialog.message().match(/\/profile\/confirm\/[a-f0-9]{40}\b/)?.[0];
    await dialog.accept();
  };

  // Register
  await page.goto(process.env.FORSETI_URL + '/profile/signup');
  await page.getByTestId('forseti-signup-email').fill(email);
  await page.getByTestId('forseti-signup-title').fill('Test account');
  await page.getByTestId('forseti-signup-password').fill('SomeStrongPassword123321');
  await page.getByTestId('forseti-signup-privacy-policy').click();
  page.once('dialog', captureConfirmation);
  await page.getByTestId('forseti-signup-submit').click();

  // Capture the development dialog; retain the mail flow for environments that send mail.
  await expect(page.getByTestId('forseti-signup-success')).toBeVisible();
  page.off('dialog', captureConfirmation);
  if (confirmationPath) {
    // StrictMode repeats the confirmation effect in development. Submit its one-time
    // request once and replay the real server response (including errors) to both effects.
    const responses = new Map<string, Promise<APIResponse>>();
    await page.route('**/common.Frey/ApproveRegistration', async (route) => {
      const body = route.request().postDataBuffer()!.toString('base64');
      if (!responses.has(body)) {
        responses.set(body, route.fetch());
      }
      await route.fulfill({ response: await responses.get(body)! });
    });
  } else {
    const message = await getLastMail();
    confirmationPath = message.match(/\/profile\/confirm\/[a-f0-9]{40}\b/)?.[0];
  }
  expect(confirmationPath).toBeTruthy();

  // Follow the confirmation path on the configured frontend.
  await page.goto(new URL(confirmationPath!, process.env.FORSETI_URL).toString());
  await expect(page.getByTestId('forseti-confirm-success')).toBeVisible();
  await page.getByTestId('forseti-confirm-go-to-login').click();

  // Proceed to login
  await expect(page.getByText(/Login to your account/)).toBeVisible();
  await page.getByTestId('forseti-login-email').fill(email);
  await page.getByTestId('forseti-login-password').fill('SomeStrongPassword123321');
  await page.getByTestId('forseti-login-submit').click();

  // Check we've logged in
  await expect(page.getByText(/Manage my events/)).toBeVisible();
});
