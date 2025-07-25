import * as Frey from '../clients/proto/frey.pb';
import { client } from 'twirpscript';
import { readFile } from 'fs/promises';
import { v4 } from 'uuid';

export async function createUser(frey: typeof Frey, email: string) {
  const adminCreds = await getAdminCreds();
  const result = await frey.CreateAccount(
    {
      city: 'testcity',
      country: 'testcountry',
      email,
      password: '123456',
      phone: '123321',
      tenhouId: 'sometenhou',
      title: 'Test Account',
    },
    {
      headers: { 'x-current-person-id': adminCreds.id.toString(), 'x-auth-token': adminCreds.hash },
    }
  );

  return frey
    .Authorize({
      email,
      password: '123456',
    })
    .then((auth) => ({
      createdId: result.personId,
      personId: auth.personId,
      authToken: auth.authToken,
    }));
}

export function makeFreyClient() {
  client.baseURL = 'http://localhost:4304';
  client.prefix = '/v2';
  return Frey;
}

export function makeUniqueEmail() {
  return v4() + '@test.com';
}

export async function getAdminCreds() {
  const json = await readFile('/tmp/admin_creds.json', { encoding: 'utf8' });
  return JSON.parse(json) as { id: number; hash: string };
}
