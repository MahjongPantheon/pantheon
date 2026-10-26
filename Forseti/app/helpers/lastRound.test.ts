// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  AbortResult,
  ChomboResult,
  DrawResult,
  MultironResult,
  MultironWin,
  NagashiResult,
  RonResult,
  Round,
  TsumoResult,
} from 'tsclients/proto/atoms.pb';
import { I18nService } from '../services/i18n';
import { formatLastRound, formatRoundIndex } from './lastRound';
import { YakuId } from './yaku';

const i18n = {
  _t: (message: string, values: (string | number)[] = []) =>
    message.replace(/%(\d+)/g, (_, position) => String(values[Number(position) - 1])),
} as unknown as I18nService;
const players = {
  1: { title: 'Alice' },
  2: { title: 'Bob' },
  3: { title: 'Carol' },
  4: { title: 'Dave' },
};

describe('last round in games management', () => {
  it('includes dora plus ura-dora, han, fu, pao, and riichi without a round prefix in ron', () => {
    const round = Round.initialize({
      ron: RonResult.initialize({
        roundIndex: 5,
        winnerId: 1,
        loserId: 2,
        yaku: [YakuId.RIICHI],
        dora: 1,
        uradora: 2,
        han: 4,
        fu: 30,
        paoPlayerId: 3,
        riichiBets: [1, 4],
      }),
    });
    expect(formatLastRound(round, players, i18n)).toEqual([
      'Ron, Alice from Bob (Riichi, dora 3, 4 han, 30 fu, pao: Carol), riichi: Alice, Dave',
    ]);
  });

  it('includes bonus tiles in tsumo and omits irrelevant fu for limit hands', () => {
    const round = Round.initialize({
      tsumo: TsumoResult.initialize({
        roundIndex: 9,
        winnerId: 1,
        yaku: [YakuId.MENZENTSUMO],
        dora: 2,
        uradora: 2,
        han: 5,
        fu: 40,
        paoPlayerId: 3,
      }),
    });
    expect(formatLastRound(round, players, i18n)).toEqual([
      'Tsumo, Alice (Menzentsumo, dora 4, 5 han, pao: Carol), riichi: --',
    ]);
  });

  it('renders a separate line for each multiron winner with their own scoring details', () => {
    const round = Round.initialize({
      multiron: MultironResult.initialize({
        roundIndex: 3,
        loserId: 4,
        riichiBets: [1],
        wins: [
          MultironWin.initialize({
            winnerId: 1,
            yaku: [YakuId.RIICHI],
            dora: 1,
            uradora: 1,
            han: 3,
            fu: 40,
          }),
          MultironWin.initialize({
            winnerId: 2,
            yaku: [YakuId.DAISANGEN],
            paoPlayerId: 3,
            han: -1,
          }),
        ],
      }),
    });
    expect(formatLastRound(round, players, i18n)).toEqual([
      'Ron, Alice from Dave (Riichi, dora 2, 3 han, 40 fu), riichi: Alice',
      'Ron, Bob from Dave (Daisangen, yakuman!, pao: Carol), riichi: Alice',
    ]);
  });

  it('also includes dora and ura-dora for every non-yakuman multiron winner', () => {
    const wins = [1, 2].map((winnerId) =>
      MultironWin.initialize({ winnerId, dora: winnerId, uradora: 1, han: 5 })
    );
    const lines = formatLastRound(
      Round.initialize({ multiron: MultironResult.initialize({ loserId: 4, wins }) }),
      players,
      i18n
    );
    expect(lines[0]).toContain('dora 2, 5 han');
    expect(lines[1]).toContain('dora 3, 5 han');
  });

  it.each([
    [[], 'all noten'],
    [[1, 2, 3, 4], 'all tenpai'],
    [[1, 3], 'Alice, Carol'],
  ])('describes exhaustive draw tenpai %j', (tempai, expected) => {
    const round = Round.initialize({
      draw: DrawResult.initialize({ roundIndex: 8, tempai, riichiBets: [2] }),
    });
    expect(formatLastRound(round, players, i18n)).toEqual([
      `Draw, tempai: ${expected}, riichi: Bob`,
    ]);
  });

  it('includes players without a round prefix for abortive draw, chombo, and nagashi', () => {
    expect(
      formatLastRound(
        Round.initialize({ abort: AbortResult.initialize({ roundIndex: 2, riichiBets: [3] }) }),
        players,
        i18n
      )
    ).toEqual(['Abortive draw, riichi: Carol']);
    expect(
      formatLastRound(
        Round.initialize({ chombo: ChomboResult.initialize({ roundIndex: 4, loserId: 2 }) }),
        players,
        i18n
      )
    ).toEqual(['Chombo, Bob']);
    expect(
      formatLastRound(
        Round.initialize({
          nagashi: NagashiResult.initialize({
            roundIndex: 6,
            nagashi: [1, 2],
            tempai: [],
            riichiBets: [3],
          }),
        }),
        players,
        i18n
      )
    ).toEqual(['Nagashi mangan, nagashi: Alice, Bob, tempai: all noten, riichi: Carol']);
  });

  it('keeps a hand readable when player profiles are missing', () => {
    const round = Round.initialize({
      ron: RonResult.initialize({
        roundIndex: 1,
        winnerId: 1,
        loserId: 2,
        paoPlayerId: 3,
        riichiBets: [4],
        han: 1,
        fu: 30,
      }),
    });
    expect(formatLastRound(round, {}, i18n)).toEqual([
      'Ron, Player #1 from Player #2 (1 han, 30 fu, pao: Player #3), riichi: Player #4',
    ]);
  });

  it('returns player names as plain text without adding HTML markup', () => {
    const round = Round.initialize({
      chombo: ChomboResult.initialize({ roundIndex: 1, loserId: 1 }),
    });
    expect(formatLastRound(round, { 1: { title: '<b>Alice & Bob</b>' } }, i18n)).toEqual([
      'Chombo, <b>Alice & Bob</b>',
    ]);
  });

  it('handles an absent outcome and an unknown round index', () => {
    expect(formatLastRound(Round.initialize({}), players, i18n)).toEqual([]);
    expect(formatRoundIndex(0)).toBe('?');
    expect(formatRoundIndex(17)).toBe('?');
    expect(formatRoundIndex(16)).toBe('北4');
  });
});
