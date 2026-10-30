import { Yaku } from '../helpers/yaku.js';
import { MimirTest } from '../services/MimirTest.js';
import {
  EventType,
  PlatformType,
  SessionStatus,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { ConfigService } from '../services/Config.js';
import { Client } from 'pg';
import { v4 } from 'uuid';
import { MikroORM } from '@mikro-orm/postgresql';
import ormConfig from '../mikro-orm.config.js';
import { Repository } from '../services/Repository.js';
import { runJob } from '../../cron/runner.js';

const CLUB_RATING_EVENT_ID = 19;
const TOURNAMENT_EVENT_ID = 889;
const ONLINE_TOURNAMENT_EVENT_ID = 863;

async function timeout(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Note: tests hardly rely on database contents created by TestSeeder
// Make sure to run TestSeeder before running these tests manually
// On CI and when using `make test` from project root, TestSeeder is automatically run on fresh database

describe('Mimir Twirp API', () => {
  const mimirClient = new MimirTest();
  beforeAll(() => {
    // prepare test data in db
  });

  afterAll(() => {});

  test('GetRulesets', async () => {
    const rulesets = await mimirClient.GetRulesets();
    expect(rulesets).toBeDefined();
    expect(rulesets.rulesets).toBeDefined();
    expect(rulesets.rulesetIds).toBeDefined();
    expect(rulesets.rulesetTitles).toBeDefined();
    const ema2025Index = rulesets.rulesetIds.indexOf('ema2025');
    expect(ema2025Index).toBeGreaterThanOrEqual(0);
    expect(rulesets.rulesetTitles[ema2025Index]).toBe('European Mahjong Association rules (2025)');
    expect(rulesets.rulesets[ema2025Index]).toMatchObject({
      withKiriageMangan: true,
      chomboCountsAsHand: true,
    });
  });

  test('CreateEvent', async () => {
    const result = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_LOCAL,
      title: 'test event',
      description: 'test event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    expect(result.eventId).toBeDefined();
  });

  test('GetEvents: limit 1 offset 0', async () => {
    const events = await mimirClient.GetEvents({
      limit: 1,
      offset: 0,
      filterUnlisted: false,
      filter: '',
    });
    expect(events).toBeDefined();
    expect(events.total).toBeGreaterThanOrEqual(3);
    expect(events.events.length).toEqual(1);
  });

  test('GetEvents: limit 1 offset 1', async () => {
    const events = await mimirClient.GetEvents({
      limit: 1,
      offset: 1,
      filterUnlisted: false,
      filter: '',
    });
    expect(events).toBeDefined();
    expect(events.total).toBeGreaterThanOrEqual(3);
    expect(events.events.length).toEqual(1);
  });

  test('GetEvents: limit 1 offset very big', async () => {
    const events = await mimirClient.GetEvents({
      limit: 1,
      offset: 4000,
      filterUnlisted: false,
      filter: '',
    });
    expect(events).toBeDefined();
    expect(events.total).toBeGreaterThanOrEqual(3);
    expect(events.events.length).toEqual(0);
  });

  test('GetEvents: search success', async () => {
    const events = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: false,
      filter: 'Club',
    });
    expect(events).toBeDefined();
    expect(events.total).toEqual(1);
    expect(events.events.length).toEqual(1);
  });

  test('GetEvents: search fail', async () => {
    const events = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: false,
      filter: 'Someevent',
    });
    expect(events).toBeDefined();
    expect(events.total).toEqual(0);
    expect(events.events.length).toEqual(0);
  });

  test('GetEventsById', async () => {
    const events = await mimirClient.GetEventsById([CLUB_RATING_EVENT_ID]);
    expect(events).toBeDefined();
    expect(events.events.length).toEqual(1);
    expect(events.events[0].id).toEqual(CLUB_RATING_EVENT_ID);
  });

  test('GetAchievements returns achievements built by the cron worker', async () => {
    const config = new ConfigService().db;
    const db = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      const achievementsBefore = await db.query('select id from achievements where event_id = $1', [
        CLUB_RATING_EVENT_ID,
      ]);
      expect(achievementsBefore.rows).toHaveLength(0);

      await mimirClient.RecalcAchievements(CLUB_RATING_EVENT_ID);
      const workerResponse = await fetch('http://localhost:4301/__test__/cron/achievements', {
        method: 'POST',
      });
      expect(workerResponse.status).toBe(204);

      const achievementsAfter = await db.query(
        'select data, last_update from achievements where event_id = $1',
        [CLUB_RATING_EVENT_ID]
      );
      expect(achievementsAfter.rows).toHaveLength(1);
      expect(achievementsAfter.rows[0].last_update).toBeDefined();
      const topResults = await db.query(
        `select r.player_id, r.score, s.representational_hash
         from session_results r join session s on s.id = r.session_id
         where r.event_id = $1 order by r.score desc limit 3`,
        [CLUB_RATING_EVENT_ID]
      );
      expect(achievementsAfter.rows[0].data.needMoreGold).toEqual(
        topResults.rows.map((result) => ({
          playerId: result.player_id,
          score: result.score,
          sessionHash: result.representational_hash,
        }))
      );

      const response = await mimirClient.GetAchievements(CLUB_RATING_EVENT_ID, ['needMoreGold']);
      expect(response.achievements).toHaveLength(1);
      expect(response.achievements[0].achievementId).toBe('needMoreGold');
      expect(JSON.parse(response.achievements[0].achievementData)).toEqual(
        achievementsAfter.rows[0].data.needMoreGold
      );
    } finally {
      await db.end();
    }
  }, 30000);

  test('GetPlayerStats returns stats built by the cron worker', async () => {
    const eventId = CLUB_RATING_EVENT_ID;
    const playerId = 2;
    const config = new ConfigService().db;
    const db = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      const registered = await db.query(
        'select player_id from event_registered_players where event_id = $1',
        [eventId]
      );
      const statsBefore = await db.query('select id from player_stats where event_id = $1', [
        eventId,
      ]);
      expect(statsBefore.rows).toHaveLength(0);

      await mimirClient.RecalcPlayerStats(eventId);
      const workerResponse = await fetch('http://localhost:4301/__test__/cron/player-stats', {
        method: 'POST',
      });
      expect(workerResponse.status).toBe(204);
      const pendingJobs = await db.query(
        "select id from jobs_queue where job_name = $1 and job_arguments::jsonb ->> 'eventId' = $2",
        ['playerStats', String(eventId)]
      );
      expect(pendingJobs.rows).toHaveLength(0);

      const statsAfter = await db.query(
        'select player_id, data, last_update from player_stats where event_id = $1',
        [eventId]
      );
      expect(statsAfter.rows.map((row) => row.player_id).sort((a, b) => a - b)).toEqual(
        registered.rows.map((row) => row.player_id).sort((a, b) => a - b)
      );
      const playerStats = statsAfter.rows.find((row) => row.player_id === playerId);
      expect(playerStats.last_update).toBeDefined();
      expect(playerStats.data.totalPlayedGames).toBeGreaterThan(0);
      expect(playerStats.data.totalPlayedRounds).toBeGreaterThan(0);
      expect(playerStats.data.ratingHistory).toHaveLength(playerStats.data.totalPlayedGames + 1);

      const response = await mimirClient.GetPlayerStats(playerId, eventId);
      expect(response.totalPlayedGames).toBe(playerStats.data.totalPlayedGames);
      expect(response.totalPlayedRounds).toBe(playerStats.data.totalPlayedRounds);
      expect(response.ratingHistory).toEqual(playerStats.data.ratingHistory);
      expect(response.playersInfo.length).toBeGreaterThan(0);
      expect(response.playersInfo).toEqual(playerStats.data.playersInfo);
      expect(response.scoreHistory).toHaveLength(playerStats.data.totalPlayedGames);
      expect(response.scoreHistory.flatMap((session) => session.tables).length).toBeGreaterThan(0);
      expect(response.placesSummary.reduce((sum, item) => sum + item.count, 0)).toBe(
        response.totalPlayedGames
      );
      expect(response.handsValueSummary.length).toBeGreaterThan(0);
      expect(response.yakuSummary.length).toBeGreaterThan(0);
    } finally {
      await db.end();
    }
  }, 60000);

  test('GetMyEvents', async () => {
    mimirClient.setPersonId(195); // player registered for club event
    const events = await mimirClient.GetMyEvents();
    mimirClient.setPersonId(1); // reset to not bother other tests
    expect(events).toBeDefined();
    expect(events.events.length).toEqual(1);
    expect(events.events[0].id).toEqual(CLUB_RATING_EVENT_ID);
  });

  test('GetGameConfig', async () => {
    const config = await mimirClient.GetGameConfig(CLUB_RATING_EVENT_ID);
    expect(config).toBeDefined();
    expect(config.rulesetTitle).toEqual('Custom');
    expect(config.syncStart).toEqual(false);
  });

  test('GetRatingTable: basic: order by rating desc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'rating',
      order: 'desc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.rating <= table.list[index].rating;
      })
    );
  });

  test('GetRatingTable: basic: order by rating asc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'rating',
      order: 'asc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.rating >= table.list[index].rating;
      })
    );
  });

  test('GetRatingTable: basic: order by name desc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'name',
      order: 'desc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.title <= table.list[index].title;
      })
    );
  });

  test('GetRatingTable: basic: order by name asc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'name',
      order: 'asc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.title >= table.list[index].title;
      })
    );
  });

  test('GetRatingTable: basic: order by games and rating', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'games_and_rating',
      order: 'desc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        if (item.gamesPlayed === table.list[index].gamesPlayed) {
          return item.rating <= table.list[index].rating;
        }
        return item.gamesPlayed <= table.list[index].gamesPlayed;
      })
    );
  });

  test('GetRatingTable: basic: order by avg_place desc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'avg_place',
      order: 'desc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.avgPlace <= table.list[index].avgPlace;
      })
    );
  });

  test('GetRatingTable: basic: order by avg_place asc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'avg_place',
      order: 'asc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.avgPlace >= table.list[index].avgPlace;
      })
    );
  });

  test('GetRatingTable: basic: order by avg_score desc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'avg_score',
      order: 'desc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.avgScore <= table.list[index].avgScore;
      })
    );
  });

  test('GetRatingTable: basic: order by avg_score asc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'avg_score',
      order: 'asc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.avgScore >= table.list[index].avgScore;
      })
    );
  });

  test('GetRatingTable: multievent: order by avg_score asc', async () => {
    const table = await mimirClient.GetRatingTable({
      eventIdList: [CLUB_RATING_EVENT_ID, TOURNAMENT_EVENT_ID],
      onlyMinGames: false,
      orderBy: 'avg_score',
      order: 'asc',
    });
    expect(table).toBeDefined();
    expect(
      table.list.every((item, index) => {
        if (index === 0) {
          return true;
        }
        return item.avgScore >= table.list[index].avgScore;
      })
    );
  });

  test('GetRecentPublicGames: latest game from each distinct public event', async () => {
    const { games } = await mimirClient.GetRecentPublicGames();
    expect(games.length).toBeGreaterThan(0);
    expect(games.length).toBeLessThanOrEqual(5);
    expect(new Set(games.map((game) => game.eventId)).size).toBe(games.length);
    for (const summary of games) {
      const { game } = await mimirClient.GetGame(summary.sessionHash);
      expect(game.date).toBe(summary.date);
      expect(game.finalResults.map((result) => result.score).sort((a, b) => a - b)).toEqual(
        summary.players.map((player) => player.score).sort((a, b) => a - b)
      );
    }
  });

  test('GetLastGames: basic', async () => {
    const games = await mimirClient.GetLastGames([TOURNAMENT_EVENT_ID], 10, 0);
    expect(games).toBeDefined();
    expect(games.totalGames).toEqual(63);
    expect(games.games).toBeDefined();
    expect(games.games.length).toEqual(10);
    expect(games.games[0].players[0].email).toBe('');
    expect(games.games[0].players[0].phone).toBe('');
    expect(games.games[0].players[0].telegramId).toBe('');
  });

  test('GetLastGames: basic with offset', async () => {
    const games = await mimirClient.GetLastGames([TOURNAMENT_EVENT_ID], 10, 25);
    expect(games).toBeDefined();
    expect(games.totalGames).toEqual(63);
    expect(games.games).toBeDefined();
    expect(games.games.length).toEqual(10);
    expect(games.games[0].players[0].email).toBe('');
    expect(games.games[0].players[0].phone).toBe('');
    expect(games.games[0].players[0].telegramId).toBe('');
  });

  test('GetLastGames: basic with offset beyond total', async () => {
    const games = await mimirClient.GetLastGames([TOURNAMENT_EVENT_ID], 10, 125);
    expect(games).toBeDefined();
    expect(games.totalGames).toEqual(63);
    expect(games.games).toBeDefined();
    expect(games.games.length).toEqual(0);
  });

  test('GetLastGames: mutilevent', async () => {
    const games = await mimirClient.GetLastGames(
      [TOURNAMENT_EVENT_ID, ONLINE_TOURNAMENT_EVENT_ID],
      10,
      134 + 63 - 10 // fetch last 10 to additionally check total items count
    );
    expect(games).toBeDefined();
    expect(games.totalGames).toEqual(134 + 63);
    expect(games.games).toBeDefined();
    expect(games.games.length).toEqual(10);
    expect(games.games[0].players[0].email).toBe('');
    expect(games.games[0].players[0].phone).toBe('');
    expect(games.games[0].players[0].telegramId).toBe('');
  });

  test('GetGame: existing', async () => {
    const game = await mimirClient.GetGame('ba81ec925d80bba537034e12a63b5e9e83e2cac2');
    expect(game).toBeDefined();
    expect(game.game.sessionHash).toEqual('ba81ec925d80bba537034e12a63b5e9e83e2cac2');
    expect(game.game.players[0].email).toBe('');
    expect(game.game.players[0].phone).toBe('');
    expect(game.game.players[0].telegramId).toBe('');
  });

  test('GetGame: non-existing', async () => {
    await expect(mimirClient.GetGame('non-existing')).rejects.toThrow();
  });

  test('GetGamesSeries: non-series event', async () => {
    await expect(mimirClient.GetGamesSeries(CLUB_RATING_EVENT_ID)).rejects.toThrow();
  });

  test('GetGamesSeries: series event', async () => {
    const series = await mimirClient.GetGamesSeries(TOURNAMENT_EVENT_ID);
    expect(series).toBeDefined();
    expect(series.results).toBeDefined();
    expect(series.results.length).toEqual(28); // equal to players count in event
  });

  test('GetCurrentSessions: basic', async () => {
    const sessions = await mimirClient.GetCurrentSessions(187, CLUB_RATING_EVENT_ID);
    expect(sessions).toBeDefined();
    expect(sessions.sessions).toBeDefined();
    expect(sessions.sessions.length).toEqual(2); // player 187 has 2 ongoing sessions
  });

  test('GetAllRegisteredPlayers: basic', async () => {
    const players = await mimirClient.GetAllRegisteredPlayers([CLUB_RATING_EVENT_ID]);
    expect(players).toBeDefined();
    expect(players.players).toBeDefined();
    expect(players.players.length).toEqual(19); // total players in club event
  });

  test('GetAllRegisteredPlayers: multievent', async () => {
    const players = await mimirClient.GetAllRegisteredPlayers([
      CLUB_RATING_EVENT_ID,
      TOURNAMENT_EVENT_ID,
    ]);
    expect(players).toBeDefined();
    expect(players.players).toBeDefined();
    expect(players.players.length).toEqual(19 + 28);
  });

  test('GetTimerState: basic', async () => {
    const timerState = await mimirClient.GetTimerState(TOURNAMENT_EVENT_ID);
    expect(timerState).toBeDefined();
    // games are waiting for seating
    expect(timerState.started).toBe(false);
    expect(timerState.waitingForTimer).toBe(false);
  });

  test('GetSessionOverview: non-finished', async () => {
    const sessionOverview = await mimirClient.GetSessionOverview(
      '750cd6015c59aed57ebd9260d03fb80adb3b83f7'
    );
    expect(sessionOverview).toBeDefined();
    expect(sessionOverview.eventId).toEqual(CLUB_RATING_EVENT_ID);
    expect(sessionOverview.state.scores).toBeDefined();
    expect(sessionOverview.state.finished).toBe(false);
  });

  test('GetSessionOverview: finished', async () => {
    const sessionOverview = await mimirClient.GetSessionOverview(
      'db3293f66b4573d39e64b901605cfce304c0e94f'
    );
    expect(sessionOverview).toBeDefined();
    expect(sessionOverview.eventId).toEqual(CLUB_RATING_EVENT_ID);
    expect(sessionOverview.state.scores).toBeDefined();
    expect(sessionOverview.state.finished).toBe(true);
  });

  test('GetSessionOverview: non-existing', async () => {
    await expect(mimirClient.GetSessionOverview('non-existing')).rejects.toThrow();
    const response = await fetch('http://localhost:4301/v2/common.Mimir/GetSessionOverview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionHash: '0000000000000000000000000000000000000000' }),
    });
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({ code: 'not_found' });
  });

  test('PreviewRound: valid ron', async () => {
    const response = await mimirClient.PreviewRound({
      sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
      roundData: {
        ron: {
          roundIndex: 3,
          honba: 3,
          winnerId: 187,
          loserId: 281,
          paoPlayerId: 0,
          han: 3,
          fu: 30,
          yaku: [Yaku.PINFU, Yaku.TANYAO],
          riichiBets: [11],
          dora: 1,
          uradora: 0,
          kandora: 0,
          kanuradora: 0,
          openHand: false,
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.state.honba).toEqual(3);
    expect(response.state.roundIndex).toEqual(3);
    expect(response.state.payments.direct).toEqual([{ from: 281, to: 187, amount: 5800 }]);
    expect(response.state.payments.honba).toEqual([{ from: 281, to: 187, amount: 900 }]);
    expect(response.state.payments.riichi).toEqual([{ from: 11, to: 187, amount: 1000 }]);
  });

  test('PreviewRound: invalid ron', async () => {
    await expect(
      mimirClient.PreviewRound({
        sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
        roundData: {
          ron: {
            roundIndex: 3,
            honba: 2,
            winnerId: 187,
            loserId: 281,
            paoPlayerId: 0,
            han: 3,
            fu: 30,
            yaku: [Yaku.PINFU, Yaku.TANYAO],
            riichiBets: [11],
            dora: 1,
            uradora: 0,
            kandora: 0,
            kanuradora: 0,
            openHand: false,
          },
        },
      })
    ).rejects.toThrow();
  });

  test('PreviewRound: valid tsumo', async () => {
    const response = await mimirClient.PreviewRound({
      sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
      roundData: {
        tsumo: {
          roundIndex: 3,
          honba: 3,
          winnerId: 187,
          paoPlayerId: 0,
          han: 3,
          fu: 30,
          yaku: [Yaku.PINFU, Yaku.TANYAO],
          riichiBets: [11],
          dora: 1,
          uradora: 0,
          kandora: 0,
          kanuradora: 0,
          openHand: false,
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.state.honba).toEqual(3);
    expect(response.state.roundIndex).toEqual(3);
    expect(response.state.payments.direct).toEqual([
      { from: 11, to: 187, amount: 2000 },
      { from: 97, to: 187, amount: 2000 },
      { from: 281, to: 187, amount: 2000 },
    ]);
    expect(response.state.payments.honba).toEqual([
      { from: 11, to: 187, amount: 300 },
      { from: 97, to: 187, amount: 300 },
      { from: 281, to: 187, amount: 300 },
    ]);
    expect(response.state.payments.riichi).toEqual([{ from: 11, to: 187, amount: 1000 }]);
  });

  test('PreviewRound: invalid tsumo', async () => {
    await expect(
      mimirClient.PreviewRound({
        sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
        roundData: {
          tsumo: {
            roundIndex: 3,
            honba: 2,
            winnerId: 187,
            paoPlayerId: 0,
            han: 3,
            fu: 30,
            yaku: [Yaku.PINFU, Yaku.TANYAO],
            riichiBets: [11],
            dora: 1,
            uradora: 0,
            kandora: 0,
            kanuradora: 0,
            openHand: false,
          },
        },
      })
    ).rejects.toThrow();
  });

  test('PreviewRound: valid draw', async () => {
    const response = await mimirClient.PreviewRound({
      sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
      roundData: {
        draw: {
          roundIndex: 3,
          honba: 3,
          riichiBets: [11],
          tempai: [187],
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.state.honba).toEqual(3);
    expect(response.state.roundIndex).toEqual(3);
    expect(response.state.payments.direct).toEqual([
      { from: 11, to: 187, amount: 1000 },
      { from: 97, to: 187, amount: 1000 },
      { from: 281, to: 187, amount: 1000 },
    ]);
    expect(response.state.payments.honba).toEqual([]);
    expect(response.state.payments.riichi).toEqual([{ from: 11, to: undefined, amount: 1000 }]);
    expect(response.state.riichi).toEqual(0);
  });

  test('PreviewRound: invalid draw', async () => {
    await expect(
      mimirClient.PreviewRound({
        sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
        roundData: {
          draw: {
            roundIndex: 3,
            honba: 2,
            riichiBets: [11],
            tempai: [187],
          },
        },
      })
    ).rejects.toThrow();
  });

  test('PreviewRound: valid abortive', async () => {
    const response = await mimirClient.PreviewRound({
      sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
      roundData: {
        abort: {
          roundIndex: 3,
          honba: 3,
          riichiBets: [11],
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.state.honba).toEqual(3);
    expect(response.state.roundIndex).toEqual(3);
    expect(response.state.payments.direct).toEqual([]);
    expect(response.state.payments.honba).toEqual([]);
    expect(response.state.payments.riichi).toEqual([{ from: 11, to: undefined, amount: 1000 }]);
    expect(response.state.riichi).toEqual(0);
  });

  test('PreviewRound: invalid abortive', async () => {
    await expect(
      mimirClient.PreviewRound({
        sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
        roundData: {
          abort: {
            roundIndex: 3,
            honba: 2,
            riichiBets: [11],
          },
        },
      })
    ).rejects.toThrow();
  });

  test('PreviewRound: valid nagashi', async () => {
    const response = await mimirClient.PreviewRound({
      sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
      roundData: {
        nagashi: {
          roundIndex: 3,
          honba: 3,
          riichiBets: [11],
          tempai: [11],
          nagashi: [187],
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.state.honba).toEqual(3);
    expect(response.state.roundIndex).toEqual(3);
    expect(response.state.payments.direct).toEqual([
      { from: 11, to: 187, amount: 4000 },
      { from: 97, to: 187, amount: 4000 },
      { from: 281, to: 187, amount: 4000 },
    ]);
    expect(response.state.payments.honba).toEqual([]);
    expect(response.state.payments.riichi).toEqual([{ from: 11, to: undefined, amount: 1000 }]);
    expect(response.state.riichi).toEqual(0);
  });

  test('PreviewRound: invalid nagashi', async () => {
    await expect(
      mimirClient.PreviewRound({
        sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
        roundData: {
          nagashi: {
            roundIndex: 3,
            honba: 2,
            riichiBets: [11],
            tempai: [11],
            nagashi: [187],
          },
        },
      })
    ).rejects.toThrow();
  });

  test('PreviewRound: valid chombo', async () => {
    const response = await mimirClient.PreviewRound({
      sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
      roundData: {
        chombo: { loserIds: [187], roundIndex: 3, honba: 3 },
      },
    });
    expect(response).toBeDefined();
    expect(response.state.honba).toEqual(3);
    expect(response.state.roundIndex).toEqual(3);
    expect(response.state.payments.direct).toEqual([
      { from: 187, to: 11, amount: 4000 },
      { from: 187, to: 97, amount: 4000 },
      { from: 187, to: 281, amount: 4000 },
    ]);
    expect(response.state.payments.honba).toEqual([]);
    expect(response.state.payments.riichi).toEqual([]);
    expect(response.state.riichi).toEqual(0);
  });

  test('PreviewRound: invalid chombo', async () => {
    await expect(
      mimirClient.PreviewRound({
        sessionHash: '750cd6015c59aed57ebd9260d03fb80adb3b83f7',
        roundData: {
          chombo: { loserIds: [187], roundIndex: 3, honba: 2 },
        },
      })
    ).rejects.toThrow();
  });

  test('StartGame & CancelGame: valid', async () => {
    const response = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    expect(response).toBeDefined();
    expect(response.sessionHash).toBeDefined();
    await timeout(100);
    const cancelResponse = await mimirClient.CancelGame(response.sessionHash);
    expect(cancelResponse).toBeDefined();
    expect(cancelResponse.success).toBe(true);
  });

  test('AddRound: valid ron', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        ron: {
          roundIndex: 1,
          honba: 0,
          winnerId: 10,
          loserId: 2,
          paoPlayerId: 0,
          han: 3,
          fu: 30,
          yaku: [Yaku.PINFU, Yaku.TANYAO],
          riichiBets: [97],
          dora: 1,
          uradora: 0,
          kandora: 0,
          kanuradora: 0,
          openHand: false,
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.round).toEqual(2);
    expect(response.honba).toEqual(0);
    expect(response.scores).toEqual([
      { playerId: 2, score: 30000 - 3900, chomboCount: 0 },
      { playerId: 10, score: 30000 + 3900 + 1000, chomboCount: 0 },
      { playerId: 97, score: 30000 - 1000, chomboCount: 0 },
      { playerId: 110, score: 30000, chomboCount: 0 },
    ]);
  });

  test('AddRound: invalid ron', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    await expect(
      mimirClient.AddRound({
        sessionHash,
        roundData: {
          ron: {
            roundIndex: 1,
            honba: 1,
            winnerId: 10,
            loserId: 2,
            paoPlayerId: 0,
            han: 3,
            fu: 30,
            yaku: [Yaku.PINFU, Yaku.TANYAO],
            riichiBets: [97],
            dora: 1,
            uradora: 0,
            kandora: 0,
            kanuradora: 0,
            openHand: false,
          },
        },
      })
    ).rejects.toThrow();
  });

  test('AddRound: valid tsumo', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        tsumo: {
          roundIndex: 1,
          honba: 0,
          winnerId: 10,
          paoPlayerId: 0,
          han: 3,
          fu: 30,
          yaku: [Yaku.PINFU, Yaku.TANYAO],
          riichiBets: [97],
          dora: 1,
          uradora: 0,
          kandora: 0,
          kanuradora: 0,
          openHand: false,
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.round).toEqual(2);
    expect(response.honba).toEqual(0);
    expect(response.scores).toEqual([
      { playerId: 2, score: 30000 - 2000, chomboCount: 0 },
      { playerId: 10, score: 30000 + 4000 + 1000, chomboCount: 0 },
      { playerId: 97, score: 30000 - 1000 - 1000, chomboCount: 0 },
      { playerId: 110, score: 30000 - 1000, chomboCount: 0 },
    ]);
  });

  test('AddRound: invalid tsumo', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    await expect(
      mimirClient.AddRound({
        sessionHash,
        roundData: {
          tsumo: {
            roundIndex: 1,
            honba: 1,
            winnerId: 10,
            paoPlayerId: 0,
            han: 3,
            fu: 30,
            yaku: [Yaku.PINFU, Yaku.TANYAO],
            riichiBets: [97],
            dora: 1,
            uradora: 0,
            kandora: 0,
            kanuradora: 0,
            openHand: false,
          },
        },
      })
    ).rejects.toThrow();
  });

  test('AddRound: valid draw', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        draw: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [97],
          tempai: [10, 97],
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.round).toEqual(2);
    expect(response.honba).toEqual(1);
    expect(response.scores).toEqual([
      { playerId: 2, score: 30000 - 1500, chomboCount: 0 },
      { playerId: 10, score: 30000 + 1500, chomboCount: 0 },
      { playerId: 97, score: 30000 + 1500 - 1000, chomboCount: 0 },
      { playerId: 110, score: 30000 - 1500, chomboCount: 0 },
    ]);
  });

  test('AddRound: invalid draw', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    await expect(
      mimirClient.AddRound({
        sessionHash,
        roundData: {
          draw: {
            roundIndex: 1,
            honba: 1,
            riichiBets: [97],
            tempai: [10, 97],
          },
        },
      })
    ).rejects.toThrow();
  });

  test('AddRound: valid abortive', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        abort: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [10, 97],
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.round).toEqual(1);
    expect(response.honba).toEqual(1);
    expect(response.scores).toEqual([
      { playerId: 2, score: 30000, chomboCount: 0 },
      { playerId: 10, score: 30000 - 1000, chomboCount: 0 },
      { playerId: 97, score: 30000 - 1000, chomboCount: 0 },
      { playerId: 110, score: 30000, chomboCount: 0 },
    ]);
  });

  test('AddRound: invalid abortive', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    await expect(
      mimirClient.AddRound({
        sessionHash,
        roundData: {
          abort: {
            roundIndex: 1,
            honba: 1,
            riichiBets: [10, 97],
          },
        },
      })
    ).rejects.toThrow();
  });

  test('AddRound: valid nagashi', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        nagashi: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [10, 97],
          tempai: [10, 97],
          nagashi: [110],
        },
      },
    });
    expect(response).toBeDefined();
    expect(response.round).toEqual(2);
    expect(response.honba).toEqual(1);
    expect(response.scores).toEqual([
      { playerId: 2, score: 30000 - 4000, chomboCount: 0 },
      { playerId: 10, score: 30000 - 1000 - 2000, chomboCount: 0 },
      { playerId: 97, score: 30000 - 1000 - 2000, chomboCount: 0 },
      { playerId: 110, score: 30000 + 8000, chomboCount: 0 },
    ]);
  });

  test('AddRound: invalid nagashi', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    await expect(
      mimirClient.AddRound({
        sessionHash,
        roundData: {
          nagashi: {
            roundIndex: 1,
            honba: 1,
            riichiBets: [10, 97],
            tempai: [10, 97],
            nagashi: [110],
          },
        },
      })
    ).rejects.toThrow();
  });

  test('AddRound: valid chombo', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        chombo: { loserIds: [10], roundIndex: 1, honba: 0 },
      },
    });
    expect(response).toBeDefined();
    expect(response.round).toEqual(1);
    expect(response.honba).toEqual(0);
    expect(response.scores).toEqual([
      { playerId: 2, score: 30000 + 4000, chomboCount: 0 },
      { playerId: 10, score: 30000 - 8000, chomboCount: 0 },
      { playerId: 97, score: 30000 + 2000, chomboCount: 0 },
      { playerId: 110, score: 30000 + 2000, chomboCount: 0 },
    ]);
  });

  test('AddRound: invalid chombo', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    await expect(
      mimirClient.AddRound({
        sessionHash,
        roundData: {
          chombo: { loserIds: [10], roundIndex: 1, honba: 1 },
        },
      })
    ).rejects.toThrow();
  });

  test('DropLastRound: valid drop', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        abort: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [10, 97],
        },
      },
    });
    await timeout(100);
    const sessionOverview = await mimirClient.GetSessionOverview(sessionHash);
    expect(sessionOverview.state.roundIndex).toBe(1);
    expect(sessionOverview.state.honbaCount).toBe(1);
    const dropResponse = await mimirClient.DropLastRound(sessionHash, response.scores);
    expect(dropResponse.success).toBe(true);
    await timeout(100);
    const sessionOverview2 = await mimirClient.GetSessionOverview(sessionHash);
    expect(sessionOverview2.state.roundIndex).toBe(1);
    expect(sessionOverview2.state.honbaCount).toBe(0);
  });

  test('DropLastRound: invalid drop', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    const response = await mimirClient.AddRound({
      sessionHash,
      roundData: {
        abort: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [10, 97],
        },
      },
    });
    // add one more round and try dropping previous one
    await mimirClient.AddRound({
      sessionHash,
      roundData: {
        abort: {
          roundIndex: 1,
          honba: 1,
          riichiBets: [10, 97],
        },
      },
    });
    await timeout(100);
    const sessionOverview = await mimirClient.GetSessionOverview(sessionHash);
    expect(sessionOverview.state.roundIndex).toBe(1);
    expect(sessionOverview.state.honbaCount).toBe(2);
    await expect(mimirClient.DropLastRound(sessionHash, response.scores)).rejects.toThrow();
  });

  test('ForceFinishGame: valid finish', async () => {
    const { sessionHash } = await mimirClient.StartGame(CLUB_RATING_EVENT_ID, [2, 10, 97, 110]);
    await timeout(100);
    await mimirClient.AddRound({
      sessionHash,
      roundData: {
        abort: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [10, 97],
        },
      },
    });
    await mimirClient.AddRound({
      sessionHash,
      roundData: {
        abort: {
          roundIndex: 1,
          honba: 1,
          riichiBets: [10, 97],
        },
      },
    });
    await timeout(100);
    const result = await mimirClient.ForceFinishGame(sessionHash);
    expect(result.success).toBe(true);
    await timeout(100);
    const sessionOverview = await mimirClient.GetSessionOverview(sessionHash);
    expect(sessionOverview.state.roundIndex).toBe(1);
    expect(sessionOverview.state.honbaCount).toBe(2);
    expect(sessionOverview.state.finished).toBe(true);
  });

  test('GetLastResults: valid result', async () => {
    const results = await mimirClient.GetLastResults(393, TOURNAMENT_EVENT_ID);
    expect(results.results).toEqual([
      {
        eventId: TOURNAMENT_EVENT_ID,
        hasAvatar: false,
        lastUpdate: expect.any(String),
        place: 3,
        playerId: 393,
        ratingDelta: -17800,
        score: 22200,
        sessionHash: expect.any(String),
        title: 'title393',
      },
      {
        eventId: TOURNAMENT_EVENT_ID,
        hasAvatar: false,
        lastUpdate: expect.any(String),
        place: 2,
        playerId: 948,
        ratingDelta: 10900,
        score: 30900,
        sessionHash: expect.any(String),
        title: 'title948',
      },
      {
        eventId: TOURNAMENT_EVENT_ID,
        hasAvatar: false,
        lastUpdate: expect.any(String),
        place: 4,
        playerId: 1729,
        ratingDelta: -40500,
        score: 19500,
        sessionHash: expect.any(String),
        title: 'title1729',
      },
      {
        eventId: TOURNAMENT_EVENT_ID,
        hasAvatar: false,
        lastUpdate: expect.any(String),
        place: 1,
        playerId: 2033,
        ratingDelta: 47400,
        score: 47400,
        sessionHash: expect.any(String),
        title: 'title2033',
      },
    ]);
  });

  test('GetLastResults: unregistered player', async () => {
    const results = await mimirClient.GetLastResults(100500, TOURNAMENT_EVENT_ID);
    expect(results.results).toEqual([]);
  });

  test('GetLastRound: valid result, finished game', async () => {
    const results = await mimirClient.GetLastRound(393, TOURNAMENT_EVENT_ID);
    expect(results.round.scores).toEqual([
      { chomboCount: 0, playerId: 393, score: 22200 },
      { chomboCount: 0, playerId: 948, score: 30900 },
      { chomboCount: 0, playerId: 1729, score: 19500 },
      { chomboCount: 0, playerId: 2033, score: 47400 },
    ]);
  });

  test('GetLastRound: valid result, unfinished game', async () => {
    const results = await mimirClient.GetLastRound(1516, CLUB_RATING_EVENT_ID);
    expect(results.round.scores).toEqual([
      { chomboCount: 0, playerId: 26, score: 25400 },
      { chomboCount: 0, playerId: 97, score: 39700 },
      { chomboCount: 0, playerId: 1411, score: 26500 },
      { chomboCount: 0, playerId: 1516, score: 28400 },
    ]);
  });

  test('GetLastRound: unregistered player', async () => {
    await expect(mimirClient.GetLastRound(100500, CLUB_RATING_EVENT_ID)).rejects.toThrow();
  });

  test('GetAllRounds: valid result, finished game', async () => {
    const results = await mimirClient.GetAllRounds('e7a35da5c1196ef3edf7b1f09e2a8bd583f81395');
    expect(results.rounds.length).toBeGreaterThan(0);
  });

  test('GetAllRounds: valid result, unfinished game', async () => {
    const results = await mimirClient.GetAllRounds('106c9aa61ff7449c30d7c44091d7e9998eef9d6b');
    expect(results.rounds.length).toBeGreaterThan(0);
  });

  test('GetAllRounds: non-existing game', async () => {
    await expect(mimirClient.GetAllRounds('non-existing-game')).rejects.toThrow();
  });

  test('GetLastRoundByHash: valid result, finished game', async () => {
    const results = await mimirClient.GetLastRoundByHash(
      'e7a35da5c1196ef3edf7b1f09e2a8bd583f81395'
    );
    expect(results.round.scores).toEqual([
      {
        chomboCount: 0,
        playerId: 235,
        score: 40600,
      },
      {
        chomboCount: 0,
        playerId: 1002,
        score: 2900,
      },
      {
        chomboCount: 0,
        playerId: 1834,
        score: 38100,
      },
      {
        chomboCount: 0,
        playerId: 2572,
        score: 37400,
      },
    ]);
  });

  test('GetLastRoundByHash: valid result, unfinished game', async () => {
    const results = await mimirClient.GetLastRoundByHash(
      '106c9aa61ff7449c30d7c44091d7e9998eef9d6b'
    );
    expect(results.round.scores).toEqual([
      {
        chomboCount: 0,
        playerId: 2,
        score: 13700,
      },
      {
        chomboCount: 0,
        playerId: 26,
        score: 79100,
      },
      {
        chomboCount: 0,
        playerId: 187,
        score: 13700,
      },
      {
        chomboCount: 0,
        playerId: 1516,
        score: 13500,
      },
    ]);
  });

  test('GetLastRoundByHash: non-existing game', async () => {
    await expect(mimirClient.GetLastRoundByHash('non-existing-game')).rejects.toThrow();
  });

  test('GetEventForEdit', async () => {
    const result = await mimirClient.GetEventForEdit(CLUB_RATING_EVENT_ID);
    expect(result).toBeDefined();
    expect(result.id).toBe(CLUB_RATING_EVENT_ID);
  });

  test('UpdateEvent', async () => {
    const { event } = await mimirClient.GetEventForEdit(ONLINE_TOURNAMENT_EVENT_ID);
    event.title = 'Modified Online Tournament';
    const result = await mimirClient.UpdateEvent(ONLINE_TOURNAMENT_EVENT_ID, event);
    expect(result.success).toBe(true);
    await timeout(100);
    const updatedEvent = await mimirClient.GetEventForEdit(ONLINE_TOURNAMENT_EVENT_ID);
    expect(updatedEvent.event.title).toBe('Modified Online Tournament');
  });

  test('FinishEvent', async () => {
    const { eventId } = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_LOCAL,
      title: 'test event',
      description: 'test event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    const result = await mimirClient.FinishEvent(eventId);
    expect(result.success).toBe(true);
    const updatedEvent = await mimirClient.GetEventsById([eventId]);
    expect(updatedEvent.events[0].finished).toBe(true);
  });

  test('RegisterPlayer / UnregisterPlayer: club rating', async () => {
    const result = await mimirClient.RegisterPlayer(ONLINE_TOURNAMENT_EVENT_ID, 100);
    expect(result.success).toBe(true);
    const unregisterResult = await mimirClient.UnregisterPlayer(ONLINE_TOURNAMENT_EVENT_ID, 100);
    expect(unregisterResult.success).toBe(true);
  });

  test('RegisterPlayer failure: tournament rating which is already started', async () => {
    await expect(mimirClient.RegisterPlayer(TOURNAMENT_EVENT_ID, 100)).rejects.toThrow();
  });

  test('UpdatePlayerSeatingFlag', async () => {
    const result = await mimirClient.UpdatePlayerSeatingFlag(TOURNAMENT_EVENT_ID, 743, true);
    expect(result.success).toBe(true);
    await timeout(100);
    const regs = await mimirClient.GetAllRegisteredPlayers([TOURNAMENT_EVENT_ID]);
    expect(regs.players.find((p) => p.id === 743)!.ignoreSeating).toBe(true);
    const result2 = await mimirClient.UpdatePlayerSeatingFlag(TOURNAMENT_EVENT_ID, 743, false);
    expect(result2.success).toBe(true);
    await timeout(100);
    const regs2 = await mimirClient.GetAllRegisteredPlayers([TOURNAMENT_EVENT_ID]);
    expect(regs2.players.find((p) => p.id === 743)!.ignoreSeating).toBe(false);
  });

  test('ToggleListed: unlist event', async () => {
    const id = v4();
    const { eventId } = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_LOCAL,
      title: 'listable event ' + id,
      description: 'listable event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    await timeout(100);

    const response = await mimirClient.ToggleListed(eventId);
    expect(response).toBeDefined();
    expect(response.success).toEqual(true);
    await timeout(100);

    const events = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: true,
      filter: id,
    });
    expect(events).toBeDefined();
    expect(events.total).toEqual(0);
    expect(events.events.length).toEqual(0);

    const eventsAll = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: false,
      filter: id,
    });
    expect(eventsAll).toBeDefined();
    expect(eventsAll.total).toEqual(1);
    expect(eventsAll.events.length).toEqual(1);

    await mimirClient.ToggleListed(eventId);
    await timeout(100);

    const eventsOrig = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: true,
      filter: id,
    });
    expect(eventsOrig).toBeDefined();
    expect(eventsOrig.total).toEqual(1);
    expect(eventsOrig.events.length).toEqual(1);
  });

  test('ToggleHideResults', async () => {
    const id = v4();
    const { eventId } = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_LOCAL,
      title: 'listable event ' + id,
      description: 'listable event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    await timeout(100);

    const response = await mimirClient.ToggleHideResults(eventId);
    expect(response).toBeDefined();
    expect(response.success).toEqual(true);
    await timeout(100);

    const events = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: false,
      filter: id,
    });
    expect(events).toBeDefined();
    expect(events.events[0].isRatingShown).toEqual(false);

    await mimirClient.ToggleHideResults(eventId);
    await timeout(100);

    const eventsOrig = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: false,
      filter: id,
    });
    expect(eventsOrig).toBeDefined();
    expect(eventsOrig.events[0].isRatingShown).toEqual(true);
  });

  test('ToggleHideAchievements', async () => {
    const id = v4();
    const { eventId } = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_LOCAL,
      title: 'listable event ' + id,
      description: 'listable event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    await timeout(100);

    const response = await mimirClient.ToggleHideAchievements(eventId);
    expect(response).toBeDefined();
    expect(response.success).toEqual(true);
    await timeout(100);

    const events = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: false,
      filter: id,
    });
    expect(events).toBeDefined();
    expect(events.events[0].achievementsShown).toEqual(false);

    await mimirClient.ToggleHideAchievements(eventId);
    await timeout(100);

    const eventsOrig = await mimirClient.GetEvents({
      limit: 20,
      offset: 0,
      filterUnlisted: false,
      filter: id,
    });
    expect(eventsOrig).toBeDefined();
    expect(eventsOrig.events[0].achievementsShown).toEqual(true);
  });

  test('UpdatePlayerReplacement', async () => {
    const response = await mimirClient.UpdatePlayerReplacement(TOURNAMENT_EVENT_ID, 1834, 100500);
    expect(response).toBeDefined();
    expect(response.success).toEqual(true);
    await timeout(100);
    const regs = await mimirClient.GetAllRegisteredPlayers([TOURNAMENT_EVENT_ID]);
    expect(regs.players.find((p) => p.id === 1834)!.replacedBy).toBeDefined();
    expect(regs.players.find((p) => p.id === 1834)!.replacedBy!.id).toEqual(100500);

    const response2 = await mimirClient.UpdatePlayerReplacement(TOURNAMENT_EVENT_ID, 1834, -1);
    expect(response2).toBeDefined();
    expect(response2.success).toEqual(true);
    await timeout(100);
    const regs2 = await mimirClient.GetAllRegisteredPlayers([TOURNAMENT_EVENT_ID]);
    expect(regs2.players.find((p) => p.id === 1834)!.replacedBy).toBeUndefined();
  });

  test('GetPlayer', async () => {
    const response = await mimirClient.GetPlayer(1834);
    expect(response).toBeDefined();
    expect(response.players).toBeDefined();
    expect(response.players.id).toEqual(1834);
  });

  test('GetCurrentStateForPlayer', async () => {
    const response = await mimirClient.GetCurrentStateForPlayer(CLUB_RATING_EVENT_ID, 1516);
    expect(response).toBeDefined();
    expect(response.config).toBeDefined();
    expect(response.sessions.length).toEqual(3);
  });

  test('AddPenalty & ListPenalties & CancelPenalty', async () => {
    const listBase = await mimirClient.ListPenalties(TOURNAMENT_EVENT_ID);
    const basePenalties = listBase.penalties.length;

    const reason = 'Test' + v4();

    const response = await mimirClient.AddPenalty({
      eventId: TOURNAMENT_EVENT_ID,
      playerId: 1834,
      amount: 1000,
      reason,
    });
    expect(response).toBeDefined();
    expect(response.success).toEqual(true);

    const list = await mimirClient.ListPenalties(TOURNAMENT_EVENT_ID);
    expect(list.penalties).toHaveLength(basePenalties + 1);
    expect(list.penalties.find((p) => p.reason?.includes(reason))?.reason).toEqual(reason);

    const cancellationReason = 'Cancelled ' + v4();

    const cancelResponse = await mimirClient.CancelPenalty(
      list.penalties.find((p) => p.reason?.includes(reason))!.id,
      cancellationReason
    );
    expect(cancelResponse).toBeDefined();
    expect(cancelResponse.success).toEqual(true);

    const finalList = await mimirClient.ListPenalties(TOURNAMENT_EVENT_ID);
    expect(finalList.penalties.find((p) => p.reason?.includes(reason))?.cancellationReason).toEqual(
      cancellationReason
    );
  });

  test('ListMyPenalties', async () => {
    mimirClient.setPersonId(1834); // player registered for club event
    const penalties = await mimirClient.ListMyPenalties(TOURNAMENT_EVENT_ID);
    mimirClient.setPersonId(1); // reset to not bother other tests
    expect(penalties.penalties.length).toBeGreaterThan(0);
    expect(penalties.penalties[0].who).toEqual(1834);
  });

  test('ListChombo', async () => {
    const chombo = await mimirClient.ListChombo(TOURNAMENT_EVENT_ID);
    expect(chombo.chombos.length).toEqual(1);
    expect(chombo.players.length).toEqual(1);
  });

  test('GetCurrentSeating', async () => {
    const seating = await mimirClient.GetCurrentSeating(TOURNAMENT_EVENT_ID);
    expect(seating.seating.length).toBeGreaterThan(0);
  });

  test('MakeShuffledSeating', async () => {
    const { eventId } = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_TOURNAMENT,
      title: 'test tournament' + v4(),
      description: 'test event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    await mimirClient.RegisterPlayer(eventId, 2517);
    await mimirClient.RegisterPlayer(eventId, 743);
    await mimirClient.RegisterPlayer(eventId, 338);
    await mimirClient.RegisterPlayer(eventId, 1834);
    await mimirClient.RegisterPlayer(eventId, 99);
    await mimirClient.RegisterPlayer(eventId, 1667);
    await mimirClient.RegisterPlayer(eventId, 948);
    await mimirClient.RegisterPlayer(eventId, 2597);

    const success = await mimirClient.MakeShuffledSeating(
      eventId,
      1,
      12345,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    expect(success.success).toBe(true);
    const seating = await mimirClient.GetCurrentSeating(eventId);
    expect(seating.seating.map((s) => s.playerId).sort((a, b) => a - b)).toEqual(
      [2517, 743, 338, 1834, 99, 1667, 948, 2597].sort((a, b) => a - b)
    );
  });

  test('MakeSwissSeating', async () => {
    const success = await mimirClient.MakeSwissSeating(
      TOURNAMENT_EVENT_ID,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    expect(success.success).toBe(true);
    const seating = await mimirClient.GetCurrentSeating(TOURNAMENT_EVENT_ID);
    await mimirClient.ResetSeating(TOURNAMENT_EVENT_ID);
    expect(seating.seating).toEqual(
      [
        {
          order: 1,
          playerId: 1068,
          rating: -69800,
          tableIndex: 7,
        },
        {
          order: 2,
          playerId: 2994,
          rating: -285400,
          tableIndex: 7,
        },
        {
          order: 3,
          playerId: 2517,
          rating: 92500,
          tableIndex: 7,
        },
        {
          order: 4,
          playerId: 1667,
          rating: -7600,
          tableIndex: 7,
        },
        {
          order: 1,
          playerId: 1175,
          rating: -59100,
          tableIndex: 6,
        },
        {
          order: 2,
          playerId: 1002,
          rating: 99100,
          tableIndex: 6,
        },
        {
          order: 3,
          playerId: 99,
          rating: 93100,
          tableIndex: 6,
        },
        {
          order: 4,
          playerId: 2902,
          rating: -137100,
          tableIndex: 6,
        },
        {
          order: 1,
          playerId: 1729,
          rating: -168600,
          tableIndex: 5,
        },
        {
          order: 2,
          playerId: 393,
          rating: -23900,
          tableIndex: 5,
        },
        {
          order: 3,
          playerId: 2387,
          rating: 61100,
          tableIndex: 5,
        },
        {
          order: 4,
          playerId: 2572,
          rating: 107200,
          tableIndex: 5,
        },
        {
          order: 1,
          playerId: 235,
          rating: 117300,
          tableIndex: 4,
        },
        {
          order: 2,
          playerId: 743,
          rating: 77500,
          tableIndex: 4,
        },
        {
          order: 3,
          playerId: 948,
          rating: -58900,
          tableIndex: 4,
        },
        {
          order: 4,
          playerId: 1468,
          rating: -11100,
          tableIndex: 4,
        },
        {
          order: 1,
          playerId: 2924,
          rating: 61600,
          tableIndex: 3,
        },
        {
          order: 2,
          playerId: 2597,
          rating: -148200,
          tableIndex: 3,
        },
        {
          order: 3,
          playerId: 1028,
          rating: 117700,
          tableIndex: 3,
        },
        {
          order: 4,
          playerId: 304,
          rating: -13500,
          tableIndex: 3,
        },
        {
          order: 1,
          playerId: 86,
          rating: 23000,
          tableIndex: 2,
        },
        {
          order: 2,
          playerId: 2318,
          rating: 34000,
          tableIndex: 2,
        },
        {
          order: 3,
          playerId: 761,
          rating: 151700,
          tableIndex: 2,
        },
        {
          order: 4,
          playerId: 1407,
          rating: -95500,
          tableIndex: 2,
        },
        {
          order: 1,
          playerId: 338,
          rating: 61100,
          tableIndex: 1,
        },
        {
          order: 2,
          playerId: 1834,
          rating: 153500,
          tableIndex: 1,
        },
        {
          order: 3,
          playerId: 147,
          // player from he bottom of the table is placed on the 1st
          // table - this is fine, it's how swiss seating works
          rating: -170900,
          tableIndex: 1,
        },
        {
          order: 4,
          playerId: 2033,
          rating: -40800,
          tableIndex: 1,
        },
      ].map((item) => ({
        ...item,
        hasAvatar: expect.any(Boolean),
        lastUpdate: expect.any(String),
        playerTitle: expect.any(String),
        sessionId: expect.any(Number),
      }))
    );
  });

  test('GenerateSwissSeating', async () => {
    const seating = await mimirClient.GenerateSwissSeating(
      TOURNAMENT_EVENT_ID,
      false,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    expect(seating.tables).toEqual([
      {
        players: [
          {
            playerId: 338,
          },
          {
            playerId: 1834,
          },
          {
            playerId: 147,
          },
          {
            playerId: 2033,
          },
        ],
      },
      {
        players: [
          {
            playerId: 86,
          },
          {
            playerId: 2318,
          },
          {
            playerId: 761,
          },
          {
            playerId: 1407,
          },
        ],
      },
      {
        players: [
          {
            playerId: 2924,
          },
          {
            playerId: 2597,
          },
          {
            playerId: 1028,
          },
          {
            playerId: 304,
          },
        ],
      },
      {
        players: [
          {
            playerId: 235,
          },
          {
            playerId: 743,
          },
          {
            playerId: 948,
          },
          {
            playerId: 1468,
          },
        ],
      },
      {
        players: [
          {
            playerId: 1729,
          },
          {
            playerId: 393,
          },
          {
            playerId: 2387,
          },
          {
            playerId: 2572,
          },
        ],
      },
      {
        players: [
          {
            playerId: 1175,
          },
          {
            playerId: 1002,
          },
          {
            playerId: 99,
          },
          {
            playerId: 2902,
          },
        ],
      },
      {
        players: [
          {
            playerId: 1068,
          },
          {
            playerId: 2994,
          },
          {
            playerId: 2517,
          },
          {
            playerId: 1667,
          },
        ],
      },
    ]);
  });

  test('MakeIntervalSeating', async () => {
    const success = await mimirClient.MakeIntervalSeating(
      TOURNAMENT_EVENT_ID,
      3,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    expect(success.success).toBe(true);
    const seating = await mimirClient.GetCurrentSeating(TOURNAMENT_EVENT_ID);
    await mimirClient.ResetSeating(TOURNAMENT_EVENT_ID);
    expect(seating.seating).toEqual(
      [
        {
          order: 1,
          playerId: 147,
          tableIndex: 7,
        },
        {
          order: 2,
          playerId: 2994,
          tableIndex: 7,
        },
        {
          order: 3,
          playerId: 1729,
          tableIndex: 7,
        },
        {
          order: 4,
          playerId: 2597,
          tableIndex: 7,
        },
        {
          order: 1,
          playerId: 1667,
          tableIndex: 6,
        },
        {
          order: 2,
          playerId: 393,
          tableIndex: 6,
        },
        {
          order: 3,
          playerId: 2902,
          tableIndex: 6,
        },
        {
          order: 4,
          playerId: 1175,
          tableIndex: 6,
        },
        {
          order: 1,
          playerId: 86,
          tableIndex: 5,
        },
        {
          order: 2,
          playerId: 304,
          tableIndex: 5,
        },
        {
          order: 3,
          playerId: 948,
          tableIndex: 5,
        },
        {
          order: 4,
          playerId: 1407,
          tableIndex: 5,
        },
        {
          order: 1,
          playerId: 1068,
          tableIndex: 4,
        },
        {
          order: 2,
          playerId: 2318,
          tableIndex: 4,
        },
        {
          order: 3,
          playerId: 1468,
          tableIndex: 4,
        },
        {
          order: 4,
          playerId: 2033,
          tableIndex: 4,
        },
        {
          order: 1,
          playerId: 338,
          tableIndex: 3,
        },
        {
          order: 2,
          playerId: 743,
          tableIndex: 3,
        },
        {
          order: 3,
          playerId: 1028,
          tableIndex: 3,
        },
        {
          order: 4,
          playerId: 1002,
          tableIndex: 3,
        },
        {
          order: 1,
          playerId: 761,
          tableIndex: 2,
        },
        {
          order: 2,
          playerId: 2517,
          tableIndex: 2,
        },
        {
          order: 3,
          playerId: 2387,
          tableIndex: 2,
        },
        {
          order: 4,
          playerId: 2572,
          tableIndex: 2,
        },
        {
          order: 1,
          playerId: 2924,
          tableIndex: 1,
        },
        {
          order: 2,
          playerId: 1834,
          tableIndex: 1,
        },
        {
          order: 3,
          playerId: 99,
          tableIndex: 1,
        },
        {
          order: 4,
          playerId: 235,
          tableIndex: 1,
        },
      ].map((item) => ({
        ...item,
        hasAvatar: expect.any(Boolean),
        lastUpdate: expect.any(String),
        playerTitle: expect.any(String),
        rating: expect.any(Number),
        sessionId: expect.any(Number),
      }))
    );
  });

  test('PrescriptedSeating', async () => {
    const { eventId } = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_TOURNAMENT,
      title: 'test tournament' + v4(),
      description: 'test event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: true,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    await timeout(100);
    await mimirClient.RegisterPlayer(eventId, 2517);
    await mimirClient.RegisterPlayer(eventId, 743);
    await mimirClient.RegisterPlayer(eventId, 338);
    await mimirClient.RegisterPlayer(eventId, 1834);
    await mimirClient.RegisterPlayer(eventId, 99);
    await mimirClient.RegisterPlayer(eventId, 1667);
    await mimirClient.RegisterPlayer(eventId, 948);
    await mimirClient.RegisterPlayer(eventId, 2597);

    // Changing identifiers must never insert registrations or move player identity.
    const dbConfig = new ConfigService().db;
    const db = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      await db.query(
        'update event_registered_players set ignore_seating = 1, replacement_id = 999, team_name = $1 where event_id = $2 and player_id = 2517',
        ['Regression team', eventId]
      );
      const snapshot = async () =>
        (
          await db.query('select * from event_registered_players where event_id = $1 order by id', [
            eventId,
          ])
        ).rows;
      const before = await snapshot();
      const save = (idsToLocalIds: { playerId: number; localId: number }[]) =>
        mimirClient.UpdatePlayersLocalIds({ eventId, idsToLocalIds });
      await save([
        { playerId: 2517, localId: 9 },
        { playerId: 743, localId: 10 },
      ]);
      expect(await snapshot()).toEqual(
        before.map((row) => ({
          ...row,
          local_id: row.player_id === 2517 ? 9 : row.player_id === 743 ? 10 : row.local_id,
        }))
      );
      await save([
        { playerId: 2517, localId: 10 },
        { playerId: 743, localId: 9 },
      ]);
      const afterSwap = await snapshot();
      expect(afterSwap).toEqual(
        before.map((row) => ({
          ...row,
          local_id: row.player_id === 2517 ? 10 : row.player_id === 743 ? 9 : row.local_id,
        }))
      );
      for (const invalid of [
        [{ playerId: 2517, localId: 3 }], // Owned by an omitted player.
        [{ playerId: 999999, localId: 11 }],
        [{ playerId: 2517, localId: 0 }],
        [
          { playerId: 2517, localId: 11 },
          { playerId: 743, localId: 11 },
        ],
        [
          { playerId: 2517, localId: 11 },
          { playerId: 2517, localId: 12 },
        ],
      ]) {
        await expect(save(invalid)).rejects.toThrow();
        expect(await snapshot()).toEqual(afterSwap);
      }
      // Both database invariants must protect writes outside this form too.
      await expect(
        db.query(
          'insert into event_registered_players (event_id, player_id, local_id, ignore_seating) values ($1, 2517, 11, 0)',
          [eventId]
        )
      ).rejects.toThrow('event_registered_players_event_id_player_id_unique');
      await expect(
        db.query(
          'insert into event_registered_players (event_id, player_id, local_id, ignore_seating) values ($1, 999999, 10, 0)',
          [eventId]
        )
      ).rejects.toThrow('event_registered_players_event_id_local_id_unique');
      await db.query(
        'update event_registered_players set ignore_seating = 0, replacement_id = null, team_name = null where event_id = $1 and player_id = 2517',
        [eventId]
      );
    } finally {
      await db.end();
    }

    await mimirClient.UpdatePlayersLocalIds({
      eventId,
      idsToLocalIds: [
        { playerId: 2517, localId: 1 },
        { playerId: 743, localId: 2 },
        { playerId: 338, localId: 3 },
        { playerId: 1834, localId: 4 },
        { playerId: 99, localId: 5 },
        { playerId: 1667, localId: 6 },
        { playerId: 948, localId: 7 },
        { playerId: 2597, localId: 8 },
      ],
    });

    const prescript = ['1-2-3-4', '5-6-7-8', '', '1-3-5-7', '2-4-6-8'].join('\n');

    const config = await mimirClient.GetPrescriptedEventConfig(eventId);
    expect(config).toEqual({
      eventId,
      nextSessionIndex: 1,
      prescript: '',
      errors: ['No predefined seating yet'],
    });

    await mimirClient.UpdatePrescriptedEventConfig({
      eventId,
      prescript,
      nextSessionIndex: 1,
    });
    await timeout(100);
    const configAfterUpdate = await mimirClient.GetPrescriptedEventConfig(eventId);
    expect(configAfterUpdate.eventId).toEqual(eventId);
    expect(configAfterUpdate.nextSessionIndex).toEqual(1);
    expect(configAfterUpdate.prescript).toEqual(prescript);

    await mimirClient.MakePrescriptedSeating(eventId);
    const seating = await mimirClient.GetCurrentSeating(eventId);
    expect(seating.seating).toEqual(
      [
        {
          order: 1,
          playerId: 948,
          tableIndex: 2,
        },
        {
          order: 2,
          playerId: 99,
          tableIndex: 2,
        },
        {
          order: 3,
          playerId: 2597,
          tableIndex: 2,
        },
        {
          order: 4,
          playerId: 1667,
          tableIndex: 2,
        },
        {
          order: 1,
          playerId: 743,
          tableIndex: 1,
        },
        {
          order: 2,
          playerId: 338,
          tableIndex: 1,
        },
        {
          order: 3,
          playerId: 1834,
          tableIndex: 1,
        },
        {
          order: 4,
          playerId: 2517,
          tableIndex: 1,
        },
      ].map((item) => ({
        ...item,
        hasAvatar: expect.any(Boolean),
        lastUpdate: expect.any(String),
        playerTitle: expect.any(String),
        rating: expect.any(Number),
        sessionId: expect.any(Number),
      }))
    );
  });

  test('GetTimerState: general state flow / StartTimer / AddExtraTime', async () => {
    const { eventId } = await mimirClient.CreateEvent({
      type: EventType.EVENT_TYPE_TOURNAMENT,
      title: 'test tournament' + v4(),
      description: 'test event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam: false,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    await mimirClient.RegisterPlayer(eventId, 2517);
    await mimirClient.RegisterPlayer(eventId, 743);
    await mimirClient.RegisterPlayer(eventId, 338);
    await mimirClient.RegisterPlayer(eventId, 1834);

    const state1 = await mimirClient.GetTimerState(eventId);
    expect(state1.started).toBe(false);
    expect(state1.waitingForTimer).toBe(false);

    const success = await mimirClient.MakeShuffledSeating(
      eventId,
      1,
      12345,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    expect(success.success).toBe(true);

    const state2 = await mimirClient.GetTimerState(eventId);
    expect(state2.started).toBe(false);
    expect(state2.waitingForTimer).toBe(true);

    await mimirClient.StartTimer(eventId);

    const state3 = await mimirClient.GetTimerState(eventId);
    expect(state3.started).toBe(true);
    expect(state3.waitingForTimer).toBe(false);

    const sessions = await mimirClient.GetCurrentSessions(2517, eventId);
    expect(sessions.sessions.length).toBe(1);
    expect(sessions.sessions[0].timerState.timeRemaining).toBeGreaterThan(0);
    const remaining = sessions.sessions[0].timerState.timeRemaining;

    const success2 = await mimirClient.AddExtraTime({
      sessionHashList: [sessions.sessions[0].sessionHash],
      extraTime: 5 * 60,
    });
    expect(success2.success).toBe(true);

    const sessions2 = await mimirClient.GetCurrentSessions(2517, eventId);
    expect(sessions2.sessions[0].timerState.timeRemaining).toBeGreaterThan(remaining + 5 * 60 - 10);
  });

  test('GetTablesState', async () => {
    const tablesStateBefore = await mimirClient.GetTablesState({
      eventId: TOURNAMENT_EVENT_ID,
      omitLastRound: true,
    });

    for (const t of tablesStateBefore.tables) {
      expect(t.currentRoundIndex).toBeGreaterThan(1);
      expect(t.players.length).toBe(4);
      expect(t.status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
    }

    const success = await mimirClient.MakeSwissSeating(
      TOURNAMENT_EVENT_ID,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    expect(success.success).toBe(true);
    const tablesState = await mimirClient.GetTablesState({
      eventId: TOURNAMENT_EVENT_ID,
      omitLastRound: true,
    });
    await mimirClient.ResetSeating(TOURNAMENT_EVENT_ID);

    for (const t of tablesState.tables) {
      expect(t.currentRoundIndex).toBe(1);
      expect(t.players.length).toBe(4);
      expect(t.status).toBe(SessionStatus.SESSION_STATUS_INPROGRESS);
    }
  });

  const gameFlowPlayerIds = [2517, 743, 338, 1834];

  const createEventWithRegisteredPlayers = async (
    type: EventType,
    titlePrefix: string,
    isTeam = false
  ) => {
    const { eventId } = await mimirClient.CreateEvent({
      type,
      title: titlePrefix + v4(),
      description: 'test event desc',
      duration: 75,
      timezone: 'UTC',
      lobbyId: 0,
      seriesLength: 0,
      minGames: 0,
      isTeam,
      isPrescripted: false,
      rulesetConfig: RulesetEntity.createRuleset('rrc').rules,
      isListed: true,
      isRatingShown: true,
      achievementsShown: true,
      allowViewOtherTables: true,
      platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      allowManualAddReplay: false,
      windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    });
    for (const playerId of gameFlowPlayerIds) {
      await mimirClient.RegisterPlayer(eventId, playerId);
    }
    return eventId;
  };

  const addEightDrawRounds = async (sessionHash: string, playerIds: number[]) => {
    for (let roundIndex = 1; roundIndex <= 8; roundIndex++) {
      await mimirClient.AddRound({
        sessionHash,
        roundData: {
          draw: {
            roundIndex,
            honba: roundIndex - 1,
            riichiBets: [playerIds[(roundIndex + 1) % 4]],
            tempai: [playerIds[roundIndex % 4], playerIds[(roundIndex + 1) % 4]],
          },
        },
      });
    }
  };

  const preparePrefinishedTournamentTable = async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_TOURNAMENT,
      'test tournament '
    );
    await mimirClient.MakeShuffledSeating(
      eventId,
      1,
      12345,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    await mimirClient.StartTimer(eventId);
    const tablesState = await mimirClient.GetTablesState({
      eventId,
      omitLastRound: true,
    });
    const sessionHash = tablesState.tables[0].sessionHash;
    const playerIds = tablesState.tables[0].players.map((p) => p.id);

    mimirClient.setEventId(eventId);
    await addEightDrawRounds(sessionHash, playerIds);

    return { eventId, sessionHash };
  };

  const prepareFinishedClubGame = async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_LOCAL,
      'test club event '
    );

    mimirClient.setEventId(eventId);
    const { sessionHash } = await mimirClient.StartGame(eventId, gameFlowPlayerIds);
    await addEightDrawRounds(sessionHash, gameFlowPlayerIds);

    return { eventId, sessionHash };
  };

  test('FinalizeSession / full tournament flow on single table', async () => {
    const { eventId } = await preparePrefinishedTournamentTable();

    const tablesStateAfter = await mimirClient.GetTablesState({
      eventId,
      omitLastRound: true,
    });

    expect(tablesStateAfter.tables[0].status).toBe(SessionStatus.SESSION_STATUS_PREFINISHED);

    const success = await mimirClient.FinalizeSession(eventId);
    expect(success.success).toBe(true);

    const tablesStateAfter2 = await mimirClient.GetTablesState({
      eventId,
      omitLastRound: true,
    });

    expect(tablesStateAfter2.tables[0].status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
  });

  test('DefinalizeGame / full club game flow on single table', async () => {
    const { eventId, sessionHash } = await prepareFinishedClubGame();
    const tablesStateFinalized = await mimirClient.GetTablesState({ eventId, omitLastRound: true });
    expect(tablesStateFinalized.tables[0].status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
    expect(tablesStateFinalized.tables[0].mayDefinalize).toBe(true);

    const definalized = await mimirClient.DefinalizeGame(sessionHash);
    expect(definalized.success).toBe(true);
    const tablesStateDefinalized = await mimirClient.GetTablesState({
      eventId,
      omitLastRound: true,
    });
    expect(tablesStateDefinalized.tables[0].status).toBe(SessionStatus.SESSION_STATUS_INPROGRESS);
  });

  test('DefinalizeGame rejects tournament games', async () => {
    const { eventId, sessionHash } = await preparePrefinishedTournamentTable();
    const finalized = await mimirClient.FinalizeSession(eventId);
    expect(finalized.success).toBe(true);
    const tablesState = await mimirClient.GetTablesState({ eventId, omitLastRound: true });
    expect(tablesState.tables[0].status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
    expect(tablesState.tables[0].mayDefinalize).toBe(false);
    await expect(mimirClient.DefinalizeGame(sessionHash)).rejects.toThrow();
    const tablesStateAfter = await mimirClient.GetTablesState({ eventId, omitLastRound: true });
    expect(tablesStateAfter.tables[0].status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
  });

  test('RebuildScoring recreates results for a finished event', async () => {
    const { eventId } = await preparePrefinishedTournamentTable();
    await mimirClient.FinalizeSession(eventId);

    const config = new ConfigService().db;
    const db = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      const resultsBefore = await db.query(
        'select id, player_id, rating_delta from session_results where event_id = $1 order by player_id',
        [eventId]
      );
      expect(resultsBefore.rows).toHaveLength(gameFlowPlayerIds.length);
      await db.query('update session_results set rating_delta = $1 where id = $2', [
        123456789,
        resultsBefore.rows[0].id,
      ]);

      const response = await mimirClient.RebuildScoring(eventId);
      expect(response.success).toBe(true);

      const resultsAfter = await db.query(
        'select id, player_id, rating_delta from session_results where event_id = $1 order by player_id',
        [eventId]
      );
      expect(resultsAfter.rows).toHaveLength(gameFlowPlayerIds.length);
      expect(resultsAfter.rows.map((result) => result.player_id).sort((a, b) => a - b)).toEqual(
        [...gameFlowPlayerIds].sort((a, b) => a - b)
      );
      expect(resultsAfter.rows.every((result) => result.rating_delta !== 123456789)).toBe(true);
      expect(resultsAfter.rows.map((result) => result.id)).not.toEqual(
        resultsBefore.rows.map((result) => result.id)
      );
    } finally {
      await db.end();
    }
  });

  test('RebuildScoring preserves all games and cumulative history across repeated rebuilds', async () => {
    const { eventId } = await prepareFinishedClubGame();
    const { sessionHash } = await mimirClient.StartGame(eventId, gameFlowPlayerIds);
    await mimirClient.AddRound({
      sessionHash,
      roundData: {
        draw: {
          roundIndex: 1,
          honba: 0,
          riichiBets: [gameFlowPlayerIds[0]],
          tempai: [gameFlowPlayerIds[1]],
        },
      },
    });
    await mimirClient.ForceFinishGame(sessionHash);
    // An unfinished game must remain untouched and excluded from rebuilt scoring.
    await mimirClient.StartGame(eventId, gameFlowPlayerIds);

    const config = new ConfigService().db;
    const db = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      const getSourceData = async () => {
        const sessions = await db.query('select * from session where event_id = $1 order by id', [
          eventId,
        ]);
        const rounds = await db.query('select * from round where event_id = $1 order by id', [
          eventId,
        ]);
        const hands = await db.query(
          'select h.* from hand h join round r on r.id = h.round_id where r.event_id = $1 order by h.id',
          [eventId]
        );
        const players = await db.query(
          'select p.* from session_players p join session s on s.id = p.session_id where s.event_id = $1 order by p.id',
          [eventId]
        );
        return [sessions.rows, rounds.rows, hands.rows, players.rows];
      };
      const getScoring = async () => {
        const results = await db.query(
          'select session_id, player_id, score, place, rating_delta, chips from session_results where event_id = $1 order by session_id, player_id',
          [eventId]
        );
        const history = await db.query(
          'select session_id, player_id, games_played, avg_place, rating, chips from player_history where event_id = $1 order by player_id, games_played',
          [eventId]
        );
        return { results: results.rows, history: history.rows };
      };
      // Historical sessions may omit zero chip counts even when chips are later enabled.
      await db.query(
        `update session set intermediate_results = jsonb_set(intermediate_results::jsonb, '{chips}', '{}') where event_id = $1`,
        [eventId]
      );
      const sourceBefore = await getSourceData();
      const scoringBefore = await getScoring();
      expect(sourceBefore[0]).toHaveLength(3);
      expect(scoringBefore.results).toHaveLength(8);
      expect(scoringBefore.results.some((item) => item.rating_delta !== 0)).toBe(true);
      expect(scoringBefore.history).toHaveLength(12);
      expect(scoringBefore.history.filter((item) => item.games_played === 2)).toHaveLength(4);
      const finalHistory = scoringBefore.history.filter((item) => item.games_played === 2);
      expect(finalHistory.some((item) => !Number.isInteger(item.avg_place))).toBe(true);
      finalHistory.forEach((item) => {
        const places = scoringBefore.results.filter(
          (result) => result.player_id === item.player_id
        );
        const expected = places.reduce((sum, result) => sum + result.place, 0) / places.length;
        expect(item.avg_place).toBeCloseTo(expected, 5);
      });

      await db.query('delete from session_results where event_id = $1', [eventId]);
      await db.query('delete from player_history where event_id = $1', [eventId]);
      expect((await mimirClient.RebuildScoring(eventId)).success).toBe(true);
      expect(await getScoring()).toEqual(scoringBefore);
      expect(await getSourceData()).toEqual(sourceBefore);

      expect((await mimirClient.RebuildScoring(eventId)).success).toBe(true);
      expect(await getScoring()).toEqual(scoringBefore);
      expect(await getSourceData()).toEqual(sourceBefore);

      // The migration's queued rebuild must repair previously rounded averages without an admin.
      // Imported events can be marked simple while storing only complex UMA tables.
      const { rows: eventRows } = await db.query('select ruleset_config from event where id = $1', [
        eventId,
      ]);
      const legacyRuleset = eventRows[0].ruleset_config;
      legacyRuleset.rules.chipsValue = 8000;
      const storedUma = legacyRuleset.rules.uma;
      legacyRuleset.rules.complexUma = { neg1: storedUma, neg3: storedUma, otherwise: storedUma };
      delete legacyRuleset.rules.uma;
      await db.query('update event set ruleset_config = $1 where id = $2', [
        legacyRuleset,
        eventId,
      ]);
      // Some imported replacement snapshots use a substitute ID in scores but the
      // registered ID in player_ids. Their recorded results must remain authoritative.
      const legacyResult = scoringBefore.results[0];
      await db.query(
        `update session set intermediate_results = jsonb_set(intermediate_results::jsonb, '{scores}',
          (intermediate_results->'scores')::jsonb - $1::text || jsonb_build_object('999999999', $2::int))
         where id = $3`,
        [String(legacyResult.player_id), legacyResult.score, legacyResult.session_id]
      );
      const queuedSourceBefore = await getSourceData();
      await db.query('update player_history set avg_place = round(avg_place) where event_id = $1', [
        eventId,
      ]);
      await db.query(
        "insert into jobs_queue (job_arguments, job_name, created_at) values ($1, 'scoring', now())",
        [JSON.stringify({ eventId })]
      );
      const orm = await MikroORM.init(ormConfig());
      try {
        const repo = Repository.instance({}, orm);
        expect(await runJob(repo, 'scoring')).toEqual({ status: 'completed', processed: 1 });
      } finally {
        await orm.close();
      }
      expect(await getScoring()).toEqual(scoringBefore);
      expect(await getSourceData()).toEqual(queuedSourceBefore);
      const jobs = await db.query(
        "select * from jobs_queue where job_name = 'scoring' and job_arguments = $1",
        [JSON.stringify({ eventId })]
      );
      expect(jobs.rows).toHaveLength(0);
    } finally {
      await db.end();
    }
  });

  test('UpdatePlayersTeams applies team names to a single-table tournament', async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_TOURNAMENT,
      'test team tournament ',
      true
    );
    await mimirClient.MakeShuffledSeating(
      eventId,
      1,
      12345,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );
    const tablesState = await mimirClient.GetTablesState({ eventId, omitLastRound: true });
    expect(tablesState.tables).toHaveLength(1);
    expect(tablesState.tables[0].currentRoundIndex).toBe(1);

    const dbConfig = new ConfigService().db;
    const db = new Client({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.username,
      password: dbConfig.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      const snapshot = async () =>
        (
          await db.query('select * from event_registered_players where event_id = $1 order by id', [
            eventId,
          ])
        ).rows;
      const before = await snapshot();
      const idsToTeamNames = [
        { playerId: 2517, teamName: 'East' },
        { playerId: 743, teamName: 'East' },
        { playerId: 338, teamName: 'West' },
        { playerId: 1834, teamName: 'West' },
      ];
      const result = await mimirClient.UpdatePlayersTeams({ eventId, idsToTeamNames });
      expect(result.success).toBe(true);

      const { players } = await mimirClient.GetAllRegisteredPlayers([eventId]);
      expect(players).toHaveLength(gameFlowPlayerIds.length);
      expect(Object.fromEntries(players.map((player) => [player.id, player.teamName]))).toEqual({
        2517: 'East',
        743: 'East',
        338: 'West',
        1834: 'West',
      });

      const names = new Map(idsToTeamNames.map(({ playerId, teamName }) => [playerId, teamName]));
      const after = await snapshot();
      expect(after).toEqual(before.map((row) => ({ ...row, team_name: names.get(row.player_id) })));
      for (const invalid of [
        [
          { playerId: 2517, teamName: 'Changed' },
          { playerId: 999999, teamName: 'Unknown' },
        ],
        [
          { playerId: 2517, teamName: 'Changed' },
          { playerId: 2517, teamName: 'Duplicate' },
        ],
      ]) {
        await expect(
          mimirClient.UpdatePlayersTeams({ eventId, idsToTeamNames: invalid })
        ).rejects.toThrow();
        expect(await snapshot()).toEqual(after);
      }
      await mimirClient.UpdatePlayersTeams({
        eventId,
        idsToTeamNames: [{ playerId: 2517, teamName: '' }],
      });
      expect(await snapshot()).toEqual(
        after.map((row) => (row.player_id === 2517 ? { ...row, team_name: '' } : row))
      );
    } finally {
      await db.end();
    }
  });

  test('ClearStatCache schedules a rebuild for a registered player', async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_LOCAL,
      'test stats invalidation '
    );
    const playerId = gameFlowPlayerIds[0];
    const jobArguments = JSON.stringify({ playerId, eventId });
    const config = new ConfigService().db;
    const db = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      const jobsBefore = await db.query(
        'select id from jobs_queue where job_name = $1 and job_arguments = $2',
        ['playerStats', jobArguments]
      );
      expect(jobsBefore.rows).toHaveLength(0);

      const response = await mimirClient.ClearStatCache(playerId);
      expect(response.success).toBe(true);
      const jobsAfter = await db.query(
        'select id from jobs_queue where job_name = $1 and job_arguments = $2',
        ['playerStats', jobArguments]
      );
      expect(jobsAfter.rows).toHaveLength(1);
    } finally {
      await db.query('delete from jobs_queue where job_name = $1 and job_arguments = $2', [
        'playerStats',
        jobArguments,
      ]);
      await db.end();
    }
  });

  test('RecalcAchievements schedules an achievements job for the event', async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_LOCAL,
      'test achievements recalculation '
    );
    const jobArguments = JSON.stringify({ eventId });
    const config = new ConfigService().db;
    const db = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    try {
      const jobsBefore = await db.query(
        'select id from jobs_queue where job_name = $1 and job_arguments = $2',
        ['achievements', jobArguments]
      );
      expect(jobsBefore.rows).toHaveLength(0);

      await mimirClient.RecalcAchievements(eventId);

      const jobsAfter = await db.query(
        'select id from jobs_queue where job_name = $1 and job_arguments = $2',
        ['achievements', jobArguments]
      );
      expect(jobsAfter.rows).toHaveLength(1);
    } finally {
      await db.query('delete from jobs_queue where job_name = $1 and job_arguments = $2', [
        'achievements',
        jobArguments,
      ]);
      await db.end();
    }
  });

  test('RecalcPlayerStats schedules a job for each registered player', async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_LOCAL,
      'test player stats recalculation '
    );
    const config = new ConfigService().db;
    const db = new Client({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: 'mimir2_unit',
    });
    await db.connect();
    const jobQuery =
      "select job_arguments from jobs_queue where job_name = $1 and job_arguments::jsonb ->> 'eventId' = $2";
    const jobParams = ['playerStats', String(eventId)];
    try {
      const jobsBefore = await db.query(jobQuery, jobParams);
      expect(jobsBefore.rows).toHaveLength(0);

      await mimirClient.RecalcPlayerStats(eventId);

      const jobsAfter = await db.query(jobQuery, jobParams);
      expect(
        jobsAfter.rows.map((row) => JSON.parse(row.job_arguments).playerId).sort((a, b) => a - b)
      ).toEqual([...gameFlowPlayerIds].sort((a, b) => a - b));
    } finally {
      await db.query(
        "delete from jobs_queue where job_name = $1 and job_arguments::jsonb ->> 'eventId' = $2",
        jobParams
      );
      await db.end();
    }
  });

  test('NotifyPlayersSessionStartsSoon sends registered player IDs to Skirnir', async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_TOURNAMENT,
      'test session notification '
    );
    const response = await mimirClient.NotifyPlayersSessionStartsSoon(eventId);
    expect(response.success).toBe(true);

    const messages = (await fetch(
      'http://localhost:4301/__test__/skirnir/session-starting-soon'
    ).then((mockResponse) => mockResponse.json())) as Array<{
      playerIds: number[];
      eventId: number;
    }>;
    const eventMessages = messages.filter((message) => message.eventId === eventId);
    expect(eventMessages).toHaveLength(1);
    expect(eventMessages[0].playerIds.sort((a, b) => a - b)).toEqual(
      [...gameFlowPlayerIds].sort((a, b) => a - b)
    );
  });

  test('CallReferee sends event and table IDs to Skirnir', async () => {
    const eventId = await createEventWithRegisteredPlayers(
      EventType.EVENT_TYPE_TOURNAMENT,
      'test referee call '
    );
    await mimirClient.MakeShuffledSeating(
      eventId,
      1,
      12345,
      WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED
    );

    const tableIndex = 1;
    const response = await mimirClient.CallReferee(eventId, tableIndex);
    expect(response.success).toBe(true);

    const calls = (await fetch('http://localhost:4301/__test__/skirnir/call-referee').then(
      (mockResponse) => mockResponse.json()
    )) as Array<{ eventId: number; tableIndex: number }>;
    expect(calls.filter((call) => call.eventId === eventId)).toEqual([{ eventId, tableIndex }]);
  });

  /*

AddPenaltyGame
AddOnlineReplay
AddTypedOnlineReplay


  */
});
