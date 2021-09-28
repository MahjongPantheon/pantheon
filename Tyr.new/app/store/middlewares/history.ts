import { Dispatch, MiddlewareAPI } from 'redux';
import {
  AppActionTypes,
  LOGIN_FAIL,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_SUCCESS
} from '../actions/interfaces';
import { IAppState } from "#/store/interfaces";

export const history = (/* HistoryService ? */) => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
// TODO !
    default:
  }

  return next(action);
};
