import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  FORCE_LOGOUT,
  GET_ALL_PLAYERS_FAIL,
  GET_ALL_PLAYERS_INIT,
  GET_ALL_PLAYERS_SUCCESS,
  GET_ALL_ROUNDS_INIT,
  GET_CHANGES_OVERVIEW_FAIL,
  GET_CHANGES_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  GET_LAST_RESULTS_INIT,
  GET_OTHER_TABLE_INIT,
  GET_OTHER_TABLES_LIST_INIT,
  GET_USERINFO_SUCCESS,
  LOGIN_FAIL,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  SETTINGS_SAVE_LANG,
  SETTINGS_SAVE_SINGLE_DEVICE_MODE,
  SETTINGS_SAVE_THEME,
  START_GAME_FAIL,
  TRACK_ARBITRARY_EVENT,
  TRACK_SCREEN_ENTER,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_SUCCESS,
} from '../actions/interfaces';
import { Analytics } from '#/services/analytics';
import { AppScreen, IAppState } from '#/store/interfaces';

let currentScreen: AppScreen | null = null;

export const analytics =
  (an: Analytics) =>
  (_mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
    switch (action.type) {
      case TRACK_ARBITRARY_EVENT:
        an.track(action.payload[0], action.payload[1]);
        break;
      case TRACK_SCREEN_ENTER:
        an.track(Analytics.SCREEN_ENTER, {
          screen: action.payload,
        });
        break;
      case LOGIN_INIT:
        an.track(Analytics.LOAD_STARTED, {
          type: 'screen-login',
          request: 'confirmRegistration',
        });
        break;
      case LOGIN_SUCCESS:
        an.track(Analytics.LOAD_SUCCESS, {
          type: 'screen-login',
          request: 'confirmRegistration',
        });
        break;
      case LOGIN_FAIL:
        an.track(Analytics.LOAD_ERROR, {
          type: 'state-init-login',
          request: 'confirmRegistration',
          message: action.payload.toString(),
        });
        break;
      case GET_USERINFO_SUCCESS:
        an.setUserId(action.payload.id);
        break;
      case UPDATE_CURRENT_GAMES_SUCCESS:
        an.track(Analytics.CONFIG_RECEIVED);
        break;
      case UPDATE_CURRENT_GAMES_FAIL:
        an.track(Analytics.REMOTE_ERROR, {
          code: action.payload.code,
          message: action.payload.toString(),
        });
        break;
      case GET_GAME_OVERVIEW_INIT:
        an.track(Analytics.LOAD_STARTED, {
          type: 'game-overview',
        });
        break;
      case GET_GAME_OVERVIEW_SUCCESS:
        an.track(Analytics.LOAD_SUCCESS, {
          type: 'game-overview',
        });
        break;
      case GET_GAME_OVERVIEW_FAIL:
        an.track(Analytics.LOAD_ERROR, {
          type: 'game-overview',
          code: action.payload.code,
          message: action.payload.message,
        });
        break;
      case FORCE_LOGOUT:
        an.track(Analytics.LOGOUT, {
          screen: 'screen-settings',
        });
        break;
      case GET_ALL_PLAYERS_INIT:
        an.track(Analytics.SCREEN_ENTER, {
          screen: 'screen-new-game',
        });
        break;
      case GET_ALL_PLAYERS_SUCCESS:
        an.track(Analytics.LOAD_SUCCESS, {
          type: 'screen-new-game',
          request: 'getAllPlayers',
        });
        break;
      case GET_ALL_PLAYERS_FAIL:
        an.track(Analytics.LOAD_ERROR, {
          type: 'screen-new-game',
          request: 'getAllPlayers',
          message: action.payload.toString(),
        });
        break;
      case GET_CHANGES_OVERVIEW_FAIL:
        an.track(Analytics.LOAD_ERROR, {
          type: 'screen-confirmation',
          code: action.payload.code,
          request: 'getChangesOverview',
        });
        break;
      case START_GAME_FAIL:
        an.track(Analytics.LOAD_ERROR, {
          type: 'screen-new-game',
          request: 'startGame',
          message: action.payload.toString(),
        });
        break;
      case GET_CHANGES_OVERVIEW_INIT:
        an.track(Analytics.SCREEN_ENTER, {
          screen: 'screen-confirmation',
        });
        break;
      case GET_LAST_RESULTS_INIT:
        an.track(Analytics.SCREEN_ENTER, {
          screen: 'screen-last-results',
        });
        break;
      case GET_ALL_ROUNDS_INIT:
        an.track(Analytics.SCREEN_ENTER, {
          screen: 'screen-log',
        });
        break;
      case GET_OTHER_TABLE_INIT:
        an.track(Analytics.SCREEN_ENTER, {
          screen: 'screen-other-table',
        });
        break;
      case GET_OTHER_TABLES_LIST_INIT:
        an.track(Analytics.SCREEN_ENTER, {
          screen: 'screen-other-tables-list',
        });
        break;
      case SETTINGS_SAVE_LANG:
        an.track(Analytics.LANG_CHANGED, {
          localeName: action.payload,
        });
        break;
      case SETTINGS_SAVE_THEME:
        an.track(Analytics.THEME_CHANGED, {
          themeName: action.payload,
        });
        break;
      case SETTINGS_SAVE_SINGLE_DEVICE_MODE:
        an.track(Analytics.SINGLE_DEVICE_MODE_CHANGED, {
          value: action.payload,
        });
        break;
      default:
        if (currentScreen !== _mw.getState().currentScreen) {
          currentScreen = _mw.getState().currentScreen;
          an.trackView('screen:' + currentScreen);
        }
    }

    return next(action);
  };
