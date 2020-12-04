import { Dispatch, Store as ReduxStore } from 'redux';
import { AppActionTypes, GOTO_PREV_SCREEN, HISTORY_INIT } from '../actions/interfaces';
import { IAppState } from '../interfaces';

export const history = () => (store: ReduxStore<IAppState>) =>
  (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
    switch (action.type) {
      case HISTORY_INIT:
        if (!store.getState().historyInitialized) {
          // initial push to make some history to return to
          window.history.pushState({}, '', '/');

          // Register handler
          window.onpopstate = (): any => {
            // Any history pop we do as BACK event!
            store.dispatch({type: GOTO_PREV_SCREEN});
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
