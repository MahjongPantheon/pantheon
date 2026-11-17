import { v4 } from 'uuid';
import { PersonsUpdatePersonalInfoPayload } from 'tsclients/proto/frey.pb';
import { createUser, getAdminCreds, makeFreyClient, makeUniqueEmail } from '../helpers';
import { ExistsError } from '../../helpers/errors';

describe('Ronin ID', () => {
  const frey = makeFreyClient();

  const profile = (
    personId: number,
    email: string,
    extra: Partial<PersonsUpdatePersonalInfoPayload> = {}
  ): PersonsUpdatePersonalInfoPayload => ({
    avatarData: '',
    email,
    hasAvatar: false,
    id: personId,
    city: 'testcity',
    country: 'testcountry',
    phone: '123321',
    tenhouId: 'sometenhou',
    title: 'Test Account',
    ...extra,
  });

  const asAdmin = async () => {
    const adminCreds = await getAdminCreds();
    return {
      headers: {
        'x-current-person-id': adminCreds.id.toString(),
        'x-auth-token': adminCreds.hash,
      },
    };
  };

  const asUser = (authData: { personId: number; authToken: string }) => ({
    headers: {
      'x-current-person-id': authData.personId.toString(),
      'x-auth-token': authData.authToken,
    },
  });

  const findRonin = async (ids: string[]) => frey.FindByRoninIds({ ids }, await asAdmin());

  it('should let a superadmin change a ronin id and keep it across profile updates without one', async () => {
    const email = makeUniqueEmail();
    const first = v4();
    const second = v4();
    const authData = await createUser(frey, email, first);

    await frey.UpdatePersonalInfo(
      profile(authData.personId, email, { roninId: second }),
      await asAdmin()
    );
    await frey.UpdatePersonalInfo(profile(authData.personId, email), asUser(authData));
    await frey.UpdatePersonalInfo(profile(authData.personId, email), await asAdmin());

    await expect(findRonin([first])).resolves.toEqual({ people: [] });
    await expect(
      frey.GetPersonalInfo({ ids: [authData.personId] }, await asAdmin())
    ).resolves.toMatchObject({ people: [{ roninId: second }] });
  });

  it('should let a user set, keep and clear their own ronin id through the profile', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    const roninId = `Ronin_${v4()}`;
    const title = `Ronin${v4().replaceAll('-', '')}`;

    await frey.UpdatePersonalInfo(
      profile(authData.personId, email, { roninId, title }),
      asUser(authData)
    );
    await frey.UpdatePersonalInfo(profile(authData.personId, email, { title }), asUser(authData));

    await expect(frey.Me({}, asUser(authData))).resolves.toMatchObject({ roninId });
    await expect(frey.FindByTitle({ query: title })).resolves.toMatchObject({
      people: [{ id: authData.personId, roninId }],
    });

    await frey.UpdatePersonalInfo(
      profile(authData.personId, email, { roninId: '', title }),
      asUser(authData)
    );
    await expect(findRonin([roninId])).resolves.toEqual({ people: [] });
  });

  it('should refuse a profile ronin id another person holds in any case', async () => {
    const roninId = `Ronin_${v4()}`;
    await createUser(frey, makeUniqueEmail(), roninId);
    const email = makeUniqueEmail();
    const other = await createUser(frey, email);

    await expect(
      frey.UpdatePersonalInfo(
        profile(other.personId, email, { roninId: roninId.toUpperCase(), title: 'Renamed' }),
        asUser(other)
      )
    ).rejects.toEqual(new ExistsError('Ronin ID is already taken'));
    await expect(
      frey.GetPersonalInfo({ ids: [other.personId] }, await asAdmin())
    ).resolves.toMatchObject({ people: [{ title: 'Test Account', roninId: '' }] });
  });

  it('should create an account with a ronin id and refuse a taken one', async () => {
    const roninId = `Ronin_${v4()}`;

    const { personId } = await createUser(frey, makeUniqueEmail(), roninId);

    await expect(findRonin([roninId])).resolves.toMatchObject({ people: [{ id: personId }] });
    await expect(createUser(frey, makeUniqueEmail(), roninId.toLowerCase())).rejects.toEqual(
      new ExistsError('Ronin ID is already taken')
    );
  });

  it('should give one of two concurrent claims of a ronin id and refuse the other', async () => {
    const roninId = v4();
    const firstEmail = makeUniqueEmail();
    const secondEmail = makeUniqueEmail();
    const first = await createUser(frey, firstEmail);
    const second = await createUser(frey, secondEmail);

    const results = await Promise.allSettled([
      frey.UpdatePersonalInfo(profile(first.personId, firstEmail, { roninId }), asUser(first)),
      frey.UpdatePersonalInfo(
        profile(second.personId, secondEmail, { roninId: roninId.toUpperCase() }),
        asUser(second)
      ),
    ]);

    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.find((r) => r.status === 'rejected')).toMatchObject({
      reason: new ExistsError('Ronin ID is already taken'),
    });
  });

  it('should match ronin ids ignoring case and keep the given spelling', async () => {
    const roninId = `Ronin_${v4()}`;
    const email = makeUniqueEmail();
    const holder = await createUser(frey, email, roninId);

    await expect(findRonin([roninId.toLowerCase()])).resolves.toMatchObject({
      people: [{ id: holder.personId, roninId }],
    });

    await frey.UpdatePersonalInfo(
      profile(holder.personId, email, { roninId: roninId.toUpperCase() }),
      asUser(holder)
    );
    await expect(findRonin([roninId])).resolves.toMatchObject({
      people: [{ id: holder.personId, roninId: roninId.toUpperCase() }],
    });
  });

  it('should show the ronin id but hide private data in anonymous lookups', async () => {
    const email = makeUniqueEmail();
    const roninId = v4();
    const authData = await createUser(frey, email, roninId);

    await expect(findRonin([roninId])).resolves.toMatchObject({ people: [{ email }] });
    await expect(frey.FindByRoninIds({ ids: [roninId] })).resolves.toMatchObject({
      people: [{ id: authData.personId, email: '', phone: '' }],
    });
    await expect(frey.GetPersonalInfo({ ids: [authData.personId] })).resolves.toMatchObject({
      people: [{ id: authData.personId, roninId, tenhouId: 'sometenhou', email: '', phone: '' }],
    });
  });

  it('should clear ronin id on depersonalization', async () => {
    const roninId = v4();
    const authData = await createUser(frey, makeUniqueEmail(), roninId);

    await frey.DepersonalizeAccount({}, asUser(authData));

    await expect(findRonin([roninId])).resolves.toEqual({ people: [] });
  });
});
