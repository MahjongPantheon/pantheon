import { PlayerInSession, RoundOutcome, SessionState } from 'tsclients/proto/atoms.pb';
import { initialState, initBlankOutcome } from '../store/state';
import type { IAppState } from '../store/interfaces';
import { formatRoundToTwirp } from './formatters';
import { getDora, getFu, getHan, getPossibleFu } from '../store/selectors/hanFu';
import * as selectors from '../store/selectors/mimir';
import { YakuId } from '../helpers/yaku';
import { pack } from '../helpers/yakuCompatibility';
import { mayGoNextFromPlayersSelect, mayGoNextFromYakuSelect } from '../store/selectors/navbar';

function state(outcome: RoundOutcome): IAppState {
  return {
    ...initialState,
    players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id })),
    sessionState: SessionState.initialize({ roundIndex: 3, honbaCount: 2 }),
    currentOutcome: initBlankOutcome(3, outcome),
  };
}
const win = {
  winner: 1,
  winnerIsDealer: false,
  han: 3,
  dora: 1,
  fu: 40,
  possibleFu: [30, 40],
  yaku: pack([YakuId.RIICHI, YakuId.__OPENHAND]),
  openHand: true,
};

it.each([1, 4])(
  'serializes a tsumo with %s dora and suppresses fu for limit hands',
  (dora: number) => {
    const s = state(RoundOutcome.ROUND_OUTCOME_TSUMO);
    s.currentOutcome = {
      ...initBlankOutcome(3, RoundOutcome.ROUND_OUTCOME_TSUMO),
      ...win,
      selectedOutcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
      dora,
      riichiBets: [2, 99],
      paoPlayerId: 3,
    };
    expect(formatRoundToTwirp(s)).toEqual({
      tsumo: {
        roundIndex: 3,
        honba: 2,
        riichiBets: [2],
        winnerId: 1,
        paoPlayerId: 3,
        han: 3 + dora,
        fu: dora === 1 ? 40 : 0,
        dora,
        uradora: 0,
        kandora: 0,
        kanuradora: 0,
        yaku: [YakuId.RIICHI],
        openHand: true,
      },
    });
    expect(getHan(s, 1)).toBe(3);
    expect(getDora(s, 1)).toBe(dora);
    expect(getPossibleFu(s, 1)).toEqual([30, 40]);
    expect(selectors.getPaoUsers(s).map((p) => p.id)).toEqual([3]);
    expect(selectors.hasYaku(s, YakuId.RIICHI)).toEqual({ 1: true });
    expect(mayGoNextFromYakuSelect(s)).toBe(true);
    expect(mayGoNextFromPlayersSelect(s)).toBe(true);
  }
);

it.each([1, 2])('serializes ron with %s winners and independent hand values', (count: number) => {
  const s = state(RoundOutcome.ROUND_OUTCOME_RON);
  const wins = {
    1: { ...win, paoPlayerId: 3 },
    ...(count === 2 ? { 2: { ...win, winner: 2, dora: 2, paoPlayerId: 99 } } : {}),
  };
  s.currentOutcome = {
    selectedOutcome: RoundOutcome.ROUND_OUTCOME_RON,
    roundIndex: 3,
    loser: 4,
    loserIsDealer: false,
    wins,
    multiRon: count,
    riichiBets: [1],
  };
  const result = formatRoundToTwirp(s)!;
  const data = count === 1 ? result.ron! : result.multiron!;
  expect(data).toMatchObject({ roundIndex: 3, honba: 2, loserId: 4, riichiBets: [1] });
  if (count === 1)
    expect(result.ron).toMatchObject({
      winnerId: 1,
      han: 4,
      fu: 40,
      openHand: true,
      yaku: [YakuId.RIICHI],
    });
  else
    expect(result.multiron!.wins).toMatchObject([
      { winnerId: 1, han: 4, fu: 40 },
      { winnerId: 2, han: 5, fu: 0 },
    ]);
  expect(getHan(s, 1)).toBe(3);
  expect(getFu(s, 1)).toBe(40);
  expect(getDora(s, 1)).toBe(1);
  expect(getPossibleFu(s, 1)).toEqual([30, 40]);
  expect(selectors.getPaoUsers(s).map((p) => p.id)).toEqual([3]);
  expect(selectors.hasYaku(s, YakuId.RIICHI)).toEqual(
    count === 1 ? { 1: true } : { 1: true, 2: true }
  );
  expect(mayGoNextFromYakuSelect(s)).toBe(true);
  expect(mayGoNextFromPlayersSelect(s)).toBe(true);
});

it.each([RoundOutcome.ROUND_OUTCOME_DRAW, RoundOutcome.ROUND_OUTCOME_NAGASHI])(
  'serializes %s while dropping unknown player IDs',
  (outcome: RoundOutcome) => {
    const s = state(outcome);
    if (
      s.currentOutcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_DRAW &&
      s.currentOutcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_NAGASHI
    )
      throw new Error('Expected draw');
    s.currentOutcome.tempai = [1, 99];
    s.currentOutcome.riichiBets = [2, 99];
    s.currentOutcome.deadhands = [3, 99];
    if (s.currentOutcome.selectedOutcome === RoundOutcome.ROUND_OUTCOME_NAGASHI)
      s.currentOutcome.nagashi = [4, 99];
    const result = formatRoundToTwirp(s)!;
    expect(result.draw ?? result.nagashi).toMatchObject({
      roundIndex: 3,
      honba: 2,
      tempai: [1],
      riichiBets: [2],
    });
    expect(selectors.getDeadhandUsers(s).map((p) => p.id)).toEqual([3]);
    expect(selectors.getNagashiUsers(s).map((p) => p.id)).toEqual(
      outcome === RoundOutcome.ROUND_OUTCOME_NAGASHI ? [4] : []
    );
    expect(mayGoNextFromPlayersSelect(s)).toBe(true);
  }
);

it('serializes abort and chombo results', () => {
  const abort = state(RoundOutcome.ROUND_OUTCOME_ABORT);
  if (abort.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_ABORT)
    abort.currentOutcome.riichiBets = [2];
  expect(formatRoundToTwirp(abort)).toEqual({
    abort: { roundIndex: 3, honba: 2, riichiBets: [2] },
  });
  const chombo = state(RoundOutcome.ROUND_OUTCOME_CHOMBO);
  if (chombo.currentOutcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_CHOMBO)
    chombo.currentOutcome.loser = 3;
  expect(formatRoundToTwirp(chombo)).toEqual({ chombo: { roundIndex: 3, honba: 2, loserId: 3 } });
  expect(mayGoNextFromPlayersSelect(chombo)).toBe(true);
});

it('returns empty selector values before an outcome has been selected', () => {
  expect(formatRoundToTwirp(initialState)).toBeUndefined();
  for (const get of [getHan, getFu, getDora]) expect(get(initialState, 1)).toBe(0);
  expect(getPossibleFu(initialState, 1)).toEqual([]);
  for (const get of [
    selectors.getWinningUsers,
    selectors.getLosingUsers,
    selectors.getPaoUsers,
    selectors.getDeadhandUsers,
    selectors.getNagashiUsers,
    selectors.getRiichiUsers,
  ])
    expect(get(initialState)).toEqual([]);
  expect(selectors.hasYaku(initialState, YakuId.RIICHI)).toEqual({});
  expect(mayGoNextFromPlayersSelect(initialState)).toBeUndefined();
  expect(mayGoNextFromYakuSelect(initialState)).toBeUndefined();
});
