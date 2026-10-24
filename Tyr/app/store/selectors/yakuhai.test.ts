import { GameConfig, PlayerInSession, RoundOutcome, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { IAppState } from '../interfaces';
import { initialState, initBlankOutcome } from '../state';
import { outcomeReducer } from '../reducers/outcomeReducer';
import { ADD_YAKU, REMOVE_YAKU, TOGGLE_WINNER } from '../actions/interfaces';
import { YakuId as Y } from '../../helpers/yaku';
import { yakuhai } from '../../helpers/yakuhai';
import { makeYakuGraph, pack } from '../../helpers/yakuCompatibility';
import { getDisabledYaku, getSelectedYaku, getYakuList } from './yaku';

function fixture(roundIndex: number, winner: number, ron = false): IAppState {
  const outcome = initBlankOutcome(
    roundIndex,
    ron ? RoundOutcome.ROUND_OUTCOME_RON : RoundOutcome.ROUND_OUTCOME_TSUMO
  );
  const win = {
    winner,
    winnerIsDealer: winner === 1,
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
        allowedYaku: [...yakuhai, Y.YAKUHAI1, Y.YAKUHAI2, Y.YAKUHAI3, Y.YAKUHAI4],
      }),
    }),
    yakuList: makeYakuGraph(),
    currentOutcome:
      outcome.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON
        ? { ...outcome, wins: { [winner]: win } }
        : {
            ...initBlankOutcome(roundIndex, RoundOutcome.ROUND_OUTCOME_TSUMO),
            ...win,
            selectedOutcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
            riichiBets: [],
          },
  };
}

it.each([false, true])('selects and removes double winds together (ron=%s)', (ron: boolean) => {
  let state = fixture(1, 1, ron);
  state = outcomeReducer(state, { type: ADD_YAKU, payload: { id: Y.EAST_SEAT_WIND, winner: 1 } });
  expect(getSelectedYaku(state)[1]).toEqual([Y.EAST_SEAT_WIND, Y.EAST_ROUND_WIND]);
  state = outcomeReducer(state, {
    type: REMOVE_YAKU,
    payload: { id: Y.EAST_SEAT_WIND, winner: 1 },
  });
  expect(getSelectedYaku(state)[1]).toEqual([]);
});

it('shows four wind buttons and three dragons, hides legacy yaku, and disables nonvalue winds', () => {
  const state = fixture(5, 1);
  const ids = getYakuList(state)[1].map((y) => y.id);
  expect(ids).toEqual([
    Y.__OPENHAND,
    Y.EAST_SEAT_WIND,
    Y.SOUTH_ROUND_WIND,
    Y.WEST_SEAT_WIND,
    Y.NORTH_SEAT_WIND,
    Y.RED_DRAGON,
    Y.GREEN_DRAGON,
    Y.WHITE_DRAGON,
  ]);
  expect(getDisabledYaku(state)[1]).toEqual([Y.WEST_SEAT_WIND, Y.NORTH_SEAT_WIND]);
});

it('uses each winner’s own seat on multiron', () => {
  const state = fixture(1, 2, true);
  const updated = outcomeReducer(state, {
    type: ADD_YAKU,
    payload: { id: Y.SOUTH_SEAT_WIND, winner: 2 },
  });
  expect(getSelectedYaku(updated)[2]).toEqual([Y.SOUTH_SEAT_WIND]);
});

it('clears wind yaku when changing the tsumo winner and preserves dragons', () => {
  let state = fixture(1, 1);
  state = outcomeReducer(state, { type: ADD_YAKU, payload: { id: Y.EAST_SEAT_WIND, winner: 1 } });
  state = outcomeReducer(state, { type: ADD_YAKU, payload: { id: Y.RED_DRAGON, winner: 1 } });
  state = outcomeReducer(state, { type: TOGGLE_WINNER, payload: 2 });
  expect(getSelectedYaku(state)[2]).toEqual([Y.RED_DRAGON]);
});
