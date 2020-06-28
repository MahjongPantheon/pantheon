import {Dispatch, Store as ReduxStore} from 'redux';
import {
  AppActionTypes,
  CONFIRM_REGISTRATION_FAIL,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_SUCCESS
} from '../actions/interfaces';

export const history = (/* HistoryService ? */) => (store: ReduxStore) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
// TODO !
    default:
  }

  return next(action);
};
