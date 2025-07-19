import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('person')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('title', 'varchar', (col) => col.notNull())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('auth_hash', 'varchar', (col) => col.notNull())
    .addColumn('auth_salt', 'varchar', (col) => col.notNull())
    .addColumn('auth_reset_token', 'varchar')
    .addColumn('country', 'varchar', (col) => col.notNull().defaultTo(''))
    .addColumn('city', 'varchar')
    .addColumn('phone', 'varchar')
    .addColumn('telegram_id', 'varchar')
    .addColumn('tenhou_id', 'varchar')
    .addColumn('disabled', 'integer', (col) => col.notNull().defaultTo(0))
    .addColumn('has_avatar', 'integer')
    .addColumn('last_update', "timestamp")
    .addColumn('is_superadmin', 'integer')
    .addColumn('notifications', 'text')
    .execute()

  await db.schema
    .createIndex('person_country')
    .on('person')
    .column('country')
    .execute()

  await db.schema
    .createIndex('person_disabled')
    .on('person')
    .column('disabled')
    .execute()

  await db.schema
    .createIndex('person_email')
    .on('person')
    .column('email')
    .execute()

  await db.schema
    .createIndex('person_title')
    .on('person')
    .column('title')
    .execute()

  await db.schema
    .createIndex('titlesearch_idx')
    .on('person')
    .using('GIN')
    .expression(sql`to_tsvector('simple', title)`)
    .execute()

  await db.schema
    .createTable('person_access')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('acl_name', 'varchar', (col) => col.notNull())
    .addColumn('acl_value', 'integer', (col) => col.notNull())
    .addColumn('person_id', 'integer', (col) => col.references('person.id').onDelete('cascade').notNull())
    .addColumn('event_id', 'integer')
    .execute()

  await db.schema
    .createIndex('person_access_acl_name')
    .on('person_access')
    .column('acl_name')
    .execute()

  await db.schema
    .createIndex('person_access_event_id')
    .on('person_access')
    .column('event_id')
    .execute()

  await db.schema
    .createTable('registrant')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('email', 'varchar', (col) => col.notNull())
    .addColumn('auth_hash', 'varchar', (col) => col.notNull())
    .addColumn('auth_salt', 'varchar', (col) => col.notNull())
    .addColumn('approval_code', 'varchar', (col) => col.notNull())
    .addColumn('title', 'varchar', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('registrant_approval_code')
    .on('registrant')
    .column('approval_code')
    .execute()

  await db.schema
    .createIndex('registrant_email')
    .on('registrant')
    .column('email')
    .execute()

  await db.schema
    .createTable('majsoul_platform_account')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('person_id', 'integer', (col) => col.references('person.id').onDelete('cascade').notNull())
    .addColumn('nickname', 'varchar', (col) => col.notNull())
    .addColumn('account_id', 'integer', (col) => col.notNull())
    .addColumn('friend_id', 'integer', (col) => col.notNull())
    .execute();

  await db.schema
    .createIndex('majsoul_platform_account_account_id')
    .on('majsoul_platform_account')
    .column('account_id')
    .unique()
    .execute()

  await db.schema
    .createIndex('majsoul_platform_account_nickname')
    .on('majsoul_platform_account')
    .column('nickname')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('pet').execute()
  await db.schema.dropTable('person').execute()
}
