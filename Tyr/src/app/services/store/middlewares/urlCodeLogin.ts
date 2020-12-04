import { Dispatch, Store as ReduxStore } from 'redux';
import { AppActionTypes, CONFIRM_REGISTRATION_INIT, FORCE_LOGOUT, INIT_WITH_PINCODE } from '../actions/interfaces';
const crc32 = require('crc/crc32').default;

export const urlCodeLogin = () => (store: ReduxStore) =>
  (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case INIT_WITH_PINCODE:
      let [pin, crc] = action.payload.split('_');
      if (crc32(pin).toString(16).toLowerCase() === crc.toLowerCase()) {
        window.history.pushState({}, '', '/'); // to remove pathname
        store.dispatch({ type: FORCE_LOGOUT }); // this deletes flag in storage and forces navigation to login screen
        store.dispatch({ type: CONFIRM_REGISTRATION_INIT, payload: pin });
      }
      break;
    default:
      next(action);
  }
};
