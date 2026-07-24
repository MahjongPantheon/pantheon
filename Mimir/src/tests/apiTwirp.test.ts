import { Yaku } from '../helpers/yaku.js';
import { MimirTest } from '../services/MimirTest.js';
import { EventType, PlatformType, WindShuffleMode } from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { v4 } from 'uuid';

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

  test('GetRulesets', async () => {
    const rulesets = await mimirClient.GetRulesets();
    expect(rulesets).toBeDefined();
    expect(rulesets.rulesets).toBeDefined();
    expect(rulesets.rulesetIds).toBeDefined();
    expect(rulesets.rulesetTitles).toBeDefined();
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

  test('GetLastGames: basic', async () => {
    const games = await mimirClient.GetLastGames([TOURNAMENT_EVENT_ID], 10, 0);
    expect(games).toBeDefined();
    expect(games.totalGames).toEqual(63);
    expect(games.games).toBeDefined();
    expect(games.games.length).toEqual(10);
  });

  test('GetLastGames: basic with offset', async () => {
    const games = await mimirClient.GetLastGames([TOURNAMENT_EVENT_ID], 10, 25);
    expect(games).toBeDefined();
    expect(games.totalGames).toEqual(63);
    expect(games.games).toBeDefined();
    expect(games.games.length).toEqual(10);
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
  });

  test('GetGame: existing', async () => {
    const game = await mimirClient.GetGame('ba81ec925d80bba537034e12a63b5e9e83e2cac2');
    expect(game).toBeDefined();
    expect(game.game.sessionHash).toEqual('ba81ec925d80bba537034e12a63b5e9e83e2cac2');
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

  test('GetTimerState: non-timer event', async () => {
    await expect(mimirClient.GetTimerState(CLUB_RATING_EVENT_ID)).rejects.toThrow();
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
        chombo: {
          roundIndex: 3,
          honba: 3,
          loserId: 187,
        },
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
          chombo: {
            roundIndex: 3,
            honba: 2,
            loserId: 187,
          },
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
    expect(
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
    expect(
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
    expect(
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
    expect(
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
    expect(
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
        chombo: {
          roundIndex: 1,
          honba: 0,
          loserId: 10,
        },
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
    expect(
      mimirClient.AddRound({
        sessionHash,
        roundData: {
          chombo: {
            roundIndex: 1,
            honba: 1,
            loserId: 10,
          },
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
    expect(mimirClient.DropLastRound(sessionHash, response.scores)).rejects.toThrow();
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
    expect(mimirClient.GetAllRounds('non-existing-game')).rejects.toThrow();
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
    expect(mimirClient.GetLastRoundByHash('non-existing-game')).rejects.toThrow();
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
    expect(mimirClient.RegisterPlayer(TOURNAMENT_EVENT_ID, 100)).rejects.toThrow();
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

  /*

GetCurrentStateForPlayer

AddPenalty
ListPenalties
CancelPenalty
AddExtraTime
ListMyPenalties
ListChombo

FinalizeSession
DefinalizeGame

StartTimer
GetCurrentSeating
MakeShuffledSeating
MakeSwissSeating
ResetSeating
GenerateSwissSeating
MakeIntervalSeating
MakePrescriptedSeating
GetPrescriptedEventConfig
UpdatePrescriptedEventConfig

GetTimerState - todo check after time started/seating ready
GetTablesState - todo check after time started/seating ready

UpdatePlayersTeams - todo after team event is ready
UpdatePlayersLocalIds - todo after prescripted event is ready

AddPenaltyGame
AddOnlineReplay
AddTypedOnlineReplay

ClearStatCache
NotifyPlayersSessionStartsSoon
CallReferee
RebuildScoring
RecalcAchievements
RecalcPlayerStats
GetAchievements
GetPlayerStats

  */
});
