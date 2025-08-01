import { createUser, getAdminCreds, makeFreyClient, makeUniqueEmail } from '../helpers';

describe('Search for users', () => {
  const frey = makeFreyClient();

  beforeAll(async () => {
    const adminCreds = await getAdminCreds();
    const { personId: p1 } = await frey.CreateAccount(
      {
        city: 'testcity',
        country: 'testcountry',
        email: makeUniqueEmail(),
        password: '123456',
        phone: '123321',
        tenhouId: 'davig1',
        title: 'David Guetta',
      },
      {
        headers: {
          'x-current-person-id': adminCreds.id.toString(),
          'x-auth-token': adminCreds.hash,
        },
      }
    );
    await frey.UpdatePersonalInfo(
      {
        city: 'testcity',
        country: 'testcountry',
        email: makeUniqueEmail(),
        avatarData: '',
        hasAvatar: false,
        id: p1,
        phone: '123321',
        tenhouId: 'davig1',
        title: 'David Guetta',
        msNickname: 'davig2',
        msFriendId: 123,
        msAccountId: 321,
      },
      {
        headers: {
          'x-current-person-id': adminCreds.id.toString(),
          'x-auth-token': adminCreds.hash,
        },
      }
    );
    const { personId: p2 } = await frey.CreateAccount(
      {
        city: 'testcity',
        country: 'testcountry',
        email: makeUniqueEmail(),
        password: '123456',
        phone: '123321',
        tenhouId: 'davij1',
        title: 'David Johnson',
      },
      {
        headers: {
          'x-current-person-id': adminCreds.id.toString(),
          'x-auth-token': adminCreds.hash,
        },
      }
    );
    await frey.UpdatePersonalInfo(
      {
        city: 'testcity',
        country: 'testcountry',
        email: makeUniqueEmail(),
        avatarData: '',
        hasAvatar: false,
        id: p2,
        phone: '123321',
        tenhouId: 'davij1',
        title: 'David Johnson',
        msNickname: 'davij2',
        msFriendId: 345,
        msAccountId: 543,
      },
      {
        headers: {
          'x-current-person-id': adminCreds.id.toString(),
          'x-auth-token': adminCreds.hash,
        },
      }
    );
  });

  it('should find users by title', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.FindByTitle(
        { query: 'Davi' },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({
      people: [
        {
          city: 'testcity',
          tenhouId: 'davig1',
          title: 'David Guetta',
        },
        {
          city: 'testcity',
          tenhouId: 'davij1',
          title: 'David Johnson',
        },
      ],
    });
  });

  it('should find users by tenhou id', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.FindByTenhouIds(
        { ids: ['davig1', 'davij1'] },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({
      people: [
        {
          city: 'testcity',
          tenhouId: 'davig1',
          title: 'David Guetta',
        },
        {
          city: 'testcity',
          tenhouId: 'davij1',
          title: 'David Johnson',
        },
      ],
    });
  });

  it('should find users by tenhou id with private data as superadmin', async () => {
    const adminCreds = await getAdminCreds();
    return expect(() =>
      frey.FindByTenhouIds(
        { ids: ['davig1', 'davij1'] },
        {
          headers: {
            'x-current-person-id': adminCreds.id.toString(),
            'x-auth-token': adminCreds.hash,
          },
        }
      )
    ).resolves.toMatchObject({
      people: [
        {
          city: 'testcity',
          tenhouId: 'davig1',
          title: 'David Guetta',
          email: expect.anything(),
          phone: '123321',
        },
        {
          city: 'testcity',
          tenhouId: 'davij1',
          title: 'David Johnson',
          email: expect.anything(),
          phone: '123321',
        },
      ],
    });
  });

  it('should find users by majsoul nickname', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.FindByMajsoulAccountId(
        {
          ids: [
            { nickname: 'davig2', accountId: 0 },
            { nickname: 'davij2', accountId: 1 },
          ],
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({
      people: [
        {
          city: 'testcity',
          tenhouId: 'davig1',
          title: 'David Guetta',
          msNickname: 'davig2',
          msAccountId: 321,
        },
        {
          city: 'testcity',
          tenhouId: 'davij1',
          title: 'David Johnson',
          msNickname: 'davij2',
          msAccountId: 543,
        },
      ],
    });
  });

  it('should find users by majsoul nickname with personal data as superadmin', async () => {
    const adminCreds = await getAdminCreds();
    return expect(() =>
      frey.FindByMajsoulAccountId(
        {
          ids: [
            { nickname: 'davig2', accountId: 0 },
            { nickname: 'davij2', accountId: 1 },
          ],
        },
        {
          headers: {
            'x-current-person-id': adminCreds.id.toString(),
            'x-auth-token': adminCreds.hash,
          },
        }
      )
    ).resolves.toMatchObject({
      people: [
        {
          city: 'testcity',
          tenhouId: 'davig1',
          title: 'David Guetta',
          email: expect.anything(),
          phone: '123321',
          msNickname: 'davig2',
          msAccountId: 321,
        },
        {
          city: 'testcity',
          tenhouId: 'davij1',
          title: 'David Johnson',
          email: expect.anything(),
          phone: '123321',
          msNickname: 'davij2',
          msAccountId: 543,
        },
      ],
    });
  });
});
