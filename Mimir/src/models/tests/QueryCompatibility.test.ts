import {
  EventType,
  PlatformType,
  RoundOutcome,
  SessionStatus,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb.js';
import moment from 'moment';
import { Model } from '../Model.js';
import { EventModel } from '../EventModel.js';
import { SessionModel } from '../SessionModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { PlayerInSessionModel } from '../PlayerInSessionModel.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { SessionPlayerEntity } from '../../entities/SessionPlayer.entity.js';
import { PlayerHistoryEntity } from '../../entities/PlayerHistory.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { init } from '../../tests/initOrm.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { HandEntity } from '../../entities/Hand.entity.js';
import { RoundModel } from '../RoundModel.js';
import { getMaxFuHand } from '../achievements/maxFuHand.js';

const orm = await init();
const repo = Repository.instance(
  { 'x-current-person-id': '42', 'x-auth-token': 'test-token' },
  orm
);
repo.mockFrey();
const events = Model.getModel(repo, EventModel);
const sessions = Model.getModel(repo, SessionModel);
const history = Model.getModel(repo, PlayerHistoryModel);
const seating = Model.getModel(repo, PlayerInSessionModel);
const players = [1, 2, 3, 4];
let event: EventEntity;
let oldSession: SessionEntity;
let currentSession: SessionEntity;

const eventData = {
  type: EventType.EVENT_TYPE_LOCAL,
  title: 'Regression test',
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
};

beforeAll(async () => {
  await orm.schema.create();
  const { eventId } = await events.createEvent(eventData);
  event = await repo.em.findOneOrFail(EventEntity, eventId);
  for (const [day, status] of [
    [1, SessionStatus.SESSION_STATUS_FINISHED],
    [3, SessionStatus.SESSION_STATUS_FINISHED],
    [5, SessionStatus.SESSION_STATUS_CANCELLED],
  ] as const) {
    const session = Object.assign(new SessionEntity(), {
      event,
      status,
      extraTime: 0,
      tableIndex: day,
      startDate: `2026-01-0${day} 10:00:00`,
      endDate: `2026-01-0${day} 12:00:00`,
      intermediateResults: new SessionState(event.ruleset, players).state,
    });
    repo.em.persist(session);
    for (const [index, playerId] of players.entries()) {
      repo.em.persist(
        Object.assign(new SessionPlayerEntity(), { session, playerId, order: index + 1 })
      );
    }
    await repo.em.flush();
    if (day === 1) oldSession = session;
    if (day === 3) currentSession = session;
    if (day !== 5) {
      repo.em.persist(
        Object.assign(new PlayerHistoryEntity(), {
          event,
          playerId: 1,
          sessionId: session.id,
          avgPlace: 2,
          gamesPlayed: day,
          rating: 1000 + day,
        })
      );
      await repo.em.flush();
    }
  }
});
afterAll(() => repo.destroy());

describe('ORM query compatibility', () => {
  it('keeps partial best-fu hands out of subsequent achievement calculations', async () => {
    await expect(
      repo.em.transactional(async (em) => {
        const round = Object.assign(new RoundEntity(), {
          event,
          session: oldSession,
          outcome: RoundOutcome.ROUND_OUTCOME_RON,
          round: 1,
          honba: 0,
          riichi: [1],
          lastSessionState: new SessionState(event.ruleset, players).state,
        });
        em.persist(round);
        em.persist(
          Object.assign(new HandEntity(), {
            round,
            winnerId: 1,
            loserId: 2,
            han: 1,
            fu: 40,
            yaku: [1],
          })
        );
        await em.flush();
        em.clear();

        expect(await getMaxFuHand(event.id, repo)).toMatchObject({ fu: 40, playerIds: [1] });
        const rounds = await Model.getModel(repo, RoundModel).findBySessionIds([oldSession.id]);
        expect(rounds[0].hands[0]).toMatchObject({
          winnerId: 1,
          loserId: 2,
          han: 1,
          fu: 40,
          yaku: [1],
        });
        expect(rounds[0].lastSessionState?.playerIds).toEqual(players);
        throw new Error('rollback achievement fixture');
      })
    ).rejects.toThrow('rollback achievement fixture');
  });

  it.each([
    [undefined, undefined, [3, 1]],
    ['2026-01-02', undefined, [3]],
    [undefined, '2026-01-02', [1]],
    ['2026-01-02', '2026-01-04', [3]],
  ])('filters sessions with date range %s to %s', async (from, to, days) => {
    const result = await sessions.findByPlayerAndEvent(
      1,
      event.id,
      SessionStatus.SESSION_STATUS_FINISHED,
      from,
      to
    );
    expect(result.map((session) => session.tableIndex!).sort((a, b) => a - b)).toEqual(
      [...days].sort((a, b) => a - b)
    );
  });

  it('supports unrestricted status and the latest session lookup', async () => {
    expect(await sessions.findByPlayerAndEvent(1, event.id)).toHaveLength(3);
    expect((await sessions.findLastByPlayerAndEvent(1, event.id))[0].tableIndex).toBe(5);
    expect(
      (
        await sessions.findLastByPlayerAndEvent(1, event.id, SessionStatus.SESSION_STATUS_FINISHED)
      )[0].id
    ).toBe(currentSession.id);
    expect(await sessions.findByPlayerAndEvent(99, event.id)).toEqual([]);
  });

  it('returns the latest history per player and honors the cutoff date', async () => {
    expect((await history.findLastByEvent([event.id]))[0].sessionId).toBe(currentSession.id);
    expect((await history.findLastByEventAndDate([event.id], null))[0].sessionId).toBe(
      currentSession.id
    );
    expect(
      (await history.findLastByEventAndDate([event.id], moment.utc('2026-01-02')))[0].sessionId
    ).toBe(oldSession.id);
    expect(await history.findLastByEventAndDate([event.id], moment.utc('2025-12-31'))).toEqual([]);
    expect(await history.findLastByEvent([])).toEqual([]);
    expect(await history.findLastByEventAndDate([], null)).toEqual([]);
  });

  it('orders seating by latest session and player order, and applies a limit', async () => {
    const all = await seating.getPlayersSeatingInEvent(event.id);
    expect(all).toHaveLength(12);
    expect(all.slice(0, 4).map((row) => row.player_id)).toEqual(players);
    expect((await seating.getPlayersSeatingInEvent(event.id, 2)).map((row) => row.order)).toEqual([
      1, 2,
    ]);
    expect(await seating.getPlayersSeatingInEvent(-1)).toEqual([]);
  });

  it('excludes cancelled sessions when checking which game is last for its players', async () => {
    expect(await sessions.isLastForPlayers(oldSession)).toBe(false);
    expect(await sessions.isLastForPlayers(currentSession)).toBe(true);
    const empty = Object.assign(new SessionEntity(), { event });
    expect(await sessions.isLastForPlayers(empty)).toBe(true);
    empty.intermediateResults = new SessionState(event.ruleset, []).state;
    expect(await sessions.isLastForPlayers(empty)).toBe(true);
    Reflect.deleteProperty(empty.intermediateResults, 'playerIds');
    expect(await sessions.isLastForPlayers(empty)).toBe(true);
    empty.intermediateResults = new SessionState(event.ruleset, [96, 97, 98, 99]).state;
    expect(await sessions.isLastForPlayers(empty)).toBe(true);
  });

  it('persists first and subsequent history entries with legacy rating and chip defaults', async () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    Reflect.deleteProperty(ruleset.rules, 'startRating');
    ruleset.rules.chipsValue = 1;
    await history.makeNewHistoryItem(ruleset, 7, event.id, currentSession.id, 20, 2);
    await repo.em.flush();
    repo.em.clear();
    const first = await history.findLastByEventAndPlayer(event.id, 7);
    expect(first).toMatchObject({ gamesPlayed: 1, avgPlace: 2, rating: 20, chips: 0 });
    await history.makeNewHistoryItem(ruleset, 7, event.id, currentSession.id, -5, 4, 3);
    await repo.em.flush();
    repo.em.clear();
    const second = await history.findLastByEventAndPlayer(event.id, 7);
    expect(second).toMatchObject({ gamesPlayed: 2, avgPlace: 3, rating: 15, chips: 3 });
    ruleset.rules.chipsValue = 0;
    await history.makeNewHistoryItem(ruleset, 7, event.id, currentSession.id, 5, 3, 10);
    await repo.em.flush();
    expect(await history.findLastByEventAndPlayer(event.id, 7)).toMatchObject({
      rating: 20,
      chips: 0,
    });
  });

  it('preserves players outside a bulk history update and defaults omitted chip values', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.chipsValue = 1;
    const previous = Object.assign(new PlayerHistoryEntity(), {
      event,
      playerId: 8,
      sessionId: oldSession.id,
      rating: 1000,
      gamesPlayed: 1,
      avgPlace: 2,
    });
    const unchanged = Object.assign(new PlayerHistoryEntity(), { ...previous, playerId: 9 });
    const updated = history.makeNewHistoryItemsForSession(
      { 8: previous, 9: unchanged },
      ruleset,
      event.id,
      currentSession.id,
      { 8: { ratingDelta: 10, place: 4 } }
    );
    expect(updated[8]).toMatchObject({ chips: 0, rating: 1010, avgPlace: 3, gamesPlayed: 2 });
    expect(updated[9]).toBe(unchanged);
    expect(previous.rating).toBe(1000);
  });

  it('groups persisted seats by session without changing their order', async () => {
    const seats = await repo.em.find(SessionPlayerEntity, {}, { orderBy: { id: 'asc' } });
    const grouped = sessions.groupBySession(seats);
    expect(grouped[oldSession.id]).toEqual(players);
    expect(grouped[currentSession.id]).toEqual(players);
    expect(sessions.groupBySession([])).toEqual({});
  });

  it('runs Kysely reads in the current ORM transaction and rolls back inserts', async () => {
    await expect(
      repo.em.transactional(async (em) => {
        const sessionId = await em.insert(
          SessionEntity,
          Object.assign(new SessionEntity(), {
            event,
            extraTime: 0,
            tableIndex: 9,
            nextRoundToken: 'rollback-token',
            status: SessionStatus.SESSION_STATUS_INPROGRESS,
          })
        );
        await em.insert(SessionPlayerEntity, { session: sessionId, playerId: 99, order: 1 });
        expect((await seating.getPlayersSeatingInEvent(event.id, 1))[0].player_id).toBe(99);
        throw new Error('rollback query fixture');
      })
    ).rejects.toThrow('rollback query fixture');
    expect(await seating.getPlayersSeatingInEvent(event.id)).toHaveLength(12);
  });
});
