import * as process from 'node:process';
import { Pool } from 'pg';
import { Repository } from './services/Repository.js';
import { MikroORM } from '@mikro-orm/postgresql';
import config from './mikro-orm.config.js';
import { RoundEntity } from './entities/Round.entity.js';
import { HandEntity } from './entities/Hand.entity.js';
import { EventEntity } from './entities/Event.entity.js';
import { SessionEntity } from './entities/Session.entity.js';
import { SessionStateEntity } from './entities/SessionState.entity.js';
import { RoundOutcome, SessionStatus } from 'tsclients/proto/atoms.pb.js';

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
    console.log('\nMigrating table', table);
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

  function toOutcome(outcome: string): RoundOutcome {
    switch (outcome) {
      case 'ron':
        return RoundOutcome.ROUND_OUTCOME_RON;
      case 'tsumo':
        return RoundOutcome.ROUND_OUTCOME_TSUMO;
      case 'draw':
        return RoundOutcome.ROUND_OUTCOME_DRAW;
      case 'abort':
        return RoundOutcome.ROUND_OUTCOME_ABORT;
      case 'chombo':
        return RoundOutcome.ROUND_OUTCOME_CHOMBO;
      case 'nagashi':
        return RoundOutcome.ROUND_OUTCOME_NAGASHI;
      case 'multiron':
        return RoundOutcome.ROUND_OUTCOME_MULTIRON;
      default:
        return RoundOutcome.ROUND_OUTCOME_UNSPECIFIED;
    }
  }

  function rewriteIntermediateResults(results: string): string {
    const parsed = JSON.parse(results);

    const newResults = {
      chips: parsed._chips ?? {},
      honba: parsed._honba,
      round: parsed._round,
      chombo: parsed._chombo ?? {},
      scores: parsed._scores,
      yakitori: parsed._yakitori ?? {},
      player_ids: Object.keys(parsed._scores).map(Number),
      riichi_bets: parsed._riichiBets,
      last_outcome: parsed._lastOutcome,
      replacements: parsed._replacements ?? {},
      last_hand_started: parsed._lastHandStarted,
      round_just_changed: parsed._roundJustChanged,
      prematurely_finished: parsed._prematurelyFinished,
    };

    return JSON.stringify(newResults);
  }

  async function migrateRounds(em: MikroORM['em']) {
    const limit = 10;
    console.log('\nMigrating rounds into rounds/hands tables; NOTE: this is gonna be quite slow');
    let lastOffset = 0;
    const flushPromises = [];
    let mark = performance.now();

    const sessionsLen = (await oldDb.query(`select count(*) as count from session`)).rows[0].count;

    while (true) {
      const sessionIds: number[] = (
        await oldDb.query(
          `select id from session order by id asc limit ${limit} offset ${lastOffset}`
        )
      ).rows.map((r) => +r.id);
      lastOffset += sessionIds.length;
      if (sessionIds.length === 0) {
        break;
      }

      const rounds = (
        await oldDb.query(
          `select * from round where session_id in (${sessionIds.join(',')}) order by session_id asc, id asc`
        )
      ).rows;
      if (rounds.length === 0) {
        continue;
      }

      const groupedRounds = [];
      let lastMultiRound = [];

      for (const round of rounds) {
        if (round.multi_ron && round.multi_ron > 1) {
          lastMultiRound.push(round);
        } else {
          if (lastMultiRound.length > 0) {
            groupedRounds.push(lastMultiRound);
            lastMultiRound = [];
          }
          groupedRounds.push([round]);
        }
      }

      const emf = em.fork();
      for (const group of groupedRounds) {
        const r = new RoundEntity();
        r.id = group[0].id;
        r.event = emf.getReference(EventEntity, group[0].event_id);
        r.session = emf.getReference(SessionEntity, group[0].session_id);
        r.outcome = toOutcome(group[0].outcome);
        r.round = group[0].round;
        r.riichi = group[0].riichi ? group[0].riichi.split(',').map(Number) : [];
        r.endDate = group[0].end_date;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const state = JSON.parse(group[0].last_session_state || '{}');
        r.lastSessionState = new SessionStateEntity();
        r.lastSessionState.round = state._round ?? 1;
        r.lastSessionState.chips = state._chips ?? {};
        r.lastSessionState.chombo = state._chombo ?? {};
        r.lastSessionState.honba = state._honba ?? 0;
        r.lastSessionState.lastHandStarted = state._lastHandStarted ?? false;
        r.lastSessionState.prematurelyFinished = state._prematurelyFinished ?? false;
        r.lastSessionState.roundJustChanged = state._roundJustChanged ?? true;
        r.lastSessionState.lastOutcome = state._lastOutcome ?? '';
        r.lastSessionState.yakitori =
          state._yakitori && state._playerIds
            ? Object.fromEntries(
                state._playerIds.map((id: number, index: number) => [+id, !!state._yakitori[index]])
              )
            : {};
        r.lastSessionState.replacements = state._replacements ?? {};
        r.lastSessionState.playerIds = state._scores ? Object.keys(state._scores).map(Number) : [];
        r.lastSessionState.riichiBets = state._riichiBets ?? 0;
        r.lastSessionState.scores = state._scores ?? {};
        r.honba = r.lastSessionState.honba;
        r.hands = [];

        for (const rnd of group) {
          const hand = new HandEntity();
          hand.round = r;
          hand.han = rnd.han ?? undefined;
          hand.fu = rnd.fu ?? undefined;
          hand.dora = rnd.dora;
          hand.uradora = rnd.uradora;
          hand.kandora = rnd.kandora;
          hand.kanuradora = rnd.kanuradora;
          hand.yaku = rnd.yaku ? rnd.yaku.split(',').map(Number) : [];
          hand.tempai = rnd.tempai ? rnd.tempai.split(',').map(Number) : [];
          hand.nagashi = rnd.nagashi ? rnd.nagashi.split(',').map(Number) : [];
          hand.winnerId = rnd.winner_id ?? undefined;
          hand.loserId = rnd.loser_id ?? undefined;
          hand.paoPlayerId = rnd.pao_player_id ?? undefined;
          hand.openHand = !!rnd.open_hand;
          r.hands.push(hand);
          emf.persist(hand);
        }

        emf.persist(r);
      }

      flushPromises.push(emf.flush());
      if (flushPromises.length >= 50) {
        // process.stdout.write(".");
        await Promise.all(flushPromises);
        console.log(
          `Sessions [${lastOffset}/${sessionsLen}]: done in ${Math.ceil(performance.now() - mark)}ms`
        );
        mark = performance.now();
        flushPromises.length = 0; // clear array
      }
    }

    await em.transactional(async (emt) => {
      const result = await emt
        .getConnection()
        .execute('select (max(round.id) + 1) as next_id from round');

      const nextId = Number(result[0].next_id);
      await emt.getConnection().execute(`select setval('round_id_seq', ${nextId})`);
    });
  }

  await orm.em.transactional(async (em) => {
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
                  ruleset_config: JSON.stringify({
                    baseRuleset: 'custom',
                    title: 'Custom',
                    rules: JSON.parse(rec.ruleset_config),
                  }),
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
                  wind_shuffle_mode:
                    rec.wind_shuffle_mode === 'balanced'
                      ? 'WIND_SHUFFLE_MODE_BALANCED'
                      : rec.wind_shuffle_mode === 'random'
                        ? 'WIND_SHUFFLE_MODE_RANDOM'
                        : rec.wind_shuffle_mode === 'prescripted'
                          ? 'WIND_SHUFFLE_MODE_PRESCRIPTED'
                          : null,
                };
              })
            )
        );
        return lastId;
      }
    );

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
                delete rec.okr_ignore;
                if (rec.status === 'finished') {
                  rec.status = SessionStatus.SESSION_STATUS_FINISHED;
                } else if (rec.status === 'prefinished') {
                  rec.status = SessionStatus.SESSION_STATUS_PREFINISHED;
                } else if (rec.status === 'inprogress') {
                  rec.status = SessionStatus.SESSION_STATUS_INPROGRESS;
                } else if (rec.status === 'planned') {
                  rec.status = SessionStatus.SESSION_STATUS_PLANNED;
                } else if (rec.status === 'cancelled') {
                  rec.status = SessionStatus.SESSION_STATUS_CANCELLED;
                } else {
                  rec.status = SessionStatus.SESSION_STATUS_UNSPECIFIED;
                }
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                if (!rec.intermediate_results) {
                  rec.intermediate_results = '{}';
                } else {
                  rec.intermediate_results = rewriteIntermediateResults(rec.intermediate_results);
                }
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
      'session_players',
      em,
      async (limit, offset) => {
        return (
          await oldDb.query(
            `select * from session_player order by id asc limit ${limit} offset ${offset}`
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

  await migrateRounds(orm.em);
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
