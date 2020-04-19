import {Dispatch, Store as ReduxStore} from 'redux';
import {
  AppActionTypes,
  CONFIRM_REGISTRATION_INIT,
  CONFIRM_REGISTRATION_SUCCESS,
  FORCE_LOGOUT,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME,
  UPDATE_STATE_SETTINGS
} from '../actions/interfaces';
import {IDBImpl} from '../../idb/interface';

export const persistentMw = (storage: IDBImpl) => (store: ReduxStore) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case CONFIRM_REGISTRATION_SUCCESS:
      storage.set('authToken', action.payload);
      break;
    case CONFIRM_REGISTRATION_INIT: // intentional
    case FORCE_LOGOUT:
      storage.delete(['authToken']);
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
