import { createAccount } from '../models/persons';
import { db, redisClient } from './db';
import { Rights } from '../helpers/rights';
import * as process from 'node:process';

async function bootstrapAdmin() {
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
    { authToken: '', currentEventId: null, locale: '', personId: null },
    true
  );

  await db.updateTable('person').set({ is_superadmin: 1 }).where('id', '=', ret.personId).execute();
  await db
    .insertInto('person_access')
    .values({
      acl_name: Rights.GET_PERSONAL_INFO_WITH_PRIVATE_DATA,
      acl_value: 1,
      person_id: ret.personId,
      event_id: null,
    })
    .execute();

  return ret.personId;
}

bootstrapAdmin()
  .then((id) => {
    console.log('Created administrator account with id = ', id);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to create administrator', err);
    process.exit(1);
  });
