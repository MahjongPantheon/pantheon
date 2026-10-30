// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironResult,
  MultironWin,
  NagashiResult,
  Player,
  RonResult,
  Round,
  TsumoResult,
} from 'tsclients/proto/atoms.pb';
import type { I18nService } from '../services/i18n';
import { makeLog } from './gameLog';

const i18n = {
  _t: (message: string, args: (string | number)[] = []) =>
    message.replace(/%(\d+)/g, (_, position) => String(args[Number(position) - 1])),
  _pt: (_context: string, message: string, args: (string | number)[] = []) =>
    message.replace(/%(\d+)/g, (_, position) => String(args[Number(position) - 1])),
} as unknown as I18nService;
const players = {
  1: Player.initialize({ id: 1, title: 'Alice' }),
  2: Player.initialize({ id: 2, title: 'Bob' }),
};

describe('chombo game log', () => {
  it('uses three-player round labels for simultaneous chombo', () => {
    const round = Round.initialize({
      chombo: ChomboResult.initialize({ roundIndex: 4, loserIds: [1, 2] }),
    });
    expect(makeLog([round], players, i18n, 3)).toEqual(['南1: Chombo (<b>Alice, Bob</b>)']);
  });

  it('shows every player penalized in the round', () => {
    const round = Round.initialize({
      chombo: ChomboResult.initialize({
        roundIndex: 1,
        loserIds: [1, 2],
      }),
    });
    expect(makeLog([round], players, i18n)[0]).toContain('Alice, Bob');
  });
  it('shows a single penalized player', () => {
    const round = Round.initialize({
      chombo: ChomboResult.initialize({ roundIndex: 1, loserIds: [2] }),
    });
    expect(makeLog([round], players, i18n)[0]).toContain('Bob');
    expect(makeLog([round], players, i18n)[0]).not.toContain('Alice');
  });
});

describe('other game log outcomes', () => {
  it.each([0, 2])(
    'keeps the ron loser and optional pao player separate (pao=%i)',
    (paoPlayerId) => {
      const round = Round.initialize({
        ron: RonResult.initialize({
          roundIndex: 1,
          winnerId: 1,
          loserId: 2,
          paoPlayerId,
          han: 3,
          fu: 40,
          yaku: [1],
          dora: 1,
          riichiBets: [1],
        }),
      });
      const [log] = makeLog([round], players, i18n);
      expect(log).toContain('東1: <b>Alice</b>');
      expect(log).toContain('(<b>Bob</b>' + (paoPlayerId ? ', pao: <b>Bob</b>' : '') + ')');
      expect(log).toContain('3 han, 40 fu. Riichi bets: Alice');
      expect(log).toContain('dora 1');
    }
  );

  it.each([0, 2])('shows tsumo responsibility and limit-hand scoring (pao=%i)', (paoPlayerId) => {
    const round = Round.initialize({
      tsumo: TsumoResult.initialize({
        roundIndex: 5,
        winnerId: 1,
        paoPlayerId,
        han: paoPlayerId ? -1 : 5,
        yaku: [1],
      }),
    });
    const [log] = makeLog([round], players, i18n);
    expect(log).toContain('南1: <b>Alice</b>');
    expect(log).toContain(paoPlayerId ? '(tsumo, pao: <b>Bob</b>)' : '(tsumo)');
    expect(log).toContain(paoPlayerId ? 'yakuman!' : '5 han');
    expect(log).toContain('Riichi bets: none');
  });

  it.each([
    [[], 'all noten'],
    [[1], 'Alice'],
    [[1, 2, 3, 4], 'all tenpai'],
  ] as [number[], string][])('describes draw readiness for %j', (tempai, label) => {
    const round = Round.initialize({ draw: DrawResult.initialize({ roundIndex: 2, tempai }) });
    expect(makeLog([round], players, i18n)).toEqual([
      `東2: Exhaustive draw (tenpai: ${label}). Riichi bets: none`,
    ]);
  });

  it('distinguishes abortive draw and nagashi mangan, with and without riichi bets', () => {
    const rounds = [
      { abort: AbortResult.initialize({ roundIndex: 3 }) },
      { abort: AbortResult.initialize({ roundIndex: 3, riichiBets: [2] }) },
      { nagashi: NagashiResult.initialize({ roundIndex: 4, nagashi: [1], riichiBets: [2] }) },
      { nagashi: NagashiResult.initialize({ roundIndex: 4, nagashi: [2] }) },
    ];
    expect(makeLog(rounds, players, i18n)).toEqual([
      '東3: Abortive draw. Riichi bets: none',
      '東3: Abortive draw. Riichi bets: Bob',
      '東4: Nagashi mangan (<b>Alice</b>). Riichi bets: Bob',
      '東4: Nagashi mangan (<b>Bob</b>). Riichi bets: none',
    ]);
  });

  it('lists each multiron winner while retaining the shared scalar loser', () => {
    const round = Round.initialize({
      multiron: MultironResult.initialize({
        roundIndex: 8,
        loserId: 2,
        wins: [
          MultironWin.initialize({ winnerId: 1, han: 3, fu: 30 }),
          MultironWin.initialize({ winnerId: 1, paoPlayerId: 2, han: -1 }),
        ],
      }),
    });
    const [log] = makeLog([round], players, i18n);
    expect(log).toContain('南4: Ron (<b>Bob</b>). Riichi bets: none');
    expect(log).toContain('<li><b>Alice</b> - , 3 han, 30 fu</li>');
    expect(log).toContain('<li><b>Alice</b> (pao: <b>Bob</b>) - , yakuman!</li>');
  });

  it('handles unknown rounds and missing player names without crashing', () => {
    expect(
      makeLog(
        [{}, { chombo: ChomboResult.initialize({ roundIndex: 0, loserIds: [99] }) }],
        players,
        i18n
      )
    ).toEqual(['', '?: Chombo (<b></b>)']);
  });
});
