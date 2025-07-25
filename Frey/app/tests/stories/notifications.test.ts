import { createUser, getAdminCreds, makeFreyClient, makeUniqueEmail } from '../helpers';
import { ActionNotAllowedError, NotFoundError } from '../../helpers/errors';

describe('Notifications', () => {
  const frey = makeFreyClient();

  it('should update own notifications settings', async () => {
    const email = makeUniqueEmail();
    const authData = await createUser(frey, email);
    return expect(() =>
      frey.SetNotificationsSettings(
        { personId: authData.personId, notifications: 'some_string', telegramId: 'some_id' },
        {
          headers: {
            'x-current-person-id': authData.personId.toString(),
            'x-auth-token': authData.authToken,
          },
        }
      )
    ).resolves.toMatchObject({ success: true });
  });

  it('should not update notifications settings of different user', async () => {
    const authData1 = await createUser(frey, makeUniqueEmail());
    const authData2 = await createUser(frey, makeUniqueEmail());
    return expect(() =>
      frey.SetNotificationsSettings(
        { personId: authData1.personId, notifications: 'some_string', telegramId: 'some_id' },
        {
          headers: {
            'x-current-person-id': authData2.personId.toString(),
            'x-auth-token': authData2.authToken,
          },
        }
      )
    ).rejects.toEqual(new ActionNotAllowedError('You can only update your own settings'));
  });

  it('should update notifications settings of different user for superadmin', async () => {
    const adminCreds = await getAdminCreds();
    const authData = await createUser(frey, makeUniqueEmail());
    return expect(() =>
      frey.SetNotificationsSettings(
        { personId: authData.personId, notifications: 'some_string', telegramId: 'some_id' },
        {
          headers: {
            'x-current-person-id': adminCreds.id.toString(),
            'x-auth-token': adminCreds.hash,
          },
        }
      )
    ).resolves.toMatchObject({ success: true });
  });

  it('should not update notifications settings without authorization', async () => {
    const authData1 = await createUser(frey, makeUniqueEmail());
    return expect(() =>
      frey.SetNotificationsSettings({
        personId: authData1.personId,
        notifications: 'some_string',
        telegramId: 'some_id',
      })
    ).rejects.toEqual(new ActionNotAllowedError('Should be logged in to use this function'));
  });

  it('should not update notifications settings for non-existing user', async () => {
    const adminCreds = await getAdminCreds();
    return expect(() =>
      frey.SetNotificationsSettings(
        { personId: 100500, notifications: 'some_string', telegramId: 'some_id' },
        {
          headers: {
            'x-current-person-id': adminCreds.id.toString(),
            'x-auth-token': adminCreds.hash,
          },
        }
      )
    ).rejects.toEqual(new NotFoundError('Person is not known to the system'));
  });

  it('should update and get notifications settings', async () => {
    const authData = await createUser(frey, makeUniqueEmail());
    await frey.SetNotificationsSettings(
      { personId: authData.personId, notifications: 'some_string', telegramId: 'some_id' },
      {
        headers: {
          'x-current-person-id': authData.personId.toString(),
          'x-auth-token': authData.authToken,
        },
      }
    );
    return expect(() =>
      frey.GetNotificationsSettings({ personId: authData.personId })
    ).resolves.toMatchObject({ notifications: 'some_string', telegramId: 'some_id' });
  });
});
