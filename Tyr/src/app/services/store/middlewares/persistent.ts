import { Dispatch, Store as ReduxStore } from 'redux';
import {
  AppActionTypes, GET_GAME_OVERVIEW_INIT, SET_CREDENTIALS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME, STARTUP_WITH_AUTH, UPDATE_CURRENT_GAMES_INIT,
  UPDATE_STATE_SETTINGS
} from '../actions/interfaces';
import { IDBImpl } from '../../idb/interface';
import { IAppState } from '../interfaces';
import { RiichiApiService } from '../../riichiApi';

export const persistentMw = (storage: IDBImpl, api: RiichiApiService) => (store: ReduxStore<IAppState>) =>
  (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
    const token = this.storage.get('authToken') || '';
    const id = parseInt(this.storage.get('currentPersonId') || '0', 10);
    switch (action.type) {
      case STARTUP_WITH_AUTH:
        if (!token || !id) { // Not logged in
          return;
        }

        function onOk() {
          store.dispatch({ type: SET_CREDENTIALS, payload: { id, token } });
          // TODO: move somewhere, persistent-storage mw is not best place for such logic
          store.dispatch({ type: UPDATE_CURRENT_GAMES_INIT });
          // TODO: and for this too
          store.dispatch({ type: GET_GAME_OVERVIEW_INIT, payload: store.getState().currentSessionHash });
        }

        function onFail() {
          storage.delete(['authToken']);
          store.dispatch({ type: SET_CREDENTIALS, payload: { id: 0, token: '' } });
        }

        api.quickAuthorize(id, token).then((passwordCorrect) => {
          if (passwordCorrect) {
            onOk();
          } else {
            onFail();
          }
        }, onFail);
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
        next({ type: UPDATE_STATE_SETTINGS, payload: data });
        break;
      default:
        next(action);
    }
  };
