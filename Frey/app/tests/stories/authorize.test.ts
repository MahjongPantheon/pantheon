import { InvalidInputError, NotFoundError } from '../../helpers/errors';
import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';

describe('Authorize', () => {
  const frey = makeFreyClient();

  it('should not authorize user with wrong password', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(() =>
      frey.Authorize({
        email,
        password: 'wrong_password',
      })
    ).rejects.toEqual(new InvalidInputError('Password check failed'));
  });

  it('should not authorize non-existing user', async () => {
    const email = makeUniqueEmail();
    return expect(() =>
      frey.Authorize({
        email,
        password: 'wrong_password',
      })
    ).rejects.toEqual(new NotFoundError('Person not found in database'));
  });

  it('should authorize using client hash', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.QuickAuthorize({ personId: authData.personId, authToken: authData.authToken })
    ).resolves.toEqual({ authSuccess: true });
  });

  it('should not authorize using unknown hash', async () => {
    return expect(() => frey.QuickAuthorize({ personId: 1, authToken: '123456' })).rejects.toEqual(
      new InvalidInputError('Password check failed')
    );
  });

  it('should not authorize unknown user', async () => {
    return expect(() =>
      frey.QuickAuthorize({ personId: 100500, authToken: '123456' })
    ).rejects.toEqual(new NotFoundError('Person is not known to the system'));
  });
});
