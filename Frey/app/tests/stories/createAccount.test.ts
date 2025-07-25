import { ActionNotAllowedError, ExistsError } from '../../helpers/errors';
import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';

describe('Create Account', () => {
  const frey = makeFreyClient();

  it('should not create new account from api without bootstrap', () => {
    const email = makeUniqueEmail();
    return expect(() =>
      frey.CreateAccount({
        city: 'testcity',
        country: 'testcountry',
        email,
        password: '123456',
        phone: '',
        tenhouId: '',
        title: 'Test Account',
      })
    ).rejects.toEqual(new ActionNotAllowedError('This action is not allowed'));
  });

  it('should login with created account', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    expect(authData.personId).toEqual(authData.createdId);
    expect(authData.authToken).toBeTruthy();
  });

  it('should not create another account with same email', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(() => createUser(frey, email)).rejects.toEqual(
      new ExistsError('This account is already registered')
    );
  });
});
