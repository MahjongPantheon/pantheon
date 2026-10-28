import { test, expect } from '@playwright/test';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('AUTH-004: Account owner can reset a password once and log in with the new password', async ({
  page,
  request,
}) => {
  test.skip(
    !new URL(process.env.FREY_URL!).hostname.endsWith('.pantheon.local'),
    'This case captures a development recovery dialog'
  );
  const [account] = await createTestAccounts(request, 1);
  const password = 'NewStrongPassword123321!';
  let path: string | undefined;
  await page.goto(`${process.env.FORSETI_URL}/profile/resetPassword`);
  await page.getByTestId('forseti-reset-password-email').fill(account.email);
  page.once('dialog', async (dialog) => {
    const link = dialog.defaultValue();
    path = link.slice(link.indexOf('/profile/resetPasswordConfirm/'));
    await dialog.accept();
  });
  await page.getByTestId('forseti-reset-password-submit').click();
  await expect(page.getByText('Email has been sent', { exact: true })).toBeVisible();
  expect(path).toMatch(/^\/profile\/resetPasswordConfirm\/.+/);
  const recoveryUrl = new URL(path!, process.env.FORSETI_URL).toString();
  await page.goto(recoveryUrl);
  await page.getByTestId('forseti-reset-password-confirm-approve').click();
  await page.getByTestId('forseti-reset-password-confirm-new-password').fill(password);
  await page.getByTestId('forseti-reset-password-confirm-submit').click();
  await expect(page.getByText('Password successfully updated', { exact: true })).toBeVisible();
  await page.getByTestId('forseti-reset-password-confirm-go-to-login').click();
  await page.getByTestId('forseti-login-email').fill(account.email);
  await page.getByTestId('forseti-login-password').fill(password);
  await page.getByTestId('forseti-login-submit').click();
  await expect(page.getByText(/Manage my events/)).toBeVisible();

  // The successful link must not reset the password again, even after changing it.
  await page.goto(recoveryUrl);
  await page.getByTestId('forseti-reset-password-confirm-approve').click();
  await expect(page.getByText('Password recovery failed', { exact: true })).toBeVisible();
  const authorization = await request.post(`${process.env.FREY_URL}/v2/common.Frey/Authorize`, {
    data: { email: account.email, password },
  });
  await expect(authorization).toBeOK();
});
