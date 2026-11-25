import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { assertPreview, assertTable, enterRound, playerPlace, type Round } from './utils/game-flow';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

// Case: ../testcases/settings-003-abortive-draw-options.md
test('SETTINGS-003: Administrator can allow triple ron while keeping other abortive draws', async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(180_000);
  page.setDefaultTimeout(15_000);
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
  const mimir = `${process.env.MIMIR_URL}/v2/common.Mimir`;
  const presets = await request.post(`${mimir}/GetRulesets`, { headers, data: {} });
  await expect(presets).toBeOK();
  const { rulesets, rulesetIds } = await presets.json();
  const title = `TEST SETTINGS-003 ${randomUUID()}`;
  const created = await request.post(`${mimir}/CreateEvent`, {
    headers,
    data: {
      requestId: randomUUID(),
      title,
      type: 'EVENT_TYPE_LOCAL',
      timezone: 'UTC',
      isListed: true,
      isRatingShown: true,
      rulesetConfig: { ...rulesets[rulesetIds.indexOf('ema')], withAbortives: true },
    },
  });
  await expect(created).toBeOK();
  const { eventId } = await created.json();
  for (const player of players) {
    const registered = await request.post(`${mimir}/RegisterPlayer`, {
      headers,
      data: { eventId, playerId: player.id },
    });
    await expect(registered).toBeOK();
  }
  const started = await request.post(`${mimir}/StartGame`, {
    headers,
    data: { eventId, players: players.map(({ id }) => id), requestId: randomUUID() },
  });
  await expect(started).toBeOK();
  const { sessionHash } = await started.json();
  const alternate = await request.post(`${mimir}/CreateEvent`, {
    headers,
    data: {
      requestId: randomUUID(),
      title: `${title} alternate`,
      type: 'EVENT_TYPE_LOCAL',
      timezone: 'UTC',
      rulesetConfig: rulesets[rulesetIds.indexOf('ema')],
    },
  });
  await expect(alternate).toBeOK();
  const { eventId: alternateEventId } = await alternate.json();
  const registration = await request.post(`${mimir}/RegisterPlayer`, {
    headers,
    data: { eventId: alternateEventId, playerId: players[0].id },
  });
  await expect(registration).toBeOK();
  const rulesRequests: string[] = [];
  page.on('request', (req) => {
    if (req.url().endsWith('/common.Mimir/GetGameConfig')) rulesRequests.push(req.url());
  });
  const adminContext = await browser.newContext();
  adminContext.setDefaultTimeout(15_000);
  const admin = await adminContext.newPage();
  const spectatorContext = await browser.newContext();
  spectatorContext.setDefaultTimeout(15_000);
  const spectator = await spectatorContext.newPage();
  const openCurrentGame = async () => {
    await expect(page.getByTestId('tyr-table').or(page.getByTestId('tyr-home'))).toBeVisible();
    if (await page.getByTestId('tyr-home').isVisible())
      await page.getByTestId('tyr-home-current-game').click();
    await expect(page.getByTestId('tyr-table')).toBeVisible();
  };
  const assertWinnerLimit = async (tripleRonAllowed: boolean) => {
    await page.getByTestId('tyr-table-add-round').click();
    await page.getByTestId('tyr-table-outcome-ron').click();
    for (const player of players.slice(1, 3))
      await playerPlace(page, 'tyr-select-player', player).getByTestId(/-win$/).click();
    const thirdWinner = playerPlace(page, 'tyr-select-player', players[3]).getByTestId(/-win$/);
    if (tripleRonAllowed) await expect(thirdWinner).toBeEnabled();
    else await expect(thirdWinner).toBeDisabled();
    await page.getByTestId('tyr-select-player-back').click();
  };
  const switchEvents = async () => {
    await page.getByTestId('tyr-table-home').click();
    await page.getByTestId('tyr-home-settings').click();
    await page.getByTestId('tyr-settings-select-event').click();
    await page.getByTestId(`tyr-event-select-event-${alternateEventId}`).click();
    await expect(page.getByTestId('tyr-home')).toBeVisible();
    await page.getByTestId('tyr-home-settings').click();
    await page.getByTestId('tyr-settings-select-event').click();
    await page.getByTestId(`tyr-event-select-event-${eventId}`).click();
    await openCurrentGame();
  };
  const saveMode = async (label: string) => {
    await admin.goto(`${process.env.FORSETI_URL}/ownedEvents/edit/${eventId}`);
    await admin.getByTestId('forseti-event-settings-tab-ruleset').click();
    await admin
      .getByTestId('forseti-event-settings-ruleset-settings-ruleset-with-abortives')
      .click();
    await admin.getByRole('option', { name: label, exact: true }).click();
    const [saved] = await Promise.all([
      admin.waitForResponse((response) => response.url().endsWith('/common.Mimir/UpdateEvent')),
      admin.getByTestId('forseti-event-settings-save').click(),
    ]);
    expect(saved.ok()).toBe(true);
  };
  try {
    await test.step('Open Tyr before the administrator changes the rules', async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(process.env.TYR_URL!);
      await page.getByTestId('tyr-login-email').fill(players[0].email);
      await page.getByTestId('tyr-login-password').fill(players[0].password);
      await page.getByTestId('tyr-login-submit').click();
      await page.getByTestId(`tyr-event-select-event-${eventId}`).click();
      await expect(page.getByTestId('tyr-table').or(page.getByTestId('tyr-home'))).toBeVisible();
      if (await page.getByTestId('tyr-home').isVisible())
        await page.getByTestId('tyr-home-current-game').click();
      await expect(page.getByTestId('tyr-table')).toBeVisible();
    });

    await test.step('Save and reload all three modes and show each on the public rules page', async () => {
      await admin.goto(process.env.FORSETI_URL!);
      await admin.getByTestId('forseti-login-email').fill(administrator.email);
      await admin.getByTestId('forseti-login-password').fill(administrator.password);
      await admin.getByTestId('forseti-login-submit').click();
      await expect(admin.getByTestId('forseti-owned-events-page')).toBeVisible();
      for (const [label, withAbortives, allowTripleRonWithAbortives] of [
        ['Disabled', false, false],
        ['All', true, false],
        ['All except triple ron', true, true],
      ] as const) {
        await admin.goto(`${process.env.FORSETI_URL}/ownedEvents/edit/${eventId}`);
        await expect(
          admin.getByTestId('forseti-event-settings-basic-settings-event-title')
        ).toHaveValue(title);
        await admin.getByTestId('forseti-event-settings-tab-ruleset').click();
        const input = admin.getByTestId(
          'forseti-event-settings-ruleset-settings-ruleset-with-abortives'
        );
        await input.click();
        await admin.getByRole('option', { name: label, exact: true }).click();
        const [saved] = await Promise.all([
          admin.waitForResponse(
            (response) =>
              response.url().endsWith('/common.Mimir/UpdateEvent') &&
              response.request().method() === 'POST'
          ),
          admin.getByTestId('forseti-event-settings-save').click(),
        ]);
        expect(saved.ok()).toBe(true);
        const persisted = await request.post(`${mimir}/GetEventForEdit`, {
          headers,
          data: { id: eventId },
        });
        await expect(persisted).toBeOK();
        const { event } = await persisted.json();
        expect(event.rulesetConfig.withAbortives ?? false).toBe(withAbortives);
        expect(event.rulesetConfig.allowTripleRonWithAbortives ?? false).toBe(
          allowTripleRonWithAbortives
        );
        await admin.goto(`${process.env.FORSETI_URL}/ownedEvents/edit/${eventId}`);
        await admin.getByTestId('forseti-event-settings-tab-ruleset').click();
        await expect(input).toHaveValue(label);
        await spectator.goto(`${process.env.SIGRUN_URL}/event/${eventId}/rules`);
        await expect(spectator.getByTestId('sigrun-rules-page')).toBeVisible({ timeout: 15_000 });
        await expect(spectator.getByLabel('Abortive draws', { exact: true })).toHaveValue(label);
      }
    });

    await test.step('Keep loaded rules during game refresh and round entry', async () => {
      await page.getByTestId('tyr-table-refresh').click();
      await assertWinnerLimit(false);
      await page.getByTestId('tyr-table-home').click();
      await page.getByTestId('tyr-home-refresh').click();
      await openCurrentGame();
      await assertWinnerLimit(false);
    });

    await test.step('Load new rules after selecting a different event in settings', async () => {
      await switchEvents();
      await assertWinnerLimit(true);
    });

    await test.step('Load new rules after browser reload without persisting them', async () => {
      await saveMode('All');
      await assertWinnerLimit(true);
      await page.reload();
      await openCurrentGame();
      await assertWinnerLimit(false);
      await saveMode('All except triple ron');
      await assertWinnerLimit(false);
      await page.reload();
      await openCurrentGame();
      await assertWinnerLimit(true);
      expect(rulesRequests).toEqual([]);
    });

    await test.step('Select three winners and record matching preview and saved scores in Tyr', async () => {
      await page.getByTestId('tyr-table-add-round').click();
      await expect(page.getByTestId('tyr-table-outcome-abort')).toBeVisible();
      await page.getByTestId('tyr-table-outcome-ron').click();
      for (const player of players.slice(1)) {
        await playerPlace(page, 'tyr-select-player', player).getByTestId(/-win$/).click();
      }
      for (const player of players.slice(1)) {
        await expect(
          playerPlace(page, 'tyr-select-player', player).getByTestId(/-win$/)
        ).toBeEnabled();
      }
      const selectedWinner = playerPlace(page, 'tyr-select-player', players[1]).getByTestId(
        /-win$/
      );
      await expect(selectedWinner).toHaveClass(/checked/);
      await selectedWinner.click();
      await expect(selectedWinner).not.toHaveClass(/checked/);
      await selectedWinner.click();
      await expect(selectedWinner).toHaveClass(/checked/);
      // Return to the table and exercise the common complete hand-entry flow.
      await page.getByTestId('tyr-select-player-back').click();
      const round: Round = {
        outcome: 'ron',
        winners: [1, 2, 3],
        loser: 0,
        scores: [27000, 31000, 31000, 31000],
        round: 2,
        honba: 0,
        pot: 0,
        payments: ['1000', '1000', '1000'],
      };
      const [preview] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().endsWith('/common.Mimir/PreviewRound') &&
            response.request().method() === 'POST',
          { timeout: 60_000 }
        ),
        enterRound(page, players, round),
      ]);
      expect(preview.ok()).toBe(true);
      await assertPreview(page, players, 0, { rounds: [round], ratingChanges: [] });
      const [added] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().endsWith('/common.Mimir/AddRound') &&
            response.request().method() === 'POST'
        ),
        page.getByTestId('tyr-round-preview-submit').click(),
      ]);
      expect(added.ok()).toBe(true);
      await assertTable(page, players, round, false);
      const overview = await request.post(`${mimir}/GetSessionOverview`, {
        headers,
        data: { sessionHash },
      });
      await expect(overview).toBeOK();
      const saved = await overview.json();
      const scores = new Map<number, number>(
        saved.players.map(({ id, score }: { id: number; score: number }) => [id, score])
      );
      expect(players.map(({ id }) => scores.get(id))).toEqual(round.scores);
      expect(saved.state.roundIndex).toBe(2);
      expect(saved.state.honbaCount ?? 0).toBe(0);
      const gameResponse = await request.post(`${mimir}/GetGame`, {
        headers,
        data: { sessionHash },
      });
      await expect(gameResponse).toBeOK();
      const { game } = await gameResponse.json();
      expect(game.rounds).toHaveLength(1);
      expect(game.rounds[0].multiron.wins).toHaveLength(3);
    });
  } finally {
    await adminContext.close();
    await spectatorContext.close();
  }
});
