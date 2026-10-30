import { vi } from 'vitest';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { PlayersGetPlayerStatsResponse } from 'tsclients/proto/mimir.pb.js';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { SessionResultsEntity } from '../../entities/SessionResults.entity.js';
import { PlayerStatsEntity } from '../../entities/PlayerStats.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { HandEntity } from '../../entities/Hand.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { Model } from '../Model.js';
import { PlayerModel } from '../PlayerModel.js';
import { PlayerStatsModel } from '../PlayerStatsModel.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const stats = Model.getModel(repo, PlayerStatsModel);
const players = Model.getModel(repo, PlayerModel);
const playerIds = [101, 202, 303, 404];
const event = Object.assign(new EventEntity(), {
  id: 19,
  timezone: 'UTC',
  ruleset: RulesetEntity.createRuleset('ema'),
});
const games = new Map(
  [502, 501].map((id) => {
    const session = Object.assign(new SessionEntity(), {
      id,
      event,
      representationalHash: `session-${id}`,
    });
    return [
      id,
      {
        session,
        results: new Map(
          playerIds.map((playerId, index) => [
            playerId,
            Object.assign(new SessionResultsEntity(), {
              session,
              playerId,
              score: 30000 - index * 1000,
              ratingDelta: 10 - index,
              place: index + 1,
            }),
          ])
        ),
      },
    ];
  })
);
const rounds = [3, 2].map((han) =>
  Object.assign(new RoundEntity(), {
    outcome: RoundOutcome.ROUND_OUTCOME_RON,
    riichi: [],
    lastSessionState: new SessionState(event.ruleset, playerIds).state,
    hands: [
      Object.assign(new HandEntity(), {
        winnerId: 101,
        loserId: 202,
        han,
        fu: 30,
        yaku: [1, han],
        dora: 1,
      }),
    ],
  })
);
let cache: PlayerStatsEntity | null;

describe('PlayerStatsModel.getPlayerStats', () => {
  beforeEach(() => {
    cache = null;
    vi.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
    vi.spyOn(repo.em, 'findAll').mockImplementation(async (entity) => {
      if (entity === EventEntity) return [event];
      if (entity === PlayerStatsEntity) return cache ? [cache] : [];
      throw new Error(`Unexpected query: ${String(entity)}`);
    });
    vi.spyOn(repo.em, 'findOne').mockImplementation(async () => cache);
    vi.spyOn(repo.em, 'persist').mockImplementation((entity) => {
      // Exercise the JSON representation stored in PostgreSQL, including cache updates.
      cache = Object.assign(new PlayerStatsEntity(), entity, {
        data: JSON.parse(JSON.stringify((entity as PlayerStatsEntity).data)),
      });
      return repo.em;
    });
    vi.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));
    vi.spyOn(players, 'findPlayerIdsForSessions').mockResolvedValue(
      Array.from(games.keys()).flatMap((sessionId) =>
        playerIds.map((id): [number, number] => [id, sessionId])
      )
    );
    vi.spyOn(stats, '_fetchGamesHistory').mockResolvedValue(games);
    vi.spyOn(stats, '_fetchRounds').mockResolvedValue(rounds);
    vi.spyOn(stats, '_fetchPlayerInfo').mockResolvedValue(
      new Map(playerIds.map((id) => [id, makePlayer(id)]))
    );
  });
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it('counts chombo for every penalized player in a shared round', () => {
    const round = Object.assign(new RoundEntity(), {
      outcome: RoundOutcome.ROUND_OUTCOME_CHOMBO,
      lastSessionState: new SessionState(event.ruleset, playerIds).state,
      hands: [101, 303].map((loserId) => Object.assign(new HandEntity(), { loserId })),
    });
    for (const playerId of playerIds) {
      expect(stats._getOutcomeSummary(event.ruleset, playerId, [round]).chombo).toBe(
        [101, 303].includes(playerId) ? 1 : 0
      );
    }
  });

  it('averages dora over won hands using the doraLord calculation', () => {
    const doraRounds = [
      [
        RoundOutcome.ROUND_OUTCOME_RON,
        [{ winnerId: 101, dora: 2, uradora: 3, kandora: 1, kanuradora: 1 }],
      ],
      [RoundOutcome.ROUND_OUTCOME_TSUMO, [{ winnerId: 101 }]],
      [
        RoundOutcome.ROUND_OUTCOME_MULTIRON,
        [
          { winnerId: 101, dora: 3 },
          { winnerId: 303, dora: 8 },
        ],
      ],
      [RoundOutcome.ROUND_OUTCOME_RON, [{ winnerId: 303, dora: 4 }]],
      [RoundOutcome.ROUND_OUTCOME_DRAW, [{}]],
      [RoundOutcome.ROUND_OUTCOME_ABORT, [{}]],
      [RoundOutcome.ROUND_OUTCOME_CHOMBO, [{ loserId: 101 }]],
      [RoundOutcome.ROUND_OUTCOME_NAGASHI, [{ nagashi: [101] }]],
    ].map(([outcome, hands]) => Object.assign(new RoundEntity(), { outcome, hands }));

    expect(stats._getDoraStat(101, doraRounds)).toEqual({ count: 5, average: 1.67 });
    expect(stats._getDoraStat(202, doraRounds)).toEqual({ count: 0, average: 0 });
    expect(stats._getDoraStat(101, [doraRounds[1]])).toEqual({ count: 0, average: 0 });
    expect(stats._getDoraStat(101, [])).toEqual({ count: 0, average: 0 });
  });

  it('reports the affected database records when a multiron winner is absent from saved seating', async () => {
    const round = Object.assign(new RoundEntity(), {
      id: 700,
      session: games.get(501)!.session,
      event,
      outcome: RoundOutcome.ROUND_OUTCOME_MULTIRON,
      riichi: [],
      lastSessionState: new SessionState(event.ruleset, playerIds).state,
      hands: [101, 999].map((winnerId) =>
        Object.assign(new HandEntity(), { winnerId, loserId: 202, han: 2, fu: 30 })
      ),
    });
    vi.spyOn(stats, '_fetchRounds').mockResolvedValue([round]);

    await expect(stats.getPlayerStats({ playerId: 101, eventIdList: [19] })).rejects.toThrow(
      'round 700, session 501, event 19: Error: Invalid multiron participants: ' +
        'winners=[101,999], loser=202, seating=[101,202,303,404]'
    );
    expect(cache).toBeNull();
  });

  it('calculates valid multiron payments for every winner and the loser', () => {
    const round = Object.assign(new RoundEntity(), {
      outcome: RoundOutcome.ROUND_OUTCOME_MULTIRON,
      riichi: [101, 303],
      lastSessionState: new SessionState(event.ruleset, playerIds).state,
      hands: [101, 303].map((winnerId) =>
        Object.assign(new HandEntity(), { winnerId, loserId: 202, han: 2, fu: 30 })
      ),
    });
    expect(stats._getMultironRiichiAssignments(round)).toEqual({
      101: { fromPlayers: [101], fromTable: 0, honba: 0, closestWinner: 303 },
      303: { fromPlayers: [303], fromTable: 0, honba: 0, closestWinner: 303 },
    });
    expect(stats._getOutcomeSummary(event.ruleset, 101, [round])).toEqual(
      expect.objectContaining({ ron: 1, pointsWon: 2900 })
    );
    expect(stats._getOutcomeSummary(event.ruleset, 303, [round])).toEqual(
      expect.objectContaining({ ron: 1, pointsWon: 2000 })
    );
    expect(stats._getOutcomeSummary(event.ruleset, 202, [round])).toEqual(
      expect.objectContaining({ feed: 2, pointsLostRon: 4900 })
    );
  });

  it('calculates participant details and summaries from played games', async () => {
    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });

    expect(result.playersInfo).toEqual(
      playerIds.map((id) => expect.objectContaining({ id, title: `Player ${id}` }))
    );
    expect(result.scoreHistory).toEqual(
      [502, 501].map((id) => ({
        tables: playerIds.map((playerId, index) =>
          expect.objectContaining({
            sessionHash: `session-${id}`,
            eventId: 19,
            playerId,
            score: 30000 - index * 1000,
            place: index + 1,
          })
        ),
      }))
    );
    expect(result.placesSummary).toEqual([
      { place: 1, count: 2 },
      { place: 2, count: 0 },
      { place: 3, count: 0 },
      { place: 4, count: 0 },
    ]);
    expect(result.handsValueSummary).toEqual([
      { hanCount: 2, count: 1 },
      { hanCount: 3, count: 1 },
    ]);
    expect(result.yakuSummary).toEqual([
      { yakuId: 1, count: 2 },
      { yakuId: 2, count: 1 },
      { yakuId: 3, count: 1 },
    ]);
    expect(result.totalPlayedGames).toBe(2);
    expect(result.totalPlayedRounds).toBe(2);
  });

  it.each([false, true])(
    'retains all calculated fields after a cache %s rebuild',
    async (existing) => {
      if (existing)
        cache = Object.assign(new PlayerStatsEntity(), { event, playerId: 101, data: {} });
      const calculated = await stats.getPlayerStats(
        { playerId: 101, eventIdList: [19] },
        { forceRebuild: true }
      );
      const fetchGames = vi.mocked(stats._fetchGamesHistory);
      fetchGames.mockClear();

      const cached = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });

      expect(cached).toEqual(calculated);
      expect(cached.playersInfo).toHaveLength(4);
      expect(cached.scoreHistory).toHaveLength(2);
      expect(cached.placesSummary).toEqual([
        { place: 1, count: 2 },
        { place: 2, count: 0 },
        { place: 3, count: 0 },
        { place: 4, count: 0 },
      ]);
      expect(cached.handsValueSummary).toHaveLength(2);
      expect(cached.yakuSummary).toHaveLength(3);
      expect(fetchGames).not.toHaveBeenCalled();
    }
  );

  it('calculates date-filtered statistics without reading or overwriting the event cache', async () => {
    cache = Object.assign(new PlayerStatsEntity(), {
      event,
      playerId: 101,
      data: { totalPlayedGames: 99 },
    });
    const result = await stats.getPlayerStats({
      playerId: 101,
      eventIdList: [19],
      dateFrom: '2026-01-01',
    });

    expect(result.totalPlayedGames).toBe(2);
    expect(result.playersInfo).toHaveLength(4);
    expect(stats._fetchGamesHistory).toHaveBeenCalledWith(19, 101, '2026-01-01', undefined);
    expect(repo.em.persist).not.toHaveBeenCalled();
    expect(cache.data.totalPlayedGames).toBe(99);
  });

  it('rebuilds the incomplete cache previously written for played games', async () => {
    cache = Object.assign(new PlayerStatsEntity(), {
      event,
      playerId: 101,
      data: {
        totalPlayedGames: 2,
        playersInfo: [],
        scoreHistory: {},
        placesSummary: {},
        handsValueSummary: {},
        yakuSummary: {},
      },
    });

    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });

    expect(result.playersInfo).toHaveLength(4);
    expect(result.scoreHistory).toHaveLength(2);
    expect(result.placesSummary).toEqual([
      { place: 1, count: 2 },
      { place: 2, count: 0 },
      { place: 3, count: 0 },
      { place: 4, count: 0 },
    ]);
    expect(result.handsValueSummary).toHaveLength(2);
    expect(result.yakuSummary).toHaveLength(3);
    expect(stats._fetchGamesHistory).toHaveBeenCalled();
  });

  it('rebuilds cached null ratings so played games can be returned over protobuf', async () => {
    const calculated = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });
    cache!.data.ratingHistory = JSON.parse('[null, null, null]');
    vi.mocked(stats._fetchGamesHistory).mockClear();

    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });

    expect(stats._fetchGamesHistory).toHaveBeenCalled();
    expect(result).toEqual(calculated);
    const decoded = PlayersGetPlayerStatsResponse.decode(
      PlayersGetPlayerStatsResponse.encode(result)
    );
    expect(decoded.totalPlayedGames).toBe(2);
    expect(decoded.ratingHistory).toEqual(calculated.ratingHistory);
  });

  it('returns empty summaries when no games have been played', async () => {
    vi.mocked(stats._fetchGamesHistory).mockResolvedValue(new Map());
    vi.mocked(stats._fetchRounds).mockResolvedValue([]);
    vi.mocked(stats._fetchPlayerInfo).mockResolvedValue(new Map());
    vi.mocked(players.findPlayerIdsForSessions).mockResolvedValue([]);

    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });

    expect(result).toEqual(
      expect.objectContaining({
        playersInfo: [],
        scoreHistory: [],
        placesSummary: [1, 2, 3, 4].map((place) => ({ place, count: 0 })),
        handsValueSummary: [],
        yakuSummary: [],
        totalPlayedGames: 0,
        totalPlayedRounds: 0,
        ratingHistory: [event.ruleset.rules.startRating],
      })
    );
    expect(await stats.getPlayerStats({ playerId: 101, eventIdList: [19] })).toEqual(result);
  });

  it('rejects an empty event list', async () => {
    await expect(stats.getPlayerStats({ playerId: 101, eventIdList: [] })).rejects.toThrow(
      'Event ID list cannot be empty'
    );
  });

  it('fills zero counts when reading an existing sparse places cache', async () => {
    await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });
    cache!.data.placesSummary = { 1: 2 };
    vi.mocked(stats._fetchGamesHistory).mockClear();

    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });

    expect(result.placesSummary).toEqual(
      [1, 2, 3, 4].map((place) => ({ place, count: place === 1 ? 2 : 0 }))
    );
    expect(stats._fetchGamesHistory).not.toHaveBeenCalled();
  });
  it('supplies backwards-compatible defaults for an empty saved statistics cache', async () => {
    cache = Object.assign(new PlayerStatsEntity(), { event, playerId: 101, data: {} });
    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });
    expect(result).toMatchObject({
      ratingHistory: [],
      scoreHistory: [],
      playersInfo: [],
      totalPlayedGames: 0,
      totalPlayedRounds: 0,
      handsValueSummary: [],
      yakuSummary: [],
    });
    expect(result.placesSummary.every((place) => place.count === 0)).toBe(true);
    expect(Number.isFinite(Date.parse(result.lastUpdate))).toBe(true);
    expect(stats._fetchGamesHistory).not.toHaveBeenCalled();
  });

  it('defaults missing chip and account fields and tolerates sparse score-history ordering', async () => {
    cache = Object.assign(new PlayerStatsEntity(), {
      event,
      playerId: 101,
      data: {
        totalPlayedGames: 0,
        scoreHistoryOrder: [501, 502],
        scoreHistory: { 501: [{ playerId: 101, score: 25000, place: 1, ratingDelta: 0 }] },
        playersInfo: [{ id: 101, title: 'Alice' }],
      },
    });
    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });
    expect(result.scoreHistory[0].tables[0]).toMatchObject({ chips: 0 });
    expect(result.scoreHistory[1].tables).toEqual([]);
    expect(result.playersInfo[0].tenhouId).toBe('');
    expect(stats._fetchGamesHistory).not.toHaveBeenCalled();
  });
});
