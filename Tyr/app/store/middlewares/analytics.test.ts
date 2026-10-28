import type { Dispatch } from 'redux';
import { analytics } from './analytics';
import { Analytics } from '../../services/analytics';
import { initialState } from '../state';
import type { AppActionTypes } from '../actions/interfaces';
import * as a from '../actions/interfaces';

it('tracks request lifecycles, preferences and user context while forwarding every action', () => {
  const service = {
    track: vi.fn(),
    trackView: vi.fn(),
    setUserId: vi.fn(),
    setEventId: vi.fn(),
    setSessionId: vi.fn(),
  };
  const next = vi.fn((action: AppActionTypes) => action);
  const handle = analytics(service as unknown as Analytics)({
    getState: () => initialState,
    dispatch: next as Dispatch<AppActionTypes>,
  })(next as Dispatch<AppActionTypes>);
  const send = (type: string, payload?: unknown) => handle({ type, payload } as AppActionTypes);
  const cases = [
    [a.LOGIN_INIT, {}, Analytics.LOAD_STARTED],
    [a.LOGIN_SUCCESS, {}, Analytics.LOAD_SUCCESS],
    [a.LOGIN_FAIL, new Error('Denied'), Analytics.LOAD_ERROR],
    [a.UPDATE_CURRENT_GAMES_SUCCESS, {}, Analytics.CONFIG_RECEIVED],
    [a.UPDATE_CURRENT_GAMES_FAIL, new Error('Offline'), Analytics.REMOTE_ERROR],
    [a.GET_GAME_OVERVIEW_INIT, undefined, Analytics.LOAD_STARTED],
    [a.GET_GAME_OVERVIEW_SUCCESS, {}, Analytics.LOAD_SUCCESS],
    [a.GET_GAME_OVERVIEW_FAIL, { message: 'Offline', code: 500 }, Analytics.LOAD_ERROR],
    [a.FORCE_LOGOUT, undefined, Analytics.LOGOUT],
    [a.GET_ALL_PLAYERS_INIT, undefined, Analytics.SCREEN_ENTER],
    [a.GET_ALL_PLAYERS_SUCCESS, [], Analytics.LOAD_SUCCESS],
    [a.GET_ALL_PLAYERS_FAIL, new Error('Offline'), Analytics.LOAD_ERROR],
    [a.GET_CHANGES_OVERVIEW_FAIL, { code: 500 }, Analytics.LOAD_ERROR],
    [a.START_GAME_FAIL, new Error('Offline'), Analytics.LOAD_ERROR],
    [a.GET_CHANGES_OVERVIEW_INIT, {}, Analytics.SCREEN_ENTER],
    [a.GET_LAST_RESULTS_INIT, undefined, Analytics.SCREEN_ENTER],
    [a.GET_ALL_ROUNDS_INIT, undefined, Analytics.SCREEN_ENTER],
    [a.GET_OTHER_TABLE_INIT, undefined, Analytics.SCREEN_ENTER],
    [a.GET_OTHER_TABLES_LIST_INIT, undefined, Analytics.SCREEN_ENTER],
    [a.SETTINGS_SAVE_LANG, 'de', Analytics.LANG_CHANGED],
    [a.SETTINGS_SAVE_THEME, 'night', Analytics.THEME_CHANGED],
    [a.SETTINGS_SAVE_SINGLE_DEVICE_MODE, true, Analytics.SINGLE_DEVICE_MODE_CHANGED],
    [a.TRACK_ARBITRARY_EVENT, ['custom', { value: 42 }], 'custom'],
    [a.TRACK_SCREEN_ENTER, 'overview', Analytics.SCREEN_ENTER],
  ] as const;
  for (const [type, payload, event] of cases) {
    send(type, payload);
    expect(service.track).toHaveBeenLastCalledWith(
      event,
      ...(type === a.UPDATE_CURRENT_GAMES_SUCCESS ? [] : [expect.anything()])
    );
    expect(next).toHaveBeenLastCalledWith({ type, payload });
  }
  send(a.SET_CREDENTIALS, { personId: 7, sessionId: 'session', authToken: 'token' });
  expect(service.setUserId).toHaveBeenCalledWith(7);
  expect(service.setSessionId).toHaveBeenCalledWith('session');
  send(a.GET_USERINFO_SUCCESS, { id: 8 });
  expect(service.setUserId).toHaveBeenCalledWith(8);
  send(a.SELECT_EVENT, 42);
  expect(service.setEventId).toHaveBeenCalledWith(42);
  send('unknown');
  expect(service.trackView).toHaveBeenCalledWith('screen:overview');
  send('unknown');
  expect(service.trackView).toHaveBeenCalledOnce();
});
