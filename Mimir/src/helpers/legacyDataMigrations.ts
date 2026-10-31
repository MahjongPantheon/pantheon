import { MikroORM } from '@mikro-orm/postgresql';
import { Migration20261024000000 } from '../migrations/Migration20261024000000.js';
import { Migration20261025000000 } from '../migrations/Migration20261025000000.js';
import { Migration20261027000000 } from '../migrations/Migration20261027000000.js';
import { Migration20261031000000 } from '../migrations/Migration20261031000000.js';
import { Migration20261031010000 } from '../migrations/Migration20261031010000.js';

// Match Migration20261029000000 before inserting into the already-constrained table.
// Deduplicate before pagination so older rows in another batch cannot survive.
export const legacyRegistrationsQuery = `
  select * from event_registered_players as registration
  where not exists (
    select 1 from event_registered_players as newer
    where newer.event_id = registration.event_id
      and newer.player_id = registration.player_id
      and newer.id > registration.id
  )
  order by id asc limit $1 offset $2
`;

/** The target schema is current, but the imported data predates these migrations. */
export async function getLegacyDataMigrationQueries(orm: MikroORM): Promise<string[]> {
  const queries: string[] = [];
  // Only data migrations belong here; schema migrations have already run.
  for (const Migration of [
    Migration20261024000000,
    Migration20261025000000,
    Migration20261027000000,
    Migration20261031000000,
    Migration20261031010000,
  ]) {
    const migration = new Migration(orm.em.getDriver(), orm.config);
    await migration.up();
    queries.push(...migration.getQueries().map(String));
  }
  // Migration20261018000000: rebuild integer-rounded history after all results exist.
  queries.push(`
    insert into "jobs_queue" ("job_arguments", "job_name", "created_at")
    select json_build_object('eventId', "id")::text, 'scoring', now() from "event"
  `);
  return queries;
}
