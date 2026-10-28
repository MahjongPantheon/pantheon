import { AchievementsEntity } from '../Achievements.entity.js';
import { RoundEntity } from '../Round.entity.js';
import { HandEntity } from '../Hand.entity.js';
import { EventEntity } from '../Event.entity.js';
import { SessionEntity } from '../Session.entity.js';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironResult,
  MultironWin,
  NagashiResult,
  RonResult,
  Round,
  RoundOutcome,
  TsumoResult,
} from 'tsclients/proto/atoms.pb.js';

it('collects and deduplicates player IDs from every achievement format', () => {
  const entity = new AchievementsEntity();
  entity.data = {};
  expect(entity.getAllPlayersIds()).toEqual([]);
  const data: Record<string, unknown> = {};
  for (const name of [
    'braveSapper',
    'dieHard',
    'justAsPlanned',
    'catchEmAll',
    'ninja',
    'riichiNomi',
    'bestDealer',
    'bestFu',
    'bestHand',
    'bestTsumoist',
    'dovakins',
    'shithander',
  ])
    data[name] = { playerIds: [1, 2] };
  for (const name of [
    'andYourRiichiBet',
    'honoredDonor',
    'doraLord',
    'favoriteAsapinApprentice',
    'favoriteTsuchidaApprentice',
    'covetousKnight',
    'needMoreGold',
    'carefulPlanning',
    'impossibleWait',
    'yakumans',
  ])
    data[name] = [{ playerId: 2 }, { playerId: 3 }];
  entity.data = data;
  expect(entity.getAllPlayersIds().sort((a, b) => a - b)).toEqual([1, 2, 3]);
});

const base = {
  roundIndex: 3,
  honba: 2,
  winnerId: 1,
  loserId: 2,
  han: 3,
  fu: 40,
  yaku: [33],
  riichiBets: [1],
};
const cases: [Round, RoundOutcome, string][] = [
  [{ ron: RonResult.initialize(base) }, RoundOutcome.ROUND_OUTCOME_RON, 'ron'],
  [{ tsumo: TsumoResult.initialize(base) }, RoundOutcome.ROUND_OUTCOME_TSUMO, 'tsumo'],
  [
    { draw: DrawResult.initialize({ ...base, tempai: [1] }) },
    RoundOutcome.ROUND_OUTCOME_DRAW,
    'draw',
  ],
  [{ abort: AbortResult.initialize(base) }, RoundOutcome.ROUND_OUTCOME_ABORT, 'abort'],
  [{ chombo: ChomboResult.initialize(base) }, RoundOutcome.ROUND_OUTCOME_CHOMBO, 'chombo'],
  [
    { nagashi: NagashiResult.initialize({ ...base, tempai: [1], nagashi: [1] }) },
    RoundOutcome.ROUND_OUTCOME_NAGASHI,
    'nagashi',
  ],
  [
    {
      multiron: MultironResult.initialize({
        ...base,
        multiRon: 2,
        wins: [MultironWin.initialize(base), MultironWin.initialize({ ...base, winnerId: 3 })],
      }),
    },
    RoundOutcome.ROUND_OUTCOME_MULTIRON,
    'multiron',
  ],
];

it.each(cases)(
  'retains outcome %s and round counters during entity conversion',
  (message, outcome, key) => {
    const session = new SessionEntity(),
      event = new EventEntity();
    const entity = RoundEntity.fromMessage(session, event, message);
    expect(entity.outcome).toBe(outcome);
    expect(entity.session).toBe(session);
    expect(entity.event).toBe(event);
    const result = RoundEntity.toMessage(entity) as Record<
      string,
      { roundIndex: number; honba: number }
    >;
    expect(result[key]).toMatchObject({ roundIndex: 3, honba: 2 });
    if (message.multiron) expect(entity.hands.map((h) => h.loserId)).toEqual([2, 2]);
    entity.riichi = undefined;
    for (const hand of entity.hands) {
      hand.yaku = undefined;
      hand.tempai = undefined;
      hand.nagashi = undefined;
    }
    const sparse = RoundEntity.toMessage(entity) as Record<string, Record<string, unknown>>;
    if (key !== 'chombo') expect(sparse[key].riichiBets).toEqual([]);
    if (key === 'draw' || key === 'nagashi') expect(sparse[key].tempai).toEqual([]);
    if (key === 'nagashi') expect(sparse[key].nagashi).toEqual([]);
  }
);

it('handles unknown outcomes without inventing a hand and associates supplied round references', () => {
  expect(RoundEntity.toMessage(new RoundEntity())).toEqual({});
  const round = RoundEntity.fromMessage(new SessionEntity(), new EventEntity(), {});
  expect(round.outcome).toBeUndefined();
  expect(HandEntity.fromMessage(AbortResult.initialize({}), round).round).toBe(round);
});
