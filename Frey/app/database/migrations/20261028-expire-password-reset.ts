import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('person').addColumn('auth_reset_expires_at', 'timestamptz').execute();
  // Legacy reset tokens were predictable and had no expiry; retire all of them.
  await db.updateTable('person').set({ auth_reset_token: null }).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable('person').dropColumn('auth_reset_expires_at').execute();
}
