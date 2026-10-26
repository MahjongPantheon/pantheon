import { GameConfig, PlayerInSession, RoundOutcome, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { IAppState } from '../interfaces';
import { initialState, initBlankOutcome } from '../state';
import { outcomeReducer } from '../reducers/outcomeReducer';
import { TOGGLE_RIICHI } from '../actions/interfaces';
import { PlayerButtonMode, PlayerPointsMode } from '../../helpers/enums';
import { getOtherTablePlayerData, getPlayerButtons, getPlayerData } from './table';

function riichiBets(state: IAppState) {
  return state.currentOutcome && 'riichiBets' in state.currentOutcome
    ? state.currentOutcome.riichiBets
    : [];
}

const outcomes = [
  RoundOutcome.ROUND_OUTCOME_RON,
  RoundOutcome.ROUND_OUTCOME_TSUMO,
  RoundOutcome.ROUND_OUTCOME_DRAW,
  RoundOutcome.ROUND_OUTCOME_ABORT,
  RoundOutcome.ROUND_OUTCOME_NAGASHI,
];

function fixture(score: number, withTobi: boolean, outcome: RoundOutcome): IAppState {
  return {
    ...initialState,
    currentPlayerId: 1,
    players: [1, 2, 3, 4].map((id) => PlayerInSession.initialize({ id, score })),
    gameConfig: GameConfig.initialize({ rulesetConfig: RulesetConfig.initialize({ withTobi }) }),
    currentOutcome: initBlankOutcome(1, outcome),
  };
}

it.each(outcomes)(
  'prevents selecting riichi below 1000 for outcome %s',
  (outcome: RoundOutcome) => {
    for (const score of [-100, 0, 900, 999]) {
      const state = fixture(score, true, outcome);
      const dispatch = vi.fn();
      const buttons = getPlayerButtons('self', state, dispatch);
      expect(buttons?.riichiButton).toBe(PlayerButtonMode.DISABLE);
      expect(buttons?.onRiichiButtonClick).toBeUndefined();
      expect(outcomeReducer(state, { type: TOGGLE_RIICHI, payload: 1 })).toBe(state);
      expect(getPlayerData('self', state)?.pointsMode).toBe(PlayerPointsMode.NEGATIVE);
    }
  }
);

it.each(outcomes)(
  'allows exactly 1000 and permits removing riichi for outcome %s',
  (outcome: RoundOutcome) => {
    const state = fixture(1000, true, outcome);
    expect(getPlayerButtons('self', state, vi.fn())?.riichiButton).toBe(PlayerButtonMode.IDLE);
    expect(getPlayerData('self', state)?.pointsMode).toBe(PlayerPointsMode.IDLE);
    const selected = outcomeReducer(state, { type: TOGGLE_RIICHI, payload: 1 });
    expect(riichiBets(selected)).toEqual([1]);
    expect(riichiBets(outcomeReducer(selected, { type: TOGGLE_RIICHI, payload: 1 }))).toEqual([]);
  }
);

it.each(outcomes)(
  'permits riichi below 1000 when tobi is disabled for outcome %s',
  (outcome: RoundOutcome) => {
    const state = fixture(0, false, outcome);
    expect(getPlayerButtons('self', state, vi.fn())?.riichiButton).toBe(PlayerButtonMode.IDLE);
    expect(getPlayerData('self', state)?.pointsMode).toBe(PlayerPointsMode.IDLE);
    expect(riichiBets(outcomeReducer(state, { type: TOGGLE_RIICHI, payload: 1 }))).toEqual([1]);
  }
);

it('allows correcting an already selected invalid riichi', () => {
  const state = fixture(900, true, RoundOutcome.ROUND_OUTCOME_DRAW);
  if (state.currentOutcome && 'riichiBets' in state.currentOutcome)
    state.currentOutcome.riichiBets = [1];
  expect(getPlayerButtons('self', state, vi.fn())?.riichiButton).toBe(PlayerButtonMode.PRESSED);
  expect(riichiBets(outcomeReducer(state, { type: TOGGLE_RIICHI, payload: 1 }))).toEqual([]);
});

it('marks players below 1000 on other table overviews', () => {
  const state = fixture(900, true, RoundOutcome.ROUND_OUTCOME_DRAW);
  state.currentOtherTablePlayers = state.players ?? [];
  expect(getOtherTablePlayerData('self', state)?.pointsMode).toBe(PlayerPointsMode.NEGATIVE);
});
