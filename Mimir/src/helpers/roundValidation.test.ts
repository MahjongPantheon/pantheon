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
import { EventEntity } from '../entities/Event.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import {
  _checkHan,
  _checkNumericArray,
  _checkRon,
  _checkTsumo,
  _checkMultiRon,
  checkRound,
  validateAndCreateFromOnlineData,
} from './roundValidation.js';

const players = [1, 2, 3, 4];
const ruleset = RulesetEntity.createRuleset('ema');
const win = {
  winnerId: 1,
  loserId: 2,
  paoPlayerId: 0,
  roundIndex: 3,
  honba: 2,
  han: 3,
  fu: 40,
  yaku: [33],
  riichiBets: [1],
};
const rounds: [Round, RoundOutcome, number][] = [
  [{ ron: RonResult.initialize(win) }, RoundOutcome.ROUND_OUTCOME_RON, 1],
  [{ tsumo: TsumoResult.initialize(win) }, RoundOutcome.ROUND_OUTCOME_TSUMO, 1],
  [
    { draw: DrawResult.initialize({ roundIndex: 3, honba: 2, tempai: [1], riichiBets: [1] }) },
    RoundOutcome.ROUND_OUTCOME_DRAW,
    1,
  ],
  [
    { abort: AbortResult.initialize({ roundIndex: 3, honba: 2, riichiBets: [1] }) },
    RoundOutcome.ROUND_OUTCOME_ABORT,
    1,
  ],
  [
    { chombo: ChomboResult.initialize({ roundIndex: 3, honba: 2, loserIds: [2] }) },
    RoundOutcome.ROUND_OUTCOME_CHOMBO,
    1,
  ],
  [
    {
      nagashi: NagashiResult.initialize({
        roundIndex: 3,
        honba: 2,
        tempai: [1],
        nagashi: [1],
        riichiBets: [1],
      }),
    },
    RoundOutcome.ROUND_OUTCOME_NAGASHI,
    1,
  ],
  [
    {
      multiron: MultironResult.initialize({
        roundIndex: 3,
        honba: 2,
        loserId: 2,
        multiRon: 2,
        riichiBets: [1],
        wins: [MultironWin.initialize(win), MultironWin.initialize({ ...win, winnerId: 3 })],
      }),
    },
    RoundOutcome.ROUND_OUTCOME_MULTIRON,
    2,
  ],
];

it.each(rounds)('validates and converts online outcome %s', (round, outcome, count) => {
  const session = Object.assign(new SessionEntity(), {
    event: Object.assign(new EventEntity(), { ruleset }),
  });
  const entity = validateAndCreateFromOnlineData(players, players, session, round);
  expect(entity.outcome).toBe(outcome);
  expect(entity.round).toBe(3);
  expect(entity.honba).toBe(2);
  expect(entity.hands).toHaveLength(count);
  expect(entity.session).toBe(session);
  expect(entity.event).toBe(session.event);
  if (round.multiron) expect(entity.hands.map((h) => h.loserId)).toEqual([2, 2]);
  if (!round.chombo) expect(entity.riichi).toEqual([1]);
});

it('rejects unregistered players, invalid outcomes and unknown array members', () => {
  expect(() => checkRound(players, [1, 2, 3], ruleset, rounds[0][0])).toThrow('not registered');
  expect(() => checkRound(players, players, ruleset, {})).toThrow('Unrecognized outcome');
  expect(() => _checkNumericArray({ tempai: [1, 99] }, 'tempai', players)).toThrow(
    'also contains [99]'
  );
  expect(() => _checkNumericArray({ tempai: [1] }, 'tempai', players)).not.toThrow();
  expect(() => _checkNumericArray({}, 'tempai', players)).not.toThrow();
});

it.each([-7, 0, 33, '3', undefined])('rejects invalid han value %s', (han) => {
  expect(() => _checkHan({ han } as { han: number })).toThrow('valid han count');
});
it.each([-6, -1, 1, 32])('accepts supported han boundary %s', (han) => {
  expect(() => _checkHan({ han })).not.toThrow();
});

it.each(['ron', 'tsumo'] as const)('validates %s yaku, pao and payment fields', (kind) => {
  const check = kind === 'ron' ? _checkRon : _checkTsumo;
  const valid = RonResult.initialize({ ...win, paoPlayerId: 3 });
  expect(() => check(players, [33], valid)).not.toThrow();
  for (const [field, value] of [
    ['winnerId', 99],
    ['paoPlayerId', 99],
    ['fu', 35],
    ['dora', 17],
    ['uradora', 5],
    ['kandora', 17],
    ['kanuradora', 17],
    ['yaku', [999]],
    ['yaku', undefined],
  ] as const) {
    expect(() => check(players, [33], { ...valid, [field]: value })).toThrow();
  }
});

it('validates every multiron hand and the advertised winner count', () => {
  const valid = MultironResult.initialize({
    loserId: 2,
    multiRon: 1,
    wins: [MultironWin.initialize({ ...win, paoPlayerId: 3 })],
  });
  expect(() => _checkMultiRon(players, [33], valid)).not.toThrow();
  expect(() =>
    _checkMultiRon(players, [33], { ...valid, wins: undefined as unknown as MultironWin[] })
  ).toThrow('wins is required');
  expect(() => _checkMultiRon(players, [33], { ...valid, multiRon: 2 })).toThrow('multiRon');
  expect(() =>
    _checkMultiRon(players, [33], {
      ...valid,
      wins: [{ ...valid.wins[0], yaku: undefined as unknown as number[] }],
    })
  ).toThrow('yaku');
});

it.each([
  [1, 2],
  [1, 2, 3, 4],
])('accepts distinct chombo players %j in one round', (...ids) => {
  const loserIds = ids as number[];
  const chombo = ChomboResult.initialize({ loserIds, roundIndex: 1 });
  expect(() => checkRound(players, players, ruleset, { chombo })).not.toThrow();
  const session = Object.assign(new SessionEntity(), {
    event: Object.assign(new EventEntity(), { ruleset }),
  });
  const round = validateAndCreateFromOnlineData(players, players, session, { chombo });
  expect(round.hands.map((hand) => hand.loserId)).toEqual(loserIds);
  expect(round.hands.every((hand) => hand.round === round)).toBe(true);
});

it.each([{ loserIds: [] }, { loserIds: [1, 1] }, { loserIds: [1, 99] }, { loserIds: [0] }])(
  'rejects invalid chombo players %j before creating a round',
  (data) => {
    expect(() =>
      checkRound(players, players, ruleset, {
        chombo: ChomboResult.initialize(data),
      })
    ).toThrow();
  }
);
