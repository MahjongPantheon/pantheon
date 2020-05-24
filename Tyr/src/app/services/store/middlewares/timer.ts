import {Dispatch, Store as ReduxStore} from 'redux';
import {AppActionTypes, SET_TIMER, UPDATE_TIMER_DATA} from '../actions/interfaces';
import {IAppState, TimerStorage} from '../interfaces';

const now = () => Math.round((new Date()).getTime() / 1000);

export const timerMw = (timerStorage: TimerStorage) => (store: ReduxStore<IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case SET_TIMER:
      if (action.payload.waiting) {
        timerStorage.clearInterval(timerStorage.timer);
        timerStorage.timer = null;
        next({ type: UPDATE_TIMER_DATA, payload: {
          ...action.payload,
          lastUpdateTimestamp: null
        }});
      } else {
        if (timerStorage.timer) {
          timerStorage.clearInterval(timerStorage.timer);
        }

        timerStorage.timer = timerStorage.setInterval(() => {
          const gameEnded = !store.getState().currentSessionHash;
          const timerNotRequired = !store.getState().gameConfig.useTimer;
          if (gameEnded || timerNotRequired) {
            timerStorage.clearInterval(timerStorage.timer);
            return;
          }
          // Calc delta to support mobile suspending with js timers stopping
          let delta = (now() - store.getState().timer.lastUpdateTimestamp);
          let timeRemaining = store.getState().timer.lastUpdateSecondsRemaining - delta;
          if (timeRemaining <= 0) {
            // timer is finished
            next({ type: UPDATE_TIMER_DATA, payload: {
              ...action.payload,
              lastUpdateTimestamp: now(),
              secondsRemaining: 0
            }});
            timerStorage.clearInterval(timerStorage.timer);
            timerStorage.timer = null;
          } else {
            next({ type: UPDATE_TIMER_DATA, payload: {
              ...action.payload,
              lastUpdateTimestamp: now(),
              secondsRemaining: timeRemaining
            }});
          }
        }, 1000);

        next({ type: UPDATE_TIMER_DATA, payload: {
          ...action.payload,
          lastUpdateTimestamp: now()
        }});
      }
      break;
    default:
  }

  return next(action);
};
