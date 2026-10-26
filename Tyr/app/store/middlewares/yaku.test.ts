import { yaku } from './yaku';
import { commonReducer } from '../reducers/commonReducer';
import { outcomeReducer } from '../reducers/outcomeReducer';
import { initialState, initBlankOutcome } from '../state';
import { IAppState } from '../interfaces';
import {
  ADD_YAKU,
  REMOVE_YAKU,
  AppActionTypes,
  RESOLVE_YAKU_ADVICE,
  SET_DORA_COUNT,
  GOTO_PREV_SCREEN,
} from '../actions/interfaces';
import { YakuId as Y, yakuList } from '../../helpers/yaku';
import { makeYakuGraph, pack } from '../../helpers/yakuCompatibility';
import { getSelectedYaku } from '../selectors/yaku';
import { GameConfig, PlayerInSession, RoundOutcome, RulesetConfig } from 'tsclients/proto/atoms.pb';

const tsumo = RoundOutcome.ROUND_OUTCOME_TSUMO;
const ron = RoundOutcome.ROUND_OUTCOME_RON;
function setup(outcome: RoundOutcome = tsumo, aggregated = true, roundIndex = 1, tsumoWinner = 1) {
  const win = {
    winner: tsumoWinner,
    winnerIsDealer: true,
    han: 0,
    fu: 30,
    possibleFu: [30],
    yaku: pack([]),
    dora: 0,
    openHand: false,
  };
  let state: IAppState = {
    ...initialState,
    currentScreen: 'handSelect',
    players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id })),
    gameConfig: GameConfig.initialize({
      rulesetConfig: RulesetConfig.initialize({
        allowedYaku: yakuList.map((y) => y.id),
        useAggregatedYakuhai: aggregated,
        withKuitan: true,
      }),
    }),
    yakuList: makeYakuGraph(),
    currentOutcome:
      outcome === tsumo
        ? { ...initBlankOutcome(roundIndex, tsumo), ...win, selectedOutcome: tsumo, riichiBets: [] }
        : {
            ...initBlankOutcome(roundIndex, ron),
            selectedOutcome: ron,
            wins: { 1: win, 2: { ...win, winner: 2 } },
            riichiBets: [],
            multiRon: 0,
            loserIsDealer: false,
          },
  };
  let handler = (action: AppActionTypes): void => {
    void action;
  };
  const dispatch = <T extends AppActionTypes>(action: T): T => {
    handler(action);
    return action;
  };
  handler = yaku({ getState: () => state, dispatch })(<T extends AppActionTypes>(action: T): T => {
    state = outcomeReducer(commonReducer(state, action), action);
    // Mimic navigation without involving unrelated screen lifecycle middleware.
    if (action.type === GOTO_PREV_SCREEN)
      state = { ...state, currentScreen: initialState.currentScreen };
    return action;
  });
  return {
    dispatch,
    state: () => state,
    selected: (winner = 1) => getSelectedYaku(state)[winner],
    add: (id: Y, winner = 1) => dispatch({ type: ADD_YAKU, payload: { id, winner } }),
    remove: (id: Y, winner = 1) => dispatch({ type: REMOVE_YAKU, payload: { id, winner } }),
    resolve: (approve: boolean) => {
      const advice = state.yakuAdvice;
      if (!advice) throw new Error('Expected dialog');
      dispatch({ type: RESOLVE_YAKU_ADVICE, payload: { approve, advice } });
    },
  };
}

it.each([false, true])(
  'confirms suuankou in either tsumo/toitoi selection order (tsumoFirst=%s)',
  (tsumoFirst: boolean) => {
    const store = setup();
    if (tsumoFirst) store.add(Y.MENZENTSUMO);
    store.add(Y.TOITOI);
    if (!tsumoFirst) {
      store.resolve(false);
      // Select Toitoi in an open hand, then close it by selecting menzentsumo.
      store.add(Y.__OPENHAND);
      store.add(Y.TOITOI);
      store.add(Y.MENZENTSUMO);
    }
    expect(store.state().yakuAdvice).toMatchObject({
      lastYaku: tsumoFirst ? Y.TOITOI : Y.MENZENTSUMO,
      expectedYaku: Y.SUUANKOU,
      winner: 1,
    });
    store.resolve(true);
    expect(store.selected()).toEqual([Y.SUUANKOU]);
    expect(store.state().yakuAdvice).toBeUndefined();
  }
);

it.each([Y.YAKUHAI4, Y.SANKANTSU, Y.SANSHOKUDOUKOU])(
  'confirms sanankou for tsumo and %s',
  (id: Y) => {
    const store = setup(tsumo, true, 5);
    store.add(Y.MENZENTSUMO);
    store.add(id);
    store.resolve(true);
    expect(store.selected()).toEqual(expect.arrayContaining([Y.MENZENTSUMO, id, Y.SANANKOU]));
    expect(store.state().yakuAdvice).toBeUndefined();
  }
);

it('recognizes four named yakuhai and cancels only the final dragon selection', () => {
  const store = setup(tsumo, false, 5);
  for (const id of [
    Y.MENZENTSUMO,
    Y.EAST_SEAT_WIND,
    Y.SOUTH_ROUND_WIND,
    Y.RED_DRAGON,
    Y.GREEN_DRAGON,
  ])
    store.add(id);
  expect(store.state().yakuAdvice?.lastYaku).toBe(Y.GREEN_DRAGON);
  store.resolve(false);
  expect(store.selected()).toEqual(
    expect.arrayContaining([Y.MENZENTSUMO, Y.EAST_SEAT_WIND, Y.SOUTH_ROUND_WIND, Y.RED_DRAGON])
  );
  expect(store.selected()).not.toContain(Y.GREEN_DRAGON);
  expect(store.state().yakuAdvice).toBeUndefined();
});

it.each([false, true])(
  'resolves ron advice for the triggering winner only (approve=%s)',
  (approve: boolean) => {
    const store = setup(ron);
    store.add(Y.__OPENHAND, 1);
    store.add(Y.TOITOI, 1);
    store.add(Y.TOITOI, 2);
    expect(store.state().yakuAdvice?.winner).toBe(2);
    store.resolve(approve);
    expect(store.selected(1)).toEqual(expect.arrayContaining([Y.__OPENHAND, Y.TOITOI]));
    expect(store.selected(2)).toEqual(
      approve ? expect.arrayContaining([Y.TOITOI, Y.SANANKOU]) : []
    );
    expect(store.state().yakuAdvice).toBeUndefined();
  }
);

it('does not prompt for an open hand or when the expected yaku is already selected', () => {
  const store = setup(ron);
  store.add(Y.__OPENHAND);
  store.add(Y.TOITOI);
  expect(store.state().yakuAdvice).toBeUndefined();
  store.remove(Y.TOITOI);
  store.remove(Y.__OPENHAND);
  store.add(Y.SANANKOU);
  store.add(Y.TOITOI);
  expect(store.state().yakuAdvice).toBeUndefined();
});

it('clears pending advice after hand changes and ignores stale resolutions and duplicate selections', () => {
  const store = setup();
  store.add(Y.TOITOI);
  const advice = store.state().yakuAdvice!;
  store.resolve(true);
  store.dispatch({ type: RESOLVE_YAKU_ADVICE, payload: { approve: false, advice } });
  expect(store.selected()).toEqual([Y.SUUANKOU]);
  store.remove(Y.SUUANKOU);
  store.add(Y.TOITOI);
  store.add(Y.__OPENHAND);
  expect(store.state().yakuAdvice).toBeUndefined();
  store.dispatch({ type: RESOLVE_YAKU_ADVICE, payload: { approve: true, advice } });
  expect(store.selected()).toEqual(expect.arrayContaining([Y.__OPENHAND, Y.TOITOI]));
  store.dispatch({ type: SET_DORA_COUNT, payload: { count: 2, winner: 1 } });
  expect(store.state().yakuAdvice).toBeUndefined();
});

it('cancels the closing tsumo selection, preserving the previously selected open toitoi', () => {
  const store = setup();
  store.add(Y.__OPENHAND);
  store.add(Y.TOITOI);
  store.add(Y.MENZENTSUMO);
  store.resolve(false);
  expect(store.selected()).toEqual(expect.arrayContaining([Y.__OPENHAND, Y.TOITOI]));
  expect(store.selected()).not.toContain(Y.MENZENTSUMO);
  expect(store.state().yakuAdvice).toBeUndefined();
});

it('does not repeat the dialog on duplicate additions and clears it on navigation', () => {
  const store = setup();
  store.add(Y.TOITOI);
  const advice = store.state().yakuAdvice;
  store.add(Y.TOITOI);
  expect(store.state().yakuAdvice).toBe(advice);
  store.dispatch({ type: GOTO_PREV_SCREEN });
  expect(store.state().yakuAdvice).toBeUndefined();
});

it.each([false, true])(
  'checks the winner’s actual winds for four yakuhai (aggregate=%s)',
  (aggregate: boolean) => {
    for (const [round, winner, distinct, winds] of [
      [1, 1, false, [Y.EAST_SEAT_WIND]],
      [1, 2, true, [Y.SOUTH_SEAT_WIND, Y.EAST_ROUND_WIND]],
      [2, 2, false, [Y.EAST_SEAT_WIND]],
      [5, 2, false, [Y.SOUTH_SEAT_WIND]],
      [5, 1, true, [Y.EAST_SEAT_WIND, Y.SOUTH_ROUND_WIND]],
      [6, 3, false, [Y.SOUTH_SEAT_WIND]],
    ] as const) {
      const store = setup(tsumo, aggregate, round, winner);
      const ids = aggregate ? [Y.YAKUHAI4] : [...winds, Y.RED_DRAGON, Y.GREEN_DRAGON];
      store.add(Y.MENZENTSUMO, winner);
      for (const id of ids) store.add(id, winner);
      if (distinct) {
        expect(store.state().yakuAdvice).toMatchObject({ winner, expectedYaku: Y.SANANKOU });
        store.resolve(true);
        expect(store.selected(winner)).toContain(Y.SANANKOU);
      } else {
        expect(store.state().yakuAdvice).toBeUndefined();
        expect(store.selected(winner)).not.toContain(Y.SANANKOU);
      }
    }
  }
);

it.each([Y.SANKANTSU, Y.SANSHOKUDOUKOU])(
  'keeps the independent %s prompt with double-wind yakuhai',
  (id: Y) => {
    const store = setup();
    store.add(Y.MENZENTSUMO);
    store.add(Y.YAKUHAI2);
    expect(store.state().yakuAdvice).toBeUndefined();
    store.add(id);
    expect(store.state().yakuAdvice).toMatchObject({
      winner: 1,
      lastYaku: id,
      expectedYaku: Y.SANANKOU,
    });
  }
);
