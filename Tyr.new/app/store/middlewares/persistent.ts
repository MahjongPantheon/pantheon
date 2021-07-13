import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes, CONFIRM_REGISTRATION_FAIL,
  CONFIRM_REGISTRATION_INIT,
  CONFIRM_REGISTRATION_SUCCESS,
  FORCE_LOGOUT, GET_GAME_OVERVIEW_INIT, RESET_REGISTRATION_ERROR, SET_CREDENTIALS, SET_STATE_SETTINGS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME, STARTUP_WITH_AUTH, UPDATE_CURRENT_GAMES_INIT,
  UPDATE_STATE_SETTINGS,
} from '../actions/interfaces';
import {IDBImpl} from '#/services/idb/interface';
import {IAppState} from '../interfaces';
import { RemoteError } from "#/services/remoteError";

export const persistentMw = (storage: IDBImpl) => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  const token = storage.get('authToken');
  let hash: string | undefined;
  switch (action.type) {
    case STARTUP_WITH_AUTH:
      if (!token) { // Not logged in
        // TODO: looks like kludge. These two actions get user to the login screen.
        mw.dispatch({ type: CONFIRM_REGISTRATION_FAIL, payload: new RemoteError('Not logged in', '403') });
        mw.dispatch({ type: RESET_REGISTRATION_ERROR }); // this resets error screen
        return;
      }

      mw.dispatch({ type: SET_CREDENTIALS, payload: token });
      mw.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); // TODO: move somewhere, persistent-storage mw is not best place for such logic
      hash = mw.getState().currentSessionHash;
      if (hash) {
        mw.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: hash }); // TODO: and for this too
      }
      break;
    case CONFIRM_REGISTRATION_SUCCESS:
      storage.set('authToken', action.payload);
      mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: action.payload, personId: mw.getState().currentPlayerId! } });
      mw.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); // TODO: move somewhere, persistent-storage mw is not best place for such logic
      hash = mw.getState().currentSessionHash;
      if (hash) {
        mw.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: hash }); // TODO: and for this too
      }
      break;
    case CONFIRM_REGISTRATION_INIT:
      // Remove current token, we're going to get the new one
      storage.delete(['authToken']);
      mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0 } });
      break;
    case FORCE_LOGOUT:
      storage.delete(['authToken']);
      mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0 } });
      // TODO: looks like kludge. These two actions get user to the login screen.
      mw.dispatch({ type: CONFIRM_REGISTRATION_FAIL, payload: new RemoteError('Not logged in', '403') });
      mw.dispatch({ type: RESET_REGISTRATION_ERROR }); // this resets error screen
      break;
    case SETTINGS_SAVE_THEME:
      storage.set('currentTheme', action.payload);
      next(action);
      break;
    case SETTINGS_SAVE_LANG:
      storage.set('currentLanguage', action.payload);
      next(action);
      break;
    case UPDATE_STATE_SETTINGS:
      const data = {
        currentTheme: storage.get('currentTheme'),
        currentLang: storage.get('currentLanguage'),
      };

      mw.dispatch({type: SET_STATE_SETTINGS, payload: data });
      break;
  }

  return next(action);
};
