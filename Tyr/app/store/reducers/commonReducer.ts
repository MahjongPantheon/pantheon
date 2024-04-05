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

import deepclone from 'deep-clone';
import { initialState } from '../state';
import {
  AppActionTypes,
  INIT_STATE,
  SELECT_MULTIRON_WINNER,
  SET_CREDENTIALS,
  SET_SELECT_HAND_TAB,
  SET_STATE_SETTINGS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_SINGLE_DEVICE_MODE,
  SETTINGS_SAVE_THEME,
  TOGGLE_ADDITIONAL_TABLE_INFO,
  TOGGLE_OVERVIEW_DIFFBY,
  TOGGLE_RIICHI_NOTIFICATION,
} from '../actions/interfaces';
import { IAppState } from '../interfaces';

export function commonReducer(state: IAppState, action: AppActionTypes): IAppState {
  switch (action.type) {
    case INIT_STATE:
      return deepclone<any, any>(initialState) as IAppState;
    case SET_CREDENTIALS:
      return {
        ...state,
        currentPlayerId: action.payload.personId,
        analyticsSession: action.payload.sessionId,
      };
    case SELECT_MULTIRON_WINNER:
      return {
        ...state,
        multironCurrentWinner: action.payload.winner,
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
    case SET_SELECT_HAND_TAB:
      return {
        ...state,
        currentSelectHandTab: action.payload,
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
    case TOGGLE_RIICHI_NOTIFICATION:
      return {
        ...state,
        riichiNotificationShown: action.payload,
      };
    default:
      return state;
  }
}
