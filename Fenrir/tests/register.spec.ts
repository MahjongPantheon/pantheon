import { test, expect } from '@playwright/test';
import * as uuid from 'uuid';
import { getLastMail } from './utils/mail';
import * as process from 'process';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('Register link from assistant', async ({ page, context }) => {
  await page.goto(process.env.TYR_URL!);
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByTestId('tyr-login-signup').click({ timeout: 10_000 }),
  ]);
  await expect(newTab.getByRole('heading', { name: 'Register new account' })).toBeVisible();
});

test('Reset password link from assistant', async ({ page, context }) => {
  await page.goto(process.env.TYR_URL!);
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByTestId('tyr-login-recovery').click(),
  ]);
  await expect(newTab.getByText(/Recover password/)).toBeVisible();
});

test('Register and login from admin panel', async ({ page }) => {
  const email = uuid.v4() + '@test.com';

  // Register
  await page.goto(process.env.FORSETI_URL + '/profile/signup');
  await page.getByTestId('forseti-signup-email').fill(email);
  await page.getByTestId('forseti-signup-title').fill('Test account');
  await page.getByTestId('forseti-signup-password').fill('SomeStrongPassword123321');
  await page.getByTestId('forseti-signup-privacy-policy').click();
  await page.getByTestId('forseti-signup-submit').click();

  // Register success, get mail
  await expect(page.getByTestId('forseti-signup-success')).toBeVisible();
  const message = await getLastMail();
  const link = message.match(/https?:\/\/(.*)/)?.[0]?.replace(/https?:\/\/[^\/]+/, '');
  expect(link).toBeTruthy();

  // Follow link in message and confirm signup
  await page.goto(process.env.FORSETI_URL! + link);
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
