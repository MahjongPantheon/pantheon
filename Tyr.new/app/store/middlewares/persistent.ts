import {Dispatch, MiddlewareAPI} from 'redux';
import {
  AppActionTypes, LOGIN_FAIL,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  FORCE_LOGOUT, GET_GAME_OVERVIEW_INIT, RESET_LOGIN_ERROR, SET_CREDENTIALS, SET_STATE_SETTINGS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME, STARTUP_WITH_AUTH, UPDATE_CURRENT_GAMES_INIT,
  UPDATE_STATE_SETTINGS,
} from '../actions/interfaces';
import {IDBImpl} from '#/services/idb/interface';
import {IAppState} from '../interfaces';
import {RemoteError} from "#/services/remoteError";
import {environment} from '#config';

export const persistentMw = (storage: IDBImpl) => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  let hash: string | undefined;
  switch (action.type) {
    case STARTUP_WITH_AUTH:
      if (!action.payload.token) { // Not logged in
        // TODO: looks like kludge. These two actions get user to the login screen.
        mw.dispatch({ type: LOGIN_FAIL, payload: new RemoteError('Not logged in', '403') });
        mw.dispatch({ type: RESET_LOGIN_ERROR }); // this resets error screen
        return;
      }

      mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: action.payload.token, personId: action.payload.personId } });
      mw.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); // TODO: move somewhere, persistent-storage mw is not best place for such logic
      hash = mw.getState().currentSessionHash;
      if (hash) {
        mw.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: hash }); // TODO: and for this too
      }
      break;
    case LOGIN_SUCCESS:
      storage.set(environment.idbTokenKey, 'string', action.payload.token);
      storage.set(environment.idbIdKey, 'int', action.payload.personId);
      mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: action.payload.token, personId: action.payload.personId } });
      mw.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); // TODO: move somewhere, persistent-storage mw is not best place for such logic
      hash = mw.getState().currentSessionHash;
      if (hash) {
        mw.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: hash }); // TODO: and for this too
      }
      break;
    case LOGIN_INIT:
      // Remove current token, we're going to get the new one
      storage.delete([environment.idbTokenKey, environment.idbIdKey]);
      mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0 } });
      break;
    case FORCE_LOGOUT:
      storage.delete([environment.idbTokenKey, environment.idbIdKey]);
      mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0 } });
      // TODO: looks like kludge. These two actions get user to the login screen.
      mw.dispatch({ type: LOGIN_FAIL, payload: new RemoteError('Not logged in', '403') });
      mw.dispatch({ type: RESET_LOGIN_ERROR }); // this resets error screen
      break;
    case SETTINGS_SAVE_THEME:
      storage.set(environment.idbThemeKey, 'string', action.payload);
      next(action);
      break;
    case SETTINGS_SAVE_LANG:
      storage.set(environment.idbLangKey, 'string', action.payload);
      next(action);
      break;
    case UPDATE_STATE_SETTINGS:
      const data = {
        currentTheme: storage.get(environment.idbThemeKey, 'string'),
        currentLang: storage.get(environment.idbLangKey, 'string'),
      };

      mw.dispatch({ type: SET_STATE_SETTINGS, payload: data });
      break;
  }

  return next(action);
};
