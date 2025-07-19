import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './schema';
import { DB as DatabaseOld } from './schema_old';
import { Pool } from 'pg';
import { env } from '../helpers/env';

const oldDb = new Kysely<DatabaseOld>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: env.db.host,
      database: 'frey',
      user: 'frey',
      password: env.db.password,
    }),
  }),
});

const newDb = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: env.db.host,
      database: env.db.dbname,
      user: env.db.username,
      password: env.db.password,
    }),
  }),
  log(event) {
    if (event.level === 'error') {
      console.error('Query failed : ', {
        durationMs: event.queryDurationMillis,
        error: event.error,
        sql: event.query.sql,
        params: event.query.parameters,
      });
    } else {
      // `'query'`
      console.log('Query executed : ', {
        durationMs: event.queryDurationMillis,
        sql: event.query.sql,
        params: event.query.parameters,
      });
    }
  },
});

async function migrate() {
  await newDb.transaction().execute(async (trx) => {
    let i = 0;
    const limit = 100;
    while (true) {
      const records = await oldDb
        .selectFrom('person')
        .orderBy('id', 'asc')
        .selectAll()
        .limit(limit)
        .offset(i)
        .execute();
      if (records.length === 0) {
        break;
      }

      await trx
        .insertInto('person')
        .values(
          records.map((rec) => ({
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
          }))
        )
        .execute();

      i += limit;
    }

    i = 0;
    while (true) {
      const records = await oldDb
        .selectFrom('person_access')
        .orderBy('id', 'asc')
        .selectAll()
        .limit(limit)
        .offset(i)
        .execute();
      if (records.length === 0) {
        break;
      }

      await trx
        .insertInto('person_access')
        .values(
          records
            .filter((rec) =>
              ['ADMIN_EVENT', 'REFEREE_FOR_EVENT', 'GET_PERSONAL_INFO_WITH_PRIVATE_DATA'].includes(
                rec.acl_name
              )
            )
            .map((rec) => ({
              acl_name: rec.acl_name,
              acl_value: parseInt(rec.acl_value.toString()),
              event_id: rec.event_id,
              id: rec.id,
              person_id: rec.person_id,
            }))
        )
        .execute();

      i += limit;
    }

    // TODO: migrate other two tables
  });
}
