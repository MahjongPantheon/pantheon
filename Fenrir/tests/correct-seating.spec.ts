import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { GamesCorrectSessionSeatingPayload } from '../../Common/tsclients/proto/mimir.pb';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

// Case: ../testcases/rules-001-correct-session-seating.md
test('RULES-001: Administrator can correct starting winds while retaining recorded outcomes', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator, ...players] = await createTestAccounts(request, 5);
  const authorized = await request.post(`${process.env.FREY_URL}/v2/common.Frey/Authorize`, {
    data: administrator,
  });
  await expect(authorized).toBeOK();
  const credentials = await authorized.json();
  const headers = {
    'X-Current-Person-Id': String(credentials.personId),
    'X-Auth-Token': credentials.authToken,
  };
  async function rpc(method: string, data: object) {
    const response = await request.post(`${process.env.MIMIR_URL}/v2/common.Mimir/${method}`, {
      headers,
      data,
    });
    await expect(response).toBeOK();
    return response.json();
  }
  const rulesets = await rpc('GetRulesets', {});
  const { eventId } = await rpc('CreateEvent', {
    requestId: randomUUID(),
    type: 'EVENT_TYPE_LOCAL',
    title: `TEST RULES-001 ${randomUUID()}`,
    timezone: 'UTC',
    rulesetConfig: { ...rulesets.rulesets[rulesets.rulesetIds.indexOf('ema')], startPoints: 25000 },
  });
  for (const player of players) await rpc('RegisterPlayer', { eventId, playerId: player.id });
  const { sessionHash } = await rpc('StartGame', {
    eventId,
    players: players.map((player) => player.id),
    requestId: randomUUID(),
  });
  const winnerId = players[0].id;
  const loserId = players[2].id;
  let before = await rpc('GetSessionOverview', { sessionHash });
  await rpc('AddRound', {
    sessionHash,
    roundToken: before.nextRoundToken,
    roundData: {
      ron: {
        winnerId,
        loserId,
        han: 1,
        fu: 30,
        yaku: [8],
        roundIndex: 1,
        honba: 0,
        riichiBets: [],
      },
    },
  });
  before = await rpc('GetSessionOverview', { sessionHash });
  await rpc('AddRound', {
    sessionHash,
    roundToken: before.nextRoundToken,
    roundData: { draw: { roundIndex: 1, honba: 1, riichiBets: [], tempai: [winnerId] } },
  });
  before = await rpc('GetSessionOverview', { sessionHash });
  const originalLog = await rpc('GetAllRounds', { sessionHash });

  await test.step('Swap starting East and South through Games Control', async () => {
    await page.goto(process.env.FORSETI_URL!);
    await page.getByTestId('forseti-login-email').fill(administrator.email);
    await page.getByTestId('forseti-login-password').fill(administrator.password);
    await page.getByTestId('forseti-login-submit').click();
    await expect(page.getByTestId('forseti-owned-events-filter-all')).toBeVisible();
    await page.goto(`${process.env.FORSETI_URL}/event/${eventId}/games`);
    const action = `forseti-game-correct-seating-${sessionHash}`;
    await page.getByTestId(`${action}-open`).click();
    await expect(page.getByRole('dialog')).toContainText(
      'Recorded outcomes stay attached to the named players'
    );
    await page.getByTestId(`${action}-seat-0`).click();
    await page.getByRole('option', { name: players[1].title, exact: true }).click();
    await expect(page.getByTestId(`${action}-seat-1`)).toHaveValue(players[0].title);
    const [saved] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/common.Mimir/CorrectSessionSeating') &&
          response.request().method() === 'POST'
      ),
      page.getByTestId(`${action}-confirm`).click(),
    ]);
    expect(saved.ok()).toBe(true);
    const payload = GamesCorrectSessionSeatingPayload.decode(
      new Uint8Array(saved.request().postDataBuffer()!)
    );
    expect(payload.playerIds).toEqual([players[1].id, players[0].id, players[2].id, players[3].id]);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByTestId(`forseti-game-row-${sessionHash}`)).toContainText('29000');
  });

  await test.step('Verify persisted outcomes and the refreshed starting order', async () => {
    const overview = await rpc('GetSessionOverview', { sessionHash });
    expect(overview.players.map((player: { id: number }) => player.id)).toEqual([
      players[1].id,
      players[0].id,
      players[2].id,
      players[3].id,
    ]);
    expect(overview.players.map((player: { score: number }) => player.score)).toEqual([
      24000, 29000, 23000, 24000,
    ]);
    expect(overview.state.roundIndex).toBe(2);
    expect(overview.state.honbaCount).toBe(1);
    expect(overview.nextRoundToken).not.toBe(before.nextRoundToken);
    const correctedLog = await rpc('GetAllRounds', { sessionHash });
    expect(correctedLog.rounds).toHaveLength(2);
    expect(correctedLog.rounds[0].round.ron).toMatchObject({ winnerId, loserId, han: 1, fu: 30 });
    expect(correctedLog.rounds[1].round.draw.tempai).toEqual([winnerId]);
    expect(correctedLog.rounds[0].round.ron.yaku).toEqual(originalLog.rounds[0].round.ron.yaku);
    await page.reload();
    const row = page.getByTestId(`forseti-game-row-${sessionHash}`);
    for (const score of ['24000', '29000', '23000']) await expect(row).toContainText(score);
    await page.getByTestId(`forseti-game-correct-seating-${sessionHash}-open`).click();
    await expect(
      page.getByTestId(`forseti-game-correct-seating-${sessionHash}-seat-0`)
    ).toHaveValue(players[1].title);
  });
});
