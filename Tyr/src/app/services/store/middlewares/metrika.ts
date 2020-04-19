import {Dispatch, Store as ReduxStore} from 'redux';
import {
  AppActionTypes,
  CONFIRM_REGISTRATION_FAIL, FORCE_LOGOUT,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_SUCCESS
} from '../actions/interfaces';
import {MetrikaService} from '../../metrika';

export const metrika = (ms: MetrikaService) => (store: ReduxStore) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
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
      ms.track(MetrikaService.LOAD_STARTED, { type: 'game-overview' });
      break;
    case GET_GAME_OVERVIEW_SUCCESS:
      ms.track(MetrikaService.LOAD_SUCCESS, {
        type: 'game-overview',
        finished: store.getState().finished // TODO: check param
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
    default:
  }

  return next(action);
};
