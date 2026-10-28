import { GameConfig, RoundOutcome } from 'tsclients/proto/atoms.pb';
import * as actions from '../actions/interfaces';
import type { AppActionTypes } from '../actions/interfaces';
import type { AppScreen, IAppState } from '../interfaces';
import { initialState, initBlankOutcome } from '../state';
import { screenManageReducer } from './screenManageReducer';

const config = GameConfig.initialize({});
function navigate(
  screen: AppScreen,
  type: string,
  outcome?: RoundOutcome,
  extra: Partial<IAppState> = {}
) {
  const state: IAppState = {
    ...initialState,
    currentScreen: screen,
    currentEventId: 7,
    gameConfig: config,
    showAdditionalTableInfo: true,
    currentOutcome: outcome ? initBlankOutcome(1, outcome) : undefined,
    ...extra,
  };
  return { state, result: screenManageReducer(state, { type } as AppActionTypes) };
}

it.each([
  [actions.GOTO_EVENT_SELECT, 'eventSelector'],
  [actions.GO_TO_CURRENT_GAME, 'currentGame'],
  [actions.GO_TO_DONATE, 'donate'],
  [actions.GO_TO_PENALTIES, 'penalties'],
  [actions.SHOW_LAST_RESULTS, 'lastResults'],
  [actions.SHOW_GAME_LOG, 'gameLog'],
  [actions.OPEN_SETTINGS, 'settings'],
] as const)('opens %s', (type: string, screen: AppScreen) => {
  expect(screenManageReducer(initialState, { type } as AppActionTypes).currentScreen).toBe(screen);
});

it('retains requested player IDs and selected seat during new-game navigation', () => {
  const started = screenManageReducer(initialState, {
    type: actions.START_NEW_GAME,
    payload: [1, 2, 3, 4],
  });
  expect(started).toMatchObject({ currentScreen: 'newGame', newGameIdsToSet: [1, 2, 3, 4] });
  expect(
    screenManageReducer(started, { type: actions.SEARCH_PLAYER, payload: '西' })
  ).toMatchObject({
    currentScreen: 'searchPlayer',
    newGameSelectedPlayerSide: '西',
  });
});

it.each(['otherTable', 'otherTablesList', 'currentGame'] as const)(
  'resets session data from %s',
  (screen: AppScreen) => {
    const { result } = navigate(screen, actions.RESET_STATE);
    expect(result.currentScreen).toBe(screen === 'currentGame' ? 'overview' : screen);
    expect(result).toMatchObject({
      currentSessionHash: '',
      nextRoundToken: undefined,
      players: undefined,
      currentOutcome: undefined,
      mapIdToPlayer: {},
      gameOverviewReady: true,
      sessionState: { roundIndex: 1, finished: false, scores: [], riichiCount: 0, honbaCount: 0 },
    });
  }
);

const outcomes = [
  RoundOutcome.ROUND_OUTCOME_RON,
  RoundOutcome.ROUND_OUTCOME_TSUMO,
  RoundOutcome.ROUND_OUTCOME_DRAW,
  RoundOutcome.ROUND_OUTCOME_ABORT,
  RoundOutcome.ROUND_OUTCOME_CHOMBO,
  RoundOutcome.ROUND_OUTCOME_NAGASHI,
];

it.each(outcomes)('walks forward and back through outcome %s', (outcome: RoundOutcome) => {
  const win =
    outcome === RoundOutcome.ROUND_OUTCOME_RON || outcome === RoundOutcome.ROUND_OUTCOME_TSUMO;
  expect(navigate('currentGame', actions.GOTO_NEXT_SCREEN, outcome).result.currentScreen).toBe(
    outcome === RoundOutcome.ROUND_OUTCOME_NAGASHI ? 'nagashiSelect' : 'playersSelect'
  );
  expect(
    navigate('overview', actions.GOTO_NEXT_SCREEN, outcome).result.showAdditionalTableInfo
  ).toBe(false);
  expect(navigate('playersSelect', actions.GOTO_NEXT_SCREEN, outcome).result.currentScreen).toBe(
    win ? 'handSelect' : 'confirmation'
  );
  expect(navigate('handSelect', actions.GOTO_NEXT_SCREEN, outcome).result.currentScreen).toBe(
    'confirmation'
  );
  expect(navigate('confirmation', actions.GOTO_PREV_SCREEN, outcome).result.currentScreen).toBe(
    win ? 'handSelect' : 'playersSelect'
  );
  expect(navigate('playersSelect', actions.GOTO_PREV_SCREEN, outcome).result.currentScreen).toBe(
    outcome === RoundOutcome.ROUND_OUTCOME_NAGASHI ? 'nagashiSelect' : 'currentGame'
  );
  expect(
    navigate('playersSelect', actions.GOTO_PREV_SCREEN, outcome).result.currentOutcome
  ).toEqual(
    outcome === RoundOutcome.ROUND_OUTCOME_NAGASHI ? initBlankOutcome(1, outcome) : undefined
  );
});

it.each(['lastResults', 'gameLog', 'otherTable', 'confirmation'] as const)(
  'returns forward from %s to overview',
  (screen: AppScreen) => {
    expect(navigate(screen, actions.GOTO_NEXT_SCREEN).result.currentScreen).toBe('overview');
  }
);

it.each([
  'otherTablesList',
  'newGame',
  'currentGame',
  'eventSelector',
  'settings',
  'donate',
  'penalties',
] as const)('returns from %s only when an event is selected', (screen: AppScreen) => {
  expect(navigate(screen, actions.GOTO_PREV_SCREEN).result.currentScreen).toBe('overview');
  const { state, result } = navigate(screen, actions.GOTO_PREV_SCREEN, undefined, {
    currentEventId: undefined,
  });
  expect(result).toBe(state);
});

it.each([
  ['searchPlayer', 'newGame'],
  ['handSelect', 'playersSelect'],
  ['nagashiSelect', 'currentGame'],
  ['otherTable', 'otherTablesList'],
] as const)('goes back from %s to %s', (from: AppScreen, to: AppScreen) => {
  expect(navigate(from, actions.GOTO_PREV_SCREEN).result.currentScreen).toBe(to);
});

it('returns game log navigation to its originating table', () => {
  expect(navigate('gameLog', actions.GOTO_PREV_SCREEN).result.currentScreen).toBe('currentGame');
  expect(
    navigate('gameLog', actions.GOTO_PREV_SCREEN, undefined, { currentOtherTableHash: 'other' })
      .result.currentScreen
  ).toBe('otherTable');
  expect(navigate('nagashiSelect', actions.GOTO_NEXT_SCREEN).result.currentScreen).toBe(
    'playersSelect'
  );
});

it('leaves unsupported navigation unchanged and handles settings before event configuration', () => {
  for (const type of [actions.GOTO_NEXT_SCREEN, actions.GOTO_PREV_SCREEN, 'unknown']) {
    const { state, result } = navigate('login', type);
    expect(result).toBe(state);
  }
  for (const screen of ['playersSelect', 'confirmation'] as const) {
    for (const type of [actions.GOTO_NEXT_SCREEN, actions.GOTO_PREV_SCREEN]) {
      const { state, result } = navigate(screen, type);
      if (screen === 'playersSelect' && type === actions.GOTO_PREV_SCREEN)
        expect(result.currentScreen).toBe('currentGame');
      else if (screen === 'confirmation' && type === actions.GOTO_NEXT_SCREEN)
        expect(result.currentScreen).toBe('overview');
      else expect(result).toBe(state);
    }
  }
  const { state, result } = navigate('currentGame', actions.GOTO_NEXT_SCREEN, undefined, {
    gameConfig: undefined,
  });
  expect(result).toBe(state);
  const back = navigate('login', actions.GOTO_PREV_SCREEN, undefined, { gameConfig: undefined });
  expect(back.result).toBe(back.state);
  expect(
    navigate('settings', actions.GOTO_PREV_SCREEN, undefined, { gameConfig: undefined }).result
      .currentScreen
  ).toBe('eventSelector');
});
