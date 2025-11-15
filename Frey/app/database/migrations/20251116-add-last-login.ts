import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('person').addColumn('last_login', 'timestamp').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('person').dropColumn('last_login').execute();
}
