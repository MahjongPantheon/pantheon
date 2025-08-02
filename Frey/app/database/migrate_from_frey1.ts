import { Kysely, PostgresDialect, sql } from 'kysely';
import { DB as DatabaseOld } from './schema_v1';
import { Pool } from 'pg';
import { env } from '../helpers/env';
import { createDbConstructor } from './db';
import * as process from 'node:process';

process.env.NODE_ENV = 'development';

export async function migrateFromFrey1() {
  const oldDb = new Kysely<DatabaseOld>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: env.db.host,
        database: 'frey',
        user: 'frey',
        password: env.db.password,
        port: env.db.port,
      }),
    }),
  });

  const newDb = createDbConstructor()();

  await newDb.transaction().execute(async (trx) => {
    let i = 0;
    const limit = 100;
    console.log('Migrating person table');
    let personLastId = 0;
    while (true) {
      const records = await oldDb
        .selectFrom('person')
        .orderBy('id', 'asc')
        .selectAll()
        .limit(limit)
        .offset(i)
        .execute();
      if (records.length === 0) {
        await sql`select setval('person_id_seq', ${personLastId + 1})`.execute(trx);
        break;
      }

      await trx
        .insertInto('person')
        .values(
          records.map((rec) => {
            if (rec.id > personLastId) {
              personLastId = rec.id;
            }
            return {
              id: rec.id,
              auth_hash: rec.auth_hash,
              auth_reset_token: rec.auth_reset_token,
              auth_salt: rec.auth_salt,
              city: rec.city,
              country: rec.country,
              disabled: rec.disabled,
              email: rec.email,
              has_avatar: rec.has_avatar,
              is_superadmin: rec.is_superadmin,
              last_update: rec.last_update,
              notifications: rec.notifications,
              phone: rec.phone,
              telegram_id: rec.telegram_id,
              tenhou_id: rec.tenhou_id,
              title: rec.title,
            };
          })
        )
        .execute();
      process.stdout.write('.');
      i += limit;
    }
    process.stdout.write('\n');

    i = 0;
    console.log('Migrating person_access table');
    let personAccessLastId = 0;
    while (true) {
      const recordsAll = await oldDb
        .selectFrom('person_access')
        .orderBy('id', 'asc')
        .selectAll()
        .limit(limit)
        .offset(i)
        .execute();

      if (recordsAll.length === 0) {
        await sql`select setval('person_access_id_seq', ${personAccessLastId + 1})`.execute(trx);
        break;
      }

      const records = recordsAll.filter((rec) =>
        ['ADMIN_EVENT', 'REFEREE_FOR_EVENT', 'GET_PERSONAL_INFO_WITH_PRIVATE_DATA'].includes(
          rec.acl_name
        )
      );

      if (records.length === 0) {
        i += limit;
        continue;
      }

      await trx
        .insertInto('person_access')
        .values(
          records.map((rec) => {
            if (rec.id > personAccessLastId) {
              personAccessLastId = rec.id;
            }
            return {
              acl_name: rec.acl_name,
              acl_value: rec.acl_value === 'true' ? 1 : 0,
              event_id: rec.event_id ?? -1,
              id: rec.id,
              person_id: rec.person_id,
            };
          })
        )
        .execute();

      process.stdout.write('.');
      i += limit;
    }
    process.stdout.write('\n');

    i = 0;
    console.log('Migrating majsoul_platform_accounts table');
    let accLastId = 0;
    while (true) {
      const records = await oldDb
        .selectFrom('majsoul_platform_accounts')
        .orderBy('id', 'asc')
        .selectAll()
        .limit(limit)
        .offset(i)
        .execute();
      if (records.length === 0) {
        await sql`select setval('majsoul_platform_account_id_seq', ${accLastId + 1})`.execute(trx);
        break;
      }

      await trx
        .insertInto('majsoul_platform_account')
        .values(
          records.map((rec) => {
            if (rec.id > accLastId) {
              accLastId = rec.id;
            }
            return {
              id: rec.id,
              account_id: rec.account_id,
              friend_id: rec.friend_id,
              nickname: rec.nickname,
              person_id: rec.person_id,
            };
          })
        )
        .execute();

      process.stdout.write('.');
      i += limit;
    }
    process.stdout.write('\n');

    i = 0;
    console.log('Migrating registrant table');
    let regLastId = 0;
    while (true) {
      const records = await oldDb
        .selectFrom('registrant')
        .orderBy('id', 'asc')
        .selectAll()
        .limit(limit)
        .offset(i)
        .execute();
      if (records.length === 0) {
        await sql`select setval('registrant_id_seq', ${regLastId + 1})`.execute(trx);
        break;
      }

      await trx
        .insertInto('registrant')
        .values(
          records.map((rec) => {
            if (rec.id > regLastId) {
              regLastId = rec.id;
            }
            return {
              id: rec.id,
              approval_code: rec.approval_code,
              auth_hash: rec.auth_hash,
              auth_salt: rec.auth_salt,
              email: rec.email,
              title: rec.title,
            };
          })
        )
        .execute();

      process.stdout.write('.');
      i += limit;
    }
    process.stdout.write('\n');
  });
}

migrateFromFrey1()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed', error);
    process.exit(1);
  });
