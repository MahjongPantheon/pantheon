import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  CONFIRM_REGISTRATION_FAIL,
  CONFIRM_REGISTRATION_INIT,
  CONFIRM_REGISTRATION_SUCCESS,
  FORCE_LOGOUT,
  GET_ALL_PLAYERS_FAIL,
  GET_ALL_PLAYERS_INIT,
  GET_ALL_PLAYERS_SUCCESS,
  GET_CHANGES_OVERVIEW_FAIL,
  GET_CHANGES_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  GET_LAST_RESULTS_INIT,
  GET_LAST_ROUND_INIT,
  GET_OTHER_TABLE_INIT,
  GET_OTHER_TABLES_LIST_INIT,
  SETTINGS_SAVE_LANG,
  START_GAME_FAIL,
  TRACK_ARBITRARY_EVENT,
  TRACK_SCREEN_ENTER,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_SUCCESS
} from '../actions/interfaces';
import { MetrikaService } from '#/services/metrika';
import { IAppState } from "#/store/interfaces";

export const metrika = (ms: MetrikaService) => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case TRACK_ARBITRARY_EVENT:
      ms.track(action.payload[0], action.payload[1]);
      break;
    case TRACK_SCREEN_ENTER:
      ms.track(MetrikaService.SCREEN_ENTER, {
        screen: action.payload
      });
      break;
    case CONFIRM_REGISTRATION_INIT:
      ms.track(MetrikaService.LOAD_STARTED, {
        type: 'screen-login',
        request: 'confirmRegistration'
      });
      break;
    case CONFIRM_REGISTRATION_SUCCESS:
      ms.track(MetrikaService.LOAD_SUCCESS, {
        type: 'screen-login',
        request: 'confirmRegistration'
      });
      break;
    case CONFIRM_REGISTRATION_FAIL:
      ms.track(MetrikaService.LOAD_ERROR, {
        type: 'state-init-login',
        request: 'confirmRegistration',
        message: action.payload.toString()
      });
      break;
    case UPDATE_CURRENT_GAMES_SUCCESS:
      ms.setUserId(action.payload.playerInfo.id);
      ms.track(MetrikaService.CONFIG_RECEIVED);
      break;
    case UPDATE_CURRENT_GAMES_FAIL:
      ms.track(MetrikaService.REMOTE_ERROR, {
        code: action.payload.code,
        message: action.payload.toString()
      });
      break;
    case GET_GAME_OVERVIEW_INIT:
      ms.track(MetrikaService.LOAD_STARTED, {
        type: 'game-overview'
      });
      break;
    case GET_GAME_OVERVIEW_SUCCESS:
      ms.track(MetrikaService.LOAD_SUCCESS, {
        type: 'game-overview'
      });
      break;
    case GET_GAME_OVERVIEW_FAIL:
      ms.track(MetrikaService.LOAD_ERROR, {
        type: 'game-overview',
        code: action.payload.code,
        message: action.payload.message
      });
      break;
    case FORCE_LOGOUT:
      ms.track(MetrikaService.LOGOUT, {
        screen: 'screen-settings'
      });
      break;
    case GET_ALL_PLAYERS_INIT:
      ms.track(MetrikaService.SCREEN_ENTER, {
        screen: 'screen-new-game'
      });
      break;
    case GET_ALL_PLAYERS_SUCCESS:
      ms.track(MetrikaService.LOAD_SUCCESS, {
        type: 'screen-new-game', request: 'getAllPlayers'
      });
      break;
    case GET_ALL_PLAYERS_FAIL:
      ms.track(MetrikaService.LOAD_ERROR, {
        type: 'screen-new-game',
        request: 'getAllPlayers', message: action.payload.toString()
      });
      break;
    case GET_CHANGES_OVERVIEW_FAIL:
      ms.track(MetrikaService.LOAD_ERROR, {
        type: 'screen-confirmation',
        code: action.payload.code,
        request: 'getChangesOverview'
      });
      break;
    case START_GAME_FAIL:
      ms.track(MetrikaService.LOAD_ERROR, {
        type: 'screen-new-game',
        request: 'startGame',
        message: action.payload.toString()
      });
      break;
    case GET_CHANGES_OVERVIEW_INIT:
      ms.track(MetrikaService.SCREEN_ENTER, {
        screen: 'screen-confirmation'
      });
      break;
    case GET_LAST_RESULTS_INIT:
      ms.track(MetrikaService.SCREEN_ENTER, {
        screen: 'screen-last-results'
      });
      break;
    case GET_LAST_ROUND_INIT:
      ms.track(MetrikaService.SCREEN_ENTER, {
        screen: 'screen-last-round'
      });
      break;
    case GET_OTHER_TABLE_INIT:
      ms.track(MetrikaService.SCREEN_ENTER, {
        screen: 'screen-other-table'
      });
      break;
    case GET_OTHER_TABLES_LIST_INIT:
      ms.track(MetrikaService.SCREEN_ENTER, {
        screen: 'screen-other-tables-list'
      });
      break;
    case SETTINGS_SAVE_LANG:
      ms.track(MetrikaService.LANG_CHANGED, {
        localeName: action.payload
      });
      break;
    default:
  }

  return next(action);
};
