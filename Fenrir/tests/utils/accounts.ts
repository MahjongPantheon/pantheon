import { expect, type APIRequestContext } from '@playwright/test';
import { randomInt, randomUUID } from 'node:crypto';
import type {
  AuthApproveRegistrationResponse,
  AuthAuthorizeResponse,
  AuthRequestRegistrationResponse,
  E2eCreateAccountsResponse,
} from '../../../Common/tsclients/proto/frey.pb';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Set ${name} before running account-backed Fenrir tests`);
  }
  return value;
}

// Create ordinary accounts without sharing the browser's authentication state.
export async function createTestAccounts(request: APIRequestContext, count: number) {
  const freyUrl = requiredEnv('FREY_URL').replace(/\/$/, '');
  const people = Array.from({ length: count }, () => ({
    email: `${randomUUID()}@test.com`,
    password: 'SomeStrongPassword123321',
    title: `Test account ${Array.from({ length: 6 }, () =>
      String.fromCharCode(97 + randomInt(26))
    ).join('')}`,
    city: '',
    phone: '',
    tenhouId: '',
    country: '',
  }));
  let personIds: number[];
  if (process.env.E2E_SUPERADMIN_EMAIL || process.env.E2E_SUPERADMIN_PASSWORD) {
    const authorization = await request.post(`${freyUrl}/v2/common.Frey/Authorize`, {
      data: {
        email: requiredEnv('E2E_SUPERADMIN_EMAIL'),
        password: requiredEnv('E2E_SUPERADMIN_PASSWORD'),
      },
    });
    await expect(authorization).toBeOK();
    const credentials: AuthAuthorizeResponse = await authorization.json();
    expect(credentials.personId).toBeGreaterThan(0);
    expect(credentials.authToken).toBeTruthy();
    const response = await request.post(`${freyUrl}/v2/common.Frey/E2eCreateAccounts`, {
      headers: {
        'X-Current-Person-Id': String(credentials.personId),
        'X-Auth-Token': credentials.authToken,
      },
      data: { people },
    });
    await expect(response).toBeOK();
    const created: E2eCreateAccountsResponse = await response.json();
    personIds = created.personIds;
  } else {
    if (!new URL(freyUrl).hostname.endsWith('.pantheon.local')) {
      throw new Error(
        'Development account setup requires a .pantheon.local Frey URL; otherwise configure E2E_SUPERADMIN_EMAIL and E2E_SUPERADMIN_PASSWORD'
      );
    }
    personIds = await Promise.all(
      people.map(async ({ email, password, title }) => {
        const registration = await request.post(`${freyUrl}/v2/common.Frey/RequestRegistration`, {
          data: { email, password, title },
        });
        await expect(registration).toBeOK();
        const pending: AuthRequestRegistrationResponse = await registration.json();
        expect(
          pending.approvalCode,
          'Frey must return a development confirmation code'
        ).toBeTruthy();
        const confirmation = await request.post(`${freyUrl}/v2/common.Frey/ApproveRegistration`, {
          data: { approvalCode: pending.approvalCode },
        });
        await expect(confirmation).toBeOK();
        const account: AuthApproveRegistrationResponse = await confirmation.json();
        return account.personId;
      })
    );
  }
  expect(personIds).toHaveLength(count);
  expect(new Set(personIds).size).toBe(count);
  personIds.forEach((id) => expect(id).toBeGreaterThan(0));
  return people.map((person, index) => ({ ...person, id: personIds[index] }));
}
