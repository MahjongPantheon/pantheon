import deepclone from 'deepclone';
import {initialState} from "../state";
import {AppActionTypes, INIT_STATE, SELECT_MULTIRON_WINNER} from "../actions/interfaces";
import {IAppState} from "../interfaces";

export function commonReducer(
  state = initialState,
  action: AppActionTypes
): IAppState {
  switch (action.type) {
    case INIT_STATE:
      return deepclone(initialState);
    case SELECT_MULTIRON_WINNER:
      return {
        ...state,
        multironCurrentWinner: action.payload
      };
  }
}
