import {
  test,
  expect as baseExpect,
  type Page,
  type BrowserContext,
  type Response,
} from '@playwright/test';
import { randomUUID, randomInt } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';
import {
  type Account,
  rounds as baselineRounds,
  checkRules,
  assertTable,
  enterRound,
  checkTournamentLog,
  assertNumber,
  assertPreview,
  assertPublishedGame,
  tournamentScenarios,
  type Scenario,
  assertYakuCoverage,
  playerPlace,
} from './utils/game-flow';

withScreenshotsOnTestFail();
const expect = baseExpect.configure({ timeout: 30_000 });
type Table = { hash: string; number: number; players: Account[]; page: Page; scenario: Scenario };
const initialState = { ...baselineRounds[0], scores: [30000, 30000, 30000, 30000], round: 1 };

async function confirm(page: Page, id: string, method: string, prepare?: () => Promise<void>) {
  await page.getByTestId(`${id}-open`).click();
  if (prepare) await prepare();
  const [response] = await Promise.all([
    page.waitForResponse(
      (r) => r.url().endsWith(`/common.Mimir/${method}`) && r.request().method() === 'POST'
    ),
    page.getByTestId(`${id}-confirm`).click(),
  ]);
  expect(response.ok(), `${method} must succeed`).toBe(true);
}

async function stage(page: Page, value: string) {
  await expect(
    page.getByTestId('forseti-tournament-stage').locator(`input[value="${value}"]`)
  ).toBeChecked();
}

async function refreshGame(table: Table) {
  await table.page.reload();
  await expect(
    table.page.getByTestId('tyr-table').or(table.page.getByTestId('tyr-home'))
  ).toBeVisible();
  if (await table.page.getByTestId('tyr-home').isVisible()) {
    await table.page.getByTestId('tyr-home-current-game').click();
  }
  await expect(table.page.getByTestId('tyr-table')).toBeVisible();
  await expect(table.page.getByTestId('tyr-table-status')).toContainText(`Table #${table.number}`);
}

async function assertAdminScores(admin: Page, table: Table, scores: number[]) {
  const row = admin.getByTestId(`forseti-game-row-${table.hash}`);
  for (const [index, player] of table.players.entries()) {
    const group = row.getByText(player.title, { exact: true }).locator('..');
    await assertNumber(group.locator('.mantine-Badge-root'), scores[index]);
  }
}

async function record(table: Table, index: number) {
  const { scenario } = table;
  const { rounds } = scenario;
  await test.step(`Table ${table.number}, R${index + 1}: ${rounds[index].hands?.[0].name ?? rounds[index].outcome}`, async () => {
    if (index === rounds.length - 1) {
      await test.step('Compare the complete Tyr log before the final hand', () =>
        checkTournamentLog(table.page, table.players, scenario));
    }
    await enterRound(table.page, table.players, rounds[index]);
    await assertPreview(table.page, table.players, index, scenario);
    await table.page.getByTestId('tyr-round-preview-submit').click();
    if (index < rounds.length - 1) {
      await assertTable(table.page, table.players, rounds[index], index >= 4);
    } else {
      await expect(table.page.getByTestId('tyr-round-preview')).toHaveCount(0);
    }
  });
}

// Case: ../testcases/smoke-006-basic-tournament-seatings.md
test('SMOKE-006: Administrator and players can complete a two-table tournament with random, Swiss, and interval seating', async ({
  page: initialPage,
  context,
  browser,
  request,
}, testInfo) => {
  test.setTimeout(60 * 60_000);
  // Shuffle complete fixture subsets without replacement, preserving independent
  // score checkpoints and guaranteeing all yaku across the six games together.
  const handPlan = [...tournamentScenarios];
  for (let index = handPlan.length - 1; index > 0; index--) {
    const other = randomInt(index + 1);
    [handPlan[index], handPlan[other]] = [handPlan[other], handPlan[index]];
  }
  assertYakuCoverage(handPlan);
  await testInfo.attach('tournament-hand-plan', {
    body: JSON.stringify(
      handPlan.map((scenario, index) => ({
        seating: Math.floor(index / 2) + 1,
        table: (index % 2) + 1,
        fixture: tournamentScenarios.indexOf(scenario) + 1,
        hands: scenario.rounds.flatMap((round) => round.hands?.map((hand) => hand.name) ?? []),
      })),
      null,
      2
    ),
    contentType: 'application/json',
  });
  context.setDefaultTimeout(30_000);
  const [administrator, ...players] = await test.step('Create independent account fixtures', () =>
    createTestAccounts(request, 9));
  const title = `TEST SMOKE-006 ${randomUUID()}`;
  let admin = initialPage;
  const extraContexts: BrowserContext[] = [];
  const recorderPages: Page[] = [];
  const spectatorContext = await browser.newContext();
  spectatorContext.setDefaultTimeout(30_000);
  extraContexts.push(spectatorContext);
  const sigrun = await spectatorContext.newPage();
  let eventId: string;
  const finished: Table[] = [];
  const ratings = new Map(players.map((player) => [player.id, 0]));
  try {
    await test.step('Create and verify the EMA tournament and register eight players', async () => {
      await admin.goto(process.env.FORSETI_URL!);
      await admin.getByTestId('forseti-login-email').fill(administrator.email);
      await admin.getByTestId('forseti-login-password').fill(administrator.password);
      await admin.getByTestId('forseti-login-submit').click();
      await expect(admin.getByTestId(/^forseti-owned-event-row-\d+$/)).toHaveCount(0);
      await admin.getByTestId('forseti-menu-sidebar-create-event').click();
      await admin.getByTestId('forseti-event-settings-basic-settings-event-title').fill(title);
      await admin.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_TOURNAMENT').check();
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
      await checkRules(admin, true);
      async function tournamentSettings(configure: boolean) {
        await admin.getByTestId('forseti-event-settings-tab-tournament').click();
        const duration = admin.getByTestId(
          'forseti-event-settings-tournament-settings-event-duration'
        );
        if (configure) await duration.fill('60');
        await expect(duration).toHaveValue('60');
        const policy = admin.getByTestId('forseti-event-settings-ending-policy-natural');
        if (configure) await policy.check();
        await expect(policy).toBeChecked();
        for (const suffix of [
          'ruleset-chombo-counts-as-hand',
          'event-is-team',
          'event-is-prescripted',
        ]) {
          const input = admin.getByTestId(`forseti-event-settings-tournament-settings-${suffix}`);
          if (configure) await input.uncheck();
          await expect(input).not.toBeChecked();
        }
        const shuffle = admin.getByTestId('forseti-event-settings-wind-shuffle-random');
        if (configure) await shuffle.check();
        await expect(shuffle).toBeChecked();
        await admin.getByTestId('forseti-event-settings-tab-basic').click();
      }
      await tournamentSettings(true);
      await admin.getByTestId('forseti-event-settings-save').click();
      await expect(admin.getByTestId(/^forseti-owned-event-row-\d+$/)).toHaveCount(1);
      const [settings] = await Promise.all([
        context.waitForEvent('page'),
        admin.getByRole('link', { name: title, exact: true }).click({ button: 'middle' }),
      ]);
      admin = settings;
      await expect(
        admin.getByTestId('forseti-event-settings-basic-settings-event-title')
      ).toHaveValue(title);
      eventId = new URL(admin.url()).pathname.match(/\/edit\/(\d+)/)![1];
      await expect(admin.getByText('Type: Tournament', { exact: true })).toBeVisible();
      await expect(
        admin.getByTestId('forseti-event-settings-basic-settings-event-timezone')
      ).toHaveValue('Europe/Moscow');
      await expect(
        admin.getByTestId('forseti-event-settings-basic-settings-event-is-rating-shown')
      ).toBeChecked();
      await checkRules(admin, false);
      await tournamentSettings(false);
      await admin.getByTestId('forseti-menu-sidebar-event-players').click();
      const rows = admin.getByTestId(/^forseti-players-row-\d+$/);
      await expect(rows).toHaveCount(0);
      for (const [index, player] of players.entries()) {
        await admin.getByTestId('forseti-players-add-selector').fill(player.title);
        await admin
          .getByRole('option')
          .filter({ hasText: `${player.title} [#${player.id},` })
          .click();
        await expect(rows).toHaveCount(index + 1);
      }
      await admin.reload();
      await expect(rows).toHaveCount(8);
      for (const player of players) {
        await expect(admin.getByTestId(`forseti-players-row-${player.id}`)).toContainText(
          player.title
        );
        await expect(
          admin.getByTestId(`forseti-players-toggle-seating-${player.id}`)
        ).toHaveAttribute('title', 'Player is included in next seating. Click to exclude');
      }
      await expect(admin.getByTestId(`forseti-players-row-${administrator.id}`)).toHaveCount(0);
      await admin.getByTestId('forseti-menu-sidebar-event-games').click();
      await stage(admin, 'ready_not_started');
      await expect(admin.getByTestId(/^forseti-game-row-/)).toHaveCount(0);
      await expect(admin.getByTestId('forseti-tournament-random-seating-open')).toBeEnabled();
      await expect(admin.getByTestId('forseti-tournament-swiss-seating-open')).toBeDisabled();
      await expect(admin.getByTestId('forseti-tournament-interval-seating-open')).toBeDisabled();
    });

    const checkPublication = async (approvedSeatings: number) => {
      let gamesLoaded: Response | undefined;
      const captureGames = (response: Response) => {
        if (
          response.url().endsWith('/common.Mimir/GetLastGames') &&
          response.request().method() === 'POST'
        ) {
          gamesLoaded = response;
        }
      };
      sigrun.on('response', captureGames);
      try {
        const navigation = await sigrun.goto(
          `${process.env.SIGRUN_URL!.replace(/\/$/, '')}/event/${eventId}/games`
        );
        expect(navigation?.ok()).toBe(true);
        // SSR has already fetched this data; hydration deliberately skips the browser RPC.
        const serverRendered = await sigrun.evaluate(
          (key) =>
            Boolean(
              (window as Window & { initialData?: Record<string, unknown> }).initialData?.[key]
            ),
          `RecentGames_games_${eventId}_1`
        );
        if (!serverRendered) {
          await expect.poll(() => gamesLoaded).toBeDefined();
          expect(gamesLoaded!.ok()).toBe(true);
          await gamesLoaded!.finished();
        }
      } finally {
        sigrun.off('response', captureGames);
      }
      await expect(sigrun.getByTestId('sigrun-recent-games-page')).toContainText(
        `${title} - Last games`
      );
      await expect(
        sigrun.getByTestId('sigrun-recent-games-page').locator('.mantine-LoadingOverlay-root')
      ).toBeHidden();
      const rows = sigrun.getByTestId(/^sigrun-game-row-/);
      await expect(rows).toHaveCount(approvedSeatings * 2);
      const hashes = await rows.evaluateAll((elements) =>
        elements.map((element) =>
          element.getAttribute('data-testid')!.replace('sigrun-game-row-', '')
        )
      );
      expect(hashes.sort()).toEqual(finished.map((table) => table.hash).sort());
      for (const table of finished)
        await assertPublishedGame(sigrun, table.hash, table.players, table.scenario);
      const [ratingsLoaded] = await Promise.all([
        sigrun.waitForResponse(
          (r) => r.url().endsWith('/common.Mimir/GetRatingTable') && r.request().method() === 'POST'
        ),
        sigrun.getByTestId('sigrun-menu-sidebar-rating-table').click(),
      ]);
      expect(ratingsLoaded.ok()).toBe(true);
      await ratingsLoaded.finished();
      await expect(sigrun.getByTestId('sigrun-rating-page')).toBeVisible();
      await expect(
        sigrun.getByTestId('sigrun-rating-page').locator('.mantine-LoadingOverlay-root')
      ).toBeHidden();
      const playerRows = sigrun.getByTestId(/^sigrun-rating-player-row-\d+$/);
      if (approvedSeatings === 0) {
        // Some views omit players with no approved results; no row may count an unapproved game.
        for (const row of await playerRows.all())
          await expect(row.getByTitle('Games played', { exact: true })).toHaveText('0');
      } else {
        await expect(playerRows).toHaveCount(8);
        for (const player of players) {
          const row = sigrun.getByTestId(`sigrun-rating-player-row-${player.id}`);
          await expect(row.getByTestId(`sigrun-rating-player-link-${player.id}`)).toHaveText(
            player.title
          );
          await expect(row.getByTitle('Games played', { exact: true })).toHaveText(
            String(approvedSeatings)
          );
          await assertNumber(
            row
              .getByTitle('Games played', { exact: true })
              .locator('..')
              .locator('.mantine-Badge-root')
              .first(),
            ratings.get(player.id)!
          );
        }
        await expect(
          sigrun.getByTestId(`sigrun-rating-player-row-${administrator.id}`)
        ).toHaveCount(0);
      }
    };

    for (const [seatingIndex, mode] of ['random', 'swiss', 'interval'].entries()) {
      const tables: Table[] = [];
      await test.step(`Seating ${seatingIndex + 1}: generate ${mode} assignments and log in one player per table`, async () => {
        await stage(admin, 'ready_not_started');
        await confirm(
          admin,
          `forseti-tournament-${mode}-seating`,
          {
            random: 'MakeShuffledSeating',
            swiss: 'MakeSwissSeating',
            interval: 'MakeIntervalSeating',
          }[mode]!,
          mode === 'interval'
            ? async () => {
                const interval = admin.getByTestId('forseti-tournament-seating-interval');
                await interval.click();
                await admin.getByRole('option', { name: '1-3-5-7', exact: true }).click();
                await expect(interval).toHaveValue('1-3-5-7');
              }
            : undefined
        );
        await stage(admin, 'seating_ready');
        const rows = admin.getByTestId(/^forseti-game-row-/);
        await expect(rows).toHaveCount(2);
        for (const row of await rows.all()) {
          const hash = (await row.getAttribute('data-testid'))!.replace('forseti-game-row-', '');
          expect(finished.map((table) => table.hash)).not.toContain(hash);
          const names = (await row.locator('.mantine-Text-root').allTextContents()).filter((name) =>
            players.some((player) => player.title === name)
          );
          expect(names).toHaveLength(4);
          const seated = names.map((name) => players.find((player) => player.title === name)!);
          const number = Number(
            (await row.getByTestId(`forseti-game-copy-session-${hash}`).innerText()).replace(
              '#',
              ''
            )
          );
          await expect(row.getByTitle('Session is ready to start', { exact: true })).toBeVisible();
          const recorderContext = await browser.newContext();
          recorderContext.setDefaultTimeout(30_000);
          extraContexts.push(recorderContext);
          const recorder = await recorderContext.newPage();
          recorderPages.push(recorder);
          const table = {
            hash,
            number,
            players: seated,
            page: recorder,
            scenario: handPlan[seatingIndex * 2 + number - 1],
          };
          tables.push(table);
          await recorder.goto(process.env.TYR_URL!);
          await recorder.getByTestId('tyr-login-email').fill(seated[0].email);
          await recorder.getByTestId('tyr-login-password').fill(seated[0].password);
          await recorder.getByTestId('tyr-login-submit').click();
          await recorder.getByTestId(`tyr-event-select-event-${eventId}`).click();
          await expect(
            recorder.getByTestId('tyr-table').or(recorder.getByTestId('tyr-home'))
          ).toBeVisible();
          if (await recorder.getByTestId('tyr-home').isVisible()) {
            await expect(recorder.getByTestId('tyr-home-event-name')).toHaveText(title);
            await recorder.getByTestId('tyr-home-current-game').click();
          }
          await expect(recorder.getByTestId('tyr-home-new-game')).toHaveCount(0);
          await expect(recorder.getByTestId('tyr-table-status')).toContainText(`Table #${number}`);
          for (const player of seated)
            await assertNumber(
              playerPlace(recorder, 'tyr-table-player', player).getByTestId(/-points$/),
              30000
            );
          await expect(recorder.getByTestId('tyr-table-add-round')).toHaveCount(0);
        }
        tables.sort((a, b) => a.number - b.number);
        expect(tables.map((table) => table.number)).toEqual([1, 2]);
        expect(new Set(tables.map((table) => table.hash)).size).toBe(2);
        expect(
          tables.flatMap((table) => table.players.map((player) => player.id)).sort((a, b) => a - b)
        ).toEqual(players.map((player) => player.id).sort((a, b) => a - b));
        if (mode === 'interval') {
          const orderedRatings = players
            .map((player) => ratings.get(player.id)!)
            .sort((a, b) => b - a);
          const expectedGroups = [
            orderedRatings.filter((_, i) => i % 2 === 0),
            orderedRatings.filter((_, i) => i % 2 === 1),
          ];
          const actualGroups = tables.map((table) =>
            table.players.map((player) => ratings.get(player.id)!).sort((a, b) => b - a)
          );
          expect(actualGroups.map((group) => JSON.stringify(group)).sort()).toEqual(
            expectedGroups.map((group) => JSON.stringify(group)).sort()
          );
        }
      });
      await test.step(`Seating ${seatingIndex + 1}: one timer action starts both tables`, async () => {
        await confirm(admin, 'forseti-tournament-start-timer', 'StartTimer');
        await stage(admin, 'started');
        const seconds: number[] = [];
        for (const table of tables) {
          await expect(
            admin
              .getByTestId(`forseti-game-row-${table.hash}`)
              .getByTitle('Session in progress', { exact: true })
          ).toBeVisible();
          await refreshGame(table);
          await assertTable(table.page, table.players, initialState, false);
          await expect(table.page.getByTestId('tyr-table-add-round')).toBeVisible();
          const timer = table.page.getByTestId('tyr-table-timer');
          await expect(timer).toHaveText(/^\d+:\d{2}$/);
          const [minutes, secs] = (await timer.innerText()).split(':').map(Number);
          seconds.push(minutes * 60 + secs);
        }
        for (const value of seconds) {
          expect(value).toBeGreaterThan(0);
          expect(value).toBeLessThanOrEqual(3600);
        }
        expect(Math.abs(seconds[0] - seconds[1])).toBeLessThanOrEqual(30);
      });
      for (let roundIndex = 0; roundIndex < 3; roundIndex++) {
        for (const table of tables) await record(table, roundIndex);
        if (seatingIndex === 0 && roundIndex === 2) {
          await test.step('Cancel table 1 R3 in Forseti and verify rollback without changing table 2', async () => {
            await admin.reload();
            for (const table of tables)
              await assertAdminScores(admin, table, baselineRounds[2].scores);
            await confirm(
              admin,
              `forseti-game-cancel-last-round-${tables[0].hash}`,
              'DropLastRound'
            );
            await admin.reload();
            for (const [index, table] of tables.entries()) {
              await refreshGame(table);
              const checkpoint = index === 0 ? 1 : 2;
              await assertTable(table.page, table.players, baselineRounds[checkpoint], false);
              await assertAdminScores(admin, table, baselineRounds[checkpoint].scores);
            }
            await record(tables[0], 2);
          });
        }
      }
      for (const table of tables) {
        for (let index = 3; index < table.scenario.rounds.length - 1; index++)
          await record(table, index);
      }
      await test.step(`Seating ${seatingIndex + 1}: both games must complete before approval`, async () => {
        await record(tables[0], tables[0].scenario.rounds.length - 1);
        await admin.reload();
        await expect(
          admin
            .getByTestId(`forseti-game-row-${tables[0].hash}`)
            .getByTitle('Session finished, but not confirmed', { exact: true })
        ).toBeVisible();
        await expect(
          admin
            .getByTestId(`forseti-game-row-${tables[1].hash}`)
            .getByTitle('Session in progress', { exact: true })
        ).toBeVisible();
        await expect(admin.getByTestId('forseti-tournament-approve-sessions-open')).toHaveCount(0);
        await checkPublication(seatingIndex);
        await record(tables[1], tables[1].scenario.rounds.length - 1);
        await admin.reload();
        await stage(admin, 'prefinished');
        for (const table of tables) {
          await expect(
            admin
              .getByTestId(`forseti-game-row-${table.hash}`)
              .getByTitle('Session finished, but not confirmed', { exact: true })
          ).toBeVisible();
          await assertAdminScores(admin, table, table.scenario.rounds.at(-1)!.scores);
          await expect(table.page.getByTestId('tyr-table-add-round')).toHaveCount(0);
        }
        await checkPublication(seatingIndex);
      });
      await test.step(`Seating ${seatingIndex + 1}: approve both sessions and verify publication and ratings`, async () => {
        await confirm(admin, 'forseti-tournament-approve-sessions', 'FinalizeSession');
        await admin.reload();
        await stage(admin, 'ready_not_started');
        for (const table of tables) {
          await expect(
            admin
              .getByTestId(`forseti-game-row-${table.hash}`)
              .getByTitle('Session finished', { exact: true })
          ).toBeVisible();
          for (const [index, player] of table.players.entries())
            ratings.set(player.id, ratings.get(player.id)! + table.scenario.ratingChanges[index]);
          finished.push(table);
        }
        await checkPublication(seatingIndex + 1);
      });
    }
    await test.step('All six game details and eight three-game ratings persist after reload', async () => {
      expect(finished).toHaveLength(6);
      expect(new Set(finished.map((table) => table.hash)).size).toBe(6);
      for (const table of finished) {
        await sigrun.goto(`${process.env.SIGRUN_URL!.replace(/\/$/, '')}/event/${eventId}/games`);
        await sigrun.getByTestId(`sigrun-game-details-link-${table.hash}`).click();
        await expect(sigrun).toHaveURL(new RegExp(`/event/${eventId}/game/${table.hash}$`));
        await expect(sigrun.getByTestId('sigrun-game-page')).toContainText(title);
        await sigrun.reload();
        await assertPublishedGame(sigrun, table.hash, table.players, table.scenario);
      }
      await checkPublication(3);
      await sigrun.reload();
      for (const player of players) {
        const row = sigrun.getByTestId(`sigrun-rating-player-row-${player.id}`);
        await expect(row.getByTitle('Games played', { exact: true })).toHaveText('3');
        await assertNumber(
          row
            .getByTitle('Games played', { exact: true })
            .locator('..')
            .locator('.mantine-Badge-root')
            .first(),
          ratings.get(player.id)!
        );
      }
      expect([...ratings.values()].reduce((sum, value) => sum + value, 0)).toBe(-120000);
      const counts = await sigrun
        .getByTestId(/^sigrun-rating-player-row-\d+$/)
        .getByTitle('Games played', { exact: true })
        .allTextContents();
      expect(counts.reduce((sum, value) => sum + Number(value), 0)).toBe(24);
    });
  } catch (error) {
    await Promise.allSettled(
      [admin, sigrun, ...recorderPages].map(async (tab, index) => {
        await testInfo.attach(`tournament-screen-${index}`, {
          body: await tab.screenshot({ fullPage: true, timeout: 5000 }),
          contentType: 'image/png',
        });
      })
    );
    throw error;
  } finally {
    await Promise.all(extraContexts.map((extra) => extra.close()));
  }
});
