import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('Saving existing event settings preserves allowed and excluded yaku in both modes', async ({
  page,
  request,
}) => {
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
        const visible = aggregated ? id < 48 : id >= 48;
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
});
