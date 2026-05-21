import * as process from 'node:process';
import { Pool } from 'pg';
import { Repository } from './services/Repository.js';
import { MikroORM } from '@mikro-orm/postgresql';
import config from './mikro-orm.config.js';

process.env.NODE_ENV = 'development';

export async function migrateFromMimir1() {
  const orm = await MikroORM.init(config());
  const repo = Repository.instance({}, orm);

  const pool = new Pool({
    host: repo.config.db.host,
    database: 'mimir',
    user: 'mimir',
    password: repo.config.db.password,
    port: repo.config.db.port,
  });
  const oldDb = await pool.connect();

  async function migrateTable(
    table: string,
    em: MikroORM['em'],
    selector: (limit: number, offset: number) => Promise<any[]>,
    inserter: (rows: any[], lastId: number) => Promise<number>
  ) {
    const limit = 100;
    let i = 0;
    console.log('Migrating table', table);
    let lastId = 0;
    while (true) {
      const records = await selector(limit, i);
      if (records.length === 0) {
        await orm.em
          .getConnection()
          .execute(`select setval('${table + '_id_seq'}', ${lastId + 1})`);
        break;
      }

      lastId = await inserter(records, lastId);
      process.stdout.write('.');
      i += limit;
    }
  }

  await orm.em.transactional(async (em) => {
    await migrateTable(
      'achievements',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from achievements order by id asc limit ${limit} offset ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('achievements')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'event',
      em,
      async (limit: number, offset: number) => {
        return (
          await oldDb.query(`select * from event order by id asc limit ${limit} offset ${offset}`)
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('event')
            .insert(
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
                  ruleset_config: rec.ruleset_config, // TODO: ::json ?
                  timezone: rec.timezone,
                  series_length: rec.series_length,
                  games_status: rec.games_status,
                  hide_results: rec.hide_results,
                  hide_achievements: rec.hide_achievements,
                  is_prescripted: rec.is_prescripted,
                  min_games_count: rec.min_games_count,
                  finished: rec.finished,
                  is_listed: rec.is_listed,
                  online_platform:
                    rec.platform_id === 1
                      ? 'PLATFORM_TYPE_TENHOUNET'
                      : rec.platform_id === 2
                        ? 'PLATFORM_TYPE_MAHJONGSOUL'
                        : null,
                  allow_view_other_tables: rec.allow_view_other_tables,
                  allow_manual_add_replay: rec.manual_add_replay,
                  wind_shuffle_mode: rec.wind_shuffle_mode, // TODO: add field
                };
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'event_prescript',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `SELECT * FROM event_prescript ORDER BY id ASC LIMIT ${limit} OFFSET ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('event_prescript')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'event_registered_players',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from event_registered_players order by id asc limit ${limit} offset ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('event_registered_players')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'jobs_queue',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from jobs_queue order by id asc limit ${limit} offset ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('jobs_queue')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'penalty',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(`select * from penalty order by id asc limit ${limit} offset ${offset}`)
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('penalty')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'player_history',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from player_history order by id asc limit ${limit} offset ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('player_history')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'player_stats',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from player_stats order by id asc limit ${limit} offset ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('player_stats')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    // TODO: посессионная миграция, выбираем 10 сессий и едем заполнять round и hand....
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
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(`select * from session order by id asc limit ${limit} offset ${offset}`)
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('session')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );

        return lastId;
      }
    );

    await migrateTable(
      'session_players',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from session_players order by id asc limit ${limit} offset ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('session_players')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
        return lastId;
      }
    );

    await migrateTable(
      'session_results',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from session_results order by id asc limit ${limit} offset ${offset}`
          )
        ).rows;
      },
      async (rows, lastId) => {
        await em.getConnection().execute(
          em
            .getKnex()
            .into('session_results')
            .insert(
              rows.map((rec) => {
                if (rec.id > lastId) {
                  lastId = rec.id;
                }
                return rec;
              })
            )
        );
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
