import type { Dispatch } from 'redux';
import { GameConfig, RoundOutcome } from 'tsclients/proto/atoms.pb';
import { Storage } from '../../../../Common/storage';
import { StorageStrategyServer } from '../../../../Common/storageStrategyServer';
import { persistentMw } from './persistent';
import { screenManageMw } from './screenManage';
import { timerMw } from './timer';
import { screenManageReducer } from '../reducers/screenManageReducer';
import { timerReducer } from '../reducers/timerReducer';
import { initialState, initBlankOutcome } from '../state';
import type { IAppState, TimerStorage } from '../interfaces';
import type { AppActionTypes } from '../actions/interfaces';
import * as a from '../actions/interfaces';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function persistence() {
  const storage = new Storage();
  storage.setStrategy(new StorageStrategyServer());
  const dispatch = vi.fn((action: AppActionTypes) => action);
  const next = vi.fn((action: AppActionTypes) => action);
  const send = persistentMw(storage)({
    getState: () => initialState,
    dispatch: dispatch as Dispatch<AppActionTypes>,
  })(next as Dispatch<AppActionTypes>);
  return {
    storage,
    dispatch,
    next,
    send: (type: string, payload?: unknown) => send({ type, payload } as AppActionTypes),
  };
}

it.each([undefined, 'existing-session'])(
  'persists login while reusing session ID %s',
  (sessionId: string | undefined) => {
    const f = persistence();
    if (sessionId) f.storage.setSessionId(sessionId);
    f.storage.setEventId(42);
    f.send(a.LOGIN_SUCCESS, { personId: 7, authToken: 'token' });
    expect(f.storage.getPersonId()).toBe(7);
    expect(f.storage.getAuthToken()).toBe('token');
    expect(f.storage.getEventId()).toBeNull();
    expect(f.dispatch).toHaveBeenCalledWith({
      type: a.SET_CREDENTIALS,
      payload: { personId: 7, authToken: 'token', sessionId: sessionId ?? expect.any(String) },
    });
  }
);

it('clears credentials for login and logout without discarding the analytics session', () => {
  const f = persistence();
  f.storage.setPersonId(7).setAuthToken('token').setSessionId('session');
  f.send(a.LOGIN_INIT);
  expect(f.storage.getPersonId()).toBeNull();
  expect(f.storage.getAuthToken()).toBeNull();
  f.send(a.FORCE_LOGOUT);
  expect(f.storage.getSessionId()).toBe('session');
  expect(f.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: a.LOGIN_FAIL }));
  const error = new Error('Expired');
  f.send(a.FORCE_LOGOUT, error);
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.LOGIN_FAIL, payload: error });
  const fresh = persistence();
  fresh.send(a.LOGIN_INIT);
  expect(fresh.storage.getSessionId()).toBeTruthy();
  const anonymous = persistence();
  anonymous.send(a.FORCE_LOGOUT);
  expect(anonymous.storage.getSessionId()).toBeTruthy();
});

it('saves display preferences, event selection, language, and device mode', () => {
  const f = persistence();
  f.send(a.SETTINGS_SAVE_THEME, 'dimmed');
  expect(f.storage.getThemeVariant()).toBe('dimmed');
  f.send(a.SETTINGS_SAVE_THEME, 'night');
  expect(f.storage.getTheme()).toBe('night');
  expect(f.storage.getThemeVariant()).toBeNull();
  f.send(a.SELECT_EVENT, 42);
  expect(f.storage.getEventId()).toBe(42);
  f.send(a.SETTINGS_SAVE_LANG, 'de');
  expect(f.storage.getLang()).toBe('de');
  f.send(a.SETTINGS_SAVE_SINGLE_DEVICE_MODE, true);
  expect(f.storage.getSingleDeviceMode()).toBe(true);
  f.send(a.UPDATE_STATE_SETTINGS);
  expect(f.dispatch).toHaveBeenCalledWith({
    type: a.SET_STATE_SETTINGS,
    payload: { currentTheme: 'night', currentLang: 'de', singleDeviceMode: true },
  });
  f.storage.setThemeVariant('dimmed');
  f.send(a.UPDATE_STATE_SETTINGS);
  expect(f.dispatch).toHaveBeenLastCalledWith({
    type: a.SET_STATE_SETTINGS,
    payload: { currentTheme: 'dimmed', currentLang: 'de', singleDeviceMode: true },
  });
});

function navigation(extra: Partial<IAppState> = {}) {
  let state: IAppState = { ...initialState, gameConfig: GameConfig.initialize({}), ...extra };
  const dispatch = vi.fn((action: AppActionTypes) => action);
  const next = vi.fn((action: AppActionTypes) => {
    state = screenManageReducer(state, action);
    return action;
  });
  const handle = screenManageMw()({
    getState: () => state,
    dispatch: dispatch as Dispatch<AppActionTypes>,
  })(next as Dispatch<AppActionTypes>);
  return {
    dispatch,
    next,
    getState: () => state,
    send: (type: string, payload?: unknown) => handle({ type, payload } as AppActionTypes),
  };
}

it.each([
  RoundOutcome.ROUND_OUTCOME_RON,
  RoundOutcome.ROUND_OUTCOME_TSUMO,
  RoundOutcome.ROUND_OUTCOME_DRAW,
])('initializes the next entry screen for %s', (outcome: RoundOutcome) => {
  const f = navigation({
    currentScreen: 'playersSelect',
    currentOutcome: initBlankOutcome(1, outcome),
  });
  f.send(a.GOTO_NEXT_SCREEN);
  expect(f.dispatch).toHaveBeenCalledWith(
    expect.objectContaining({
      type:
        outcome === RoundOutcome.ROUND_OUTCOME_DRAW
          ? a.GET_CHANGES_OVERVIEW_INIT
          : a.INIT_REQUIRED_YAKU,
    })
  );
  if (outcome === RoundOutcome.ROUND_OUTCOME_TSUMO)
    expect(f.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: a.ADD_YAKU }));
});

it.each([undefined, 'session-hash'])(
  'refreshes current-game data before entry with hash=%s',
  (currentSessionHash: string | undefined) => {
    const f = navigation({ currentScreen: 'currentGame', currentSessionHash });
    f.send(a.GOTO_NEXT_SCREEN);
    expect(f.dispatch.mock.calls.length).toBe(currentSessionHash ? 1 : 0);
    if (currentSessionHash)
      expect(f.dispatch).toHaveBeenCalledWith({
        type: a.GET_GAME_OVERVIEW_INIT,
        payload: currentSessionHash,
      });
  }
);

it.each([
  [a.START_NEW_GAME, a.GET_ALL_PLAYERS_INIT],
  [a.INIT_STATE, a.UPDATE_STATE_SETTINGS],
  [a.SHOW_LAST_RESULTS, a.GET_LAST_RESULTS_INIT],
  [a.GET_ALL_PLAYERS_SUCCESS, a.SET_NEWGAME_PLAYERS],
] as const)('loads required state after %s', (type: string, expected: string) => {
  const f = navigation();
  f.send(type, []);
  expect(f.dispatch).toHaveBeenCalledWith({ type: expected });
});

it.each(['otherTable', 'currentGame'] as const)(
  'loads the game log from %s',
  (currentScreen: 'otherTable' | 'currentGame') => {
    const f = navigation({
      currentScreen,
      currentSessionHash: 'own',
      currentOtherTableHash: 'other',
    });
    f.send(a.SHOW_GAME_LOG);
    expect(f.dispatch).toHaveBeenCalledWith({
      type: a.GET_ALL_ROUNDS_INIT,
      payload: currentScreen === 'otherTable' ? 'other' : 'own',
    });
    const missing = navigation();
    missing.send(a.SHOW_GAME_LOG);
    expect(missing.dispatch).not.toHaveBeenCalled();
  }
);

it('loads final results only after a finished session and passes other navigation through', () => {
  const f = navigation({ currentScreen: 'lastResults' });
  f.send(a.ADD_ROUND_SUCCESS, { isFinished: true });
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.GET_LAST_RESULTS_INIT });
  const active = navigation();
  active.send(a.ADD_ROUND_SUCCESS, { isFinished: false });
  expect(active.dispatch).not.toHaveBeenCalled();
  active.send(a.GOTO_PREV_SCREEN);
  active.send('unknown');
  expect(active.next).toHaveBeenCalledWith({ type: 'unknown', payload: undefined });
});

function clock(extra: Partial<IAppState> = {}) {
  let tick: () => void = () => {};
  let state: IAppState = {
    ...initialState,
    currentSessionHash: 'game',
    gameConfig: GameConfig.initialize({ useTimer: true }),
    ...extra,
  };
  const timers = {
    timer: undefined,
    setInterval: vi.fn((callback: () => void) => {
      tick = callback;
      return 1;
    }),
    clearInterval: vi.fn(),
  } as unknown as TimerStorage;
  const dispatch = vi.fn((action: AppActionTypes) => action);
  const next = vi.fn((action: AppActionTypes) => {
    state = timerReducer(state, action);
    return action;
  });
  const handle = timerMw(timers)({
    getState: () => state,
    dispatch: dispatch as Dispatch<AppActionTypes>,
  })(next as Dispatch<AppActionTypes>);
  return {
    timers,
    next,
    tick: () => tick(),
    state: () => state,
    send: (type: string, payload?: unknown) => handle({ type, payload } as AppActionTypes),
  };
}

it('updates elapsed real time, stops at zero, and cancels an existing interval while waiting', () => {
  vi.useFakeTimers();
  vi.setSystemTime(100000);
  const f = clock();
  f.send(a.SET_TIMER, { waiting: false, secondsRemaining: 60 });
  vi.setSystemTime(105000);
  f.tick();
  expect(f.state().timer?.secondsRemaining).toBe(55);
  vi.setSystemTime(161000);
  f.tick();
  expect(f.state().timer?.secondsRemaining).toBe(0);
  expect(f.timers.timer).toBeUndefined();
  f.send(a.SET_TIMER, { waiting: false, secondsRemaining: 60 });
  f.send(a.SET_TIMER, { waiting: true, secondsRemaining: 10 });
  expect(f.timers.clearInterval).toHaveBeenCalled();
  expect(f.state().timer?.waiting).toBe(true);
  expect(f.timers.timer).toBeUndefined();
});

it.each([{ currentSessionHash: undefined }, { gameConfig: undefined }])(
  'stops clocks when the session or timer configuration disappears',
  (extra: Partial<IAppState>) => {
    const f = clock(extra);
    f.send(a.SET_TIMER, { waiting: false, secondsRemaining: 60 });
    f.tick();
    expect(f.timers.clearInterval).toHaveBeenCalled();
  }
);

it('clears an existing interval when restarting and preserves default timer values', () => {
  const f = clock();
  f.send(a.SET_TIMER, { waiting: false, secondsRemaining: 60 });
  f.send(a.SET_TIMER, { waiting: false });
  expect(f.timers.clearInterval).toHaveBeenCalled();
  expect(f.state().timer?.secondsRemaining).toBe(0);
  const waited = clock();
  waited.send(a.SET_TIMER, { waiting: true });
  expect(waited.state().timer).toMatchObject({
    secondsRemaining: 0,
    lastUpdateTimestamp: 0,
    lastUpdateSecondsRemaining: 0,
  });
});
