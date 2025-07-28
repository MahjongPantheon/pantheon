// GetMajsoulNicknames;

import { createUser, makeFreyClient, makeUniqueEmail } from '../helpers';
import { Rights } from '../../helpers/rights';

describe('Get misc data', () => {
  const frey = makeFreyClient();

  let adminAuthData: { personId: number; authToken: string; createdId?: number };
  let anotherAdminData: { personId: number; authToken: string; createdId?: number };
  let refereeData: { personId: number; authToken: string; createdId?: number };

  beforeAll(async () => {
    const email = makeUniqueEmail();
    adminAuthData = await createUser(frey, email);

    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: adminAuthData.personId,
        eventId: 200,
      },
      {
        headers: {
          'x-current-person-id': adminAuthData.personId.toString(),
          'x-auth-token': adminAuthData.authToken,
        },
      }
    );

    // Add majsoul nickname
    await frey.UpdatePersonalInfo(
      {
        avatarData: '',
        email,
        hasAvatar: false,
        id: adminAuthData.personId,
        msAccountId: 333111,
        msFriendId: 333111,
        msNickname: 'adminaccount',
        city: 'testcity123',
        country: 'testcountry123',
        phone: '333111',
        tenhouId: '333111',
        title: 'Admin account',
      },
      {
        headers: {
          'x-current-person-id': adminAuthData.personId.toString(),
          'x-auth-token': adminAuthData.authToken,
        },
      }
    );

    const email2 = makeUniqueEmail();
    anotherAdminData = await createUser(frey, email2);

    await frey.AddRuleForPerson(
      {
        ruleName: Rights.ADMIN_EVENT,
        ruleValue: 1,
        personId: anotherAdminData.personId,
        eventId: 200,
      },
      {
        headers: {
          'x-current-person-id': adminAuthData.personId.toString(),
          'x-auth-token': adminAuthData.authToken,
        },
      }
    );

    // Add majsoul nickname
    await frey.UpdatePersonalInfo(
      {
        avatarData: '',
        email,
        hasAvatar: false,
        id: anotherAdminData.personId,
        msAccountId: 333222,
        msFriendId: 333222,
        msNickname: 'anotheradminaccount',
        city: 'testcity123',
        country: 'testcountry123',
        phone: '333111222',
        tenhouId: '333111222',
        title: 'Another admin account',
      },
      {
        headers: {
          'x-current-person-id': anotherAdminData.personId.toString(),
          'x-auth-token': anotherAdminData.authToken,
        },
      }
    );

    const email3 = makeUniqueEmail();
    refereeData = await createUser(frey, email3);

    await frey.AddRuleForPerson(
      {
        ruleName: Rights.REFEREE_FOR_EVENT,
        ruleValue: 1,
        personId: refereeData.personId,
        eventId: 200,
      },
      {
        headers: {
          'x-current-person-id': adminAuthData.personId.toString(),
          'x-auth-token': adminAuthData.authToken,
        },
      }
    );

    // Add majsoul nickname
    await frey.UpdatePersonalInfo(
      {
        avatarData: '',
        email,
        hasAvatar: false,
        id: refereeData.personId,
        msAccountId: 333333,
        msFriendId: 333333,
        msNickname: 'refereeeaccount',
        city: 'testcity123',
        country: 'testcountry123',
        phone: '333333',
        tenhouId: '333333',
        title: 'Refereee account',
      },
      {
        headers: {
          'x-current-person-id': refereeData.personId.toString(),
          'x-auth-token': refereeData.authToken,
        },
      }
    );
  });

  it('should get event admins', async () => {
    return expect(() =>
      frey.GetEventAdmins({
        eventId: 200,
      })
    ).resolves.toEqual({
      admins: [
        {
          hasAvatar: false,
          lastUpdate: expect.anything(),
          personId: adminAuthData.personId,
          personName: expect.anything(),
          ruleId: expect.anything(),
        },
        {
          hasAvatar: false,
          lastUpdate: expect.anything(),
          personId: anotherAdminData.personId,
          personName: expect.anything(),
          ruleId: expect.anything(),
        },
      ],
    });
  });

  it('should get event referees', async () => {
    return expect(() =>
      frey.GetEventReferees({
        eventId: 200,
      })
    ).resolves.toEqual({
      referees: [
        {
          hasAvatar: false,
          lastUpdate: expect.anything(),
          personId: refereeData.personId,
          personName: expect.anything(),
          ruleId: expect.anything(),
        },
      ],
    });
  });

  it('should get owned event for original admin', async () => {
    return expect(() =>
      frey.GetOwnedEventIds({
        personId: adminAuthData.personId,
      })
    ).resolves.toEqual({ eventIds: [200] });
  });

  it('should get owned event for another admin', async () => {
    return expect(() =>
      frey.GetOwnedEventIds({
        personId: anotherAdminData.personId,
      })
    ).resolves.toEqual({ eventIds: [200] });
  });

  it('should get owned event for referee', async () => {
    return expect(() =>
      frey.GetOwnedEventIds({
        personId: refereeData.personId,
      })
    ).resolves.toEqual({ eventIds: [200] });
  });

  it('should get majsoul data', async () => {
    return expect(() =>
      frey.GetMajsoulNicknames({
        ids: [adminAuthData.personId, anotherAdminData.personId, refereeData.personId],
      })
    ).resolves.toEqual({
      mapping: [
        {
          nickname: 'adminaccount',
          personId: 2,
        },
        {
          nickname: 'anotheradminaccount',
          personId: 3,
        },
        {
          nickname: 'refereeeaccount',
          personId: 4,
        },
      ],
    });
  });
});
