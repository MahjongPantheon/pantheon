import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import { InvalidInputError, NotFoundError } from '../../helpers/errors';

describe('Get my data', () => {
  const frey = makeFreyClient();

  it('should get own data', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
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
      city: 'testcity',
      country: 'testcountry',
      email,
      hasAvatar: false,
      personId: authData.personId,
      phone: '123321',
      tenhouId: 'sometenhou',
      title: 'Test Account',
    });
  });

  it('should not get own data with wrong auth hash', async () => {
    const email = makeUniqueEmail();
    const authData2 = await createUser(frey, email);
    return expect(() =>
      frey.Me(
        {},
        {
          headers: {
            'x-current-person-id': authData2.personId.toString(),
            'x-auth-token': 'wrong_hash',
          },
        }
      )
    ).rejects.toEqual(new InvalidInputError('Password check failed'));
  });

  it('should not get data of non-existing user', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.Me(
        {},
        {
          headers: {
            'x-current-person-id': '100500',
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).rejects.toEqual(new NotFoundError('Person is not known to the system'));
  });
});
