import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

import {
  rounds,
  localScenario,
  ratingChanges,
  assertPreview,
  assertPublishedGame,
  assertYakuCoverage,
  checkRules,
  assertNumber,
  assertTable,
  enterRound,
  checkLog,
} from './utils/game-flow';

withScreenshotsOnTestFail();

// Case: ../testcases/smoke-005-local-session-round-outcomes.md
test('SMOKE-005: Registered player can finish a local session and view matching results in Tyr and Sigrun', async ({
  page,
  browser,
  request,
}, testInfo) => {
  test.setTimeout(30 * 60_000);
  assertYakuCoverage([localScenario]);
  page.setDefaultTimeout(15_000);
  const [administrator, ...registered] =
    await test.step('Create independent account fixtures', () => createTestAccounts(request, 9));
  const players = registered.slice(0, 4);
  const eventTitle = `TEST SMOKE-005 ${randomUUID()}`;
  const adminContext = await browser.newContext();
  const sigrunContext = await browser.newContext();
  let admin = await adminContext.newPage();
  const sigrun = await sigrunContext.newPage();
  adminContext.setDefaultTimeout(15_000);
  sigrunContext.setDefaultTimeout(15_000);
  let eventId: string;
  let eventEditUrl: string;
  try {
    await test.step('Create the local event and verify its scoring rules in Forseti', async () => {
      await admin.goto(process.env.FORSETI_URL!);
      await admin.getByTestId('forseti-login-email').fill(administrator.email);
      await admin.getByTestId('forseti-login-password').fill(administrator.password);
      await admin.getByTestId('forseti-login-submit').click();
      await expect(admin.getByTestId('forseti-owned-events-page')).toBeVisible();
      await expect(admin.getByTestId(/^forseti-owned-event-row-\d+$/)).toHaveCount(0);
      await admin.getByTestId('forseti-menu-sidebar-create-event').click();
      await admin.getByTestId('forseti-event-settings-basic-settings-event-title').fill(eventTitle);
      await admin.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_LOCAL').check();
      await admin.getByTestId('forseti-event-settings-basic-settings-event-ruleset').click();
      await admin
        .getByRole('option', { name: 'European Mahjong Association rules', exact: true })
        .click();
      await admin
        .getByTestId('forseti-event-settings-basic-settings-event-timezone')
        .fill('Europe/Moscow');
      await admin.getByRole('option', { name: 'Europe/Moscow', exact: true }).click();
      await admin
        .getByTestId('forseti-event-settings-basic-settings-event-is-rating-shown')
        .check();
      await admin.getByTestId('forseti-event-settings-basic-settings-event-is-listed').check();
      await checkRules(admin, true);
      await admin.getByTestId('forseti-event-settings-save').click();
      const rows = admin.getByTestId(/^forseti-owned-event-row-\d+$/);
      await expect(rows).toHaveCount(1);
      await expect(rows).toContainText(eventTitle);
      // Match SMOKE-004's full-navigation workaround for Forseti's permissions race.
      const [settings] = await Promise.all([
        adminContext.waitForEvent('page'),
        admin.getByRole('link', { name: eventTitle, exact: true }).click({ button: 'middle' }),
      ]);
      admin = settings;
      await expect(admin.getByTestId('forseti-event-settings-page')).toBeVisible();
      eventId = new URL(admin.url()).pathname.match(/\/edit\/(\d+)/)![1];
      eventEditUrl = admin.url();
      await expect(
        admin.getByTestId('forseti-event-settings-basic-settings-event-title')
      ).toHaveValue(eventTitle);
      await expect(admin.getByText('Type: Local rating', { exact: true })).toBeVisible();
      await expect(
        admin.getByTestId('forseti-event-settings-basic-settings-event-timezone')
      ).toHaveValue('Europe/Moscow');
      await expect(
        admin.getByTestId('forseti-event-settings-basic-settings-event-is-rating-shown')
      ).toBeChecked();
      await checkRules(admin, false);
    });
    await test.step('Register eight players through Forseti and reload', async () => {
      await admin.getByTestId('forseti-menu-sidebar-event-players').click();
      const rows = admin.getByTestId(/^forseti-players-row-\d+$/);
      await expect(rows).toHaveCount(0);
      for (const [index, player] of registered.entries()) {
        await admin.getByTestId('forseti-players-add-selector').fill(player.title);
        await admin
          .getByRole('option')
          .filter({ hasText: `${player.title} [#${player.id},` })
          .click();
        await expect(rows).toHaveCount(index + 1);
      }
      await admin.reload();
      await expect(rows).toHaveCount(8);
      for (const player of registered)
        await expect(admin.getByTestId(`forseti-players-row-${player.id}`)).toContainText(
          player.title
        );
      await expect(admin.getByTestId(`forseti-players-row-${administrator.id}`)).toHaveCount(0);
    });
    await test.step('Log in to Tyr as player A and start A/B/C/D in fixed seating', async () => {
      await page.goto(process.env.TYR_URL!);
      await page.getByTestId('tyr-login-email').fill(players[0].email);
      await page.getByTestId('tyr-login-password').fill(players[0].password);
      await page.getByTestId('tyr-login-submit').click();
      await page.getByTestId(`tyr-event-select-event-${eventId}`).click();
      await expect(page.getByTestId('tyr-home-event-name')).toHaveText(eventTitle);
      await page.getByTestId('tyr-home-new-game').click();
      await page.getByTestId('tyr-new-game-clear').click();
      for (const [index, wind] of ['east', 'south', 'west', 'north'].entries()) {
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
        await expect(page.getByTestId(`tyr-new-game-player-${wind}`)).toContainText(
          players[index].title
        );
      }
      await expect(page.getByTestId('tyr-new-game-start')).toBeEnabled();
      await page.getByTestId('tyr-new-game-start').click();
      await assertTable(
        page,
        players,
        { outcome: 'ron', scores: [30000, 30000, 30000, 30000], round: 1, honba: 0, pot: 0 },
        false
      );
    });
    await test.step('Persist each yakuhai mode in Forseti and verify its Tyr buttons without recording a hand', async () => {
      const editUrl = eventEditUrl;
      for (const aggregated of [true, false]) {
        await admin.goto(editUrl);
        await expect(admin.getByTestId('forseti-event-settings-page')).toBeVisible();
        await admin.getByTestId('forseti-event-settings-tab-yaku').click();
        await admin.getByTestId('forseti-event-settings-yakuhai-aggregated').setChecked(aggregated);
        const [saved] = await Promise.all([
          admin.waitForResponse(
            (response) =>
              response.url().endsWith('/common.Mimir/UpdateEvent') &&
              response.request().method() === 'POST'
          ),
          admin.getByTestId('forseti-event-settings-save').click(),
        ]);
        expect(saved.ok()).toBe(true);
        await admin.goto(editUrl);
        await admin.getByTestId('forseti-event-settings-tab-yaku').click();
        await expect(admin.getByTestId('forseti-event-settings-yakuhai-aggregated')).toBeChecked({
          checked: aggregated,
        });
        await page.reload();
        await expect(page.getByTestId('tyr-table').or(page.getByTestId('tyr-home'))).toBeVisible();
        if (await page.getByTestId('tyr-home').isVisible())
          await page.getByTestId('tyr-home-current-game').click();
        const probe = aggregated
          ? {
              ...rounds[0],
              hands: [
                {
                  name: 'Aggregate yakuhai probe',
                  yaku: [14],
                  han: 2,
                  fu: 30,
                  dora: 0,
                  open: true,
                  labels: ['Yakuhai x2'],
                },
              ],
            }
          : rounds[0];
        await enterRound(page, players, probe, aggregated);
        const prefix = `tyr-hand-player-${players[rounds[0].winners![0]].id}`;
        await page.getByTestId('tyr-round-preview-back').click();
        await expect(page.getByTestId(`${prefix}-yaku-14`)).toHaveCount(aggregated ? 1 : 0);
        await expect(page.getByTestId(`${prefix}-yaku-56`)).toHaveCount(aggregated ? 0 : 1);
        const yakuhaiGroup = page.getByTestId(`${prefix}-yakuhai`);
        await expect
          .poll(() =>
            yakuhaiGroup.evaluate((group) =>
              group.previousElementSibling?.getAttribute('data-testid')
            )
          )
          .toBe(`${prefix}-yaku--1`);
        await expect(yakuhaiGroup.getByRole('heading')).toHaveCount(0);
        await expect(yakuhaiGroup).toHaveAttribute('aria-label', 'Yakuhai');
        await expect(yakuhaiGroup.getByRole('button')).toHaveCount(aggregated ? 4 : 7);
        if (!aggregated) {
          for (const name of [
            'East',
            'South',
            'West',
            'North',
            'Red dragon',
            'Green dragon',
            'White dragon',
          ]) {
            const tile = page.getByTestId(prefix).getByRole('img', { name, exact: true });
            await expect(tile).toBeVisible();
            await expect
              .poll(() => tile.evaluate((image: HTMLImageElement) => image.naturalWidth))
              .toBeGreaterThan(0);
          }
          const viewport = page.viewportSize()!;
          await page.setViewportSize({ width: 390, height: 844 });
          await expect
            .poll(async () => {
              const boxes = await yakuhaiGroup.getByRole('button').evaluateAll((buttons) =>
                buttons.map((button) => {
                  const box = button.getBoundingClientRect();
                  return { top: Math.round(box.top), left: box.left, right: box.right };
                })
              );
              return (
                new Set(boxes.map((box) => box.top)).size === 1 &&
                boxes.every((box) => box.left >= 0 && box.right <= 390)
              );
            })
            .toBe(true);
          await page.screenshot({ path: testInfo.outputPath('yakuhai-tiles.png') });
          await page.setViewportSize(viewport);
        }
        await page.getByTestId('tyr-hand-back').click();
        await page.getByTestId('tyr-select-player-back').click();
        await checkLog(page, players, 0);
      }
    });
    for (const [index, entry] of rounds.entries()) {
      await test.step(`R${index + 1}: ${entry.outcome}${index === rounds.length - 1 ? ' finishes South 4' : ''}`, async () => {
        await enterRound(page, players, entry);
        // Previewing the entry must not persist it. Back out to the active table before
        // entering it again, so unchanged scores and log count are verified through UI.
        if (index === 0) {
          await page.getByTestId('tyr-round-preview-back').click();
          await page.getByTestId('tyr-hand-back').click();
          await page.getByTestId('tyr-select-player-back').click();
          await assertTable(
            page,
            players,
            { ...entry, scores: [30000, 30000, 30000, 30000], round: 1 },
            false
          );
          await checkLog(page, players, 0);
          await enterRound(page, players, entry);
        }
        await assertPreview(page, players, index);
        await page.getByTestId('tyr-round-preview-submit').click();
        if (index === rounds.length - 1) {
          await expect(page.getByTestId('tyr-game-result')).toBeVisible();
          await expect(page.getByTestId('tyr-table')).toHaveCount(0);
        } else {
          await assertTable(page, players, entry, index >= 4);
          await checkLog(page, players, index + 1);
        }
        if (index === 6) {
          await page.reload();
          await expect(
            page.getByTestId('tyr-table').or(page.getByTestId('tyr-home'))
          ).toBeVisible();
          if (await page.getByTestId('tyr-home').isVisible()) {
            await page.getByTestId('tyr-home-current-game').click();
          }
          await assertTable(page, players, entry, true);
          await checkLog(page, players, 7, localScenario, true);
        }
      });
    }
    const results = new Map<number, { score: string; delta: string }>();
    await test.step('Verify and capture Tyr final results including deferred chombo', async () => {
      await expect(page.getByTestId(/^tyr-game-result-player-\d+$/)).toHaveCount(4);
      for (const [index, player] of players.entries()) {
        const score = page.getByTestId(`tyr-game-result-player-${player.id}-score`);
        const delta = page.getByTestId(`tyr-game-result-player-${player.id}-rating-change`);
        await expect(page.getByTestId(`tyr-game-result-player-${player.id}`)).toContainText(
          player.title
        );
        await assertNumber(score, rounds.at(-1)!.scores[index]);
        await assertNumber(delta, ratingChanges[index]);
        results.set(player.id, {
          score: (await score.innerText()).replace(/^\+/, ''),
          delta: (await delta.innerText()).replace(/^\+/, ''),
        });
      }
      await page.getByTestId('tyr-game-result-confirm').click();
      await expect(page.getByTestId('tyr-home')).toBeVisible();
      await expect(page.getByTestId('tyr-home-current-game')).toHaveCount(0);
    });
    await test.step('Compare the finished session in Sigrun Last games and after reload', async () => {
      await sigrun.goto(`${process.env.SIGRUN_URL!.replace(/\/$/, '')}/event/${eventId}/info`);
      await sigrun.getByTestId('sigrun-menu-sidebar-recent-games').click();
      await expect(sigrun.getByTestId('sigrun-recent-games-page')).toContainText(
        `${eventTitle} - Last games`
      );
      const games = sigrun.getByTestId(/^sigrun-game-row-/);
      await expect(games).toHaveCount(1);
      const hash = (await games.getAttribute('data-testid'))!.replace('sigrun-game-row-', '');
      async function checkGame() {
        const game = sigrun.getByTestId(`sigrun-game-row-${hash}`);
        await expect(game.getByTestId(/^sigrun-game-player-link-/)).toHaveCount(4);
        for (const player of players) {
          const link = game.getByTestId(`sigrun-game-player-link-${hash}-${player.id}`);
          await expect(link).toHaveText(player.title);
          const data = link.locator('..');
          const badges = data.locator('.mantine-Badge-root');
          await expect(badges).toHaveCount(2);
          await assertNumber(badges.nth(0), Number(results.get(player.id)!.delta));
          await assertNumber(badges.nth(1), Number(results.get(player.id)!.score));
          for (const badge of await badges.all()) {
            const label = badge.locator('.mantine-Badge-label');
            expect(
              await label.evaluate((element) => element.scrollWidth <= element.clientWidth)
            ).toBe(true);
          }
        }
        await assertPublishedGame(sigrun, hash, players);
        await expect(game.locator('ul').first().locator(':scope > li').last()).toContainText('南4');
      }
      await checkGame();
      await sigrun.getByTestId(`sigrun-game-details-link-${hash}`).click();
      await expect(sigrun).toHaveURL(new RegExp(`/event/${eventId}/game/${hash}$`));
      await expect(sigrun.getByTestId('sigrun-game-page')).toContainText(eventTitle);
      await checkGame();
      await sigrun.reload();
      await expect(sigrun.getByTestId('sigrun-game-page')).toBeVisible();
      await checkGame();
      await test.step('Find the completed session on the public homepage and follow its links', async () => {
        await sigrun.goto(process.env.SIGRUN_URL!);
        const feed = sigrun.getByTestId('sigrun-public-recent-games');
        await expect(feed).toBeVisible();
        const eventLink = feed.getByTestId(`sigrun-recent-game-event-${hash}`);
        await expect(eventLink).toHaveText(eventTitle);
        await expect(eventLink).toHaveAttribute('href', `/event/${eventId}/info`);
        const summary = feed.getByTestId(`sigrun-game-row-${hash}`);
        await expect(summary.getByTestId(/^sigrun-recent-game-player-/)).toHaveCount(4);
        for (const player of players) {
          const row = summary.getByTestId(`sigrun-recent-game-player-${hash}-${player.id}`);
          await expect(row).toContainText(player.title);
          await assertNumber(
            row.getByTestId('sigrun-recent-game-score'),
            Number(results.get(player.id)!.score)
          );
          const scoreLabel = row
            .getByTestId('sigrun-recent-game-score')
            .locator('.mantine-Badge-label');
          expect(
            await scoreLabel.evaluate((element) => element.scrollWidth <= element.clientWidth)
          ).toBe(true);
        }
        await expect(summary.getByTestId('sigrun-recent-game-date')).toHaveText(
          /^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$/
        );
        await expect(summary.locator('ul')).toHaveCount(0);
        await expect(feed.locator('xpath=following-sibling::h2').first()).toHaveText(
          'Riichi mahjong events list'
        );
        await feed.getByTestId(`sigrun-game-details-link-${hash}`).click();
        await expect(sigrun).toHaveURL(new RegExp(`/event/${eventId}/game/${hash}$`));
        await expect(sigrun.getByTestId('sigrun-game-page')).toContainText(eventTitle);
        await sigrun.goto(process.env.SIGRUN_URL!);
        await sigrun.evaluate(() => {
          document.documentElement.dataset.sigrunSpaNavigation = 'pending';
        });
        await sigrun.getByTestId(`sigrun-recent-game-event-${hash}`).click();
        await expect(sigrun).toHaveURL(new RegExp(`/event/${eventId}/info$`));
        await expect(sigrun.locator('html')).toHaveAttribute(
          'data-sigrun-spa-navigation',
          'pending'
        );
      });
    });
  } catch (error) {
    await Promise.allSettled(
      (
        [
          ['forseti', admin],
          ['sigrun', sigrun],
        ] as const
      ).map(async ([name, tab]) => {
        await testInfo.attach(name, {
          body: await tab.screenshot({ fullPage: true, timeout: 5000 }),
          contentType: 'image/png',
        });
      })
    );
    throw error;
  } finally {
    await adminContext.close();
    await sigrunContext.close();
  }
});
