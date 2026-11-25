import {
  EventData,
  EventType,
  MultironResult,
  MultironWin,
  Round,
} from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { MimirTest } from '../services/MimirTest.js';
import { Yaku } from '../helpers/yaku.js';

const client = new MimirTest();

async function startSession(
  withAbortives: boolean,
  allowTripleRonWithAbortives: boolean,
  withAtamahane = false,
  withSanma = false
) {
  const rules = RulesetEntity.createRuleset('ema').rules;
  Object.assign(rules, { withAbortives, allowTripleRonWithAbortives, withAtamahane, withSanma });
  const { eventId } = await client.CreateEvent(
    EventData.initialize({
      type: EventType.EVENT_TYPE_LOCAL,
      title: 'Abortive draw policy regression',
      timezone: 'UTC',
      rulesetConfig: rules,
    })
  );
  const players = withSanma ? [1, 2, 3] : [1, 2, 3, 4];
  for (const id of players) await client.RegisterPlayer(eventId, id);
  return { eventId, sessionHash: (await client.StartGame(eventId, players)).sessionHash };
}

function multiron(winners = [2, 3, 4], loserId = 1, honba = 0, riichiBets: number[] = []): Round {
  return {
    multiron: MultironResult.initialize({
      roundIndex: 1,
      honba,
      loserId,
      riichiBets,
      multiRon: winners.length,
      wins: winners.map((winnerId) =>
        MultironWin.initialize({
          winnerId,
          han: 1,
          fu: 30,
          yaku: [Yaku.TANYAO],
          openHand: true,
        })
      ),
    }),
  };
}

async function assertRejected(sessionHash: string, roundData: Round) {
  const before = await client.GetSessionOverview(sessionHash);
  await expect(client.PreviewRound({ sessionHash, roundData })).rejects.toThrow();
  await expect(client.AddRound({ sessionHash, roundData })).rejects.toThrow();
  expect(await client.GetSessionOverview(sessionHash)).toEqual(before);
  expect((await client.GetGame(sessionHash)).game.rounds).toHaveLength(0);
}

it.each([
  [false, false],
  [false, true],
  [true, true],
])(
  'previews and records triple ron with abortives=%s and triple ron=%s',
  async (withAbortives, allowTripleRonWithAbortives) => {
    const { sessionHash, eventId } = await startSession(withAbortives, allowTripleRonWithAbortives);
    const config = await client.GetGameConfig(eventId);
    expect(config.rulesetConfig.withAbortives).toBe(withAbortives);
    expect(config.rulesetConfig.allowTripleRonWithAbortives).toBe(allowTripleRonWithAbortives);
    const roundData = multiron();
    const preview = await client.PreviewRound({ sessionHash, roundData });
    expect(preview.state?.scores.map(({ score }) => score)).toEqual([27000, 31000, 31000, 31000]);
    expect(preview.state?.roundIndex).toBe(1);
    expect(preview.state?.honba).toBe(0);
    expect(
      (await client.GetSessionOverview(sessionHash)).players.map(({ score }) => score)
    ).toEqual([30000, 30000, 30000, 30000]);
    const added = await client.AddRound({ sessionHash, roundData });
    expect(added.scores.map(({ score }) => score)).toEqual([27000, 31000, 31000, 31000]);
    const saved = await client.GetSessionOverview(sessionHash);
    expect(saved.state.scores).toEqual(preview.state.scores);
    expect(saved.state.roundIndex).toBe(2);
    expect(saved.state.honbaCount).toBe(0);
    expect((await client.GetGame(sessionHash)).game.rounds[0].multiron?.wins).toHaveLength(3);
  }
);

it('keeps legacy all-abortives rules and permits double ron', async () => {
  const { sessionHash } = await startSession(true, false);
  await assertRejected(sessionHash, multiron());
  await client.AddRound({ sessionHash, roundData: multiron([2, 3]) });
  expect((await client.GetSessionOverview(sessionHash)).players.map(({ score }) => score)).toEqual([
    28000, 31000, 31000, 30000,
  ]);
});

it.each([false, true])('keeps atamahane precedence with triple ron=%s', async (tripleRon) => {
  const { sessionHash } = await startSession(true, tripleRon, true);
  await assertRejected(sessionHash, multiron([2, 3]));
  await assertRejected(sessionHash, multiron());
});

it('retains dealer repeats, honba and riichi allocation with triple ron', async () => {
  const { sessionHash } = await startSession(true, true);
  await client.AddRound({
    sessionHash,
    roundData: { abort: { roundIndex: 1, honba: 0, riichiBets: [4] } },
  });
  const roundData = multiron([1, 2, 3], 4, 1, [1, 2]);
  const preview = await client.PreviewRound({ sessionHash, roundData });
  // Dealer wins 1500 + 300 honba, other winners 1000 + 300 each.
  // Winners recover their current riichi; the closest winner gets the carried bet.
  expect(preview.state?.scores.map(({ score }) => score)).toEqual([32800, 31300, 31300, 24600]);
  expect(preview.state?.roundIndex).toBe(1);
  expect(preview.state?.honba).toBe(1);
  expect(preview.state?.riichi).toBe(1);
  const added = await client.AddRound({ sessionHash, roundData });
  expect(added.scores).toEqual(preview.state?.scores);
  const saved = await client.GetSessionOverview(sessionHash);
  expect(saved.state.roundIndex).toBe(1);
  expect(saved.state.honbaCount).toBe(2);
  expect(saved.state.riichiCount).toBe(0);
});

it('rejects more ron winners than real opponents in sanma', async () => {
  const { sessionHash } = await startSession(true, true, false, true);
  await assertRejected(sessionHash, multiron([1, 2, 3], 1));
});
