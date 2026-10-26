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

import deepclone from '../../helpers/deepClone';
import { initialState } from '../state';
import {
  AppActionTypes,
  ADMIN_ACCESS_INIT,
  ADMIN_ACCESS_SUCCESS,
  ADMIN_ACCESS_FAIL,
  FORCE_LOGOUT,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  STARTUP_WITH_AUTH,
  INIT_STATE,
  SET_CREDENTIALS,
  SELECT_EVENT,
  SET_STATE_SETTINGS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_SINGLE_DEVICE_MODE,
  SETTINGS_SAVE_THEME,
  SHOW_NETWORK_DIALOG,
  TOGGLE_ADDITIONAL_TABLE_INFO,
  TOGGLE_OVERVIEW_DIFFBY,
  TOGGLE_RIICHI_NOTIFICATION,
  SET_YAKU_ADVICE,
} from '../actions/interfaces';
import { IAppState } from '../interfaces';

export function commonReducer(state: IAppState, action: AppActionTypes): IAppState {
  switch (action.type) {
    case INIT_STATE:
      return deepclone(initialState);
    case ADMIN_ACCESS_SUCCESS:
      return { ...state, canAccessAdminPanel: action.payload };
    case ADMIN_ACCESS_INIT:
    case ADMIN_ACCESS_FAIL:
    case FORCE_LOGOUT:
    case LOGIN_INIT:
    case LOGIN_SUCCESS:
    case LOGIN_FAIL:
    case STARTUP_WITH_AUTH:
    case SELECT_EVENT:
      return { ...state, canAccessAdminPanel: false };
    case SET_CREDENTIALS:
      return {
        ...state,
        canAccessAdminPanel: false,
        currentPlayerId: action.payload.personId,
        analyticsSession: action.payload.sessionId,
      };
    case SETTINGS_SAVE_THEME:
      return {
        ...state,
        settings: {
          ...state.settings,
          currentTheme: action.payload,
        },
      };
    case SETTINGS_SAVE_LANG:
      return {
        ...state,
        settings: {
          ...state.settings,
          currentLang: action.payload,
        },
      };
    case SETTINGS_SAVE_SINGLE_DEVICE_MODE:
      return {
        ...state,
        settings: {
          ...state.settings,
          singleDeviceMode: action.payload,
        },
      };
    case SET_STATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          currentLang: (action.payload ?? state.settings)['currentLang'],
          currentTheme: (action.payload ?? state.settings)['currentTheme'],
          singleDeviceMode: (action.payload ?? state.settings)['singleDeviceMode'],
        },
      };
    case TOGGLE_OVERVIEW_DIFFBY:
      return {
        ...state,
        overviewDiffBy: state.overviewDiffBy === action.payload ? undefined : action.payload,
      };
    case TOGGLE_ADDITIONAL_TABLE_INFO:
      return {
        ...state,
        showAdditionalTableInfo: !state.showAdditionalTableInfo,
      };
    case SET_YAKU_ADVICE:
      return { ...state, yakuAdvice: action.payload };
    case TOGGLE_RIICHI_NOTIFICATION:
      return {
        ...state,
        riichiNotificationShown: action.payload,
      };
    case SHOW_NETWORK_DIALOG:
      return {
        ...state,
        networkDialogShown: action.payload,
      };
    default:
      return state;
  }
}
