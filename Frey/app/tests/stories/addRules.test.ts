import { ActionNotAllowedError, InvalidInputError, NotFoundError } from '../../helpers/errors';
import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import { Rights } from '../../helpers/rights';

describe('Add rules for person', () => {
  const frey = makeFreyClient();

  it('should add admin rule for existing user for new event', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);

    // Adding myself to event admins, when there is no admins - should work fine
    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData.personId,
          eventId: 1,
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ ruleId: expect.anything() });
  });

  it('should not add rule for non-existing user for new event', async () => {
    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: 100500,
          eventId: 2,
        },
        {
          headers: {
            'x-current-person-id': '100500',
            'x-auth-token': '123456',
          },
        }
      )
    ).rejects.toEqual(new NotFoundError('Person is not known ot the system'));
  });

  it('should not add rule with wrong client hash for new event', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);

    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData.personId,
          eventId: 3,
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': '123456',
          },
        }
      )
    ).rejects.toEqual(new InvalidInputError('Password check failed'));
  });

  it('should add admin rule for another user', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);

    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: authData.personId,
        eventId: 4,
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );

    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 4,
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ ruleId: expect.anything() });
  });

  it('should not add admin rule for another user if user is not admin', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);
    const email3 = makeUniqueEmail();
    const authData3 = await createUser(frey, email3);

    // bootstrapping
    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: authData.personId,
        eventId: 5,
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );

    // try adding another user as admin by one who's not an admin
    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 5,
        },
        {
          headers: {
            'x-current-person-id': authData3.personId.toString(),
            'x-auth-token': authData3.authToken,
          },
        }
      )
    ).rejects.toEqual(
      new ActionNotAllowedError('You are not allowed to add administrators in this event')
    );
  });

  it('should not add myself as admin if I am already an admin', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);

    // bootstrapping
    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: authData.personId,
        eventId: 6,
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );

    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData.personId,
          eventId: 6,
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).rejects.toEqual(
      new ActionNotAllowedError(
        'You are not allowed to add yourself to administrators in this event'
      )
    );
  });

  it('should not add myself as admin if I am not an admin', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);

    // bootstrapping
    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: authData.personId,
        eventId: 7,
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );

    // add myself as admin but I'm not admin
    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 7,
        },
        {
          headers: {
            'x-current-person-id': authData2.personId.toString(),
            'x-auth-token': authData2.authToken,
          },
        }
      )
    ).rejects.toEqual(
      new ActionNotAllowedError(
        'You are not allowed to add yourself to administrators in this event'
      )
    );
  });

  it('should add referree rule for another user', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);

    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: authData.personId,
        eventId: 8,
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );

    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.REFEREE_FOR_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 8,
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ ruleId: expect.anything() });
  });

  it('should not add referee rule for another user if user is not admin', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);
    const email3 = makeUniqueEmail();
    const authData3 = await createUser(frey, email3);

    // bootstrapping
    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: authData.personId,
        eventId: 9,
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );

    // try adding another user as referee by one who's not an admin
    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.REFEREE_FOR_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 9,
        },
        {
          headers: {
            'x-current-person-id': authData3.personId.toString(),
            'x-auth-token': authData3.authToken,
          },
        }
      )
    ).rejects.toEqual(
      new ActionNotAllowedError('You are not allowed to add referees in this event')
    );
  });

  it('should add myself as referee if I am an admin (useless but anyway)', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);

    // bootstrapping
    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: authData.personId,
        eventId: 11,
      },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );

    return expect(() =>
      frey.AddRuleForPerson(
        {
          ruleName: Rights.REFEREE_FOR_EVENT,
          ruleValue: 1,
          personId: authData.personId,
          eventId: 11,
        },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ ruleId: expect.anything() });
  });
});
