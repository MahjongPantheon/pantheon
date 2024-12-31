/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  CONGRATS_SHOW,
  CONGRATS_INIT,
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
import { RemoteError } from '../../services/remoteError';
import { IStorage } from '../../../../Common/storage';
import { v4 } from 'uuid';

export const persistentMw =
  (storage: IStorage) =>
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    switch (action.type) {
      case LOGIN_SUCCESS: {
        const sessionId = storage.getSessionId() ?? v4();
        storage
          .setSessionId(sessionId)
          .setAuthToken(action.payload.authToken)
          .setPersonId(action.payload.personId)
          .deleteEventId();
        mw.dispatch({
          type: SET_CREDENTIALS,
          payload: {
            authToken: action.payload.authToken,
            personId: action.payload.personId,
            sessionId,
          },
        });
        break;
      }
      case LOGIN_INIT: {
        // Remove current token, we're going to get the new one
        storage.deleteAuthToken().deletePersonId();
        const sessionId = storage.getSessionId() ?? v4();
        storage.setSessionId(sessionId);
        mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0, sessionId } });
        break;
      }
      case FORCE_LOGOUT:
        const sessionId = storage.getSessionId() ?? v4();
        storage.clear();
        storage.setSessionId(sessionId);
        mw.dispatch({ type: SET_CREDENTIALS, payload: { authToken: '', personId: 0, sessionId } });
        mw.dispatch({
          type: LOGIN_FAIL,
          payload: action.payload ?? new RemoteError('Not logged in', '403'),
        });
        break;
      case SETTINGS_SAVE_THEME:
        if (['day', 'night'].includes(action.payload)) {
          storage.setTheme(action.payload).deleteThemeVariant();
        } else {
          storage.setThemeVariant(action.payload);
        }
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
          currentTheme: storage.getThemeVariant() ?? storage.getTheme(),
          currentLang: storage.getLang(),
          singleDeviceMode: storage.getSingleDeviceMode(),
        };

        mw.dispatch({ type: SET_STATE_SETTINGS, payload: data });
        break;
      case CONGRATS_INIT:
        if (storage.getLang() !== 'ru') {
          // only show for local ru folks as it's not translated (same as donations), so here we just disable it
          storage.setCongratsShown(true);
        } else if (
          !storage.getCongratsShown() &&
          matchDate() &&
          Math.floor(Math.random() * 10) % 3 === 0
        ) {
          storage.setCongratsShown(true);
          mw.dispatch({ type: CONGRATS_SHOW });
        }
        break;
      default:
    }

    return next(action);
  };

function matchDate() {
  const date = new Date(Date.now());
  return date.getMonth() === 0 && date.getDate() === 1 && date.getHours() < 3;
}
