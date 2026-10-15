import { expect, type Page, type Locator } from '@playwright/test';
import { createTestAccounts } from './accounts';

export type Account = Awaited<ReturnType<typeof createTestAccounts>>[number];
export type Round = {
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

export const rounds: Round[] = [
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

export async function checkRules(page: Page, configure: boolean) {
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

export function playerPlace(page: Page, prefix: string, player: Account) {
  return page
    .getByTestId(new RegExp(`^${prefix}-(self|shimocha|toimen|kamicha)$`))
    .filter({ hasText: player.title });
}

async function playerButton(page: Page, player: Account, action: string) {
  const place = playerPlace(page, 'tyr-select-player', player);
  await expect(place).toHaveCount(1);
  await place.getByTestId(new RegExp(`-${action}$`)).click();
}

export async function assertNumber(locator: Locator, value: number) {
  await expect(locator).toHaveText(value > 0 ? new RegExp(`^\\+?${value}$`) : String(value));
}

export async function assertTable(page: Page, players: Account[], state: Round, chombo: boolean) {
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

export async function enterRound(page: Page, players: Account[], entry: Round) {
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

export async function checkLog(page: Page, players: Account[], count: number) {
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

export const ratingChanges = [7200, -5000, -45400, 23200];

export async function assertPreview(page: Page, players: Account[], index: number) {
  const previous = index === 0 ? [30000, 30000, 30000, 30000] : rounds[index - 1].scores;
  for (const [playerIndex, player] of players.entries()) {
    const place = playerPlace(page, 'tyr-preview-player', player);
    await expect(place).toHaveCount(1);
    await assertNumber(place.getByTestId(/-points$/), previous[playerIndex]);
  }
  const labels = [
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
      (await page.getByTestId('tyr-round-preview').locator('svg textPath').allTextContents()).sort()
    )
    .toEqual([...labels].sort());
}

export async function assertPublishedGame(page: Page, hash: string, players: Account[]) {
  const game = page.getByTestId(`sigrun-game-row-${hash}`);
  await expect(game.getByTestId(/^sigrun-game-player-link-/)).toHaveCount(4);
  for (const [index, player] of players.entries()) {
    const link = game.getByTestId(`sigrun-game-player-link-${hash}-${player.id}`);
    await expect(link).toHaveText(player.title);
    const badges = link.locator('..').locator('.mantine-Badge-root');
    await expect(badges).toHaveCount(2);
    await assertNumber(badges.nth(0), ratingChanges[index]);
    await assertNumber(badges.nth(1), rounds[12].scores[index]);
  }
  for (const text of ['Ron: 8', 'Tsumo: 1', 'Draw: 2', 'Chombo: 1', 'Nagashi: 1']) {
    await expect(game).toContainText(text);
  }
  const log = game.locator('ul').first().locator(':scope > li');
  await expect(log).toHaveCount(13);
  for (const [index, entry] of rounds.entries()) {
    const row = log.nth(index);
    const start = index === 0 ? 1 : rounds[index - 1].round;
    await expect(row).toContainText(`${start <= 4 ? '東' : '南'}${((start - 1) % 4) + 1}`);
    for (const winner of entry.winners ?? []) {
      await expect(row).toContainText(players[winner].title);
      await expect(row).toContainText('Tanyao');
      await expect(row).toContainText('1 han, 30 fu');
    }
    if (entry.loser !== undefined) await expect(row).toContainText(players[entry.loser].title);
    for (const person of entry.outcome === 'draw' ? (entry.tenpai ?? []) : (entry.riichi ?? [])) {
      await expect(row).toContainText(players[person].title);
    }
    if (entry.nagashi !== undefined) await expect(row).toContainText(players[entry.nagashi].title);
  }
}
