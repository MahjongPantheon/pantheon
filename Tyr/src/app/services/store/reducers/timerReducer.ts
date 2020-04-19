import { AppActionTypes, UPDATE_TIMER_DATA } from '../actions/interfaces';
import { IAppState } from '../interfaces';

export function timerReducer(
  state,
  action: AppActionTypes
): IAppState {
  switch (action.type) {
    case UPDATE_TIMER_DATA:
      return {
        ...state,
        timer: {
          ...state.timer,
          waiting: action.payload.waiting,
          secondsRemaining: action.payload.secondsRemaining,
          lastUpdateTimestamp: action.payload.lastUpdateTimestamp || state.timer.lastUpdateTimestamp,
          lastUpdateSecondsRemaining: action.payload.lastUpdateTimestamp
            ? action.payload.secondsRemaining
            : state.timer.lastUpdateSecondsRemaining
        }
      };
    default:
      return state;
  }
}
