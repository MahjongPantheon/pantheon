import { test, expect, type Page, type Locator } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

type Account = Awaited<ReturnType<typeof createTestAccounts>>[number];
type Round = {
  outcome: 'ron' | 'tsumo' | 'draw' | 'abort' | 'chombo' | 'nagashi';
  winners?: number[];
  loser?: number;
  tenpai?: number[];
  riichi?: number[];
  nagashi?: number;
  scores: number[];
  round: number;
  honba: number;
  pot: number;
};

const rounds: Round[] = [
  {
    outcome: 'ron',
    winners: [1],
    loser: 2,
    scores: [30000, 31000, 29000, 30000],
    round: 2,
    honba: 0,
    pot: 0,
  },
  {
    outcome: 'tsumo',
    winners: [1],
    scores: [29500, 32500, 28500, 29500],
    round: 2,
    honba: 1,
    pot: 0,
  },
  {
    outcome: 'draw',
    tenpai: [0, 1],
    riichi: [1],
    scores: [31000, 33000, 27000, 28000],
    round: 2,
    honba: 2,
    pot: 1,
  },
  {
    outcome: 'abort',
    riichi: [3],
    scores: [31000, 33000, 27000, 27000],
    round: 2,
    honba: 3,
    pot: 2,
  },
  { outcome: 'chombo', loser: 2, scores: [31000, 33000, 27000, 27000], round: 2, honba: 3, pot: 2 },
  {
    outcome: 'nagashi',
    tenpai: [1, 3],
    nagashi: 3,
    scores: [29000, 29000, 25000, 35000],
    round: 2,
    honba: 4,
    pot: 2,
  },
  {
    outcome: 'ron',
    winners: [0, 3],
    loser: 2,
    scores: [31200, 29000, 20600, 39200],
    round: 3,
    honba: 0,
    pot: 0,
  },
  {
    outcome: 'ron',
    winners: [0],
    loser: 2,
    scores: [32200, 29000, 19600, 39200],
    round: 4,
    honba: 0,
    pot: 0,
  },
  {
    outcome: 'ron',
    winners: [1],
    loser: 3,
    scores: [32200, 30000, 19600, 38200],
    round: 5,
    honba: 0,
    pot: 0,
  },
  {
    outcome: 'ron',
    winners: [2],
    loser: 0,
    scores: [31200, 30000, 20600, 38200],
    round: 6,
    honba: 0,
    pot: 0,
  },
  {
    outcome: 'ron',
    winners: [3],
    loser: 1,
    scores: [31200, 29000, 20600, 39200],
    round: 7,
    honba: 0,
    pot: 0,
  },
  {
    outcome: 'ron',
    winners: [0],
    loser: 2,
    scores: [32200, 29000, 19600, 39200],
    round: 8,
    honba: 0,
    pot: 0,
  },
  {
    outcome: 'ron',
    winners: [1],
    loser: 3,
    scores: [32200, 30000, 19600, 38200],
    round: 9,
    honba: 0,
    pot: 0,
  },
];

const checkboxRules: Record<string, boolean> = {
  tonpuusen: false,
  'with-leading-dealer-game-over': false,
  'with-winning-dealer-honba-skipped': false,
  'with-buttobi': false,
  'play-additional-rounds': false,
  'with-atamahane': false,
  'with-abortives': true,
  'with-nagashi-mangan': true,
  'riichi-goes-to-winner': false,
  'doubleron-honba-atamahane': false,
  'doubleron-riichi-atamahane': false,
  'equalize-uma': true,
  'extra-chombo-payments': false,
  'with-yakitori': false,
};
const numericRules: Record<string, number> = {
  'start-points': 30000,
  oka: 0,
  'honba-value': 300,
  'chombo-amount': 20000,
};

async function checkRules(page: Page, configure: boolean) {
  await page.getByTestId('forseti-event-settings-tab-ruleset').click();
  for (const [name, checked] of Object.entries(checkboxRules)) {
    const input = page.getByTestId(`forseti-event-settings-ruleset-settings-ruleset-${name}`);
    if (configure) await input.setChecked(checked);
    if (checked) await expect(input).toBeChecked();
    else await expect(input).not.toBeChecked();
  }
  for (const [name, value] of Object.entries(numericRules)) {
    const input = page.getByTestId(`forseti-event-settings-ruleset-settings-ruleset-${name}`);
    if (configure) await input.fill(String(value));
    await expect(input).toHaveValue(String(value));
  }
  const simpleUma = page.getByTestId('forseti-event-settings-uma-simple');
  if (configure) await simpleUma.check();
  await expect(simpleUma).toBeChecked();
  for (const [index, value] of [15000, 5000, -5000, -15000].entries()) {
    const input = page.getByTestId(
      `forseti-event-settings-uma-select-ruleset-uma-place${index + 1}`
    );
    if (configure) await input.fill(String(value));
    await expect(input).toHaveValue(String(value));
  }
  await page.getByTestId('forseti-event-settings-tab-yaku').click();
  const kuitan = page.getByTestId('forseti-event-settings-yaku-settings-ruleset-with-kuitan');
  if (configure) await kuitan.check();
  await expect(kuitan).toBeChecked();
  await page.getByTestId('forseti-event-settings-tab-basic').click();
}

function playerPlace(page: Page, prefix: string, player: Account) {
  return page
    .getByTestId(new RegExp(`^${prefix}-(self|shimocha|toimen|kamicha)$`))
    .filter({ hasText: player.title });
}

async function playerButton(page: Page, player: Account, action: string) {
  const place = playerPlace(page, 'tyr-select-player', player);
  await expect(place).toHaveCount(1);
  await place.getByTestId(new RegExp(`-${action}$`)).click();
}

async function assertNumber(locator: Locator, value: number) {
  await expect(locator).toHaveText(value > 0 ? new RegExp(`^\\+?${value}$`) : String(value));
}

async function assertTable(page: Page, players: Account[], state: Round, chombo: boolean) {
  await expect(page.getByTestId('tyr-table')).toBeVisible();
  for (const [index, player] of players.entries()) {
    const place = playerPlace(page, 'tyr-table-player', player);
    await expect(place).toHaveCount(1);
    await assertNumber(place.getByTestId(/-points$/), state.scores[index]);
    // The current wind is visible alongside the player's name; East identifies the dealer.
    const wind = ['東', '南', '西', '北'][(index - ((state.round - 1) % 4) + 4) % 4];
    await expect(place).toContainText(wind);
    if (index === 2) {
      if (chombo) await expect(place).toContainText('-20k');
      else await expect(place).not.toContainText('-20k');
    }
  }
  await expect(page.getByTestId('tyr-table-round')).toHaveText(
    `${state.round <= 4 ? '東' : '南'}${((state.round - 1) % 4) + 1}`
  );
  await expect(page.getByTestId('tyr-table-honba-count')).toHaveText(String(state.honba));
  await expect(page.getByTestId('tyr-table-riichi-count')).toHaveText(String(state.pot));
}

async function enterRound(page: Page, players: Account[], entry: Round) {
  await page.getByTestId('tyr-table-add-round').click();
  await page.getByTestId(`tyr-table-outcome-${entry.outcome}`).click();
  await expect(page.getByTestId('tyr-select-player-status')).toBeVisible();
  if (entry.nagashi !== undefined) {
    await expect(page.getByTestId('tyr-select-player-status')).toContainText('Select nagashi');
    await playerButton(page, players[entry.nagashi], 'win');
    await page.getByTestId('tyr-select-player-next').click();
  }
  for (const index of entry.winners ?? entry.tenpai ?? []) {
    await playerButton(page, players[index], 'win');
  }
  if (entry.loser !== undefined) await playerButton(page, players[entry.loser], 'lose');
  for (const index of entry.riichi ?? []) await playerButton(page, players[index], 'riichi');
  await page.getByTestId('tyr-select-player-next').click();
  // Tyr renders ron hands by numeric person ID, independent of selection order.
  const handOrder = [...(entry.winners ?? [])].sort((a, b) => players[a].id - players[b].id);
  for (const [winnerIndex, index] of handOrder.entries()) {
    const player = players[index];
    await expect(page.getByTestId('tyr-hand')).toBeVisible();
    if (winnerIndex > 0) {
      // Use the hand carousel's swipe interaction, which also moves the title carousel.
      const hand = page.getByTestId(`tyr-hand-player-${players[handOrder[winnerIndex - 1]].id}`);
      const box = (await hand.boundingBox())!;
      await page.mouse.move(box.x + box.width * 0.8, box.y + box.height - 20);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width * 0.2, box.y + box.height - 20, { steps: 15 });
      await page.mouse.up();
    }
    await expect(page.getByTestId(`tyr-hand-player-${player.id}-yaku--1`)).toBeInViewport();
    await page.getByTestId(`tyr-hand-player-${player.id}-yaku--1`).click();
    await page.getByTestId(`tyr-hand-player-${player.id}-yaku-23`).click();
    await page.getByTestId(`tyr-hand-player-${player.id}-fu-select`).click();
    await page.getByTestId(`tyr-hand-player-${player.id}-fu-option-30`).click();
    await expect(page.getByTestId(`tyr-hand-player-${player.id}-dora-select`)).toHaveText('Dora 0');
    await expect(page.getByTestId(`tyr-hand-player-${player.id}`)).toContainText('1 han 30 fu');
  }
  if (entry.winners?.length) await page.getByTestId('tyr-hand-next').click();
  await expect(page.getByTestId('tyr-round-preview')).toBeVisible();
}

async function checkLog(page: Page, players: Account[], count: number) {
  await page.getByTestId('tyr-table-game-log').click();
  await expect(page.getByTestId(/^tyr-game-log-round-\d+$/)).toHaveCount(count);
  for (const [index, entry] of rounds.slice(0, count).entries()) {
    const row = page.getByTestId(`tyr-game-log-round-${index}`);
    await row.click();
    const label = {
      ron: 'Ron',
      tsumo: 'Tsumo',
      draw: 'Exhaustive draw',
      abort: 'Abortive draw',
      chombo: 'Chombo',
      nagashi: 'Nagashi',
    }[entry.outcome];
    await expect(row).toContainText(entry.winners?.length === 2 ? 'Multiron' : label);
    for (const personIndex of entry.winners ?? entry.tenpai ?? []) {
      await expect(row).toContainText(players[personIndex].title);
    }
    if (entry.loser !== undefined) await expect(row).toContainText(players[entry.loser].title);
    for (const personIndex of entry.riichi ?? []) {
      await expect(row).toContainText(players[personIndex].title);
      await expect(row).toContainText('Riichi');
    }
    if (entry.nagashi !== undefined) await expect(row).toContainText(players[entry.nagashi].title);
    if (entry.winners?.length) {
      await expect(row).toContainText('1 han 30 fu');
      await expect(row).toContainText('Tanyao');
    }
  }
  await page.getByTestId('tyr-game-log-back').click();
}

// Case: ../testcases/smoke-005-local-session-round-outcomes.md
test('SMOKE-005: Registered player can finish a local session and view matching results in Tyr and Sigrun', async ({
  page,
  browser,
  request,
}, testInfo) => {
  test.setTimeout(240_000);
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
    for (const [index, entry] of rounds.entries()) {
      await test.step(`R${index + 1}: ${entry.outcome}${index === 12 ? ' finishes South 4' : ''}`, async () => {
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
        const previousScores =
          index === 0 ? [30000, 30000, 30000, 30000] : rounds[index - 1].scores;
        for (const [playerIndex, player] of players.entries()) {
          const place = playerPlace(page, 'tyr-preview-player', player);
          await expect(place).toHaveCount(1);
          await assertNumber(place.getByTestId(/-points$/), previousScores[playerIndex]);
        }
        const paymentLabels = [
          ['1000'],
          ['500', '500', '500'],
          ['1500', '1500'],
          [],
          [],
          ['2000', '2000', '4000'],
          ['1000 + 1200', '1000 + 1200'],
          ['1000'],
          ['1000'],
          ['1000'],
          ['1000'],
          ['1000'],
          ['1000'],
        ][index];
        await expect
          .poll(async () =>
            (
              await page.getByTestId('tyr-round-preview').locator('svg textPath').allTextContents()
            ).sort()
          )
          .toEqual([...paymentLabels].sort());
        await page.getByTestId('tyr-round-preview-submit').click();
        if (index === 12) {
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
          await checkLog(page, players, 7);
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
        await assertNumber(score, rounds[12].scores[index]);
        await assertNumber(delta, [7200, -5000, -45400, 23200][index]);
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
        }
        for (const text of ['Ron: 8', 'Tsumo: 1', 'Draw: 2', 'Chombo: 1', 'Nagashi: 1'])
          await expect(game).toContainText(text);
        const log = game.locator('ul').first().locator(':scope > li');
        await expect(log).toHaveCount(13);
        for (const [index, entry] of rounds.entries()) {
          const row = log.nth(index);
          const startRound = index === 0 ? 1 : rounds[index - 1].round;
          await expect(row).toContainText(
            `${startRound <= 4 ? '東' : '南'}${((startRound - 1) % 4) + 1}`
          );
          for (const personIndex of entry.outcome === 'draw'
            ? (entry.tenpai ?? [])
            : (entry.riichi ?? [])) {
            await expect(row).toContainText(players[personIndex].title);
          }
          if (entry.nagashi !== undefined)
            await expect(row).toContainText(players[entry.nagashi].title);
          for (const winner of entry.winners ?? [])
            await expect(row).toContainText(players[winner].title);
          if (entry.loser !== undefined)
            await expect(row).toContainText(players[entry.loser].title);
        }
        await expect(log.nth(12)).toContainText('南4');
      }
      await checkGame();
      await sigrun.getByTestId(`sigrun-game-details-link-${hash}`).click();
      await expect(sigrun).toHaveURL(new RegExp(`/event/${eventId}/game/${hash}$`));
      await expect(sigrun.getByTestId('sigrun-game-page')).toContainText(eventTitle);
      await checkGame();
      await sigrun.reload();
      await expect(sigrun.getByTestId('sigrun-game-page')).toBeVisible();
      await checkGame();
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
