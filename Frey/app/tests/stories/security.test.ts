import { createUser, getAdminCreds, makeFreyClient, makeUniqueEmail } from '../helpers';
import { InvalidInputError } from '../../helpers/errors';

describe('Identity permission boundaries', () => {
  const frey = makeFreyClient();

  it.each([undefined, 'wrong'])(
    'rejects account creation with a claimed admin ID and token %s',
    async (token) => {
      const admin = await getAdminCreds();
      await expect(
        frey.CreateAccount(
          {
            email: makeUniqueEmail(),
            password: '123456',
            title: 'Test',
            city: '',
            country: '',
            phone: '',
            tenhouId: '',
          },
          {
            headers: {
              'x-current-person-id': String(admin.id),
              ...(token ? { 'x-auth-token': token } : {}),
            },
          }
        )
      ).rejects.toEqual(new InvalidInputError('Password check failed'));
    }
  );

  it.each([true, false])('limits self-access within a batch, self first: %s', async (selfFirst) => {
    const email = makeUniqueEmail();
    const caller = await createUser(frey, email);
    const other = await createUser(frey, makeUniqueEmail());
    const ids = selfFirst ? [caller.personId, other.personId] : [other.personId, caller.personId];
    const { people } = await frey.GetPersonalInfo(
      { ids },
      {
        headers: {
          'x-current-person-id': String(caller.personId),
          'x-auth-token': caller.authToken,
        },
      }
    );
    expect(people.find((person) => person.id === caller.personId)).toMatchObject({
      email,
      phone: '123321',
    });
    expect(people.find((person) => person.id === other.personId)).toMatchObject({
      email: '',
      phone: '',
    });
  });

  it.each([0, 1])('honors private-data permission value %i', async (ruleValue) => {
    const admin = await getAdminCreds();
    const caller = await createUser(frey, makeUniqueEmail());
    const email = makeUniqueEmail();
    const other = await createUser(frey, email);
    await frey.AddRuleForPerson(
      {
        personId: caller.personId,
        eventId: -1,
        ruleName: 'GET_PERSONAL_INFO_WITH_PRIVATE_DATA',
        ruleValue,
      },
      { headers: { 'x-current-person-id': String(admin.id), 'x-auth-token': admin.hash } }
    );
    const options = {
      headers: { 'x-current-person-id': String(caller.personId), 'x-auth-token': caller.authToken },
    };
    const expected = {
      email: ruleValue === 1 ? email : '',
      phone: ruleValue === 1 ? '123321' : '',
    };
    expect(
      (await frey.GetPersonalInfo({ ids: [other.personId] }, options)).people[0]
    ).toMatchObject(expected);
    expect(
      (await frey.FindByTenhouIds({ ids: ['sometenhou'] }, options)).people.find(
        (person) => person.id === other.personId
      )
    ).toMatchObject(expected);
  });
});
