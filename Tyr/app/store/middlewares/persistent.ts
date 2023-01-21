import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  FORCE_LOGOUT,
  LOGIN_FAIL,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  RESET_LOGIN_ERROR,
  SELECT_EVENT,
  SET_CREDENTIALS,
  SET_STATE_SETTINGS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_SINGLE_DEVICE_MODE,
  SETTINGS_SAVE_THEME,
  UPDATE_STATE_SETTINGS,
} from '../actions/interfaces';
import { IDBImpl } from '#/services/idb/interface';
import { IAppState } from '../interfaces';
import { RemoteError } from '#/services/remoteError';
import { environment } from '#config';

export const persistentMw =
  (storage: IDBImpl) =>
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    switch (action.type) {
      case LOGIN_SUCCESS:
        storage.set(environment.idbTokenKey, 'string', action.payload.token);
        storage.set(environment.idbIdKey, 'int', action.payload.personId);
        storage.delete([environment.idbEventKey]);
        mw.dispatch({
          type: SET_CREDENTIALS,
          payload: { authToken: action.payload.token, personId: action.payload.personId },
        });
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
      case SELECT_EVENT:
        storage.set(environment.idbEventKey, 'int', action.payload);
        next(action);
        break;
      case SETTINGS_SAVE_LANG:
        storage.set(environment.idbLangKey, 'string', action.payload);
        next(action);
        break;
      case SETTINGS_SAVE_SINGLE_DEVICE_MODE:
        storage.set(environment.idbDeviceModeKey, 'string', action.payload);
        next(action);
        break;
      case UPDATE_STATE_SETTINGS:
        const data = {
          currentTheme: storage.get(environment.idbThemeKey, 'string'),
          currentLang: storage.get(environment.idbLangKey, 'string'),
          singleDeviceMode: storage.get(environment.idbDeviceModeKey, 'string'),
        };

        mw.dispatch({ type: SET_STATE_SETTINGS, payload: data });
        break;
    }

    return next(action);
  };
