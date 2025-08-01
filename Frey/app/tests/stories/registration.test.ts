import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import {
  DataMalformedError,
  ExistsError,
  InvalidInputError,
  NotFoundError,
} from '../../helpers/errors';

describe('Registration process', () => {
  const frey = makeFreyClient();

  it('should request registration', async () => {
    const email = makeUniqueEmail();
    return expect(() =>
      frey.RequestRegistration({
        email,
        password: 'testpass123!!',
        title: 'Test user',
      })
    ).resolves.toMatchObject({
      approvalCode: expect.anything(),
    });
  });

  it('should request registration and use approval code to approve', async () => {
    const email = makeUniqueEmail();
    const { approvalCode } = await frey.RequestRegistration({
      email,
      password: 'testpass123!!',
      title: 'Test user',
    });

    return expect(() => frey.ApproveRegistration({ approvalCode })).resolves.toMatchObject({
      personId: expect.anything(),
    });
  });

  it('should not request registration for existing email', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(() =>
      frey.RequestRegistration({
        email,
        password: 'testpass123!!',
        title: 'Test user',
      })
    ).rejects.toEqual(new ExistsError('Already registered'));
  });

  it('should fail to request registration for malformed email', async () => {
    const email = makeUniqueEmail();
    return expect(() =>
      frey.RequestRegistration({
        email,
        password: 'testpass',
        title: 'Test user',
      })
    ).rejects.toEqual(new InvalidInputError('Password is too weak'));
  });

  it('should fail to request registration for weak password', async () => {
    return expect(() =>
      frey.RequestRegistration({
        email: '123123',
        password: 'testpass',
        title: 'Test user',
      })
    ).rejects.toEqual(new DataMalformedError('Email address is malformed'));
  });

  it('should change password', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(() =>
      frey.ChangePassword({
        email,
        password: '123456',
        newPassword: 'testpass123!!',
      })
    ).resolves.toMatchObject({ authToken: expect.anything() });
  });

  it('should not change password if original password is incorrect', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(() =>
      frey.ChangePassword({
        email,
        password: 'incorrect',
        newPassword: 'testpass123!!',
      })
    ).rejects.toEqual(new InvalidInputError('Password check failed'));
  });

  it('should not change password if new password is too weak', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(() =>
      frey.ChangePassword({
        email,
        password: '123456',
        newPassword: 'testpass',
      })
    ).rejects.toEqual(new InvalidInputError('Password is too weak'));
  });

  it('should not change password for non-existing user', async () => {
    const email = makeUniqueEmail();
    return expect(() =>
      frey.ChangePassword({
        email,
        password: '123456',
        newPassword: 'testpass',
      })
    ).rejects.toEqual(new NotFoundError('Email is not known to the system'));
  });
});
