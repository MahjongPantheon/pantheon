import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { GenericEventPayload } from '../../Common/tsclients/proto/atoms.pb';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('Registration identifiers and team names preserve players across saves and tab changes', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator, ...players] = await createTestAccounts(request, 3);
  await page.goto(process.env.FORSETI_URL!);
  await page.getByTestId('forseti-login-email').fill(administrator.email);
  await page.getByTestId('forseti-login-password').fill(administrator.password);
  await page.getByTestId('forseti-login-submit').click();
  await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
  await page.getByTestId('forseti-menu-sidebar-create-event').click();
  await page
    .getByTestId('forseti-event-settings-basic-settings-event-title')
    .fill(`TEST registration mappings ${randomUUID()}`);
  await page.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_TOURNAMENT').check();
  await page.getByTestId('forseti-event-settings-basic-settings-event-ruleset').click();
  await page.getByRole('option').first().click();
  await page
    .getByTestId('forseti-event-settings-basic-settings-event-timezone')
    .fill('Europe/Moscow');
  await page.getByRole('option', { name: 'Europe/Moscow', exact: true }).click();
  await page.getByTestId('forseti-event-settings-tab-tournament').click();
  await page.getByTestId('forseti-event-settings-tournament-settings-event-is-team').check();
  await page.getByTestId('forseti-event-settings-tournament-settings-event-is-prescripted').check();
  const [created] = await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().endsWith('/common.Mimir/CreateEvent') &&
        response.request().method() === 'POST'
    ),
    page.getByTestId('forseti-event-settings-save').click(),
  ]);
  expect(created.ok()).toBe(true);
  const { eventId } = GenericEventPayload.decode(new Uint8Array(await created.body()));
  // Full navigation loads the newly granted event permissions.
  await page.goto(`${process.env.FORSETI_URL}/ownedEvents/edit/${eventId}`);
  await page.getByTestId('forseti-menu-sidebar-event-players').click();
  const rows = page.getByTestId(/^forseti-players-row-\d+$/);
  for (const [index, player] of players.entries()) {
    await page.getByTestId('forseti-players-add-selector').fill(player.title);
    await page
      .getByRole('option')
      .filter({ hasText: `${player.title} [#${player.id},` })
      .click();
    await expect(rows).toHaveCount(index + 1);
  }
  const localId = (index: number) =>
    page.getByTestId(`forseti-players-local-id-input-${players[index].id}`);
  const teamName = (index: number) =>
    page.getByTestId(`forseti-players-team-name-input-${players[index].id}`);
  await page.getByTestId('forseti-players-tab-local-ids').click();
  // The IDs assigned by registration must be available without a reload.
  await expect(localId(0)).toHaveValue('1');
  await expect(localId(1)).toHaveValue('2');
  for (const ids of [
    [9, 10],
    [10, 9],
  ]) {
    await localId(0).fill(String(ids[0]));
    await localId(1).fill(String(ids[1]));
    await page.getByTestId('forseti-players-local-ids-save').click();
    await expect(page.getByTestId('forseti-players-local-ids-save')).toContainText(
      'Changes saved!'
    );
    await page.getByTestId('forseti-players-tab-management').click();
    await expect(rows).toHaveCount(2);
    await page.getByTestId('forseti-players-tab-local-ids').click();
    await expect(localId(0)).toHaveValue(String(ids[0]));
    await expect(localId(1)).toHaveValue(String(ids[1]));
  }
  await page.getByTestId('forseti-players-tab-team-names').click();
  await teamName(0).fill('East');
  await teamName(1).fill('East');
  await page.getByTestId('forseti-players-team-names-save').click();
  await expect(page.getByTestId('forseti-players-team-names-save')).toContainText('Changes saved!');
  await page.getByTestId('forseti-players-tab-management').click();
  await expect(rows).toHaveCount(2);
  await page.getByTestId('forseti-players-tab-team-names').click();
  await expect(teamName(0)).toHaveValue('East');
  await expect(teamName(1)).toHaveValue('East');
  await page.reload();
  await expect(rows).toHaveCount(2);
  await page.getByTestId('forseti-players-tab-local-ids').click();
  await expect(localId(0)).toHaveValue('10');
  await expect(localId(1)).toHaveValue('9');
  await page.getByTestId('forseti-players-tab-team-names').click();
  await expect(teamName(0)).toHaveValue('East');
  await expect(teamName(1)).toHaveValue('East');
});
