import { test, expect } from '@playwright/test';
import * as uuid from 'uuid';
import { getLastMail } from './utils/mail';
import * as process from 'process';

test('Register link from assistant', async ({ page, context }) => {
  await page.goto(process.env.TYR_URL!);
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByTestId('button_signup').click(),
  ]);
  await expect(newTab.getByRole('heading', { name: 'Register new account' })).toBeVisible();
});

test('Reset password link from assistant', async ({ page, context }) => {
  await page.goto(process.env.TYR_URL!);
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByTestId('button_forgot').click(),
  ]);
  await expect(newTab.getByText(/Recover password/)).toBeVisible();
});

test('Register and login from admin panel', async ({ page }) => {
  const email = uuid.v4() + '@test.com';

  // Register
  await page.goto(process.env.FORSETI_URL + '/profile/signup');
  await page.getByTestId('email_field').fill(email);
  await page.getByTestId('title_field').fill('Test account');
  await page.getByTestId('password_field').fill('SomeStrongPassword123321');
  await page.getByTestId('agreement_checkbox').click();
  await page.getByTestId('register_submit_button').click();

  // Register success, get mail
  await expect(page.getByTestId('register_success')).toBeVisible();
  const message = await getLastMail();
  const link = message.match(/https?:\/\/(.*)/)?.[0]?.replace(/https?:\/\/[^\/]+/, '');
  expect(link).toBeTruthy();

  // Follow link in message and confirm signup
  await page.goto(process.env.FORSETI_URL! + link);
  await expect(page.getByTestId('confirmation_success')).toBeVisible();
  await page.getByTestId('goto_login').click();

  // Proceed to login
  await expect(page.getByText(/Login to your account/)).toBeVisible();
  await page.getByTestId('email_field').fill(email);
  await page.getByTestId('password_field').fill('SomeStrongPassword123321');
  await page.getByTestId('login_button').click();

  // Check we've logged in
  await expect(page.getByText(/Manage my events/)).toBeVisible();
});
