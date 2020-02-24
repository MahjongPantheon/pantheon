import {Dispatch, Store as ReduxStore} from "redux";
import {
  AppActionTypes,
  CONFIRM_REGISTRATION_INIT,
  CONFIRM_REGISTRATION_SUCCESS,
  FORCE_LOGOUT
} from "../actions/interfaces";
import {IDBImpl} from "../../idb/interface";

export const storageMw = (storage: IDBImpl) => (store: ReduxStore) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case CONFIRM_REGISTRATION_SUCCESS:
      storage.set('authToken', action.payload);
      break;
    case CONFIRM_REGISTRATION_INIT: // intentional
    case FORCE_LOGOUT:
      storage.delete(['authToken']);
      break;
    default:
  }

  return next(action);
};
