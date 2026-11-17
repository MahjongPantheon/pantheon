import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  await db.schema.alterTable('person').addColumn('ronin_id', 'varchar').execute();
  await sql`create unique index person_ronin_id_lower on person (lower(ronin_id)) where ronin_id is not null`.execute(
    db
  );
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropIndex('person_ronin_id_lower').execute();
  await db.schema.alterTable('person').dropColumn('ronin_id').execute();
}
