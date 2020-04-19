import {Dispatch, Store as ReduxStore} from 'redux';
import {
  AppActionTypes, CONFIRM_REGISTRATION_FAIL,
  CONFIRM_REGISTRATION_INIT,
  CONFIRM_REGISTRATION_SUCCESS,
  FORCE_LOGOUT, GET_GAME_OVERVIEW_INIT, RESET_REGISTRATION_ERROR, SET_CREDENTIALS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME, STARTUP_WITH_AUTH, UPDATE_CURRENT_GAMES_INIT,
  UPDATE_STATE_SETTINGS
} from '../actions/interfaces';
import {IDBImpl} from '../../idb/interface';
import {IAppState} from '../interfaces';

export const persistentMw = (storage: IDBImpl) => (store: ReduxStore<IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  const token = storage.get('authToken');
  switch (action.type) {
    case STARTUP_WITH_AUTH:
      if (!token) { // Not logged in
        // TODO: looks like kludge. These two actions get user to the login screen.
        store.dispatch({ type: CONFIRM_REGISTRATION_FAIL, payload: { message: 'Not logged in' } });
        store.dispatch({ type: RESET_REGISTRATION_ERROR }); // this resets error screen
        return;
      }

      store.dispatch({ type: SET_CREDENTIALS, payload: token });
      store.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); // TODO: move somewhere, persistent-storage mw is not best place for such logic
      store.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: store.getState().currentSessionHash }); // TODO: and for this too
      break;
    case CONFIRM_REGISTRATION_SUCCESS:
      storage.set('authToken', action.payload);
      store.dispatch({ type: SET_CREDENTIALS, payload: action.payload });
      store.dispatch({ type: UPDATE_CURRENT_GAMES_INIT }); // TODO: move somewhere, persistent-storage mw is not best place for such logic
      store.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: store.getState().currentSessionHash }); // TODO: and for this too
      break;
    case CONFIRM_REGISTRATION_INIT:
      // Remove current token, we're going to get the new one
      storage.delete(['authToken']);
      store.dispatch({ type: SET_CREDENTIALS, payload: '' });
      break;
    case FORCE_LOGOUT:
      storage.delete(['authToken']);
      store.dispatch({ type: SET_CREDENTIALS, payload: '' });
      // TODO: looks like kludge. These two actions get user to the login screen.
      store.dispatch({ type: CONFIRM_REGISTRATION_FAIL, payload: { message: 'Not logged in' } });
      store.dispatch({ type: RESET_REGISTRATION_ERROR }); // this resets error screen
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
        currentLang: storage.get('currentLang'),
      };
      next({ type: UPDATE_STATE_SETTINGS, payload: data });
      break;
  }

  return next(action);
};
