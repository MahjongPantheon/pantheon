import { createHash } from 'node:crypto';
import { createDbConstructor } from '../../database/db';
import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import { InvalidInputError, NotFoundError } from '../../helpers/errors';

describe('Reset password', () => {
  const frey = makeFreyClient();
  const db = createDbConstructor(true)();
  afterAll(() => db.destroy());

  it('should request password reset', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    return expect(
      frey.RequestResetPassword({
        email,
      })
    ).resolves.toMatchObject({
      resetToken: expect.anything(),
    });
  });

  it('should not request password reset for non-existing user', async () => {
    const email = makeUniqueEmail();
    return expect(
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

    return expect(frey.ApproveResetPassword({ email, resetToken })).resolves.toMatchObject({
      newTmpPassword: expect.anything(),
    });
  });

  it('should not reset password for unknown email', async () => {
    return expect(
      frey.ApproveResetPassword({ email: 'unknown_email_123@test.com', resetToken: '12345' })
    ).rejects.toEqual(new NotFoundError('Email is not known to the system'));
  });

  it('should not reset password if token is wrong', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);

    return expect(frey.ApproveResetPassword({ email, resetToken: 'ololo' })).rejects.toEqual(
      new InvalidInputError('Password reset approval code is incorrect.')
    );
  });
  it('does not derive reset links from the email and request timestamp', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    const before = Date.now();
    const { resetToken } = await frey.RequestResetPassword({ email });
    const after = Date.now();
    for (let timestamp = before; timestamp <= after; timestamp++) {
      expect(resetToken).not.toBe(
        createHash('sha1')
          .update(email + timestamp.toString())
          .digest('hex')
      );
    }
    const stored = await db
      .selectFrom('person')
      .select(['auth_reset_token', 'auth_reset_expires_at'])
      .where('email', '=', email)
      .executeTakeFirstOrThrow();
    expect(stored.auth_reset_token).not.toBe(resetToken);
    expect(new Date(stored.auth_reset_expires_at!).getTime()).toBeGreaterThan(after);
    expect(new Date(stored.auth_reset_expires_at!).getTime()).toBeLessThanOrEqual(
      after + 60 * 60 * 1000
    );
  });

  it('invalidates the previous token when a new reset is requested', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    const first = await frey.RequestResetPassword({ email });
    const second = await frey.RequestResetPassword({ email });
    expect(second.resetToken).not.toBe(first.resetToken);
    await expect(
      frey.ApproveResetPassword({ email, resetToken: first.resetToken })
    ).rejects.toEqual(new InvalidInputError('Password reset approval code is incorrect.'));
    await expect(
      frey.ApproveResetPassword({ email, resetToken: second.resetToken })
    ).resolves.toMatchObject({ newTmpPassword: expect.any(String) });
  });

  it('allows only one concurrent redemption of a reset token', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    const { resetToken } = await frey.RequestResetPassword({ email });
    const results = await Promise.allSettled([
      frey.ApproveResetPassword({ email, resetToken }),
      frey.ApproveResetPassword({ email, resetToken }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((r) => r.status === 'rejected')).toHaveLength(1);
    const redeemed = results.find((r) => r.status === 'fulfilled');
    if (redeemed?.status !== 'fulfilled') throw new Error('No successful reset');
    await expect(
      frey.Authorize({ email, password: redeemed.value.newTmpPassword })
    ).resolves.toMatchObject({ personId: expect.any(Number) });
    await expect(frey.ApproveResetPassword({ email, resetToken })).rejects.toEqual(
      new InvalidInputError('Password reset approval code is incorrect.')
    );
  });

  it('invalidates a pending reset token on password change', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    const { resetToken } = await frey.RequestResetPassword({ email });
    await frey.ChangePassword({
      email,
      password: '123456',
      newPassword: 'ChangedPassword-987!different',
    });
    await expect(frey.ApproveResetPassword({ email, resetToken })).rejects.toEqual(
      new InvalidInputError('Password reset approval code is incorrect.')
    );
  });

  it('rejects expired reset tokens', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    const { resetToken } = await frey.RequestResetPassword({ email });
    await db
      .updateTable('person')
      .set({ auth_reset_expires_at: new Date(Date.now() - 1000).toISOString() })
      .where('email', '=', email)
      .execute();
    await expect(frey.ApproveResetPassword({ email, resetToken })).rejects.toEqual(
      new InvalidInputError('Password reset approval code is incorrect.')
    );
    await expect(frey.Authorize({ email, password: '123456' })).resolves.toMatchObject({
      personId: expect.any(Number),
    });
  });

  it('rejects legacy reset tokens without expiry', async () => {
    const email = makeUniqueEmail();
    await createUser(frey, email);
    await db
      .updateTable('person')
      .set({ auth_reset_token: 'legacy-token', auth_reset_expires_at: null })
      .where('email', '=', email)
      .execute();
    await expect(frey.ApproveResetPassword({ email, resetToken: 'legacy-token' })).rejects.toEqual(
      new InvalidInputError('Password reset approval code is incorrect.')
    );
  });
});
