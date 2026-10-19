import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

// Case: ../testcases/smoke-004-create-event-with-users.md
test('SMOKE-004: Create a local event and add players there', async ({
  page: initialPage,
  context,
  request,
}) => {
  let page = initialPage;
  test.setTimeout(120_000);
  const [administrator, ...players] = await test.step('Create independent account fixtures', () =>
    createTestAccounts(request, 9));
  const eventTitle = `TEST SMOKE-004 ${randomUUID()}`;
  const eventRows = page.getByTestId(/^forseti-owned-event-row-\d+$/);
  let playerRows = page.getByTestId(/^forseti-players-row-\d+$/);

  await test.step('Log in as the new event administrator', async () => {
    await page.goto(process.env.FORSETI_URL!);
    await expect(page.getByTestId('forseti-login-email')).toBeVisible();
    await expect(page.getByTestId('forseti-login-password')).toBeVisible();
    await page.getByTestId('forseti-login-email').fill(administrator.email);
    await page.getByTestId('forseti-login-password').fill(administrator.password);
    await page.getByTestId('forseti-login-submit').click();
    await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
    await expect(eventRows).toHaveCount(0);
  });

  await test.step('Create a local event through Forseti', async () => {
    await page.getByTestId('forseti-menu-sidebar-create-event').click();
    await expect(page.getByTestId('forseti-event-settings-page')).toBeVisible();
    const title = page.getByTestId('forseti-event-settings-basic-settings-event-title');
    const localType = page.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_LOCAL');
    const ruleset = page.getByTestId('forseti-event-settings-basic-settings-event-ruleset');
    const timezone = page.getByTestId('forseti-event-settings-basic-settings-event-timezone');
    await title.fill(eventTitle);
    await localType.check();
    await ruleset.click();
    const rulesetOption = page.getByRole('option').first();
    const rulesetName = await rulesetOption.innerText();
    await rulesetOption.click();
    await timezone.fill('Europe/Moscow');
    await page.getByRole('option', { name: 'Europe/Moscow', exact: true }).click();
    await expect(title).toHaveValue(eventTitle);
    await expect(localType).toBeChecked();
    await expect(ruleset).toHaveValue(rulesetName);
    await expect(timezone).toHaveValue('Europe/Moscow');
    await expect(page.getByTestId('forseti-event-settings-tab-basic')).toHaveAttribute(
      'data-active',
      'true'
    );
    const [created] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/common.Mimir/CreateEvent') &&
          response.request().method() === 'POST'
      ),
      page.getByTestId('forseti-event-settings-save').click(),
    ]);
    expect(created.ok(), 'Mimir must create the event and assign its administrator').toBe(true);
    await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
    await expect(eventRows).toHaveCount(1);
    await expect(eventRows).toContainText(eventTitle);
  });

  await test.step('Open event settings and its empty player list', async () => {
    // Full navigation initializes permissions for the new event. Forseti's in-app
    // navigation currently checks the previous page's permissions before loading them.
    const [settingsPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('link', { name: eventTitle, exact: true }).click({ button: 'middle' }),
    ]);
    page = settingsPage;
    playerRows = page.getByTestId(/^forseti-players-row-\d+$/);
    await expect(page.getByTestId('forseti-event-settings-page')).toBeVisible();
    await expect(page.getByTestId('forseti-event-settings-basic-settings-event-title')).toHaveValue(
      eventTitle
    );
    await page.getByTestId('forseti-menu-sidebar-event-players').click();
    await expect(page.getByTestId('forseti-players-page')).toBeVisible();
    await expect(page.getByTestId('forseti-players-add-selector')).toBeVisible();
    await expect(playerRows).toHaveCount(0);
  });

  await test.step('Find and register all eight players', async () => {
    for (const [index, player] of players.entries()) {
      await page.getByTestId('forseti-players-add-selector').fill(player.title);
      await page
        .getByRole('option')
        .filter({ hasText: `${player.title} [#${player.id},` })
        .click();
      await expect(playerRows).toHaveCount(index + 1);
      await expect(page.getByTestId(`forseti-players-row-${player.id}`)).toContainText(
        player.title
      );
    }
  });

  await test.step('Verify registrations survive reloading', async () => {
    await page.reload();
    await expect(page.getByTestId('forseti-players-add-selector')).toBeVisible();
    await expect(playerRows).toHaveCount(8);
    for (const player of players) {
      await expect(page.getByTestId(`forseti-players-row-${player.id}`)).toContainText(
        player.title
      );
    }
  });

  await test.step('Filter finished events from the owned events page', async () => {
    await page.goto(`${process.env.FORSETI_URL}/ownedEvents`);
    const ongoing = page.getByTestId('forseti-owned-events-filter-ongoing');
    const all = page.getByTestId('forseti-owned-events-filter-all');
    await expect(ongoing).toHaveAttribute('aria-pressed', 'true');
    const row = page.getByTestId(/^forseti-owned-event-row-\d+$/).filter({ hasText: eventTitle });
    await expect(row).toBeVisible();
    const rowId = (await row.getAttribute('data-testid'))!.split('-').pop();
    await page.goto(`${process.env.FORSETI_URL}/ownedEvents/edit/${rowId}`);
    await expect(page.getByTestId('forseti-event-settings-page')).toBeVisible();
    await page.getByTestId('forseti-menu-sidebar-finish-event').click();
    await page.getByTestId('forseti-stop-event-confirm').click();
    await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
    await expect(row).toHaveCount(0);
    await all.click();
    await expect(all).toHaveAttribute('aria-pressed', 'true');
    await expect(row).toBeVisible();
    let resumeRequest!: () => void;
    const pendingRequest = new Promise<void>((resolve) => {
      resumeRequest = resolve;
    });
    await page.route(
      '**/common.Mimir/GetEventStates',
      async (route) => {
        await pendingRequest;
        await route.continue();
      },
      { times: 1 }
    );
    try {
      await ongoing.click();
      await expect(ongoing).toHaveAttribute('aria-pressed', 'true');
      await expect(page.getByTestId('forseti-owned-events-page')).toHaveAttribute(
        'aria-busy',
        'true'
      );
      await expect(row).toBeVisible();
    } finally {
      resumeRequest();
    }
    await expect(row).toHaveCount(0);
    await page.reload();
    await expect(ongoing).toHaveAttribute('aria-pressed', 'true');
    await expect(row).toHaveCount(0);
  });
});
