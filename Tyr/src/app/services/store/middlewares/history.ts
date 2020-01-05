import {Dispatch, Store as ReduxStore} from "redux";
import {
  AppActionsAll,
  CONFIRM_REGISTRATION_FAIL,
  GET_GAME_OVERVIEW_FAIL,
  GET_GAME_OVERVIEW_INIT,
  GET_GAME_OVERVIEW_SUCCESS,
  UPDATE_CURRENT_GAMES_FAIL,
  UPDATE_CURRENT_GAMES_SUCCESS
} from "../actions/interfaces";
import {MetrikaService} from "../../metrika";

export const history = (/* HistoryService ? */) => (store: ReduxStore) => (next: Dispatch<AppActionsAll>) => (action: AppActionsAll) => {
  switch (action.type) {

    default:
  }

  return next(action);
};
