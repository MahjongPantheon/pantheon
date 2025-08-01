import { ActionNotAllowedError, NotFoundError } from '../../helpers/errors';
import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import { Rights } from '../../helpers/rights';

describe('Delete rules for person', () => {
  const frey = makeFreyClient();
  let adminAuthData: { personId: number; authToken: string; createdId?: number };
  let adminRuleId: number;

  beforeAll(async () => {
    const email = makeUniqueEmail();
    adminAuthData = await createUser(frey, email);
    adminRuleId = (
      await frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: adminAuthData.personId,
          eventId: 100,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).ruleId;
  });

  it('should not remove non-existing rule', async () => {
    return expect(() =>
      frey.DeleteRuleForPerson(
        {
          ruleId: 100500,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).rejects.toEqual(new NotFoundError('Rule does not exist'));
  });

  it('should remove admin rule for another user', async () => {
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);

    const ruleId = (
      await frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 100,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).ruleId;

    return expect(() =>
      frey.DeleteRuleForPerson(
        {
          ruleId,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ success: true });
  });

  it('should not remove rule for another user if user is not admin', async () => {
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);
    const email3 = makeUniqueEmail();
    const authData3 = await createUser(frey, email3);

    const ruleId = (
      await frey.AddRuleForPerson(
        {
          ruleName: Rights.ADMIN_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 100,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).ruleId;

    // try removing rule by one who's not an admin
    return expect(() =>
      frey.DeleteRuleForPerson(
        {
          ruleId,
        },
        {
          headers: {
            'x-current-person-id': authData3.personId.toString(),
            'x-auth-token': authData3.authToken,
          },
        }
      )
    ).rejects.toEqual(
      new ActionNotAllowedError('You are not allowed to remove administrators from this event')
    );
  });

  it('should not remove myself from administrators', async () => {
    return expect(() =>
      frey.DeleteRuleForPerson(
        {
          ruleId: adminRuleId,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).rejects.toEqual(
      new ActionNotAllowedError(
        'You are not allowed to remove yourself from administrators in this event'
      )
    );
  });

  it('should remove referree rule for another user', async () => {
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);

    const ruleId = (
      await frey.AddRuleForPerson(
        {
          ruleName: Rights.REFEREE_FOR_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 100,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).ruleId;

    return expect(() =>
      frey.DeleteRuleForPerson(
        { ruleId },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ success: true });
  });

  it('should not remove referee rule for another user if user is not admin', async () => {
    const email2 = makeUniqueEmail();
    const authData2 = await createUser(frey, email2);
    const email3 = makeUniqueEmail();
    const authData3 = await createUser(frey, email3);

    const ruleId = (
      await frey.AddRuleForPerson(
        {
          ruleName: Rights.REFEREE_FOR_EVENT,
          ruleValue: 1,
          personId: authData2.personId,
          eventId: 100,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).ruleId;

    // try removing rule by one who's not an admin
    return expect(() =>
      frey.DeleteRuleForPerson(
        { ruleId },
        {
          headers: {
            'x-current-person-id': authData3.personId.toString(),
            'x-auth-token': authData3.authToken,
          },
        }
      )
    ).rejects.toEqual(
      new ActionNotAllowedError('You are not allowed to remove referees from this event')
    );
  });

  it('should remove myself as referee if I am an admin (useless but anyway)', async () => {
    const ruleId = (
      await frey.AddRuleForPerson(
        {
          ruleName: Rights.REFEREE_FOR_EVENT,
          ruleValue: 1,
          personId: adminAuthData.personId,
          eventId: 100,
        },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).ruleId;

    return expect(() =>
      frey.DeleteRuleForPerson(
        { ruleId },
        {
          headers: {
            'x-current-person-id': adminAuthData.personId.toString(),
            'x-auth-token': adminAuthData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ success: true });
  });
});
