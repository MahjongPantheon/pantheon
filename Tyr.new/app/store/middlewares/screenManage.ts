import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  GET_ALL_PLAYERS_INIT,
  GET_CHANGES_OVERVIEW_INIT, GO_TO_CURRENT_GAME,
  GOTO_NEXT_SCREEN,
  INIT_STATE, START_GAME_SUCCESS,
  START_NEW_GAME,
  UPDATE_STATE_SETTINGS,
} from '../actions/interfaces';
import {IAppState} from '../interfaces';

export const screenManageMw = () => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case GOTO_NEXT_SCREEN:
      next({ type: GOTO_NEXT_SCREEN });
      const state = mw.getState();
      const currentScreen = state.currentScreen;
      if (currentScreen === 'confirmation') {
        mw.dispatch({ type: GET_CHANGES_OVERVIEW_INIT, payload: state });
      }
      break;
    case START_NEW_GAME:
      next(action)
      mw.dispatch({ type: GET_ALL_PLAYERS_INIT });
      break;
    case INIT_STATE:
      next(action)
      mw.dispatch({ type: UPDATE_STATE_SETTINGS});
      break;
    default:
      return next(action);
  }
};