import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes, GET_CHANGES_OVERVIEW_INIT, GOTO_NEXT_SCREEN,
} from '../actions/interfaces';
import {IAppState} from '../interfaces';

export const screenManageMw = () => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case GOTO_NEXT_SCREEN:
      next({ type: GOTO_NEXT_SCREEN });
      const state = mw.getState()
      const currentScreen = state.currentScreen
      if (currentScreen === 'confirmation') {
        mw.dispatch({ type: GET_CHANGES_OVERVIEW_INIT, payload: state });
      }
      break;
    default:
      return next(action);
  }
};
