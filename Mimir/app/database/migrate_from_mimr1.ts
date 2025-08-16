import { Kysely, PostgresDialect, sql, Transaction } from 'kysely';
import { DB as DatabaseOld } from './schema_v1';
import { Pool } from 'pg';
import { env } from '../helpers/env';
import { createDbConstructor } from './db';
import * as process from 'node:process';
import { Database } from './schema';

process.env.NODE_ENV = 'development';

export async function migrateFromMimir1() {
  const oldDb = new Kysely<DatabaseOld>({
    dialect: new PostgresDialect({
      pool: new Pool({
        host: env.db.host,
        database: 'mimir',
        user: 'mimir',
        password: env.db.password,
        port: env.db.port,
      }),
    }),
  });

  async function migrateTable<T extends DatabaseOld[keyof DatabaseOld]>(
    table: string,
    trx: Transaction<Database>,
    selector: (limit: number, offset: number) => Promise<T[]>,
    inserter: (rows: T[], lastId: number) => Promise<number>
  ) {
    const limit = 100;
    let i = 0;
    console.log('Migrating table', table);
    let lastId = 0;
    while (true) {
      const records = await selector(limit, i);
      if (records.length === 0) {
        await sql`select setval('${table + '_id_seq'}', ${lastId + 1})`.execute(trx);
        break;
      }

      lastId = await inserter(records, lastId);
      process.stdout.write('.');
      i += limit;
    }
  }

  const newDb = createDbConstructor()();

  await newDb.transaction().execute(async (trx) => {
    await migrateTable(
      'achievements',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('achievements')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('achievements')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'event',
      trx,
      (limit: number, offset: number) => {
        return oldDb
          .selectFrom('event')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('event')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return {
                id: rec.id,
                title: rec.title,
                description: rec.description,
                start_time: rec.start_time,
                end_time: rec.end_time,
                game_duration: rec.game_duration,
                last_timer: rec.last_timer,
                is_online: rec.is_online,
                is_team: rec.is_team,
                sync_start: rec.sync_start,
                sync_end: rec.sync_end,
                auto_seating: rec.auto_seating,
                sort_by_games: rec.sort_by_games,
                use_timer: rec.use_timer,
                use_penalty: rec.use_penalty,
                allow_player_append: rec.allow_player_append,
                stat_host: rec.stat_host,
                lobby_id: rec.lobby_id,
                ruleset_config: rec.ruleset_config,
                timezone: rec.timezone,
                series_length: rec.series_length,
                games_status: rec.games_status,
                hide_results: rec.hide_results,
                hide_achievements: rec.hide_achievements,
                is_prescripted: rec.is_prescripted,
                min_games_count: rec.min_games_count,
                finished: rec.finished,
                next_game_start_time: rec.next_game_start_time,
                time_to_start: rec.time_to_start,
                is_listed: rec.is_listed,
                online_platform:
                  rec.platform_id === 1 ? 'TENHOU' : rec.platform_id === 2 ? 'MAJSOUL' : null,
                allow_view_other_tables: rec.allow_view_other_tables,
              };
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'event_prescript',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('event_prescript')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('event_prescript')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'event_registered_players',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('event_registered_players')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('event_registered_players')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'jobs_queue',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('jobs_queue')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('jobs_queue')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'penalty',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('penalty')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('penalty')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'player_history',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('player_history')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('player_history')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'player_stats',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('player_stats')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('player_stats')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'round',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('round')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('round')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return {
                ...rec,
                open_hand: rec.open_hand === 1 ? 1 : 0,
              };
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'session',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('session')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('session')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'session_player',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('session_player')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('session_player')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );

    await migrateTable(
      'session_results',
      trx,
      (limit, offset) => {
        return oldDb
          .selectFrom('session_results')
          .orderBy('id', 'asc')
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute();
      },
      async (rows, lastId) => {
        await trx
          .insertInto('session_results')
          .values(
            rows.map((rec) => {
              if (rec.id > lastId) {
                lastId = rec.id;
              }
              return rec;
            })
          )
          .execute();
        return lastId;
      }
    );
  });
}

migrateFromMimir1()
  .then(() => {
    console.log('Migration completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed', error);
    process.exit(1);
  });
