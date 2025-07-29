import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import {
  InvalidInputError,
  NotFoundError,
} from '../../helpers/errors';

describe('Reset password', () => {
  const frey = makeFreyClient();

  it('should request password reset', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(() =>
      frey.RequestResetPassword({
        email,
      })
    ).resolves.toMatchObject({
      resetToken: expect.anything(),
    });
  });

  it('should not request password reset for non-existing user', async () => {
    const email = makeUniqueEmail();
    return expect(() =>
      frey.RequestResetPassword({
        email,
      })
    ).rejects.toEqual(new NotFoundError('Email in not known to auth system'));
  });

  it('should use reset token to reset password', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    const { resetToken } = await frey.RequestResetPassword({
      email,
    });

    return expect(() => frey.ApproveResetPassword({ email, resetToken })).resolves.toMatchObject({
      newTmpPassword: expect.anything(),
    });
  });

  it('should not reset password for unknown email', async () => {
    return expect(() =>
      frey.ApproveResetPassword({ email: 'unknown_email_123@test.com', resetToken: '12345' })
    ).rejects.toEqual(new NotFoundError('Email is not known to the system'));
  });

  it('should not reset password if token is wrong', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);

    return expect(() => frey.ApproveResetPassword({ email, resetToken: 'ololo' })).rejects.toEqual(
      new InvalidInputError('Password reset approval code is incorrect.')
    );
  });
});
