import type { Database as Db } from './schema.ts';
import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';

const dialect = new PostgresDialect({
  pool: new Pool({
    database: 'frey',
    host: 'localhost',
    user: 'postgres',
    port: 5432,
    max: 10,
  }),
});

export const db = new Kysely<Db>({
  dialect,
});

export type Database = typeof db;
//
// db.selectFrom("person")
//   .selectAll()
//   .where("id", "=", 1)
//   .limit(10)
//   .execute()
//   .then((result) => {
//     const clientHash = makeClientHash(
//       "Itsumademomatteru88",
//       result[0].auth_salt,
//     );
//     verifyHash(clientHash, result[0].auth_hash)
//       .then(() => console.log("success"))
//       .catch(() => console.log("failed"));
//     console.log(result);
//   });
