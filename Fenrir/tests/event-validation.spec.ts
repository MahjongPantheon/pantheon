import { test, expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

async function checkValidationNavigation(page: Page, eventTitle: string) {
  const title = page.getByTestId('forseti-event-settings-basic-settings-event-title');
  const timezone = page.getByTestId('forseti-event-settings-basic-settings-event-timezone');
  const goal = page.getByTestId('forseti-event-settings-ruleset-settings-ruleset-goal-points');
  const initialPoints = page.getByTestId(
    'forseti-event-settings-ruleset-settings-ruleset-start-points'
  );
  const save = page.getByTestId('forseti-event-settings-save');
  const basicTab = page.getByTestId('forseti-event-settings-tab-basic');
  const rulesetTab = page.getByTestId('forseti-event-settings-tab-ruleset');
  const yakuTab = page.getByTestId('forseti-event-settings-tab-yaku');

  const missingTimezone = !(await timezone.inputValue());
  await title.fill('');
  await rulesetTab.click();
  await page
    .getByTestId('forseti-event-settings-ruleset-settings-ruleset-play-additional-rounds')
    .check();
  await initialPoints.fill('30000');
  await goal.fill('30000');
  await initialPoints.fill('35000');
  await yakuTab.click();
  await save.click();
  await expect(basicTab).toHaveAttribute('aria-selected', 'true');
  await expect(title).toBeFocused();
  await expect(title).toBeInViewport();

  // Repeated submissions must navigate even when the first error has not changed.
  await yakuTab.click();
  await save.click();
  await expect(basicTab).toHaveAttribute('aria-selected', 'true');
  await expect(title).toBeFocused();
  await expect(title).toBeInViewport();
  await title.fill(eventTitle);

  if (missingTimezone) {
    // Move to the next invalid field within the same tab.
    await yakuTab.click();
    await save.click();
    await expect(basicTab).toHaveAttribute('aria-selected', 'true');
    await expect(timezone).toBeFocused();
    await expect(timezone).toBeInViewport();
    await timezone.fill('Europe/Moscow');
    await page.getByRole('option', { name: 'Europe/Moscow', exact: true }).click();
  }

  await yakuTab.click();
  await save.click();
  await expect(rulesetTab).toHaveAttribute('aria-selected', 'true');
  await expect(goal).toBeFocused();
  await expect(goal).toBeInViewport();
  await goal.fill('35000');
}

test('Create and edit event navigate to the first invalid field', async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator] = await createTestAccounts(request, 1);
  const eventTitle = `TEST validation ${randomUUID()}`;
  await page.goto(process.env.FORSETI_URL!);
  await page.getByTestId('forseti-login-email').fill(administrator.email);
  await page.getByTestId('forseti-login-password').fill(administrator.password);
  await page.getByTestId('forseti-login-submit').click();
  await page.getByTestId('forseti-menu-sidebar-create-event').click();
  await page.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_LOCAL').check();

  await checkValidationNavigation(page, eventTitle);
  await page.getByTestId('forseti-event-settings-save').click();
  await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
  const [settingsPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: eventTitle, exact: true }).click({ button: 'middle' }),
  ]);
  await expect(
    settingsPage.getByTestId('forseti-event-settings-basic-settings-event-title')
  ).toHaveValue(eventTitle);
  await checkValidationNavigation(settingsPage, eventTitle);
  await settingsPage.getByTestId('forseti-event-settings-save').click();
  const save = settingsPage.getByTestId('forseti-event-settings-save');
  await expect(save).toContainText('Changes saved!');
  await expect(save).toBeDisabled();
  await expect(save).not.toHaveAttribute('data-loading');
  await expect(save).toContainText('Save changes', { timeout: 10_000 });
  await expect(save).toBeEnabled();
});
