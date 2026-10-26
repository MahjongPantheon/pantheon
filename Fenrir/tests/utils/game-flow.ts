import { expect, type Page, type Locator } from '@playwright/test';
import { createTestAccounts } from './accounts';
import { readFileSync } from 'node:fs';
type StoredScenario = {
  rounds: (Round & { hand?: number; paoPlayer?: number })[];
  ratingChanges: number[];
};
const fixtures = JSON.parse(
  readFileSync(new URL('./hand-scenarios.json', import.meta.url), 'utf8')
) as {
  local: StoredScenario;
  tournament: StoredScenario[];
  yakuIds: number[];
  hands: Hand[];
};
function loadScenario(stored: StoredScenario): Scenario {
  return {
    ...stored,
    rounds: stored.rounds.map(({ hand, paoPlayer, ...round }, index) => ({
      ...round,
      ...(hand === undefined
        ? {}
        : {
            hands: [
              {
                ...resolveWindHand(
                  fixtures.hands[hand],
                  index === 0 ? 1 : stored.rounds[index - 1].round
                ),
                paoPlayer,
              },
            ],
          }),
    })),
  };
}

function resolveWindHand(hand: Hand, roundIndex: number): Hand {
  if (!hand.yaku.includes(49)) return hand;
  const roundWind = Math.floor((roundIndex - 1) / 4);
  return {
    ...hand,
    yaku: hand.yaku.map((id) => (id === 49 ? 49 + roundWind * 2 : id)),
    labels: hand.labels.map((label) =>
      label === 'East round wind'
        ? `${['East', 'South', 'West', 'North'][roundWind]} round wind`
        : label
    ),
  };
}

export type Account = Awaited<ReturnType<typeof createTestAccounts>>[number];
export type Hand = {
  name: string;
  yaku: number[];
  han: number;
  fu: number;
  dora: number;
  open: boolean;
  labels: string[];
  paoPlayer?: number;
};
export type Scenario = { rounds: Round[]; ratingChanges: number[] };
export type Round = {
  hands?: Hand[];
  payments?: string[];
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

// Independent score checkpoints, based on Mimir fixtures and PointsCalc examples.
// No production scoring code is used to calculate expectations during an e2e run.
export const localScenario = loadScenario(fixtures.local);
export const tournamentScenarios = fixtures.tournament.map(loadScenario);
export const localRounds = localScenario.rounds;
export { localRounds as rounds };
const localRatingChanges = localScenario.ratingChanges;
export { localRatingChanges as ratingChanges };
const basicHand: Hand = {
  name: 'Open tanyao',
  yaku: [23],
  han: 1,
  fu: 30,
  dora: 0,
  open: true,
  labels: ['Tanyao'],
};

export function assertYakuCoverage(games: Scenario[]) {
  const covered = [
    ...new Set(
      games.flatMap((game) =>
        game.rounds.flatMap((round) =>
          (round.hands ?? (round.winners ?? []).map(() => basicHand)).flatMap((hand) =>
            hand.yaku.map((id) => (id === 51 ? 49 : id))
          )
        )
      )
    ),
  ].sort((a, b) => a - b);
  // The East/South catalogue exercises East seat, East/South round winds and all three dragons.
  // Normalize the round wind because local and tournament samples reach different rounds.
  // Every wind/seat combination is covered by Tyr's focused unit tests.
  expect(covered).toEqual(
    fixtures.yakuIds.filter((id) => ![13, 14, 15, 16, 50, 51, 52, 53, 54, 55].includes(id))
  );
  for (const game of games) {
    for (const round of game.rounds)
      expect(round.scores.reduce((sum, score) => sum + score, round.pot * 1000)).toBe(120000);
    expect(game.rounds.at(-1)!.round).toBe(9);
    expect(game.ratingChanges.reduce((sum, delta) => sum + delta, 0)).toBe(-20000);
  }
}

const checkboxRules: Record<string, boolean> = {
  tonpuusen: false,
  'with-leading-dealer-game-over': false,
  'with-winning-dealer-honba-skipped': false,
  'with-tobi': false,
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
  'with-kazoe': false,
  'with-kiriage-mangan': false,
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
  const aggregatedYakuhai = page.getByTestId('forseti-event-settings-yakuhai-aggregated');
  if (configure) await aggregatedYakuhai.uncheck();
  await expect(aggregatedYakuhai).not.toBeChecked();
  const kuitan = page.getByTestId('forseti-event-settings-yaku-settings-ruleset-with-kuitan');
  if (configure) await kuitan.check();
  await expect(kuitan).toBeChecked();
  const allowed = page.getByTestId(/^forseti-event-settings-yaku-allowed-/);
  expect(
    (
      await allowed.evaluateAll((inputs) =>
        inputs.map((input) => Number(input.getAttribute('data-testid')!.split('-').at(-1)))
      )
    ).sort((a, b) => a - b)
  ).toEqual(fixtures.yakuIds.filter((id) => ![13, 14, 15, 16, 49, 51, 53, 55].includes(id)));
  for (const input of await allowed.all()) {
    if (configure) await input.check();
    await expect(input).toBeChecked();
  }
  const multiple = page.getByTestId(
    'forseti-event-settings-yaku-settings-ruleset-with-multi-yakumans'
  );
  if (configure) await multiple.check();
  await expect(multiple).toBeChecked();
  for (const id of [21, 45, 46, 47]) {
    const input = page.getByTestId(`forseti-event-settings-yaku-double-${id}`);
    if (configure) await input.setChecked(id !== 21);
    if (id !== 21) await expect(input).toBeChecked();
    else await expect(input).not.toBeChecked();
  }
  for (const id of [6, 19, 21, 22, 26, 30]) {
    const input = page.getByTestId(`forseti-event-settings-yaku-pao-${id}`);
    if (configure) await input.setChecked(id === 19 || id === 21);
    if (id === 19 || id === 21) await expect(input).toBeChecked();
    else await expect(input).not.toBeChecked();
  }
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

export async function enterRound(
  page: Page,
  players: Account[],
  entry: Round,
  aggregatedYakuhai = false
) {
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
    const spec = entry.hands?.[(entry.winners ?? []).indexOf(index)] ?? basicHand;
    const prefix = `tyr-hand-player-${player.id}`;
    await expect(page.getByTestId(`${prefix}-yaku--1`)).toBeInViewport();
    // A double wind has two persisted awards and one visible button.
    const buttonYaku = spec.yaku.filter((id) => !(id === 49 && spec.yaku.includes(48)));
    if (spec.yaku.includes(48) && spec.yaku.includes(49)) {
      await expect(page.getByTestId(`${prefix}-yaku-48-double-wind`)).toHaveText('x2');
    }
    for (const id of [13, 14, 15, 16]) {
      await expect(page.getByTestId(`${prefix}-yaku-${id}`)).toHaveCount(aggregatedYakuhai ? 1 : 0);
    }
    for (const yaku of [...(spec.open ? [-1] : []), ...buttonYaku]) {
      const button = page.getByTestId(`${prefix}-yaku-${yaku}`);
      if (!(await button.getAttribute('class'))?.includes('checked')) await button.click();
      await expect(button).toHaveClass(/checked/);
    }
    const dragons = [56, 57, 58];
    if (dragons.filter((id) => spec.yaku.includes(id)).length === 2) {
      const third = dragons.find((id) => !spec.yaku.includes(id))!;
      await expect(page.getByTestId(`${prefix}-yaku-${third}`)).toBeDisabled();
    }
    // Assert the complete selection: Tyr may suppress incompatible yaku automatically.
    const selected = await page
      .getByTestId(prefix)
      .getByTestId(/-yaku--?\d+$/)
      .evaluateAll((buttons) =>
        buttons
          .filter((button) => button.className.includes('checked'))
          .map((button) => Number(button.getAttribute('data-testid')!.match(/-yaku-(-?\d+)$/)![1]))
          .sort((a, b) => a - b)
      );
    expect(selected, spec.name).toEqual(
      [...(spec.open ? [-1] : []), ...buttonYaku].sort((a, b) => a - b)
    );
    if (spec.dora) {
      await page.getByTestId(`${prefix}-dora-select`).click();
      await page.getByTestId(`${prefix}-dora-option-${spec.dora}`).click();
    }
    await expect(page.getByTestId(`${prefix}-dora-select`)).toHaveText(`Dora ${spec.dora}`);
    if (spec.fu) {
      await page.getByTestId(`${prefix}-fu-select`).click();
      await page.getByTestId(`${prefix}-fu-option-${spec.fu}`).click();
    }
    if (spec.yaku.some((id) => id === 19 || id === 21)) {
      await page.getByTestId(`${prefix}-pao-open`).click();
      await page
        .getByTestId(
          `${prefix}-pao-${spec.paoPlayer === undefined ? 'none' : players[spec.paoPlayer].id}`
        )
        .click();
    }
    await expect(page.getByTestId(prefix)).toContainText(handValue(spec));
  }
  if (entry.winners?.length) await page.getByTestId('tyr-hand-next').click();
  await expect(page.getByTestId('tyr-round-preview')).toBeVisible();
}

export async function checkLog(
  page: Page,
  players: Account[],
  count: number,
  scenario = localScenario,
  full = false
) {
  await page.getByTestId('tyr-table-game-log').click();
  await expect(page.getByTestId(/^tyr-game-log-round-\d+$/)).toHaveCount(count);
  for (const [index, entry] of scenario.rounds.slice(0, count).entries()) {
    if (!full && index !== count - 1) continue;
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
      for (const hand of entry.hands ?? entry.winners.map(() => basicHand)) {
        await expect(row).toContainText(hand.han < 0 ? 'yakuman' : handValue(hand));
        for (const yakuLabel of hand.labels)
          await expect(row).toContainText(yakuLabel === 'Chihou' ? 'Chiihou' : yakuLabel);
        if (hand.dora) await expect(row).toContainText(`dora ${hand.dora}`);
      }
    }
  }
  await page.getByTestId('tyr-game-log-back').click();
}

// Read the collapsed score grid in one browser call: expanding Tyr rows one at a
// time is unnecessary here because Sigrun verifies all persisted hand details.
export async function checkTournamentLog(page: Page, players: Account[], scenario: Scenario) {
  const entered = scenario.rounds.slice(0, -1);
  await page.getByTestId('tyr-table-game-log').click();
  await expect(page.getByTestId('tyr-game-log').locator('[class*="headerCell"]')).toHaveText(
    players.map((player) => player.title)
  );
  const expected = entered.map((entry, index) => {
    const start = index === 0 ? 1 : entered[index - 1].round;
    const previous = index === 0 ? [30000, 30000, 30000, 30000] : entered[index - 1].scores;
    return {
      round: `${start <= 4 ? '東' : '南'}${((start - 1) % 4) + 1}`,
      deltas: entry.scores.map((score, player) => score - previous[player]),
    };
  });
  await expect
    .poll(() =>
      page.getByTestId(/^tyr-game-log-round-\d+$/).evaluateAll((rows) =>
        rows.map((row) => {
          const cells = Array.from(row.firstElementChild!.children);
          return {
            round: cells[0].textContent,
            deltas: cells.slice(1).map((cell) => Number(cell.firstElementChild!.textContent)),
          };
        })
      )
    )
    .toEqual(expected);
  await page.getByTestId('tyr-game-log-back').click();
}

function handValue(hand: Hand, separator = ' ') {
  return hand.han < 0
    ? `Yakuman${hand.han < -1 ? ` x${-hand.han}` : ''}`
    : `${hand.han} han${hand.fu ? `${separator}${hand.fu} fu` : ''}`;
}

export async function assertPreview(
  page: Page,
  players: Account[],
  index: number,
  scenario = localScenario
) {
  const rounds = scenario.rounds;
  const previous = index === 0 ? [30000, 30000, 30000, 30000] : rounds[index - 1].scores;
  for (const [playerIndex, player] of players.entries()) {
    const place = playerPlace(page, 'tyr-preview-player', player);
    await expect(place).toHaveCount(1);
    await assertNumber(place.getByTestId(/-points$/), previous[playerIndex]);
  }
  const labels = rounds[index].payments!;
  await expect
    .poll(async () =>
      (await page.getByTestId('tyr-round-preview').locator('svg textPath').allTextContents())
        .filter((text) => text !== 'pao')
        .sort()
    )
    .toEqual([...labels].sort());
}

export async function assertPublishedGame(
  page: Page,
  hash: string,
  players: Account[],
  scenario = localScenario
) {
  const { rounds, ratingChanges } = scenario;
  const game = page.getByTestId(`sigrun-game-row-${hash}`);
  await expect(game.getByTestId(/^sigrun-game-player-link-/)).toHaveCount(4);
  for (const [index, player] of players.entries()) {
    const link = game.getByTestId(`sigrun-game-player-link-${hash}-${player.id}`);
    await expect(link).toHaveText(player.title);
    const badges = link.locator('..').locator('.mantine-Badge-root');
    await expect(badges).toHaveCount(2);
    await assertNumber(badges.nth(0), ratingChanges[index]);
    await assertNumber(badges.nth(1), rounds.at(-1)!.scores[index]);
  }
  const counts: Record<string, number> = { Ron: 0, Tsumo: 0, Draw: 0, Chombo: 0, Nagashi: 0 };
  for (const round of rounds) {
    const label = {
      ron: 'Ron',
      tsumo: 'Tsumo',
      draw: 'Draw',
      abort: 'Draw',
      chombo: 'Chombo',
      nagashi: 'Nagashi',
    }[round.outcome];
    counts[label]++;
  }
  for (const text of Object.entries(counts).map(([label, count]) => `${label}: ${count}`)) {
    await expect(game).toContainText(text);
  }
  const log = game.locator('ul').first().locator(':scope > li');
  // One collection assertion checks count, order and every round's contents.
  // Avoid a browser round trip for every name, yaku, fu and dora in every row.
  const expectedLog = rounds.map((entry, index) => {
    const start = index === 0 ? 1 : rounds[index - 1].round;
    const wind = `${start <= 4 ? '東' : '南'}${((start - 1) % 4) + 1}`;
    const contents: string[] = [];
    for (const winner of entry.winners ?? []) {
      contents.push(players[winner].title);
      const hand = entry.hands?.[entry.winners!.indexOf(winner)] ?? basicHand;
      contents.push(...hand.labels, hand.han < 0 ? 'yakuman!' : handValue(hand, ', '));
      if (hand.dora) contents.push(`dora ${hand.dora}`);
      if (hand.paoPlayer !== undefined) contents.push(`pao: ${players[hand.paoPlayer].title}`);
    }
    if (entry.outcome === 'tsumo') contents.push('(tsumo)');
    if (entry.outcome === 'draw') contents.push('Exhaustive draw');
    if (entry.outcome === 'abort') contents.push('Abortive draw');
    if (entry.outcome === 'chombo') contents.push('Chombo');
    if (entry.loser !== undefined) contents.push(players[entry.loser].title);
    for (const person of entry.outcome === 'draw' ? (entry.tenpai ?? []) : (entry.riichi ?? [])) {
      contents.push(players[person].title);
    }
    if (entry.nagashi !== undefined) contents.push('Nagashi mangan', players[entry.nagashi].title);
    const includes = contents.map((text) => `(?=[\\s\\S]*${escapeRegex(text)})`).join('');
    return new RegExp(`^${escapeRegex(wind)}:${includes}[\\s\\S]*$`);
  });
  await expect(log).toHaveText(expectedLog);
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
