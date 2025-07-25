import { createUser, getAdminCreds, makeFreyClient, makeUniqueEmail } from '../helpers';

describe('Superadmin flag', () => {
  const frey = makeFreyClient();

  it('should get superadmin flag of regular user', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.GetSuperadminFlag({
        personId: authData.personId,
      })
    ).resolves.toMatchObject({ isAdmin: false });
  });

  it('should not get superadmin flag of non-existing user', async () => {
    return expect(() =>
      frey.GetSuperadminFlag({
        personId: 100500,
      })
    ).resolves.toMatchObject({ isAdmin: false });
  });

  it('should get superadmin flag of superadmin user', async () => {
    const adminCreds = await getAdminCreds();
    return expect(() =>
      frey.GetSuperadminFlag({
        personId: adminCreds.id,
      })
    ).resolves.toMatchObject({ isAdmin: true });
  });
});
