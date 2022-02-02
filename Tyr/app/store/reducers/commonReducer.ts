import deepclone from 'deep-clone';
import {initialState} from '../state';
import {
  AppActionTypes,
  ENABLE_FEATURE,
  INIT_STATE,
  SELECT_MULTIRON_WINNER,
  SET_CREDENTIALS,
  SET_SELECT_HAND_TAB,
  SET_STATE_SETTINGS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME,
  TOGGLE_ADDITIONAL_TABLE_INFO,
  TOGGLE_OVERVIEW_DIFFBY,
} from '../actions/interfaces';
import {IAppState} from '../interfaces';

export function commonReducer(
  state: IAppState,
  action: AppActionTypes
): IAppState {
  switch (action.type) {
    case INIT_STATE:
      return deepclone(initialState);
    case SET_CREDENTIALS:
      return {
        ...state,
        currentPlayerId: action.payload.personId
      };
    case SELECT_MULTIRON_WINNER:
      return {
        ...state,
        multironCurrentWinner: action.payload.winner
      };
    case SETTINGS_SAVE_THEME:
      return {
        ...state,
        settings: {
          ...state.settings,
          currentTheme: action.payload
        }
      };
    case SETTINGS_SAVE_LANG:
      return {
        ...state,
        settings: {
          ...state.settings,
          currentLang: action.payload
        }
      };
    case SET_STATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          currentLang: (action.payload || state.settings)['currentLang'],
          currentTheme: (action.payload || state.settings)['currentTheme']
        }
      };
    case SET_SELECT_HAND_TAB:
      return {
        ...state,
        currentSelectHandTab: action.payload
      };
    case TOGGLE_OVERVIEW_DIFFBY:
      return {
        ...state,
        overviewDiffBy: state.overviewDiffBy === action.payload ? undefined : action.payload
      };
    case TOGGLE_ADDITIONAL_TABLE_INFO:
      return {
        ...state,
        showAdditionalTableInfo: !state.showAdditionalTableInfo
      };
    case ENABLE_FEATURE:
      return {
        ...state,
        features: {
          [action.payload.feature]: action.payload.enable
        }
      };
    default:
      return state;
  }
}
