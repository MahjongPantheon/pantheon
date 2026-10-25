import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('New event types set yakuhai defaults and ruleset selection preserves the choice', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator] = await createTestAccounts(request, 1);
  await page.goto(process.env.FORSETI_URL!);
  await page.getByTestId('forseti-login-email').fill(administrator.email);
  await page.getByTestId('forseti-login-password').fill(administrator.password);
  await page.getByTestId('forseti-login-submit').click();
  await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
  await page.getByTestId('forseti-menu-sidebar-create-event').click();
  const checkbox = page.getByTestId('forseti-event-settings-yakuhai-aggregated');
  const basic = page.getByTestId('forseti-event-settings-tab-basic');
  const yaku = page.getByTestId('forseti-event-settings-tab-yaku');
  await yaku.click();
  await expect(checkbox).not.toBeChecked();
  for (const type of ['TOURNAMENT', 'ONLINE', 'LOCAL', 'TOURNAMENT']) {
    await basic.click();
    await page.getByTestId(`forseti-event-settings-event-type-EVENT_TYPE_${type}`).check();
    await yaku.click();
    await expect(checkbox).toBeChecked({ checked: type === 'TOURNAMENT' });
  }
  await basic.click();
  await page.getByTestId('forseti-event-settings-basic-settings-event-ruleset').click();
  await page
    .getByRole('option', { name: 'European Mahjong Association rules', exact: true })
    .click();
  await yaku.click();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await basic.click();
  await page.getByTestId('forseti-event-settings-basic-settings-event-ruleset').click();
  await page.getByRole('option', { name: 'Russian Riichi Community rules', exact: true }).click();
  await yaku.click();
  await expect(checkbox).not.toBeChecked();
});

test('Saving existing event settings preserves allowed and excluded yaku in both modes', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator] = await createTestAccounts(request, 1);
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
  const presetsResponse = await request.post(`${mimir}/GetRulesets`, { data: {}, headers });
  await expect(presetsResponse).toBeOK();
  const { rulesets, rulesetIds } = await presetsResponse.json();
  const ruleset = rulesets[rulesetIds.indexOf('rrc')];
  const title = `TEST yaku preservation ${randomUUID()}`;
  const created = await request.post(`${mimir}/CreateEvent`, {
    headers,
    data: {
      requestId: randomUUID(),
      title,
      type: 'EVENT_TYPE_LOCAL',
      timezone: 'Europe/Moscow',
      duration: 75,
      rulesetConfig: ruleset,
    },
  });
  await expect(created).toBeOK();
  const { eventId } = await created.json();
  await page.goto(process.env.FORSETI_URL!);
  await page.getByTestId('forseti-login-email').fill(administrator.email);
  await page.getByTestId('forseti-login-password').fill(administrator.password);
  await page.getByTestId('forseti-login-submit').click();
  await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
  const editUrl = `${process.env.FORSETI_URL}/ownedEvents/edit/${eventId}`;
  // Save once without visiting the yaku tab, then save each mode without editing any yaku.
  for (const aggregated of [undefined, true, false]) {
    await page.goto(editUrl);
    await expect(page.getByTestId('forseti-event-settings-basic-settings-event-title')).toHaveValue(
      title
    );
    await expect(page.getByTestId('forseti-event-settings-save')).toBeEnabled();
    if (aggregated !== undefined) {
      await page.getByTestId('forseti-event-settings-tab-yaku').click();
      const allowed = page.getByTestId(/^forseti-event-settings-yaku-allowed-/);
      for (const checkbox of await allowed.all()) {
        const id = Number((await checkbox.getAttribute('data-testid'))!.split('-').at(-1));
        await expect(checkbox).toBeChecked({ checked: ruleset.allowedYaku.includes(id) });
      }
      await page.getByTestId('forseti-event-settings-yakuhai-aggregated').setChecked(aggregated);
      for (const id of [13, 14, 15, 16, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58]) {
        const visible = aggregated ? id < 48 : id >= 48 && ![49, 51, 53, 55].includes(id);
        const checkbox = page.getByTestId(`forseti-event-settings-yaku-allowed-${id}`);
        await expect(checkbox).toHaveCount(visible ? 1 : 0);
        if (visible) await expect(checkbox).toBeChecked();
      }
    }
    const [saved] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/common.Mimir/UpdateEvent') && r.request().method() === 'POST'
      ),
      page.getByTestId('forseti-event-settings-save').click(),
    ]);
    expect(saved.ok()).toBe(true);
    const persisted = await request.post(`${mimir}/GetEventForEdit`, {
      headers,
      data: { id: eventId },
    });
    await expect(persisted).toBeOK();
    const { event } = await persisted.json();
    for (const field of ['allowedYaku', 'yakuWithPao', 'doubleYakuman']) {
      expect([...(event.rulesetConfig[field] ?? [])].sort((a, b) => a - b)).toEqual(
        [...(ruleset[field] ?? [])].sort((a, b) => a - b)
      );
    }
    expect(event.rulesetConfig.withKuitan).toBe(ruleset.withKuitan);
    expect(event.rulesetConfig.withMultiYakumans).toBe(ruleset.withMultiYakumans);
    expect(event.rulesetConfig.useAggregatedYakuhai ?? false).toBe(aggregated ?? false);
  }
  // Each of the four wind controls must persist both underlying yaku together.
  for (const enabled of [false, true]) {
    await page.goto(editUrl);
    await expect(page.getByTestId('forseti-event-settings-save')).toBeEnabled();
    await page.getByTestId('forseti-event-settings-tab-yaku').click();
    for (const seat of [48, 50, 52, 54]) {
      const checkbox = page.getByTestId(`forseti-event-settings-yaku-allowed-${seat}`);
      await expect(checkbox).toBeChecked({ checked: !enabled });
      await checkbox.setChecked(enabled);
      await expect(page.getByTestId(`forseti-event-settings-yaku-allowed-${seat + 1}`)).toHaveCount(
        0
      );
    }
    const [saved] = await Promise.all([
      page.waitForResponse(
        (r) => r.url().endsWith('/common.Mimir/UpdateEvent') && r.request().method() === 'POST'
      ),
      page.getByTestId('forseti-event-settings-save').click(),
    ]);
    expect(saved.ok()).toBe(true);
    const persisted = await request.post(`${mimir}/GetEventForEdit`, {
      headers,
      data: { id: eventId },
    });
    await expect(persisted).toBeOK();
    const { event } = await persisted.json();
    const expected = ruleset.allowedYaku.filter((id: number) => enabled || id < 48 || id > 55);
    expect([...event.rulesetConfig.allowedYaku].sort((a, b) => a - b)).toEqual(
      [...expected].sort((a, b) => a - b)
    );
  }
  await page.reload();
  await expect(page.getByTestId('forseti-event-settings-save')).toBeEnabled();
  await page.getByTestId('forseti-event-settings-tab-yaku').click();
  for (const seat of [48, 50, 52, 54])
    await expect(page.getByTestId(`forseti-event-settings-yaku-allowed-${seat}`)).toBeChecked();
});
