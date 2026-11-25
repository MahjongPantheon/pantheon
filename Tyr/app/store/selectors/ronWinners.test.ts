import { GameConfig, PlayerInSession, RoundOutcome, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { GHOST_PLAYER_ID } from '../../../../Common/constants';
import { IAppState } from '../interfaces';
import { initialState, initBlankOutcome } from '../state';
import { outcomeReducer } from '../reducers/outcomeReducer';
import { TOGGLE_LOSER, TOGGLE_WINNER } from '../actions/interfaces';
import { winDisabled } from './userItem';

function fixture(
  withAbortives: boolean,
  allowTripleRonWithAbortives: boolean,
  withAtamahane = false
): IAppState {
  return {
    ...initialState,
    players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id, score: 30000 })),
    gameConfig: GameConfig.initialize({
      rulesetConfig: RulesetConfig.initialize({
        withAbortives,
        allowTripleRonWithAbortives,
        withAtamahane,
      }),
    }),
    currentOutcome: initBlankOutcome(1, RoundOutcome.ROUND_OUTCOME_RON),
  };
}

it.each([
  [false, false, false],
  [false, true, false],
  [true, false, true],
  [true, true, false],
])(
  'limits ron winners with abortives=%s and triple ron=%s',
  (abortives: boolean, tripleRon: boolean, disabled: boolean) => {
    let state = fixture(abortives, tripleRon);
    for (const id of [1, 2]) state = outcomeReducer(state, { type: TOGGLE_WINNER, payload: id });
    expect(winDisabled(state, state.players![2])).toBe(disabled);
    expect(winDisabled(state, state.players![0])).toBe(false);
    state = outcomeReducer(state, { type: TOGGLE_WINNER, payload: 1 });
    expect(winDisabled(state, state.players![2])).toBe(false);
  }
);

it.each([false, true])(
  'preserves atamahane precedence with triple ron=%s',
  (tripleRon: boolean) => {
    let state = fixture(true, tripleRon, true);
    state = outcomeReducer(state, { type: TOGGLE_WINNER, payload: 1 });
    expect(winDisabled(state, state.players![0])).toBe(false);
    expect(winDisabled(state, state.players![1])).toBe(true);
  }
);

it('excludes the loser and allows removing any of three selected winners', () => {
  let state = fixture(true, true);
  state = outcomeReducer(state, { type: TOGGLE_LOSER, payload: 4 });
  for (const id of [1, 2, 3]) state = outcomeReducer(state, { type: TOGGLE_WINNER, payload: id });
  expect(winDisabled(state, state.players![3])).toBe(true);
  for (const player of state.players!.slice(0, 3)) expect(winDisabled(state, player)).toBe(false);
});

it('limits sanma to two real winners even with a ghost seat', () => {
  let state = fixture(true, true);
  state.players = [1, 2, 3, GHOST_PLAYER_ID].map((id) => PlayerInSession.initialize({ id }));
  for (const id of [1, 2]) state = outcomeReducer(state, { type: TOGGLE_WINNER, payload: id });
  expect(winDisabled(state, state.players![2])).toBe(true);
  expect(winDisabled(state, state.players![0])).toBe(false);
});
