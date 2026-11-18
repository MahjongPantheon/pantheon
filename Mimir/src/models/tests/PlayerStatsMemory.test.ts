import {
  RoundOutcome,
  EventType,
  PlatformType,
  SessionStatus,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb.js';
import { init } from '../../tests/initOrm.js';
import { createWorkerRepository } from '../../tests/workerRepository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { SessionPlayerEntity } from '../../entities/SessionPlayer.entity.js';
import { SessionResultsEntity } from '../../entities/SessionResults.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { HandEntity } from '../../entities/Hand.entity.js';
import { PlayerStatsEntity } from '../../entities/PlayerStats.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { Model } from '../Model.js';
import { EventModel } from '../EventModel.js';
import { PlayerStatsModel } from '../PlayerStatsModel.js';

const orm = await init();
const repo = await createWorkerRepository(orm, {
  'x-current-person-id': '42',
  'x-auth-token': 'test-token',
});
const stats = Model.getModel(repo, PlayerStatsModel);
const playerIds = [1, 2, 3, 4];
let event: EventEntity;
let session: SessionEntity;
let expectedWinSummary: ReturnType<typeof stats._getOutcomeSummary>;
let expectedRiichiSummary: ReturnType<typeof stats._getRiichiSummary>;

beforeAll(async () => {
  await orm.schema.create();
  const { eventId } = await Model.getModel(repo, EventModel).createEvent({
    type: EventType.EVENT_TYPE_LOCAL,
    title: 'Paged statistics',
    description: '',
    duration: 75,
    timezone: 'UTC',
    lobbyId: 0,
    seriesLength: 0,
    minGames: 0,
    isTeam: false,
    isPrescripted: false,
    rulesetConfig: RulesetEntity.createRuleset('ema').rules,
    isListed: true,
    isRatingShown: true,
    achievementsShown: true,
    allowViewOtherTables: true,
    platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
    allowManualAddReplay: false,
    windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
  });
  event = await repo.em.findOneOrFail(EventEntity, eventId);
  session = Object.assign(new SessionEntity(), {
    event,
    status: SessionStatus.SESSION_STATUS_FINISHED,
    representationalHash: 'paged-session',
    extraTime: 0,
    startDate: '2026-01-02 10:00:00',
    endDate: '2026-01-02 12:00:00',
    intermediateResults: new SessionState(event.ruleset, playerIds).state,
  });
  repo.em.persist(session);
  for (const [index, playerId] of playerIds.entries()) {
    repo.em.persist(
      Object.assign(new SessionPlayerEntity(), { session, playerId, order: index + 1 })
    );
    repo.em.persist(
      Object.assign(new SessionResultsEntity(), {
        event,
        session,
        playerId,
        score: 30000 - index * 1000,
        place: index + 1,
        ratingDelta: 10 - index,
      })
    );
  }
  const rounds = Array.from({ length: 257 }, (_, index) =>
    Object.assign(new RoundEntity(), {
      event,
      session,
      round: 1,
      honba: 0,
      outcome: index === 256 ? RoundOutcome.ROUND_OUTCOME_MULTIRON : RoundOutcome.ROUND_OUTCOME_RON,
      riichi: [],
      lastSessionState: new SessionState(event.ruleset, playerIds).state,
      hands: (index === 256 ? [1, 3] : [1]).map((winnerId) =>
        Object.assign(new HandEntity(), {
          winnerId,
          loserId: 2,
          han: index === 256 ? 5 : 2,
          fu: 30,
          dora: index === 256 ? 4 : 1,
          yaku: [1],
        })
      ),
    })
  );
  expectedWinSummary = stats._getOutcomeSummary(event.ruleset, 1, rounds);
  expectedRiichiSummary = stats._getRiichiSummary(event.ruleset, 1, rounds);
  repo.em.persist(rounds);
  await repo.em.flush();
  repo.em.clear();
});
afterEach(() => repo.em.clear());
afterAll(() => repo.destroy());

it('folds multiple pages without splitting multiron hands or retaining round snapshots', async () => {
  const summary = await repo.em.transactional(() =>
    stats._getRoundSummaries(event.ruleset, 1, [session.id])
  );
  expect(summary).toEqual({
    totalPlayedRounds: 257,
    winSummary: expectedWinSummary,
    riichiSummary: expectedRiichiSummary,
    handsValueSummary: [
      { hanCount: 2, count: 256 },
      { hanCount: 5, count: 1 },
    ],
    yakuSummary: [{ yakuId: 1, count: 257 }],
    doraStat: { count: 260, average: 1.01 },
  });
  expect(repo.em.getUnitOfWork().getIdentityMap().values()).toEqual([]);
});

it('reads lightweight game histories without registering sessions or results in the unit of work', async () => {
  const history = await stats._fetchGamesHistory(event.id, 1, '2026-01-02', '2026-01-03');
  expect(history.size).toBe(1);
  const game = history.get(session.id)!;
  expect(game.session.representationalHash).toBe('paged-session');
  expect((game.session as SessionEntity).intermediateResults).toBeUndefined();
  expect(game.results.size).toBe(4);
  expect(repo.em.getUnitOfWork().getIdentityMap().values()).toEqual([]);
  expect(await stats._fetchGamesHistory(event.id, 1, '2026-01-03')).toEqual(new Map());
});

it('rolls back detached cache writes with the owning transaction', async () => {
  await expect(
    repo.em.transactional(async () => {
      const result = await stats.getPlayerStats(
        { playerId: 1, eventIdList: [event.id] },
        { forceRebuild: true }
      );
      expect(result.totalPlayedRounds).toBe(257);
      expect(
        repo.em
          .getUnitOfWork()
          .getIdentityMap()
          .values()
          .some(
            (entity) =>
              entity instanceof RoundEntity ||
              entity instanceof HandEntity ||
              entity instanceof PlayerStatsEntity
          )
      ).toBe(false);
      throw new Error('Roll back the complete batch');
    })
  ).rejects.toThrow('Roll back the complete batch');
  expect(await repo.em.count(PlayerStatsEntity)).toBe(0);
});

it('updates the same cached history on subsequent rebuilds and reads it back unchanged', async () => {
  const input = { playerId: 1, eventIdList: [event.id] };
  const first = await stats.getPlayerStats(input, { forceRebuild: true });
  const second = await stats.getPlayerStats(input, { forceRebuild: true });
  expect(await repo.em.count(PlayerStatsEntity)).toBe(1);
  expect(await stats.getPlayerStats(input)).toEqual(second);
  expect(second.scoreHistory).toEqual(first.scoreHistory);
  expect(second.doraStat).toEqual({ count: 260, average: 1.01 });
});
