import { randomUUID } from 'node:crypto';
import { setImmediate } from 'node:timers/promises';
import { MikroORM } from '@mikro-orm/postgresql';
import { Collection } from '@mikro-orm/core';
import {
  EventData,
  EventType,
  SessionStatus,
  RonResult,
  Round,
  MultironWin,
} from 'tsclients/proto/atoms.pb.js';
import config from '../mikro-orm.config.js';
import { Repository } from '../services/Repository.js';
import { Model } from '../models/Model.js';
import { EventModel } from '../models/EventModel.js';
import { SessionModel } from '../models/SessionModel.js';
import { PlayerModel } from '../models/PlayerModel.js';
import { RoundModel } from '../models/RoundModel.js';
import { PlayerInSessionModel } from '../models/PlayerInSessionModel.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { SessionPlayerEntity } from '../entities/SessionPlayer.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { EventEntity } from '../entities/Event.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionState } from '../helpers/SessionState.js';

const orm = await MikroORM.init(config());
afterAll(() => orm.close());
afterEach(() => vi.restoreAllMocks());

function repository() {
  const repo = Repository.instance(
    { 'x-current-person-id': '42', 'x-auth-token': 'test-token' },
    orm
  );
  repo.mockFrey();
  repo.mockSkirnir();
  vi.spyOn(repo.skirnir, 'messageClubSessionEnd').mockResolvedValue();
  vi.spyOn(Model.getModel(repo, PlayerModel), 'isEventAdmin').mockResolvedValue(true);
  return repo;
}

async function fixture(roundData?: Round, withYakitori = false) {
  const repo = repository();
  const { eventId } = await Model.getModel(repo, EventModel).createEvent(
    EventData.initialize({
      type: EventType.EVENT_TYPE_LOCAL,
      title: `Seating correction ${randomUUID()}`,
      timezone: 'UTC',
      rulesetConfig: {
        ...RulesetEntity.createRuleset('ema').rules,
        startPoints: 25000,
        withYakitori,
      },
    })
  );
  const event = await repo.em.findOneOrFail(EventEntity, eventId);
  const state = new SessionState(event.ruleset, [1, 2, 3, 4]);
  if (withYakitori) state.state.yakitori = { 1: true, 2: true, 3: true, 4: true };
  const session = Object.assign(new SessionEntity(), {
    event,
    status: SessionStatus.SESSION_STATUS_INPROGRESS,
    representationalHash: randomUUID(),
    extraTime: 0,
  });
  const round = RoundEntity.fromMessage(
    session,
    event,
    roundData ?? {
      ron: RonResult.initialize({
        winnerId: 1,
        loserId: 3,
        han: 1,
        fu: 30,
        yaku: [8],
        roundIndex: 1,
        honba: 0,
        riichiBets: [],
      }),
    },
    state.state.clone()
  );
  state.update(round);
  session.intermediateResults = state.state;
  repo.em.persist(session);
  repo.em.persist(round);
  for (const [index, playerId] of [1, 2, 3, 4].entries()) {
    repo.em.persist(
      Object.assign(new SessionPlayerEntity(), { session, playerId, order: index + 1 })
    );
  }
  await repo.em.flush();
  const payload = {
    sessionHash: session.representationalHash,
    playerIds: [2, 1, 3, 4],
    nextRoundToken: session.nextRoundToken,
  };
  return { repo, model: Model.getModel(repo, SessionModel), session, round, payload };
}

const hydratedRoundCases: Array<{
  name: string;
  round: Round;
  scores: Record<number, number>;
  direct: Record<string, number>;
  yakitori: Record<number, boolean>;
}> = [
  ...[
    [2, 4],
    [2, 3, 4],
  ].map((winners) => ({
    name: `${winners.length}-ron`,
    round: {
      multiron: {
        roundIndex: 1,
        honba: 0,
        riichiBets: [],
        loserId: 1,
        multiRon: winners.length,
        wins: winners.map((winnerId) =>
          MultironWin.initialize({ winnerId, han: 1, fu: 30, yaku: [8] })
        ),
      },
    },
    scores:
      winners.length === 2
        ? { 1: 23000, 2: 26000, 3: 25000, 4: 26000 }
        : { 1: 22000, 2: 26000, 3: 26000, 4: 26000 },
    direct: Object.fromEntries(winners.map((winnerId) => [`${winnerId}<-1`, 1000])),
    yakitori: { 1: true, 2: false, 3: winners.length === 2, 4: false },
  })),
  {
    name: 'nagashi',
    round: { nagashi: { roundIndex: 1, honba: 0, riichiBets: [], nagashi: [2], tempai: [2] } },
    scores: { 1: 21000, 2: 33000, 3: 23000, 4: 23000 },
    direct: { '2<-1': 4000, '2<-3': 2000, '2<-4': 2000 },
    yakitori: { 1: true, 2: true, 3: true, 4: true },
  },
];

it.each(hydratedRoundCases)(
  'reads hydrated $name hands in both historical APIs and yakitori replay without mutating stored state',
  async ({ round, scores, direct, yakitori }) => {
    const f = await fixture(round, true);
    // A fresh repository must read the relation from PostgreSQL as a real Collection.
    const reader = repository();
    const loaded = await reader.em.findOneOrFail(RoundEntity, f.round.id, {
      populate: ['hands', 'event', 'session'],
    });
    expect(loaded.hands).toBeInstanceOf(Collection);
    expect(Array.isArray(loaded.hands)).toBe(false);
    const before = loaded.lastSessionState!.clone();
    const current = loaded.session.intermediateResults!.clone();
    const handIds = loaded.hands.map((hand) => hand.id);
    const replay = new SessionState(loaded.event.ruleset, before.playerIds, before);
    expect(replay.update(loaded).direct).toEqual(direct);
    expect(replay.getScores()).toEqual(scores);
    expect(replay.getYakitori()).toEqual(yakitori);
    expect(
      Model.getModel(reader, RoundModel).getRoundPaymentsInfo(loaded.event, loaded.session, loaded)
        .direct
    ).toEqual(direct);

    const history = Model.getModel(reader, PlayerInSessionModel);
    const all = await history.getAllRounds({ sessionHash: f.payload.sessionHash });
    const last = await history.getLastRoundByHash({ sessionHash: f.payload.sessionHash });
    expect(all.rounds).toHaveLength(1);
    expect(last.round).toEqual(all.rounds[0]);
    expect(
      Object.fromEntries(all.rounds[0].scores.map((score) => [score.playerId, score.score]))
    ).toEqual(scores);
    expect(all.rounds[0].round).toMatchObject(round);
    expect(
      Object.fromEntries(
        all.rounds[0].payments.direct.map((payment) => [
          `${payment.to}<-${payment.from}`,
          payment.amount,
        ])
      )
    ).toEqual(direct);
    expect(loaded.lastSessionState).toEqual(before);
    expect(loaded.session.intermediateResults).toEqual(current);
    expect(loaded.hands.map((hand) => hand.id)).toEqual(handIds);
    await reader.em.flush();
    const saved = await orm.em
      .fork()
      .findOneOrFail(RoundEntity, f.round.id, { populate: ['session'] });
    expect(saved.lastSessionState).toEqual(before);
    expect(saved.session.intermediateResults).toEqual(current);
  }
);

it('persists recalculated snapshots, keeps outcome IDs, rotates tokens and supports undo', async () => {
  const f = await fixture();
  const oldHand = structuredClone(f.round.hands[0]);
  await f.model.correctSessionSeating(f.payload);
  const em = orm.em.fork();
  const session = await em.findOneOrFail(SessionEntity, f.session.id);
  const round = await em.findOneOrFail(RoundEntity, f.round.id, { populate: ['hands'] });
  expect(session.intermediateResults!.scores).toEqual({ 1: 26000, 2: 25000, 3: 24000, 4: 25000 });
  expect(session.intermediateResults!.round).toBe(2);
  expect(round.lastSessionState!.playerIds).toEqual([2, 1, 3, 4]);
  expect(round.hands[0].id).toBe(oldHand.id);
  expect(round.hands[0].winnerId).toBe(1);
  expect(round.endDate).toBe(f.round.endDate);
  expect(session.nextRoundToken).not.toBe(f.payload.nextRoundToken);
  const fresh = Model.getModel(repository(), SessionModel);
  await expect(
    fresh.addRound(
      f.payload.sessionHash,
      { abort: { roundIndex: 2, honba: 0, riichiBets: [] } },
      f.payload.nextRoundToken
    )
  ).rejects.toMatchObject({ code: 'failed_precondition', msg: expect.stringContaining('stale') });
  await fresh.dropLastRound({ sessionHash: f.payload.sessionHash, intermediateResults: [] });
  const undone = await orm.em.fork().findOneOrFail(SessionEntity, session.id);
  expect(undone.intermediateResults).toEqual(round.lastSessionState);
  expect(await orm.em.fork().count(RoundEntity, { session: session.id })).toBe(0);
});

it('rolls back every changed row and token after a real database flush fails later', async () => {
  const f = await fixture();
  const original = f.session.intermediateResults!.clone();
  await expect(
    f.repo.em.transactional(async () => {
      await f.model.correctSessionSeating(f.payload);
      await f.repo.em.flush();
      const changed = await f.repo.em.findOneOrFail(SessionEntity, f.session.id);
      expect(changed.nextRoundToken).not.toBe(f.payload.nextRoundToken);
      throw new Error('Rollback after flush');
    })
  ).rejects.toThrow('Rollback after flush');
  const em = orm.em.fork();
  const session = await em.findOneOrFail(SessionEntity, f.session.id);
  expect(session.nextRoundToken).toBe(f.payload.nextRoundToken);
  expect(session.intermediateResults).toEqual(original);
  expect((await em.findOneOrFail(RoundEntity, f.round.id)).lastSessionState!.playerIds).toEqual([
    1, 2, 3, 4,
  ]);
  expect(
    (
      await em.find(SessionPlayerEntity, { session: f.session.id }, { orderBy: { order: 'asc' } })
    ).map((seat) => seat.playerId)
  ).toEqual([1, 2, 3, 4]);
});

it.each(['round', 'undo', 'extraTime', 'completion'] as const)(
  'serializes correction with %s on a fresh locked state',
  async (operation) => {
    const f = await fixture();
    let release!: () => void;
    let acquired!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const ready = new Promise<void>((resolve) => {
      acquired = resolve;
    });
    const first = f.repo.em.transactional(async () => {
      await f.model.correctSessionSeating(f.payload);
      await f.repo.em.flush();
      acquired();
      await held;
    });
    await ready;
    const competitor = repository();
    const other = Model.getModel(competitor, SessionModel);
    // Prime the identity map before the first correction commits.
    await other.findByRepresentationalHash([f.payload.sessionHash], ['event']);
    let settled = false;
    const second = (
      operation === 'round'
        ? other.addRound(
            f.payload.sessionHash,
            { abort: { roundIndex: 1, honba: 1, riichiBets: [] } },
            f.payload.nextRoundToken
          )
        : operation === 'undo'
          ? other.dropLastRound({ sessionHash: f.payload.sessionHash, intermediateResults: [] })
          : operation === 'extraTime'
            ? other.addExtraTime({ sessionHashList: [f.payload.sessionHash], extraTime: 60 })
            : other.forceFinishGame(f.payload.sessionHash)
    )
      .then(
        (value) => ({ value }),
        (error: Error) => ({ error })
      )
      .finally(() => {
        settled = true;
      });
    try {
      // A PostgreSQL lock wait proves the competing request reached the database.
      let waiting = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const rows = await orm.em
          .fork()
          .getConnection()
          .execute<{ waiting: boolean }[]>(
            'select exists(select 1 from pg_stat_activity where datname = current_database() and cardinality(pg_blocking_pids(pid)) > 0) as waiting'
          );
        if (rows[0].waiting) {
          waiting = true;
          break;
        }
        await setImmediate();
      }
      expect(waiting).toBe(true);
      expect(settled).toBe(false);
    } finally {
      release();
      await first;
    }
    const result = await second;
    if (operation === 'round') {
      expect(result).toMatchObject({ error: { msg: expect.stringContaining('stale') } });
    } else {
      if ('error' in result) throw result.error;
      expect(result).toHaveProperty('value');
    }
    const saved = await orm.em.fork().findOneOrFail(SessionEntity, f.session.id);
    expect(saved.intermediateResults!.playerIds).toEqual(f.payload.playerIds);
    if (operation === 'undo') expect(saved.intermediateResults!.scores[1]).toBe(25000);
    if (operation === 'extraTime') {
      expect(saved.extraTime).toBe(60);
      expect(saved.intermediateResults!.scores[1]).toBe(26000);
    }
    if (operation === 'completion')
      expect(saved.status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
  }
);
