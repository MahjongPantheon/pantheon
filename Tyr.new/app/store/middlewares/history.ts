import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
} from '../actions/interfaces';
import { IAppState } from "#/store/interfaces";
import {GOTO_PREV_SCREEN, HISTORY_INIT} from "../../../../Tyr/src/app/services/store/actions/interfaces";

export const history = (/* HistoryService ? */) => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case HISTORY_INIT:
      if (!mw.getState().historyInitialized) {
        // initial push to make some history to return to
        window.history.pushState({}, '', '/');

        // Register handler
        window.onpopstate = (): any => {
          // Any history pop we do as BACK event!
          mw.dispatch({type: GOTO_PREV_SCREEN});
          // Then make another dummy history item
          window.history.pushState({}, '');
        };
        next(action);
      }
      break;
    default:
  }

  return next(action);
};
