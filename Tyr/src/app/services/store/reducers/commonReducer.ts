import deepclone from 'deepclone';
import {initialState} from "../state";
import {AppActionsAll, INIT_STATE} from "../actions/interfaces";
import {IAppState} from "../interfaces";

export function commonReducer(
  state = initialState,
  action: AppActionsAll
): IAppState {
  switch (action.type) {
    case INIT_STATE:
      return deepclone(initialState);
  }
}
