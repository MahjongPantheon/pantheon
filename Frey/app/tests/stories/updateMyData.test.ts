import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';

describe('Update my data', () => {
  const frey = makeFreyClient();

  it('should update account', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.UpdatePersonalInfo(
        {
          avatarData: '',
          email,
          hasAvatar: false,
          id: authData.personId,
          msAccountId: 1231,
          msFriendId: 321,
          msNickname: 'testtest',
          city: 'testcity123',
          country: 'testcountry123',
          phone: '123',
          tenhouId: '321',
          title: 'Test Account123',
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toEqual({ success: true });
  });

  it('should update data and get it back', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    await frey.UpdatePersonalInfo(
      {
        avatarData: '',
        email,
        hasAvatar: false,
        id: authData.personId,
        msAccountId: 1232,
        msFriendId: 321,
        msNickname: 'testtest',
        city: 'testcity123',
        country: 'testcountry123',
        phone: '123',
        tenhouId: '321',
        title: 'Test Account123',
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );
    return expect(() =>
      frey.Me(
        { personId: authData.personId, authToken: authData.authToken },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({
      city: 'testcity123',
      country: 'testcountry123',
      email,
      hasAvatar: false,
      personId: authData.personId,
      phone: '123',
      tenhouId: '321',
      title: 'Test Account123',
    });
  });
});
