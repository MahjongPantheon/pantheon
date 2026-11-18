import type { InferResult } from 'kysely';
import type { Database } from './db';

export const PERSON_LOOKUP_BATCH_SIZE = 250;

export function selectPersonProfile(db: Database) {
  return db
    .selectFrom('person')
    .leftJoin('majsoul_platform_account', 'majsoul_platform_account.person_id', 'person.id')
    .select([
      'person.id',
      'person.city',
      'person.country',
      'person.tenhou_id',
      'person.ronin_id',
      'person.title',
      'person.email',
      'person.phone',
      'person.has_avatar',
      'person.last_update',
      'person.telegram_id',
      'person.notifications',
      'majsoul_platform_account.account_id',
      'majsoul_platform_account.nickname',
    ]);
}

export type PersonProfile = InferResult<ReturnType<typeof selectPersonProfile>>[number];

// Online identifiers and Majsoul nicknames can match many people, even for one input.
export async function* readPersonProfilePages(query: ReturnType<typeof selectPersonProfile>) {
  let lastId: number | undefined;
  while (true) {
    const page = lastId === undefined ? query : query.where('person.id', '>', lastId);
    const rows = await page.orderBy('person.id').limit(PERSON_LOOKUP_BATCH_SIZE).execute();
    if (rows.length > 0) {
      yield rows;
    }
    if (rows.length < PERSON_LOOKUP_BATCH_SIZE) {
      return;
    }
    lastId = rows[rows.length - 1].id;
  }
}
