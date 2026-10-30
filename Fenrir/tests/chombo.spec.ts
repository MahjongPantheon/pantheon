import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { GamesAddRoundPayload, GamesAddRoundResponse } from '../../Common/tsclients/proto/mimir.pb';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

// Case: ../testcases/settings-002-simultaneous-chombo.md
test('SETTINGS-002: Players can record simultaneous chombo after timeout as one hand', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator, ...players] = await createTestAccounts(request, 5);
  const mimir = `${process.env.MIMIR_URL}/v2/common.Mimir`;
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
    const response = await request.post(`${mimir}/${method}`, { headers, data });
    await expect(response).toBeOK();
    return response.json();
  }
  const presets = await rpc('GetRulesets', {});
  const rules = presets.rulesets[presets.rulesetIds.indexOf('ema2025')];
  expect(rules.chomboCountsAsHand).toBe(true);
  expect(rules).not.toHaveProperty('chomboEndsGame');
  const { eventId } = await rpc('CreateEvent', {
    requestId: randomUUID(),
    type: 'EVENT_TYPE_TOURNAMENT',
    title: `TEST SETTINGS-002 ${randomUUID()}`,
    timezone: 'UTC',
    duration: 0,
    rulesetConfig: rules,
  });
  for (const player of players) await rpc('RegisterPlayer', { eventId, playerId: player.id });
  const { sessionHash } = await rpc('StartGame', {
    requestId: randomUUID(),
    eventId,
    players: players.map((player) => player.id),
  });
  await rpc('StartTimer', { eventId });
  const timerStarted = Date.now();
  await page.goto(process.env.TYR_URL!);
  await page.getByTestId('tyr-login-email').fill(players[0].email);
  await page.getByTestId('tyr-login-password').fill(players[0].password);
  await page.getByTestId('tyr-login-submit').click();
  await page.getByTestId(`tyr-event-select-event-${eventId}`).click();
  // Tournament selection opens the assigned table directly.
  await expect(page.getByTestId('tyr-table-add-round')).toBeVisible();
  // Cross the zero-duration timer boundary without modifying shared event data.
  await expect.poll(() => Date.now()).toBeGreaterThan(timerStarted + 1500);

  for (const [index, group] of [
    [players[0], players[1]],
    [players[2], players[3]],
  ].entries()) {
    await page.getByTestId('tyr-table-add-round').click();
    await page.getByTestId('tyr-table-outcome-chombo').click();
    await expect(page.getByTestId('tyr-select-player-next')).toBeDisabled();
    for (const player of group) {
      const seat = page
        .getByTestId(/^tyr-select-player-(self|shimocha|toimen|kamicha)$/)
        .filter({ hasText: player.title });
      const button = seat.getByTestId(/-lose$/);
      await expect(button).toBeEnabled();
      await button.click();
    }
    // Deselecting and restoring one player must preserve the other selection.
    const first = page
      .getByTestId(/^tyr-select-player-(self|shimocha|toimen|kamicha)$/)
      .filter({ hasText: group[0].title })
      .getByTestId(/-lose$/);
    await first.click();
    await first.click();
    await page.getByTestId('tyr-select-player-next').click();
    const preview = page.getByTestId('tyr-round-preview');
    await expect(preview).toBeVisible();
    for (const player of group) await expect(preview).toContainText(player.title);
    const [submitted] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/common.Mimir/AddRound') &&
          response.request().method() === 'POST'
      ),
      page.getByTestId('tyr-round-preview-submit').click(),
    ]);
    expect(submitted.ok()).toBe(true);
    const outgoing = GamesAddRoundPayload.decode(
      new Uint8Array(submitted.request().postDataBuffer()!)
    );
    expect(outgoing.roundData.chombo?.loserIds).toEqual(group.map((player) => player.id));
    const result = GamesAddRoundResponse.decode(new Uint8Array(await submitted.body()));
    expect(result.lastHandStarted).toBe(true);
    expect(result.isFinished).toBe(index === 1);
    for (const player of group)
      expect(result.scores.find((score) => score.playerId === player.id)?.chomboCount).toBe(-20000);
    const log = await rpc('GetAllRounds', { sessionHash });
    expect(log.rounds).toHaveLength(index + 1);
    expect(log.rounds.at(-1).round.chombo.loserIds).toEqual(group.map((player) => player.id));
    if (index === 0) await expect(page.getByTestId('tyr-table-add-round')).toBeVisible();
  }
  const overview = await rpc('GetSessionOverview', { sessionHash });
  expect(overview.state.finished).toBe(true);
  expect(overview.state.chombo).toHaveLength(4);
});
