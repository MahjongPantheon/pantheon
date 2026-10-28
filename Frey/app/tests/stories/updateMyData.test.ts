import { createUser, getAdminCreds, makeFreyClient, makeUniqueEmail } from '../helpers';
import { ActionNotAllowedError, InvalidInputError, NotFoundError } from '../../helpers/errors';

describe('Update my data', () => {
  const frey = makeFreyClient();

  it('should update account', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(
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
    return expect(
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

  it.each(['missing', 'wrong', 'another user'])(
    'should reject a spoofed superadmin profile update with %s token',
    async (tokenKind) => {
      const adminCreds = await getAdminCreds();
      const attacker = await createUser(frey, makeUniqueEmail());
      const headers = {
        'x-current-person-id': adminCreds.id.toString(),
        'x-auth-token': adminCreds.hash,
      };
      const {
        people: [before],
      } = await frey.GetPersonalInfo({ ids: [adminCreds.id] }, { headers });
      const attackerEmail = makeUniqueEmail();

      await expect(
        frey.UpdatePersonalInfo(
          {
            avatarData: '',
            email: attackerEmail,
            hasAvatar: false,
            id: adminCreds.id,
            city: 'changed',
            country: 'changed',
            phone: '',
            tenhouId: '',
            title: 'Changed title',
          },
          {
            headers: {
              'x-current-person-id': adminCreds.id.toString(),
              ...(tokenKind === 'missing'
                ? {}
                : { 'x-auth-token': tokenKind === 'wrong' ? 'wrong' : attacker.authToken }),
            },
          }
        )
      ).rejects.toEqual(
        tokenKind === 'missing'
          ? new ActionNotAllowedError('Should be logged in to use this function')
          : new InvalidInputError('Password check failed')
      );
      await expect(frey.GetPersonalInfo({ ids: [adminCreds.id] }, { headers })).resolves.toEqual({
        people: [before],
      });
      await expect(frey.RequestResetPassword({ email: attackerEmail })).rejects.toEqual(
        new NotFoundError('Email in not known to auth system')
      );
    }
  );

  it.each(['missing', 'wrong'])(
    'should reject an own profile update with %s token',
    async (tokenKind) => {
      const email = makeUniqueEmail();
      const authData = await createUser(frey, email);
      await expect(
        frey.UpdatePersonalInfo(
          {
            avatarData: '',
            email,
            hasAvatar: false,
            id: authData.personId,
            city: 'changed',
            country: 'changed',
            phone: '',
            tenhouId: '',
            title: 'Changed title',
          },
          {
            headers: {
              'x-current-person-id': authData.personId.toString(),
              ...(tokenKind === 'missing' ? {} : { 'x-auth-token': 'wrong' }),
            },
          }
        )
      ).rejects.toEqual(
        tokenKind === 'missing'
          ? new ActionNotAllowedError('Should be logged in to use this function')
          : new InvalidInputError('Password check failed')
      );
      await expect(frey.GetPersonalInfo({ ids: [authData.personId] })).resolves.toMatchObject({
        people: [{ title: 'Test Account' }],
      });
    }
  );

  it('should allow an authenticated superadmin to change a user email', async () => {
    const authData = await createUser(frey, makeUniqueEmail());
    const adminCreds = await getAdminCreds();
    const email = makeUniqueEmail();
    const headers = {
      'x-current-person-id': adminCreds.id.toString(),
      'x-auth-token': adminCreds.hash,
    };
    await expect(
      frey.UpdatePersonalInfo(
        {
          avatarData: '',
          email,
          hasAvatar: false,
          id: authData.personId,
          city: 'changed',
          country: 'changed',
          phone: '',
          tenhouId: '',
          title: 'Changed title',
        },
        { headers }
      )
    ).resolves.toEqual({ success: true });
    await expect(
      frey.GetPersonalInfo({ ids: [authData.personId] }, { headers })
    ).resolves.toMatchObject({ people: [{ email, title: 'Changed title' }] });
  });
});
