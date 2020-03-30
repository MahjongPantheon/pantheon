import { Dispatch, Store as ReduxStore } from "redux";
import { ADD_YAKU, AppActionTypes, REMOVE_YAKU, SELECT_MULTIRON_WINNER } from "../actions/interfaces";
import { getRequiredYaku } from "../selectors/yaku";

export const yaku = (store: ReduxStore) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case ADD_YAKU:
    case REMOVE_YAKU:
    case SELECT_MULTIRON_WINNER:
      next(action);
      // Mark required yaku
      const requiredYaku = getRequiredYaku(store.getState());
      requiredYaku.forEach((y) => {
        store.dispatch({ type: ADD_YAKU, payload: { id: y } });
      });
  }
};
