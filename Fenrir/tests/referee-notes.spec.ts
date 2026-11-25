import { test, expect, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

// Case: ../testcases/referee-001-shared-notes.md
test('REFEREE-001: Event referees share private notes and see player links on penalties', async ({
  page,
  browser,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator, firstReferee, secondReferee, player] = await createTestAccounts(request, 4);
  const mimir = `${process.env.MIMIR_URL}/v2/common.Mimir`;
  const frey = `${process.env.FREY_URL}/v2/common.Frey`;
  async function authorize(account: typeof administrator) {
    const response = await request.post(`${frey}/Authorize`, { data: account });
    await expect(response).toBeOK();
    const credentials = await response.json();
    return {
      'X-Current-Person-Id': String(credentials.personId),
      'X-Auth-Token': String(credentials.authToken),
    };
  }
  const adminHeaders = await authorize(administrator);
  const playerHeaders = await authorize(player);
  async function rpc(method: string, data: object) {
    const response = await request.post(`${mimir}/${method}`, { headers: adminHeaders, data });
    await expect(response).toBeOK();
    return response.json();
  }
  async function login(target: Page, account: typeof administrator) {
    await target.goto(process.env.FORSETI_URL!);
    await target.getByTestId('forseti-login-email').fill(account.email);
    await target.getByTestId('forseti-login-password').fill(account.password);
    await target.getByTestId('forseti-login-submit').click();
    await expect(target.getByTestId('forseti-owned-events-page')).toBeVisible();
  }
  const presets = await rpc('GetRulesets', {});
  const rulesetConfig = presets.rulesets[presets.rulesetIds.indexOf('ema')];
  async function createEvent() {
    return rpc('CreateEvent', {
      requestId: randomUUID(),
      type: 'EVENT_TYPE_TOURNAMENT',
      title: `TEST REFEREE-001 ${randomUUID()}`,
      timezone: 'UTC',
      duration: 75,
      rulesetConfig,
    });
  }
  const { eventId } = await createEvent();
  const { eventId: otherEventId } = await createEvent();
  await rpc('RegisterPlayer', { eventId, playerId: player.id });
  for (const referee of [firstReferee, secondReferee]) {
    const granted = await request.post(`${frey}/AddRuleForPerson`, {
      headers: adminHeaders,
      data: { ruleName: 'REFEREE_FOR_EVENT', ruleValue: 1, personId: referee.id, eventId },
    });
    await expect(granted).toBeOK();
  }
  const general = `Event instructions ${randomUUID()}`;
  const linked = `Observation for player ${randomUUID()}`;
  const followup = `Second referee follow-up ${randomUUID()}`;
  const noteCard = (target: Page, content: string) =>
    target.getByTestId(/^forseti-referee-note-\d+$/).filter({ hasText: content });
  async function saveNote(target: Page) {
    const [saved] = await Promise.all([
      target.waitForResponse(
        (response) => response.url().endsWith('/common.Mimir/AddRefereeNote'),
        { timeout: 15_000 }
      ),
      target.getByTestId('forseti-referee-note-submit').click(),
    ]);
    expect(saved.ok(), `Save returned ${saved.status()}: ${await saved.text()}`).toBe(true);
    await expect(target.getByTestId('forseti-referee-note-content')).toHaveValue('');
    await expect(target.getByTestId('forseti-referee-note-content')).toBeEnabled();
  }

  await test.step('First referee adds general and player-linked notes', async () => {
    await login(page, firstReferee);
    await page.goto(`${process.env.FORSETI_URL}/event/${eventId}/notes`);
    await expect(page.getByTestId('forseti-menu-sidebar-event-notes')).toBeVisible();
    await page.getByTestId('forseti-referee-note-content').fill(general);
    await saveNote(page);
    await expect(noteCard(page, general)).toBeVisible();
    await page.getByTestId('forseti-referee-note-content').fill(linked);
    await page.getByTestId('forseti-referee-note-player').fill(player.title);
    await page.getByRole('option', { name: player.title, exact: true }).click({ timeout: 15_000 });
    await saveNote(page);
    const note = noteCard(page, linked);
    await expect(note).toContainText(player.title);
    await expect(note).toContainText(firstReferee.title);
    await expect(note.locator('time')).toHaveAttribute('datetime', /^\d{4}-\d{2}-\d{2}T.*Z$/);
    await page.reload();
    await expect(noteCard(page, general)).toBeVisible();
    await expect(noteCard(page, linked)).toBeVisible();
  });

  const otherContext = await browser.newContext();
  try {
    const otherPage = await otherContext.newPage();
    await test.step('Second referee sees the shared notes and can append a follow-up', async () => {
      await login(otherPage, secondReferee);
      await otherPage.goto(`${process.env.FORSETI_URL}/event/${eventId}/notes`);
      await expect(noteCard(otherPage, general)).toBeVisible();
      await expect(noteCard(otherPage, linked)).toBeVisible();
      await otherPage.getByTestId('forseti-referee-note-content').fill(followup);
      await saveNote(otherPage);
      await expect(noteCard(otherPage, followup)).toBeVisible();
      await page.getByRole('button', { name: 'Refresh notes', exact: true }).click();
      await expect(noteCard(page, followup)).toBeVisible();
      const persisted = await rpc('ListRefereeNotes', { eventId });
      expect(persisted.notes).toHaveLength(3);
      expect(
        persisted.notes.find((note: { content: string }) => note.content === followup)
      ).toMatchObject({ authorId: secondReferee.id });
      expect((await rpc('ListRefereeNotes', { eventId: otherEventId })).notes ?? []).toHaveLength(
        0
      );
    });
    await test.step('Penalties retain their behavior alongside player-linked notes', async () => {
      await rpc('AddPenalty', {
        eventId,
        playerId: player.id,
        amount: 500,
        reason: 'Existing penalty',
      });
      await otherPage.getByTestId('forseti-menu-sidebar-event-penalties').click();
      await expect(otherPage).toHaveURL(`${process.env.FORSETI_URL}/event/${eventId}/penalties`);
      await expect(noteCard(otherPage, linked)).toBeVisible();
      await expect(noteCard(otherPage, general)).toHaveCount(0);
      await expect(noteCard(otherPage, followup)).toHaveCount(0);
      await expect(otherPage.getByTestId(/^forseti-penalty-row-\d+$/)).toContainText(
        'Existing penalty'
      );
      await expect(otherPage.getByTestId(/^forseti-penalty-row-\d+$/)).toContainText('500');
    });
  } finally {
    await otherContext.close();
  }

  await test.step('Registered players and anonymous readers cannot read or add private notes', async () => {
    for (const headers of [{}, playerHeaders]) {
      for (const [method, data] of [
        ['ListRefereeNotes', { eventId }],
        ['AddRefereeNote', { eventId, content: 'Unauthorized note' }],
      ] as const) {
        const denied = await request.post(`${mimir}/${method}`, { headers, data });
        expect(denied.ok()).toBe(false);
        expect(await denied.text()).not.toContain(linked);
      }
    }
    const playerContext = await browser.newContext();
    try {
      const playerPage = await playerContext.newPage();
      await login(playerPage, player);
      await playerPage.goto(`${process.env.FORSETI_URL}/event/${eventId}/notes`);
      await expect(
        playerPage.getByText('Referee notes are available to event referees and administrators.', {
          exact: true,
        })
      ).toBeVisible();
      await expect(playerPage.getByTestId('forseti-referee-note-content')).toHaveCount(0);
      await expect(noteCard(playerPage, linked)).toHaveCount(0);
      await expect(playerPage.getByTestId('forseti-menu-sidebar-event-notes')).toHaveCount(0);
    } finally {
      await playerContext.close();
    }
    expect((await rpc('ListRefereeNotes', { eventId })).notes).toHaveLength(3);
  });
});
