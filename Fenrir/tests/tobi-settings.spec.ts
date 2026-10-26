import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { EventData, GenericEventPayload } from '../../Common/tsclients/proto/atoms.pb';
import { EventsUpdateEventPayload } from '../../Common/tsclients/proto/mimir.pb';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

// Case: ../testcases/settings-001-tobi-persistence.md
test('SETTINGS-001: Administrator can save and reload the tobi setting', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const [administrator] = await createTestAccounts(request, 1);
  const authorized = await request.post(`${process.env.FREY_URL}/v2/common.Frey/Authorize`, {
    data: administrator,
  });
  await expect(authorized).toBeOK();
  const credentials = await authorized.json();
  const headers = {
    'X-Current-Person-Id': String(credentials.personId),
    'X-Auth-Token': credentials.authToken,
  };
  const title = `TEST SETTINGS-001 ${randomUUID()}`;
  const checkbox = page.getByTestId('forseti-event-settings-ruleset-settings-ruleset-with-tobi');
  let eventId: number;

  async function assertPersisted(enabled: boolean) {
    const persisted = await request.post(
      `${process.env.MIMIR_URL}/v2/common.Mimir/GetEventForEdit`,
      {
        headers,
        data: { id: eventId },
      }
    );
    await expect(persisted).toBeOK();
    const { event } = await persisted.json();
    expect(event.rulesetConfig.withTobi ?? false).toBe(enabled);
    expect(event.rulesetConfig).not.toHaveProperty('withButtobi');
    await page.goto(`${process.env.FORSETI_URL}/ownedEvents/edit/${eventId}`);
    await expect(page.getByTestId('forseti-event-settings-basic-settings-event-title')).toHaveValue(
      title
    );
    await page.getByTestId('forseti-event-settings-tab-ruleset').click();
    await expect(checkbox).toBeChecked({ checked: enabled });
  }

  await test.step('Log in and create a local event with tobi enabled', async () => {
    await page.goto(process.env.FORSETI_URL!);
    await page.getByTestId('forseti-login-email').fill(administrator.email);
    await page.getByTestId('forseti-login-password').fill(administrator.password);
    await page.getByTestId('forseti-login-submit').click();
    await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
    await page.getByTestId('forseti-menu-sidebar-create-event').click();
    await page.getByTestId('forseti-event-settings-basic-settings-event-title').fill(title);
    await page.getByTestId('forseti-event-settings-event-type-EVENT_TYPE_LOCAL').check();
    await page.getByTestId('forseti-event-settings-basic-settings-event-ruleset').click();
    await page.getByRole('option', { name: 'Russian Riichi Community rules', exact: true }).click();
    await page
      .getByTestId('forseti-event-settings-basic-settings-event-timezone')
      .fill('Europe/Moscow');
    await page.getByRole('option', { name: 'Europe/Moscow', exact: true }).click();
    await page.getByTestId('forseti-event-settings-tab-ruleset').click();
    await checkbox.check();
    const [created] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().endsWith('/common.Mimir/CreateEvent') &&
          response.request().method() === 'POST'
      ),
      page.getByTestId('forseti-event-settings-save').click(),
    ]);
    expect(created.ok()).toBe(true);
    const outgoing = EventData.decode(
      new Uint8Array(created.request().postDataBuffer()!)
    ).rulesetConfig;
    expect(outgoing.withTobi).toBe(true);
    expect(outgoing).not.toHaveProperty('withButtobi');
    eventId = GenericEventPayload.decode(new Uint8Array(await created.body())).eventId;
    await expect(page.getByTestId('forseti-owned-events-page')).toBeVisible();
    await assertPersisted(true);
  });

  for (const enabled of [false, true, false]) {
    await test.step(`Save tobi ${enabled ? 'enabled' : 'disabled'} and reload`, async () => {
      await checkbox.setChecked(enabled);
      const [saved] = await Promise.all([
        page.waitForResponse(
          (response) =>
            response.url().endsWith('/common.Mimir/UpdateEvent') &&
            response.request().method() === 'POST'
        ),
        page.getByTestId('forseti-event-settings-save').click(),
      ]);
      expect(saved.ok()).toBe(true);
      const outgoing = EventsUpdateEventPayload.decode(
        new Uint8Array(saved.request().postDataBuffer()!)
      ).event.rulesetConfig;
      expect(outgoing.withTobi ?? false).toBe(enabled);
      expect(outgoing).not.toHaveProperty('withButtobi');
      await assertPersisted(enabled);
    });
  }
});
