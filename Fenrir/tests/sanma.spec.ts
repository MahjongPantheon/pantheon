import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { enterRound, playerPlace } from './utils/game-flow';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

// Case: ../testcases/smoke-007-three-player-session.md
test('SMOKE-007: Three players can finish a sanma session after South 3', async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(5 * 60_000);
  page.setDefaultTimeout(15_000);
  const [administrator, ...players] = await createTestAccounts(request, 4);
  const title = `TEST SMOKE-007 ${randomUUID()}`;
  const adminContext = await browser.newContext();
  adminContext.setDefaultTimeout(15_000);
  let admin = await adminContext.newPage();
  try {
    await admin.goto(process.env.FORSETI_URL!);
    await admin.getByTestId('forseti-login-email').fill(administrator.email);
    await admin.getByTestId('forseti-login-password').fill(administrator.password);
    await admin.getByTestId('forseti-login-submit').click();
    await admin.getByTestId('forseti-menu-sidebar-create-event').click();
    await admin.getByTestId('forseti-event-settings-basic-settings-event-title').fill(title);
    await admin.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_LOCAL').check();
    await admin.getByTestId('forseti-event-settings-basic-settings-event-ruleset').click();
    await admin
      .getByRole('option', { name: 'Three-player riichi (sanma) rules', exact: true })
      .click();
    await admin
      .getByTestId('forseti-event-settings-basic-settings-event-timezone')
      .fill('Europe/Moscow');
    await admin.getByRole('option', { name: 'Europe/Moscow', exact: true }).click();
    await admin.getByTestId('forseti-event-settings-save').click();
    const [settings] = await Promise.all([
      adminContext.waitForEvent('page'),
      admin.getByRole('link', { name: title, exact: true }).click({ button: 'middle' }),
    ]);
    admin = settings;
    await expect(admin.getByTestId('forseti-event-settings-page')).toBeVisible();
    const eventId = new URL(admin.url()).pathname.match(/\/edit\/(\d+)/)![1];
    await admin.getByTestId('forseti-menu-sidebar-event-players').click();
    for (const player of players) {
      await admin.getByTestId('forseti-players-add-selector').fill(player.title);
      await admin
        .getByRole('option')
        .filter({ hasText: `${player.title} [#${player.id},` })
        .click();
      await expect(admin.getByTestId(`forseti-players-row-${player.id}`)).toBeVisible();
    }
    await page.goto(process.env.TYR_URL!);
    await page.getByTestId('tyr-login-email').fill(players[0].email);
    await page.getByTestId('tyr-login-password').fill(players[0].password);
    await page.getByTestId('tyr-login-submit').click();
    await page.getByTestId(`tyr-event-select-event-${eventId}`).click();
    await page.getByTestId('tyr-home-new-game').click();
    await page.getByTestId('tyr-new-game-clear').click();
    await expect(page.getByTestId('tyr-new-game-player-north')).toHaveCount(0);
    for (const [index, wind] of ['east', 'south', 'west'].entries()) {
      const [loaded] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().endsWith('/common.Mimir/GetAllRegisteredPlayers') &&
            response.request().method() === 'POST'
        ),
        page.getByTestId(`tyr-new-game-player-${wind}`).click(),
      ]);
      expect(loaded.ok()).toBe(true);
      await page.getByTestId('tyr-player-search-query').fill(players[index].title);
      await page.getByTestId(`tyr-player-search-result-${players[index].id}`).click();
    }
    await page.getByTestId('tyr-new-game-start').click();
    for (let index = 1; index <= 6; index++) {
      await expect(page.getByTestId('tyr-table-round')).toHaveText(
        `${index <= 3 ? '東' : '南'}${((index - 1) % 3) + 1}`
      );
      for (const [seat, player] of players.entries()) {
        const place = playerPlace(page, 'tyr-table-player', player);
        await expect(place).toHaveCount(1);
        await expect(place.getByTestId(/-points$/)).toHaveText('35000');
        await expect(place).toContainText(['東', '南', '西'][(((seat - (index - 1)) % 3) + 3) % 3]);
      }
      await enterRound(page, players, {
        outcome: 'draw',
        tenpai: [],
        scores: [35000, 35000, 35000],
        round: index + 1,
        honba: index,
        pot: 0,
      });
      await page.getByTestId('tyr-round-preview-submit').click();
    }
    await expect(page.getByTestId('tyr-game-result')).toBeVisible();
    await expect(page.getByTestId(/^tyr-game-result-player-\d+$/)).toHaveCount(3);
    for (const player of players) {
      await expect(page.getByTestId(`tyr-game-result-player-${player.id}-score`)).toHaveText(
        '35000'
      );
      await expect(
        page.getByTestId(`tyr-game-result-player-${player.id}-rating-change`)
      ).toHaveText('0');
    }
  } finally {
    await adminContext.close();
  }
});
