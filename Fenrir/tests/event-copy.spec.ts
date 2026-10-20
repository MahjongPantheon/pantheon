import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('Copy event requires review, preserves settings and excludes games and participants', async ({
  page,
  request,
  browser,
}) => {
  test.setTimeout(120_000);
  const [administrator, referee, ...players] = await createTestAccounts(request, 5);
  const frey = `${process.env.FREY_URL}/v2/common.Frey`;
  const mimir = `${process.env.MIMIR_URL}/v2/common.Mimir`;
  const auth = await request.post(`${frey}/Authorize`, { data: administrator });
  await expect(auth).toBeOK();
  const credentials = await auth.json();
  const headers = {
    'X-Current-Person-Id': String(credentials.personId),
    'X-Auth-Token': credentials.authToken,
  };
  const rulesets = await request.post(`${mimir}/GetRulesets`, { data: {}, headers });
  await expect(rulesets).toBeOK();
  const { rulesets: rules } = await rulesets.json();
  const title = `TEST copy ${randomUUID()}`;
  const created = await request.post(`${mimir}/CreateEvent`, {
    headers,
    data: {
      requestId: randomUUID(),
      type: 'EVENT_TYPE_LOCAL',
      title,
      description: 'Copied **description**',
      timezone: 'Europe/Moscow',
      duration: 90,
      seriesLength: 8,
      minGames: 3,
      isListed: false,
      isRatingShown: false,
      achievementsShown: true,
      allowViewOtherTables: true,
      allowManualAddReplay: false,
      rulesetConfig: { ...rules[0], startPoints: 35000, goalPoints: 40000 },
    },
  });
  await expect(created).toBeOK();
  const { eventId } = await created.json();
  for (const player of [referee, ...players]) {
    const registered = await request.post(`${mimir}/RegisterPlayer`, {
      headers,
      data: { eventId, playerId: player.id },
    });
    await expect(registered).toBeOK();
  }
  const started = await request.post(`${mimir}/StartGame`, {
    headers,
    data: {
      eventId,
      players: [referee, ...players].map((player) => player.id),
      requestId: randomUUID(),
    },
  });
  await expect(started).toBeOK();
  const { sessionHash } = await started.json();
  const gameFinished = await request.post(`${mimir}/ForceFinishGame`, {
    headers,
    data: { sessionHash },
  });
  await expect(gameFinished).toBeOK();
  const granted = await request.post(`${frey}/AddRuleForPerson`, {
    headers,
    data: { eventId, personId: referee.id, ruleName: 'REFEREE_FOR_EVENT', ruleValue: 1 },
  });
  await expect(granted).toBeOK();
  const finished = await request.post(`${mimir}/FinishEvent`, { headers, data: { eventId } });
  await expect(finished).toBeOK();
  const sourceResponse = await request.post(`${mimir}/GetEventForEdit`, {
    headers,
    data: { id: eventId },
  });
  await expect(sourceResponse).toBeOK();
  const source = await sourceResponse.json();

  await page.goto(process.env.FORSETI_URL!);
  await page.getByTestId('forseti-login-email').fill(administrator.email);
  await page.getByTestId('forseti-login-password').fill(administrator.password);
  await page.getByTestId('forseti-login-submit').click();
  const writes: string[] = [];
  page.on('request', (req) => {
    if (/\/(CreateEvent|UpdateEvent)$/.test(req.url())) writes.push(req.url());
  });
  await page.getByTestId('forseti-owned-events-filter-all').click();
  await page.getByTestId(`forseti-owned-event-actions-${eventId}`).click();
  await page.getByTestId(`forseti-owned-event-copy-${eventId}`).click();
  await expect(page.getByTestId('forseti-event-settings-basic-settings-event-title')).toHaveValue(
    `${title} [copy]`
  );
  await expect(
    page.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_LOCAL')
  ).toBeChecked();
  await expect(
    page.getByTestId('forseti-event-settings-basic-settings-event-description')
  ).toHaveValue(source.event.description);
  await expect(page.getByTestId('forseti-event-settings-save')).toBeEnabled();
  expect(writes).toEqual([]);

  // Reloading the draft must still only read settings.
  await page.reload();
  const draftTitle = page.getByTestId('forseti-event-settings-basic-settings-event-title');
  await expect(draftTitle).toHaveValue(`${title} [copy]`);
  expect(writes).toEqual([]);
  await draftTitle.fill(`${title} reviewed`);
  const [saved] = await Promise.all([
    page.waitForResponse((response) => response.url().endsWith('/common.Mimir/CreateEvent')),
    page.getByTestId('forseti-event-settings-save').click(),
  ]);
  expect(saved.ok()).toBe(true);
  expect(writes).toHaveLength(1);
  await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
  const copyLink = page.getByRole('link', { name: `${title} reviewed`, exact: true });
  const copyHref = await copyLink.getAttribute('href');
  const copyId = Number(copyHref?.split('/').pop());
  expect(copyId).toBeGreaterThan(0);
  expect(copyId).not.toBe(eventId);
  const copyResponse = await request.post(`${mimir}/GetEventForEdit`, {
    headers,
    data: { id: copyId },
  });
  await expect(copyResponse).toBeOK();
  const copy = await copyResponse.json();
  // These arrays represent sets; the form serializes them in numeric order.
  for (const field of ['allowedYaku', 'yakuWithPao', 'doubleYakuman']) {
    source.event.rulesetConfig[field]?.sort((a: number, b: number) => a - b);
    copy.event.rulesetConfig[field]?.sort((a: number, b: number) => a - b);
  }
  expect(copy.event).toEqual({ ...source.event, title: `${title} reviewed` });
  for (const [id, expectedCount] of [
    [eventId, 1],
    [copyId, 0],
  ]) {
    const games = await request.post(`${mimir}/GetLastGames`, {
      headers,
      data: { eventIdList: [id], limit: 10, offset: 0 },
    });
    await expect(games).toBeOK();
    expect((await games.json()).totalGames ?? 0).toBe(expectedCount);
  }
  expect(copy.finished ?? false).toBe(false);
  await page.goto(`${process.env.FORSETI_URL}/event/${copyId}/players`);
  await expect(page.getByTestId('forseti-players-add-selector')).toBeVisible();
  await expect(page.getByTestId(/^forseti-players-row-\d+$/)).toHaveCount(0);

  const refereeContext = await browser.newContext();
  const refereePage = await refereeContext.newPage();
  try {
    await refereePage.goto(process.env.FORSETI_URL!);
    await refereePage.getByTestId('forseti-login-email').fill(referee.email);
    await refereePage.getByTestId('forseti-login-password').fill(referee.password);
    await refereePage.getByTestId('forseti-login-submit').click();
    await refereePage.getByTestId('forseti-owned-events-filter-all').click();
    await expect(refereePage.getByTestId(`forseti-owned-event-row-${eventId}`)).toBeVisible();
    await refereePage.getByTestId(`forseti-owned-event-actions-${eventId}`).click();
    await expect(refereePage.getByTestId(`forseti-owned-event-copy-${eventId}`)).toBeVisible();
    await refereePage.goto(`${process.env.FORSETI_URL}/ownedEvents/copy/${eventId}`);
    await expect(
      refereePage.getByText('Failed to fetch event data', { exact: true })
    ).toBeVisible();
    await expect(refereePage.getByTestId('forseti-event-settings-save')).toHaveCount(0);
  } finally {
    await refereeContext.close();
  }
});
