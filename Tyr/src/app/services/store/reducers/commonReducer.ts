import deepclone from 'deepclone';
import {initialState} from "../state";
import {
  AppActionTypes,
  INIT_STATE,
  SELECT_MULTIRON_WINNER,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_THEME, UPDATE_STATE_SETTINGS
} from "../actions/interfaces";
import {IAppState} from "../interfaces";

export function commonReducer(
  state = initialState,
  action: AppActionTypes
): IAppState {
  switch (action.type) {
    case INIT_STATE:
      return deepclone(initialState);
    case SELECT_MULTIRON_WINNER:
      return {
        ...state,
        multironCurrentWinner: action.payload
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
    case UPDATE_STATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          currentLang: action.payload['currentLang'],
          currentTheme: action.payload['currentTheme']
        }
      };
  }
}
