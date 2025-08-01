// DepersonalizeAccount;
import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import { ActionNotAllowedError, InvalidInputError, NotFoundError } from '../../helpers/errors';

describe('Depersonalize', () => {
  const frey = makeFreyClient();

  it('should depersonalize existing user', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    await expect(() =>
      frey.DepersonalizeAccount(
        {},
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ success: true });
    return expect(() => frey.GetPersonalInfo({ ids: [authData.personId] })).resolves.toMatchObject({
      people: [
        {
          city: '',
          country: '',
          email: '',
          hasAvatar: false,
          msAccountId: 0,
          msNickname: '',
          notifications: '',
          phone: '',
          telegramId: '',
          tenhouId: '',
          title: expect.stringContaining('[Deleted account '),
        },
      ],
    });
  });

  it('should not depersonalize existing user with wrong hash', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    await expect(() =>
      frey.DepersonalizeAccount(
        {},
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': 'wrong_hash',
          },
        }
      )
    ).rejects.toEqual(new InvalidInputError('Password check failed'));
  });

  it('should not run depersonalize without authorization', async () => {
    await expect(() => frey.DepersonalizeAccount({})).rejects.toEqual(
      new ActionNotAllowedError('Should be logged in to depersonalize')
    );
  });

  it('should not run depersonalize for non-existing-user', async () => {
    await expect(() =>
      frey.DepersonalizeAccount(
        {},
        {
          headers: {
            'x-current-person-id': '100500',
            'x-auth-token': 'wrong_hash',
          },
        }
      )
    ).rejects.toEqual(new NotFoundError('Person not found in database'));
  });
});
