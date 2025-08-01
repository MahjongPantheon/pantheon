import { createDbConstructor, createRedisConstructor } from '../db';
import { createAccount } from '../../models/persons';
import { Rights } from '../../helpers/rights';

export async function bootstrapAdmin(mockdb?: boolean) {
  const db = createDbConstructor(mockdb)();
  const redisClient = await createRedisConstructor()();

  await db.deleteFrom('person').where('email', '=', 'admin@localhost.localdomain').execute();

  const ret = await createAccount(
    db,
    redisClient,
    {
      city: '',
      country: '',
      email: 'admin@localhost.localdomain',
      password: '123456',
      phone: '',
      tenhouId: '',
      title: 'Adminstrator',
    },
    {
      authToken: '',
      currentEventId: null,
      locale: '',
      personId: null,
      db,
      redisClient,
      isInternalQuery: true,
    }
  );

  await db.updateTable('person').set({ is_superadmin: 1 }).where('id', '=', ret.personId).execute();
  await db
    .insertInto('person_access')
    .values({
      acl_name: Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA,
      acl_value: 1,
      person_id: ret.personId,
      event_id: -1,
    })
    .execute();

  return ret.personId;
}
