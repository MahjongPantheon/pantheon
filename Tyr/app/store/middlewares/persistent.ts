import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  FORCE_LOGOUT,
  LOGIN_FAIL,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  SELECT_EVENT,
  SET_CREDENTIALS,
  SET_STATE_SETTINGS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_SINGLE_DEVICE_MODE,
  SETTINGS_SAVE_THEME,
  UPDATE_STATE_SETTINGS,
} from '../actions/interfaces';
import { IAppState } from '../interfaces';
import { RemoteError } from '#/services/remoteError';
import { IStorage } from '../../../../Common/storage';

export const persistentMw =
  (storage: IStorage) =>
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    switch (action.type) {
      case LOGIN_SUCCESS:
        storage
          .setAuthToken(action.payload.token)
          .setPersonId(action.payload.personId)
          .deleteEventId();
        mw.dispatch({
          type: SET_CREDENTIALS,
          payload: { authToken: action.payload.token, personId: action.payload.personId },
        });
        break;
      case LOGIN_INIT:
        // Remove current token, we're going to get the new one
        storage.deleteAuthToken().deletePersonId();
        mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0 } });
        break;
      case FORCE_LOGOUT:
        storage.clear();
        mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0 } });
        mw.dispatch({
          type: LOGIN_FAIL,
          payload: action.payload ?? new RemoteError('Not logged in', '403'),
        });
        break;
      case SETTINGS_SAVE_THEME:
        storage.setTheme(action.payload);
        next(action);
        break;
      case SELECT_EVENT:
        storage.setEventId(action.payload);
        next(action);
        break;
      case SETTINGS_SAVE_LANG:
        storage.setLang(action.payload);
        next(action);
        break;
      case SETTINGS_SAVE_SINGLE_DEVICE_MODE:
        storage.setSingleDeviceMode(action.payload);
        next(action);
        break;
      case UPDATE_STATE_SETTINGS:
        const data = {
          currentTheme: storage.getTheme(),
          currentLang: storage.getLang(),
          singleDeviceMode: storage.getSingleDeviceMode(),
        };

        mw.dispatch({ type: SET_STATE_SETTINGS, payload: data });
        break;
      default:
    }

    return next(action);
  };
