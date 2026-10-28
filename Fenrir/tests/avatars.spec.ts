import { test, expect } from '@playwright/test';
import { createTestAccounts } from './utils/accounts';
import { withScreenshotsOnTestFail } from './utils/screenshots';

withScreenshotsOnTestFail();

test('AUTH-005: Account owner can upload an avatar through Frey while direct replacement is denied', async ({
  request,
}) => {
  const [account] = await createTestAccounts(request, 1);
  const frey = `${process.env.FREY_URL}/v2/common.Frey`;
  const storage = process.env.GULLVEIG_URL ?? 'http://gullveig.pantheon.local';
  const authorization = await request.post(`${frey}/Authorize`, {
    data: { email: account.email, password: account.password },
  });
  await expect(authorization).toBeOK();
  const { authToken } = await authorization.json();
  const avatar =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC';
  const headers = { 'X-Current-Person-Id': String(account.id), 'X-Auth-Token': authToken };
  const update = await request.post(`${frey}/UpdatePersonalInfo`, {
    headers,
    data: {
      id: account.id,
      email: account.email,
      title: account.title,
      city: '',
      country: '',
      phone: '',
      tenhouId: '',
      hasAvatar: true,
      avatarData: avatar,
    },
  });
  await expect(update).toBeOK();
  const profile = await request.post(`${frey}/Me`, { headers, data: {} });
  await expect(profile).toBeOK();
  expect(await profile.json()).toMatchObject({ personId: account.id, hasAvatar: true });
  const assetUrl = `${storage}/files/avatars/user_${account.id}.jpg`;
  const asset = await request.get(assetUrl);
  await expect(asset).toBeOK();
  expect(asset.headers()['content-type']).toContain('image/jpeg');
  const original = await asset.body();
  expect(original.length).toBeGreaterThan(0);
  const direct = await request.post(storage, { data: { userId: account.id, avatar } });
  expect(direct.status()).toBe(403);
  const after = await request.get(assetUrl);
  await expect(after).toBeOK();
  expect(await after.body()).toEqual(original);
});
