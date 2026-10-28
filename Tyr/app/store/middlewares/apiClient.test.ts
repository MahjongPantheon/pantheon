import type { Dispatch } from 'redux';
import { GameConfig } from 'tsclients/proto/atoms.pb';
import { apiClient } from './apiClient';
import type { IRiichiApi } from '../../services/IRiichiApi';
import type { IAppState } from '../interfaces';
import { initialState } from '../state';
import * as a from '../actions/interfaces';
import type { AppActionTypes } from '../actions/interfaces';

const flush = async () => {
  for (let i = 0; i < 12; i++) await Promise.resolve();
};
function fixture(extra: Partial<IAppState> = {}) {
  const api = {
    setCredentials: vi.fn(),
    getMyEvents: vi.fn().mockResolvedValue([]),
    authorize: vi.fn(),
    quickAuthorize: vi.fn().mockResolvedValue(true),
    getUserInfo: vi.fn().mockResolvedValue([{ id: 7 }]),
    getCurrentState: vi.fn().mockResolvedValue({ sessions: [], config: {} }),
    getGameOverview: vi
      .fn()
      .mockResolvedValue({ timerState: { waitingForTimer: false, timeRemaining: 60 } }),
    getTablesState: vi.fn().mockResolvedValue([]),
    getAllRounds: vi.fn().mockResolvedValue([]),
    getChangesOverview: vi.fn().mockResolvedValue({}),
    getLastResults: vi.fn().mockResolvedValue([]),
    getAllPlayers: vi.fn().mockResolvedValue([]),
    startGame: vi.fn().mockResolvedValue('hash'),
    addRound: vi.fn().mockResolvedValue({ isFinished: false }),
    callReferee: vi.fn().mockResolvedValue(true),
    getPenalties: vi.fn().mockResolvedValue([]),
  };
  const state: IAppState = {
    ...initialState,
    currentPlayerId: 7,
    currentEventId: 42,
    tableIndex: 2,
    currentSessionHash: 'hash',
    currentOtherTableHash: 'other',
    ...extra,
  };
  const dispatch = vi.fn((action: AppActionTypes) => action);
  const next = vi.fn((action: AppActionTypes) => action);
  const handle = apiClient(api as unknown as IRiichiApi)({
    getState: () => state,
    dispatch: dispatch as Dispatch<AppActionTypes>,
  })(next as Dispatch<AppActionTypes>);
  return {
    api,
    dispatch,
    next,
    state,
    send: (type: string, payload?: unknown) => handle({ type, payload } as AppActionTypes),
  };
}
const loads = [
  [
    a.GET_GAME_OVERVIEW_INIT,
    'getGameOverview',
    a.GET_GAME_OVERVIEW_SUCCESS,
    a.GET_GAME_OVERVIEW_FAIL,
    'hash',
  ],
  [
    a.GET_OTHER_TABLES_LIST_INIT,
    'getTablesState',
    a.GET_OTHER_TABLES_LIST_SUCCESS,
    a.GET_OTHER_TABLES_LIST_FAIL,
    undefined,
  ],
  [
    a.GET_OTHER_TABLES_LIST_RELOAD,
    'getTablesState',
    a.GET_OTHER_TABLES_LIST_SUCCESS,
    a.GET_OTHER_TABLES_LIST_FAIL,
    undefined,
  ],
  [
    a.GET_OTHER_TABLE_INIT,
    'getGameOverview',
    a.GET_OTHER_TABLE_SUCCESS,
    a.GET_OTHER_TABLE_FAIL,
    'other',
  ],
  [
    a.GET_OTHER_TABLE_RELOAD,
    'getGameOverview',
    a.GET_OTHER_TABLE_SUCCESS,
    a.GET_OTHER_TABLE_FAIL,
    undefined,
  ],
  [a.GET_ALL_ROUNDS_INIT, 'getAllRounds', a.GET_ALL_ROUNDS_SUCCESS, a.GET_ALL_ROUNDS_FAIL, 'hash'],
  [
    a.GET_CHANGES_OVERVIEW_INIT,
    'getChangesOverview',
    a.GET_CHANGES_OVERVIEW_SUCCESS,
    a.GET_CHANGES_OVERVIEW_FAIL,
    initialState,
  ],
  [
    a.GET_LAST_RESULTS_INIT,
    'getLastResults',
    a.GET_LAST_RESULTS_SUCCESS,
    a.GET_LAST_RESULTS_FAIL,
    undefined,
  ],
  [
    a.GET_ALL_PLAYERS_INIT,
    'getAllPlayers',
    a.GET_ALL_PLAYERS_SUCCESS,
    a.GET_ALL_PLAYERS_FAIL,
    undefined,
  ],
  [a.GET_PENALTIES_INIT, 'getPenalties', a.GET_PENALTIES_SUCCESS, a.GET_PENALTIES_FAIL, undefined],
] as const;

it.each(loads)(
  '%s reports successful and failed loads',
  async (
    type: string,
    method: keyof ReturnType<typeof fixture>['api'],
    success: string,
    failure: string,
    payload: unknown
  ) => {
    const f = fixture();
    f.send(type, payload);
    await flush();
    expect(f.api[method]).toHaveBeenCalledOnce();
    expect(f.next).toHaveBeenCalledWith(expect.objectContaining({ type: success }));
    const failed = fixture();
    const error = new Error('Offline');
    failed.api[method].mockRejectedValueOnce(error);
    failed.send(type, payload);
    await flush();
    expect(failed.next).toHaveBeenCalledWith({ type: failure, payload: error });
  }
);

it('filters online events and reports event-list failures', async () => {
  const f = fixture();
  f.api.getMyEvents.mockResolvedValueOnce([
    { id: 1, isOnline: true },
    { id: 2, isOnline: false },
  ]);
  f.send(a.EVENTS_GET_LIST_INIT);
  await flush();
  expect(f.dispatch).toHaveBeenCalledWith({
    type: a.EVENTS_GET_LIST_SUCCESS,
    payload: [{ id: 2, isOnline: false }],
  });
  const error = new Error('Offline');
  f.api.getMyEvents.mockRejectedValueOnce(error);
  f.send(a.EVENTS_GET_LIST_INIT);
  await flush();
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.EVENTS_GET_LIST_FAIL, payload: error });
});

it('refreshes active-game overview and timer data', async () => {
  const f = fixture();
  const session = {
    sessionHash: 'fresh',
    timerState: { waitingForTimer: true, timeRemaining: 90 },
  };
  f.api.getCurrentState.mockResolvedValueOnce({ sessions: [session], config: { title: 'Event' } });
  f.send(a.UPDATE_CURRENT_GAMES_INIT);
  await flush();
  expect(f.api.getCurrentState).toHaveBeenCalledWith(7, 42);
  expect(f.next).toHaveBeenCalledWith({
    type: a.UPDATE_CURRENT_GAMES_SUCCESS,
    payload: { games: [session], gameConfig: { title: 'Event' } },
  });
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.GET_GAME_OVERVIEW_INIT, payload: 'fresh' });
  expect(f.dispatch).toHaveBeenCalledWith({
    type: a.SET_TIMER,
    payload: { waiting: true, secondsRemaining: 90 },
  });
  f.api.getCurrentState.mockRejectedValueOnce({ code: 401 });
  f.send(a.UPDATE_CURRENT_GAMES_INIT);
  await flush();
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.FORCE_LOGOUT, payload: undefined });
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.RESET_LOGIN_ERROR });
  const error = new Error('Offline');
  f.api.getCurrentState.mockRejectedValueOnce(error);
  f.send(a.UPDATE_CURRENT_GAMES_INIT);
  await flush();
  expect(f.next).toHaveBeenCalledWith({ type: a.UPDATE_CURRENT_GAMES_FAIL, payload: error });
});

it.each([undefined, 0])(
  'does not load event data without event ID %s',
  (currentEventId: number | undefined) => {
    const f = fixture({ currentEventId });
    for (const type of [
      a.UPDATE_CURRENT_GAMES_INIT,
      a.GET_OTHER_TABLES_LIST_INIT,
      a.GET_OTHER_TABLES_LIST_RELOAD,
      a.GET_OTHER_TABLE_INIT,
      a.GET_OTHER_TABLE_RELOAD,
      a.GET_LAST_RESULTS_INIT,
      a.GET_ALL_PLAYERS_INIT,
      a.START_GAME_INIT,
      a.GET_PENALTIES_INIT,
    ])
      f.send(type, 'hash');
    expect(f.next).not.toHaveBeenCalled();
    f.send(a.GET_GAME_OVERVIEW_INIT, 'hash');
    expect(f.dispatch).toHaveBeenCalledWith({ type: a.RESET_STATE });
  }
);

it('does not load personal data without a player ID', () => {
  const f = fixture({ currentPlayerId: undefined });
  for (const type of [a.UPDATE_CURRENT_GAMES_INIT, a.GET_LAST_RESULTS_INIT, a.GET_PENALTIES_INIT])
    f.send(type);
  expect(f.next).not.toHaveBeenCalled();
});

it.each([
  a.GET_OTHER_TABLES_LIST_INIT,
  a.GET_OTHER_TABLES_LIST_RELOAD,
  a.GET_OTHER_TABLE_INIT,
  a.GET_OTHER_TABLE_RELOAD,
])('respects other-table visibility for %s and permits spectators', async (type: string) => {
  const f = fixture({ gameConfig: GameConfig.initialize({ allowViewOtherTables: false }) });
  f.send(type, 'other');
  expect(f.next).not.toHaveBeenCalled();
  const spectator = fixture({
    currentSessionHash: undefined,
    gameConfig: GameConfig.initialize({ allowViewOtherTables: false }),
  });
  spectator.send(type, 'other');
  await flush();
  expect(spectator.next).toHaveBeenCalled();
});

it('loads an empty other-table hash fallback and resets a missing overview', async () => {
  const f = fixture({ currentOtherTableHash: undefined });
  f.send(a.GET_OTHER_TABLE_RELOAD);
  await flush();
  expect(f.api.getGameOverview).toHaveBeenCalledWith('');
  f.send(a.GET_GAME_OVERVIEW_INIT, '');
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.RESET_STATE });
});

it('starts a game and returns the app to the active session', async () => {
  const f = fixture();
  f.send(a.START_GAME_INIT, [1, 2, 3, 4]);
  await flush();
  expect(f.api.startGame).toHaveBeenCalledWith(42, [1, 2, 3, 4]);
  for (const type of [
    a.START_GAME_SUCCESS,
    a.RESET_STATE,
    a.SELECT_EVENT,
    a.UPDATE_CURRENT_GAMES_INIT,
    a.GO_TO_CURRENT_GAME,
  ])
    expect(f.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type }));
  const error = new Error('Offline');
  f.api.startGame.mockRejectedValueOnce(error);
  f.send(a.START_GAME_INIT, [1, 2, 3, 4]);
  await flush();
  expect(f.next).toHaveBeenCalledWith({ type: a.START_GAME_FAIL, payload: error });
});

it.each([false, true])(
  'submits a round and refreshes unfinished sessions: finished=%s',
  async (isFinished: boolean) => {
    const f = fixture();
    f.api.addRound.mockResolvedValueOnce({ isFinished });
    f.send(a.ADD_ROUND_INIT, f.state);
    await flush();
    expect(f.next).toHaveBeenCalledWith({ type: a.ADD_ROUND_SUCCESS, payload: { isFinished } });
    expect(
      f.dispatch.mock.calls.some(
        ([action]: [AppActionTypes]) => action.type === a.GET_GAME_OVERVIEW_INIT
      )
    ).toBe(!isFinished);
  }
);

it.each(['failed_precondition', 'already_exists', 'internal'])(
  'handles rejected round code %s',
  async (code: string) => {
    const f = fixture();
    const error = { code };
    f.api.addRound.mockRejectedValueOnce(error);
    f.send(a.ADD_ROUND_INIT, f.state);
    await flush();
    expect(f.next).toHaveBeenCalledWith({ type: a.ADD_ROUND_FAIL, payload: error });
    expect(
      f.dispatch.mock.calls.some(
        ([action]: [AppActionTypes]) => action.type === a.GET_GAME_OVERVIEW_INIT
      )
    ).toBe(code !== 'internal');
  }
);

it('passes credentials and unknown actions to the next middleware', () => {
  const f = fixture();
  f.send(a.SET_CREDENTIALS, { personId: 7, authToken: 'token', sessionId: 'session' });
  expect(f.api.setCredentials).toHaveBeenCalledWith(7, 'token');
  f.send('unknown');
  expect(f.next).toHaveBeenCalledWith({ type: 'unknown', payload: undefined });
  f.send(a.CALL_REFEREE);
  expect(f.api.callReferee).toHaveBeenCalledWith(42, 2);
  const missing = fixture({ tableIndex: undefined });
  missing.send(a.CALL_REFEREE);
  expect(missing.api.callReferee).not.toHaveBeenCalled();
});

it('requires an auth token before startup', () => {
  const f = fixture();
  f.send(a.STARTUP_WITH_AUTH, { personId: 7, sessionId: 'session', token: '' });
  expect(f.dispatch).toHaveBeenCalledWith({ type: a.FORCE_LOGOUT, payload: undefined });
  expect(f.api.quickAuthorize).not.toHaveBeenCalled();
});

it.each([undefined, 42])(
  'restores a valid login with event ID %s',
  async (currentEventId: number | undefined) => {
    const f = fixture({ currentEventId });
    f.send(a.STARTUP_WITH_AUTH, { personId: 7, sessionId: 'session', token: 'token' });
    await flush();
    expect(f.dispatch).toHaveBeenCalledWith({
      type: a.SET_CREDENTIALS,
      payload: { personId: 7, sessionId: 'session', authToken: 'token' },
    });
    expect(f.next).toHaveBeenCalledWith({ type: a.GET_USERINFO_SUCCESS, payload: { id: 7 } });
    expect(f.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: currentEventId ? a.SELECT_EVENT : a.GOTO_EVENT_SELECT })
    );
  }
);

it.each(['Password check failed', 'Person is not known to the system', 'Offline'])(
  'handles startup rejection %s',
  async (msg: string) => {
    const f = fixture();
    f.api.quickAuthorize.mockRejectedValueOnce({ msg });
    f.send(a.STARTUP_WITH_AUTH, { personId: 7, token: 'token', sessionId: 'session' });
    await flush();
    expect(f.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: msg === 'Offline' ? a.SHOW_NETWORK_DIALOG : a.FORCE_LOGOUT })
    );
  }
);

it('reports denied quick authorization and profile failures', async () => {
  const denied = fixture();
  denied.api.quickAuthorize.mockResolvedValueOnce(false);
  denied.send(a.STARTUP_WITH_AUTH, { personId: 7, token: 'token', sessionId: 'session' });
  await flush();
  expect(denied.dispatch).toHaveBeenCalledWith({ type: a.SHOW_NETWORK_DIALOG, payload: true });
  const f = fixture();
  const error = new Error('Offline');
  f.api.getUserInfo.mockRejectedValueOnce(error);
  f.send(a.STARTUP_WITH_AUTH, { personId: 7, token: 'token', sessionId: 'session' });
  await flush();
  expect(f.next).toHaveBeenCalledWith({ type: a.GET_USERINFO_FAIL, payload: error });
});

it('retries login up to five times and reports exhaustion', async () => {
  vi.useFakeTimers();
  try {
    const f = fixture();
    f.api.authorize.mockRejectedValue(new Error('Offline'));
    f.send(a.LOGIN_INIT, { email: 'email', password: 'password', sessionId: 'session' });
    await vi.advanceTimersByTimeAsync(2500);
    expect(f.api.authorize).toHaveBeenCalledTimes(5);
    expect(f.dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: a.FORCE_LOGOUT }));
    const success = fixture();
    success.api.authorize.mockResolvedValue({ personId: 7, authToken: 'token' });
    success.send(a.LOGIN_INIT, { email: 'email', password: 'password', sessionId: 'session' });
    await flush();
    expect(success.dispatch).toHaveBeenCalledWith({
      type: a.LOGIN_SUCCESS,
      payload: { personId: 7, authToken: 'token' },
    });
  } finally {
    vi.useRealTimers();
  }
});
