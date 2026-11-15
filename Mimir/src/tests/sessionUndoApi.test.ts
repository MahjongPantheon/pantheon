import { vi } from 'vitest';
import { MikroORM } from '@mikro-orm/postgresql';
import { EventData, EventType, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import config from '../mikro-orm.config.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { MimirTest } from '../services/MimirTest.js';
import { Repository } from '../services/Repository.js';
import { Model } from '../models/Model.js';
import { SessionModel } from '../models/SessionModel.js';
import { PlayerStatsModel } from '../models/PlayerStatsModel.js';

const client = new MimirTest();
const orm = await MikroORM.init(config());
afterAll(() => orm.close());
afterEach(() => vi.restoreAllMocks());

async function finishedGame() {
  const { eventId } = await client.CreateEvent(
    EventData.initialize({
      type: EventType.EVENT_TYPE_LOCAL,
      title: 'Atomic club undo',
      timezone: 'UTC',
      rulesetConfig: RulesetEntity.createRuleset('ema').rules,
    })
  );
  for (const id of [1, 2, 3, 4]) await client.RegisterPlayer(eventId, id);
  const { sessionHash } = await client.StartGame(eventId, [1, 2, 3, 4]);
  const before = await client.GetSessionOverview(sessionHash);
  await client.AddRound({
    sessionHash,
    roundData: { draw: { roundIndex: 1, honba: 0, riichiBets: [], tempai: [1, 2] } },
  });
  await client.ForceFinishGame(sessionHash);
  const finished = await client.GetSessionOverview(sessionHash);
  const scores = finished.players.map((p) => ({ playerId: p.id, score: p.score, chomboCount: 0 }));
  return { sessionHash, before, finished, scores };
}

it('undoes club results and the last round in one confirmed request', async () => {
  const { sessionHash, before, finished, scores } = await finishedGame();
  expect((await client.GetGame(sessionHash)).game.finalResults).toHaveLength(4);
  await client.DropLastRound(sessionHash, scores, true);
  const restored = await client.GetSessionOverview(sessionHash);
  expect(restored.state.finished).toBe(false);
  expect(restored.state.roundIndex).toBe(before.state.roundIndex);
  expect(restored.state.honbaCount).toBe(before.state.honbaCount);
  expect(restored.players.map((p) => p.score)).toEqual(before.players.map((p) => p.score));
  expect(restored.nextRoundToken).not.toBe(finished.nextRoundToken);
  expect(
    await orm.em.fork().count(RoundEntity, { session: { representationalHash: sessionHash } })
  ).toBe(0);
  expect((await client.GetGame(sessionHash)).game.finalResults).toHaveLength(0);
  expect(
    (await orm.em.fork().findOneOrFail(SessionEntity, { representationalHash: sessionHash }))
      .endDate
  ).toBeFalsy();
  await expect(client.DropLastRound(sessionHash, scores, true)).rejects.toThrow();
});

it('leaves finished results intact without confirmation or with stale scores', async () => {
  const { sessionHash, scores } = await finishedGame();
  await expect(client.DropLastRound(sessionHash, scores)).rejects.toThrow();
  await expect(
    client.DropLastRound(sessionHash, [{ ...scores[0], score: 0 }], true)
  ).rejects.toThrow();
  expect((await client.GetSessionOverview(sessionHash)).state.finished).toBe(true);
  expect((await client.GetGame(sessionHash)).game.finalResults).toHaveLength(4);
  expect((await client.GetAllRounds(sessionHash)).rounds).toHaveLength(1);
});

it('rolls back result removal and reopening when an operation inside undo fails', async () => {
  const { sessionHash, scores } = await finishedGame();
  const repo = Repository.instance(
    { 'x-current-person-id': '1', 'x-auth-token': 'test-token' },
    orm
  );
  repo.mockFrey();
  vi.spyOn(
    Model.getModel(repo, PlayerStatsModel),
    'scheduleRebuildPlayersStats'
  ).mockImplementation(async () => {
    // Force the pending result/history deletions to reach PostgreSQL before failing.
    await repo.em.flush();
    throw new Error('Simulated rebuild failure');
  });
  await expect(
    Model.getModel(repo, SessionModel).dropLastRound({
      sessionHash,
      intermediateResults: scores,
      cancelResults: true,
    })
  ).rejects.toThrow('Simulated rebuild failure');
  const saved = await orm.em
    .fork()
    .findOneOrFail(SessionEntity, { representationalHash: sessionHash });
  expect(saved.status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
  expect((await client.GetGame(sessionHash)).game.finalResults).toHaveLength(4);
  expect((await client.GetAllRounds(sessionHash)).rounds).toHaveLength(1);
});
