import { Dispatch, MiddlewareAPI } from 'redux';
import { IRiichiApi } from '../../services/IRiichiApi';
import { IAppState } from '../interfaces';
import {
  ADMIN_ACCESS_FAIL,
  ADMIN_ACCESS_INIT,
  ADMIN_ACCESS_SUCCESS,
  AppActionTypes,
  FORCE_LOGOUT,
  INIT_STATE,
  LOGIN_FAIL,
  LOGIN_INIT,
  LOGIN_SUCCESS,
  OPEN_SETTINGS,
  SET_CREDENTIALS,
  STARTUP_WITH_AUTH,
} from '../actions/interfaces';

export const adminAccess =
  (api: Pick<IRiichiApi, 'canAccessAdminPanel'>) =>
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => {
    let generation = 0;
    return (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
      switch (action.type) {
        case FORCE_LOGOUT:
        case INIT_STATE:
        case LOGIN_INIT:
        case LOGIN_SUCCESS:
        case LOGIN_FAIL:
        case STARTUP_WITH_AUTH:
        case SET_CREDENTIALS:
          // Invalidate requests even when the same account logs in again.
          generation++;
          break;
      }
      const result = next(action);
      if (action.type !== OPEN_SETTINGS) {
        return result;
      }
      const requestGeneration = ++generation;
      mw.dispatch({ type: ADMIN_ACCESS_INIT });
      const personId = mw.getState().currentPlayerId;
      if (!personId) {
        return result;
      }
      api.canAccessAdminPanel(personId).then(
        (allowed) => {
          if (generation === requestGeneration) {
            mw.dispatch({ type: ADMIN_ACCESS_SUCCESS, payload: allowed });
          }
        },
        () => {
          if (generation === requestGeneration) {
            mw.dispatch({ type: ADMIN_ACCESS_FAIL });
          }
        }
      );
      return result;
    };
  };
