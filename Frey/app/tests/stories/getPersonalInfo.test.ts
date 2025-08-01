import { createUser, getAdminCreds, makeFreyClient, makeUniqueEmail } from '../helpers';
import { InvalidInputError } from '../../helpers/errors';

describe('Get personal data', () => {
  const frey = makeFreyClient();

  it('should get personal data by regular user', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.GetPersonalInfo(
        { ids: [authData.personId] },
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
          country: 'testcountry',
          email: '', // should be empty
          hasAvatar: false,
          id: authData.personId,
          phone: '', // should be empty
          tenhouId: 'sometenhou',
          title: 'Test Account',
        },
      ],
    });
  });

  it('should get empty data by regular user for non-existing user', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.GetPersonalInfo(
        { ids: [100500] },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toEqual({
      people: [],
    });
  });

  it('should get personal data by superadmin', async () => {
    const adminCreds = await getAdminCreds();
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.GetPersonalInfo(
        { ids: [authData.personId] },
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
          country: 'testcountry',
          email,
          hasAvatar: false,
          id: authData.personId,
          phone: '123321',
          tenhouId: 'sometenhou',
          title: 'Test Account',
        },
      ],
    });
  });

  it('should not get personal data by superadmin with wrong hash', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    const adminCreds = await getAdminCreds();
    return expect(() =>
      frey.GetPersonalInfo(
        { ids: [authData.personId] },
        {
          headers: {
            'x-current-person-id': adminCreds.id.toString(),
            'x-auth-token': 'wrong_hash',
          },
        }
      )
    ).rejects.toEqual(new InvalidInputError('Password check failed'));
  });
});
