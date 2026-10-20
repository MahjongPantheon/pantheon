import { randomUUID } from 'node:crypto';
import { jest } from '@jest/globals';
import { MikroORM } from '@mikro-orm/postgresql';
import { EventData, EventType } from 'tsclients/proto/atoms.pb.js';
import { MimirTest } from '../services/MimirTest.js';
import config from '../mikro-orm.config.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { EventEntity } from '../entities/Event.entity.js';
import { Repository } from '../services/Repository.js';
import { Model } from '../models/Model.js';
import { IdempotencyModel } from '../models/IdempotencyModel.js';
import { EventModel } from '../models/EventModel.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';

const orm = await MikroORM.init(config());
const client = new MimirTest();
const players = [2, 10, 97, 110];
afterAll(() => orm.close());

async function roundCount(sessionHash: string) {
  return orm.em.fork().count(RoundEntity, { session: { representationalHash: sessionHash } });
}

it('replays concurrent session creation and rejects changed parameters for its key', async () => {
  const requestId = randomUUID();
  const [first, retry] = await Promise.all([
    client.StartGame(19, players, requestId),
    client.StartGame(19, players, requestId),
  ]);
  expect(retry).toEqual(first);
  expect(
    await orm.em.fork().count(SessionEntity, { representationalHash: first.sessionHash })
  ).toBe(1);
  await expect(client.StartGame(19, [...players].reverse(), requestId)).rejects.toThrow(
    'different parameters'
  );
  const other = new MimirTest();
  other.setPersonId(2);
  expect((await other.StartGame(19, players, requestId)).sessionHash).not.toBe(first.sessionHash);
});

it('replays concurrent event creation with the original event ID', async () => {
  const request = EventData.initialize({
    requestId: randomUUID(),
    type: EventType.EVENT_TYPE_LOCAL,
    title: `Idempotent event ${randomUUID()}`,
    timezone: 'UTC',
    rulesetConfig: RulesetEntity.createRuleset('ema').rules,
  });
  const [first, retry] = await Promise.all([
    client.CreateEvent(request),
    client.CreateEvent(request),
  ]);
  expect(retry).toEqual(first);
  expect(await orm.em.fork().count(EventEntity, { title: request.title })).toBe(1);
  await expect(client.CreateEvent({ ...request, title: 'Different' })).rejects.toThrow(
    'different parameters'
  );
});

it('keeps an event after a failed permission grant and resumes without recreating it', async () => {
  const repo = Repository.instance({ 'x-current-person-id': '42' }, orm);
  repo.mockFrey();
  const model = Model.getModel(repo, EventModel);
  const request = EventData.initialize({
    requestId: randomUUID(),
    type: EventType.EVENT_TYPE_LOCAL,
    title: `Resume grant ${randomUUID()}`,
    timezone: 'UTC',
    rulesetConfig: RulesetEntity.createRuleset('ema').rules,
  });
  const grant = jest
    .spyOn(repo.frey, 'AddRuleForPerson')
    .mockRejectedValueOnce(new Error('Frey unavailable'))
    .mockResolvedValue({ ruleId: 1 });
  try {
    await expect(model.createEvent(request)).rejects.toThrow('Frey unavailable');
    const saved = await orm.em.fork().findOneOrFail(EventEntity, { title: request.title });
    expect(await model.createEvent(request)).toEqual({ eventId: saved.id });
    expect(await orm.em.fork().count(EventEntity, { title: request.title })).toBe(1);
    expect(await model.createEvent(request)).toEqual({ eventId: saved.id });
    expect(grant).toHaveBeenCalledTimes(2);
  } finally {
    grant.mockRestore();
  }
});

it('issues stable round tokens, deduplicates chombo, and accepts a second intentional chombo', async () => {
  const { sessionHash } = await client.StartGame(19, players);
  const overview = await client.GetSessionOverview(sessionHash);
  expect(overview.nextRoundToken).toBeTruthy();
  expect((await client.GetSessionOverview(sessionHash)).nextRoundToken).toBe(
    overview.nextRoundToken
  );
  const request = {
    sessionHash,
    roundToken: overview.nextRoundToken,
    roundData: {
      chombo: {
        roundIndex: overview.state.roundIndex,
        honba: overview.state.honbaCount,
        loserId: 10,
      },
    },
  };
  await expect(
    client.AddRound({
      ...request,
      roundData: { chombo: { ...request.roundData.chombo, honba: 999 } },
    })
  ).rejects.toThrow();
  expect((await client.GetSessionOverview(sessionHash)).nextRoundToken).toBe(
    overview.nextRoundToken
  );
  expect(await roundCount(sessionHash)).toBe(0);
  const [first, retry] = await Promise.all([client.AddRound(request), client.AddRound(request)]);
  expect(retry).toEqual(first);
  expect(first.nextRoundToken).not.toBe(overview.nextRoundToken);
  expect(await roundCount(sessionHash)).toBe(1);
  expect(first.round).toBe(overview.state.roundIndex);
  expect(first.honba).toBe(overview.state.honbaCount);
  await expect(
    client.AddRound({
      ...request,
      roundData: { chombo: { ...request.roundData.chombo, loserId: 97 } },
    })
  ).rejects.toThrow('different parameters');
  const second = await client.AddRound({ ...request, roundToken: first.nextRoundToken });
  expect(second.nextRoundToken).not.toBe(first.nextRoundToken);
  expect(await roundCount(sessionHash)).toBe(2);
  // A delayed retry returns its original response, even after later rounds.
  expect(await client.AddRound(request)).toEqual(first);
  const unauthenticated = new MimirTest();
  unauthenticated.setAuthToken('');
  await expect(unauthenticated.AddRound(request)).rejects.toThrow('Authentication required');
  expect(await roundCount(sessionHash)).toBe(2);

  await client.DropLastRound(sessionHash, second.scores);
  const afterUndo = await client.GetSessionOverview(sessionHash);
  expect(afterUndo.nextRoundToken).not.toBe(second.nextRoundToken);
  await expect(client.AddRound({ ...request, roundToken: second.nextRoundToken })).rejects.toThrow(
    'stale'
  );
  // Undo does not erase the receipt for the removed round.
  expect(await client.AddRound({ ...request, roundToken: first.nextRoundToken })).toEqual(second);
  expect(await roundCount(sessionHash)).toBe(1);
  await client.AddRound({ ...request, roundToken: afterUndo.nextRoundToken });
  expect(await roundCount(sessionHash)).toBe(2);
  await expect(client.AddRound({ ...request, roundToken: '' })).rejects.toThrow('idempotency key');
});

it('rejects competing submissions with the same round token', async () => {
  const { sessionHash } = await client.StartGame(19, players);
  const overview = await client.GetSessionOverview(sessionHash);
  const results = await Promise.allSettled(
    [10, 97].map((loserId) =>
      client.AddRound({
        sessionHash,
        roundToken: overview.nextRoundToken,
        roundData: { chombo: { roundIndex: 1, honba: 0, loserId } },
      })
    )
  );
  expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
  expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  expect(await roundCount(sessionHash)).toBe(1);
});

it('rolls back the operation receipt with the business write and permits retry', async () => {
  const key = randomUUID();
  const sessionHash = randomUUID();
  const execute = (fail: boolean) => {
    const repo = Repository.instance({}, orm);
    return Model.getModel(repo, IdempotencyModel).execute(
      'rollback-test',
      'Create',
      key,
      {},
      async () => {
        repo.em.persist(
          repo.em.create(SessionEntity, {
            event: repo.em.getReference(EventEntity, 19),
            players: [],
            extraTime: 0,
            representationalHash: sessionHash,
            nextRoundToken: randomUUID(),
          })
        );
        await repo.em.flush();
        if (fail) throw new Error('Transaction failed');
        return { sessionHash };
      }
    );
  };
  await expect(execute(true)).rejects.toThrow('Transaction failed');
  expect(await orm.em.fork().count(SessionEntity, { representationalHash: sessionHash })).toBe(0);
  expect(await execute(false)).toEqual({ sessionHash });
  expect(await execute(false)).toEqual({ sessionHash });
  expect(await orm.em.fork().count(SessionEntity, { representationalHash: sessionHash })).toBe(1);
});

it('requires creation keys and authenticates before replaying a saved response', async () => {
  await expect(client.StartGame(19, players, '')).rejects.toThrow('idempotency key');
  const requestId = randomUUID();
  await client.StartGame(19, players, requestId);
  const unauthenticated = new MimirTest();
  unauthenticated.setAuthToken('');
  await expect(unauthenticated.StartGame(19, players, requestId)).rejects.toThrow(
    'Authentication required'
  );
});
