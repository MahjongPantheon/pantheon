import { GameConfig, PlayerInSession, RoundOutcome, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { IAppState } from '../interfaces';
import { initialState, initBlankOutcome } from '../state';
import { outcomeReducer } from '../reducers/outcomeReducer';
import { ADD_YAKU, REMOVE_YAKU } from '../actions/interfaces';
import { YakuId as Y, yakuList } from '../../helpers/yaku';
import { makeYakuGraph, pack } from '../../helpers/yakuCompatibility';
import { getFixedFu, getYakuAdvice } from '../../helpers/yakuValues';
import { getDisabledYaku, getSelectedYaku } from './yaku';
import { mayGoNextFromYakuSelect } from './navbar';

const tsumo = RoundOutcome.ROUND_OUTCOME_TSUMO;
const ron = RoundOutcome.ROUND_OUTCOME_RON;
function fixture(outcome: RoundOutcome = tsumo, aggregated = false, withKuitan = true): IAppState {
  const base = initBlankOutcome(1, outcome);
  const win = {
    winner: 1,
    winnerIsDealer: true,
    han: 0,
    fu: 30,
    possibleFu: [30],
    yaku: pack([]),
    dora: 0,
    openHand: false,
  };
  return {
    ...initialState,
    players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id })),
    gameConfig: GameConfig.initialize({
      rulesetConfig: RulesetConfig.initialize({
        allowedYaku: yakuList.map((yaku) => yaku.id),
        useAggregatedYakuhai: aggregated,
        withKuitan,
      }),
    }),
    yakuList: makeYakuGraph(),
    currentOutcome:
      outcome === ron
        ? {
            ...base,
            selectedOutcome: ron,
            wins: { 1: win },
            riichiBets: [],
            multiRon: 0,
            loserIsDealer: false,
          }
        : { ...base, ...win, selectedOutcome: tsumo, riichiBets: [] },
  };
}
function select(state: IAppState, ...ids: Y[]) {
  return ids.reduce(
    (next, id) => outcomeReducer(next, { type: ADD_YAKU, payload: { id, winner: 1 } }),
    state
  );
}
function remove(state: IAppState, id: Y) {
  return outcomeReducer(state, { type: REMOVE_YAKU, payload: { id, winner: 1 } });
}
function selected(state: IAppState) {
  return getSelectedYaku(state)[1];
}

it('clears the han and prevents proceeding when tsumo becomes open without another yaku', () => {
  let state = select(fixture(), Y.MENZENTSUMO);
  expect(mayGoNextFromYakuSelect(state)).toBe(true);
  state = select(state, Y.__OPENHAND);
  expect(state.currentOutcome).toMatchObject({ han: 0 });
  expect(selected(state)).toEqual([Y.__OPENHAND]);
  expect(mayGoNextFromYakuSelect(state)).toBe(false);
  expect(getDisabledYaku(state)[1]).toContain(Y.MENZENTSUMO);
});

it.each([false, true])(
  'respects kuitan when opening a hand and selecting tanyao (kuitan=%s)',
  (kuitan: boolean) => {
    let state = select(fixture(tsumo, false, kuitan), Y.TANYAO, Y.__OPENHAND);
    expect(selected(state).includes(Y.TANYAO)).toBe(kuitan);
    expect(getDisabledYaku(state)[1].includes(Y.TANYAO)).toBe(!kuitan);
    state = select(state, Y.TANYAO);
    expect(selected(state).includes(Y.TANYAO)).toBe(kuitan);
  }
);

it('allows closed tsumo with toitoi and honroutou and advises suuankou', () => {
  const state = select(fixture(), Y.MENZENTSUMO, Y.HONROTO, Y.TOITOI);
  expect(selected(state)).toEqual(expect.arrayContaining([Y.MENZENTSUMO, Y.HONROTO, Y.TOITOI]));
  expect(getYakuAdvice(selected(state), tsumo)).toBe('suuankou');
  expect(getYakuAdvice([Y.TOITOI], ron)).toBe('sanankou');
  expect(getYakuAdvice([Y.TOITOI, Y.SANANKOU], ron)).toBeUndefined();
});

it.each([Y.YAKUHAI4, Y.SANKANTSU, Y.SANSHOKUDOUKOU])(
  'advises sanankou for closed tsumo with %s',
  (id: Y) => {
    const state = select(fixture(tsumo, true), Y.MENZENTSUMO, id);
    expect(getYakuAdvice(selected(state), tsumo)).toBe('sanankou');
    expect(getYakuAdvice([...selected(state), Y.__OPENHAND], tsumo)).toBeUndefined();
  }
);

it.each([false, true])(
  'requires two dragons or enough aggregate yakuhai for shosangen (aggregate=%s)',
  (aggregate: boolean) => {
    let state = fixture(ron, aggregate);
    expect(getDisabledYaku(state)[1]).toContain(Y.SHOSANGEN);
    expect(select(state, Y.SHOSANGEN)).toBe(state);
    state = select(state, ...(aggregate ? [Y.YAKUHAI1] : [Y.EAST_SEAT_WIND]));
    expect(getDisabledYaku(state)[1]).toContain(Y.SHOSANGEN);
    state = select(state, ...(aggregate ? [Y.YAKUHAI2] : [Y.RED_DRAGON, Y.GREEN_DRAGON]));
    expect(getDisabledYaku(state)[1]).not.toContain(Y.SHOSANGEN);
    state = select(state, Y.SHOSANGEN);
    expect(selected(state)).toContain(Y.SHOSANGEN);
    state = remove(state, aggregate ? Y.YAKUHAI2 : Y.RED_DRAGON);
    expect(selected(state)).not.toContain(Y.SHOSANGEN);
  }
);

it.each([false, true])(
  'forces honitsu with shosangen and four yakuhai (aggregate=%s)',
  (aggregate: boolean) => {
    let state = select(
      fixture(ron, aggregate),
      ...(aggregate ? [Y.YAKUHAI4] : [Y.EAST_SEAT_WIND, Y.RED_DRAGON, Y.GREEN_DRAGON]),
      Y.SHOSANGEN
    );
    expect(selected(state)).toContain(Y.HONITSU);
    state = remove(state, Y.HONITSU);
    expect(selected(state)).toContain(Y.HONITSU);
  }
);

it.each([false, true])(
  'allows iipeikou, three yakuhai and shosangen in either order (aggregate=%s)',
  (aggregate: boolean) => {
    for (const iipeikouFirst of [false, true]) {
      let state = fixture(ron, aggregate);
      // Non-double seat and round winds plus two dragons fit the two remaining pons.
      if (!aggregate) state.currentOutcome!.roundIndex = 5;
      const yakus = aggregate ? [Y.YAKUHAI3] : [Y.EAST_SEAT_WIND, Y.RED_DRAGON, Y.GREEN_DRAGON];
      state = select(
        state,
        ...(iipeikouFirst
          ? [Y.IIPEIKOU, ...yakus, Y.SHOSANGEN]
          : [...yakus, Y.SHOSANGEN, Y.IIPEIKOU])
      );
      expect(selected(state)).toEqual(
        expect.arrayContaining([Y.IIPEIKOU, Y.SHOSANGEN, Y.HONITSU, ...yakus])
      );
    }
  }
);

it.each([Y.SUUANKOU, Y.SUUANKOUTANKI])(
  'keeps the hand closed when selecting %s after riichi',
  (id: Y) => {
    const state = fixture();
    if (state.currentOutcome?.selectedOutcome !== tsumo) throw new Error('Expected tsumo');
    state.currentOutcome.riichiBets = [1];
    const updated = select(state, Y.RIICHI, Y.MENZENTSUMO, id);
    expect(selected(updated)).toEqual([id]);
    expect(updated.currentOutcome).toMatchObject({ han: -1 });
  }
);

it.each([
  [[Y.__OPENHAND, Y.SHOSANGEN], tsumo, 40],
  [[Y.__OPENHAND, Y.SHOSANGEN], ron, 30],
  [[Y.SANANKOU], tsumo, 40],
  [[Y.__OPENHAND, Y.SANANKOU], ron, 40],
  [[Y.__OPENHAND, Y.TOITOI], tsumo, 40],
  [[Y.__OPENHAND, Y.TOITOI, Y.YAKUHAI2], ron, 30],
  [[Y.__OPENHAND, Y.TOITOI, Y.EAST_SEAT_WIND, Y.EAST_ROUND_WIND], ron, 30],
  [[Y.PINFU, Y.MENZENTSUMO], tsumo, 20],
  [[Y.CHIITOITSU, Y.MENZENTSUMO], tsumo, 25],
] as const)(
  'sets minimum fu for %s, outcome %s to %s',
  (ids: readonly Y[], outcome: RoundOutcome, minimum: number) => {
    expect(getFixedFu([...ids], outcome)[0]).toBe(minimum);
  }
);
