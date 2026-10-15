import { jest } from '@jest/globals';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';
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
    jest.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
    jest.spyOn(repo.em, 'findAll').mockImplementation(async (entity) => {
      if (entity === EventEntity) return [event];
      if (entity === PlayerStatsEntity) return cache ? [cache] : [];
      throw new Error(`Unexpected query: ${String(entity)}`);
    });
    jest.spyOn(repo.em, 'findOne').mockImplementation(async () => cache);
    jest.spyOn(repo.em, 'persist').mockImplementation((entity) => {
      // Exercise the JSON representation stored in PostgreSQL, including cache updates.
      cache = Object.assign(new PlayerStatsEntity(), entity, {
        data: JSON.parse(JSON.stringify((entity as PlayerStatsEntity).data)),
      });
      return repo.em;
    });
    jest.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));
    jest
      .spyOn(players, 'findPlayerIdsForSessions')
      .mockResolvedValue(
        Array.from(games.keys()).flatMap((sessionId) =>
          playerIds.map((id): [number, number] => [id, sessionId])
        )
      );
    jest.spyOn(stats, '_fetchGamesHistory').mockResolvedValue(games);
    jest.spyOn(stats, '_fetchRounds').mockResolvedValue(rounds);
    jest
      .spyOn(stats, '_fetchPlayerInfo')
      .mockResolvedValue(new Map(playerIds.map((id) => [id, makePlayer(id)])));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

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
      const fetchGames = jest.mocked(stats._fetchGamesHistory);
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

  it('returns empty summaries when no games have been played', async () => {
    jest.mocked(stats._fetchGamesHistory).mockResolvedValue(new Map());
    jest.mocked(stats._fetchRounds).mockResolvedValue([]);
    jest.mocked(stats._fetchPlayerInfo).mockResolvedValue(new Map());
    jest.mocked(players.findPlayerIdsForSessions).mockResolvedValue([]);

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
    jest.mocked(stats._fetchGamesHistory).mockClear();

    const result = await stats.getPlayerStats({ playerId: 101, eventIdList: [19] });

    expect(result.placesSummary).toEqual(
      [1, 2, 3, 4].map((place) => ({ place, count: place === 1 ? 2 : 0 }))
    );
    expect(stats._fetchGamesHistory).not.toHaveBeenCalled();
  });
});
