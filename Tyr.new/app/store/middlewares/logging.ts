import { Dispatch, MiddlewareAPI, Store as ReduxStore } from 'redux';
import {AppActionTypes} from '../actions/interfaces';

export const logging = (purpose: string) => (api: MiddlewareAPI) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) { // enable only for devtools users
    console.groupCollapsed(`${purpose}: ${action.type}`);
    console.log('Payload: ', (action as any).payload);
    console.groupEnd();
  }
  return next(action);
};
