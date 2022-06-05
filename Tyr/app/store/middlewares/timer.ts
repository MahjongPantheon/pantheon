import { Dispatch, MiddlewareAPI } from 'redux';
import { AppActionTypes, SET_TIMER, UPDATE_TIMER_DATA } from '../actions/interfaces';
import { IAppState, TimerStorage } from '../interfaces';

const now = () => Math.round((new Date()).getTime() / 1000);

export const timerMw = (timerStorage: TimerStorage) => (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) => (next: Dispatch<AppActionTypes>) => (action: AppActionTypes) => {
  switch (action.type) {
    case SET_TIMER:
      if (action.payload.waiting) {
        if (timerStorage.timer) {
          timerStorage.clearInterval(timerStorage.timer);
        }
        timerStorage.timer = undefined;
        if (timerStorage.autostartTimer) {
          timerStorage.clearInterval(timerStorage.autostartTimer);
        }

        timerStorage.autostartTimer = timerStorage.setInterval(() => {
          const timerNotRequired = !mw.getState().gameConfig?.useTimer;
          if (timerNotRequired) {
            if (timerStorage.autostartTimer) {
              timerStorage.clearInterval(timerStorage.autostartTimer);
            }
            return;
          }
          // Calc delta to support mobile suspending with js timers stopping
          let delta = (now() - (mw.getState().timer?.autostartLastUpdateTimestamp || 0));
          let timeRemaining = (mw.getState().timer?.autostartLastUpdateSecondsRemaining || 0) - delta;
          if (timeRemaining <= 0) {
            // timer is finished
            next({ type: UPDATE_TIMER_DATA, payload: {
                ...action.payload,
                autostartLastUpdateTimestamp: now(),
                autostartSecondsRemaining: 0
              }});
            if (timerStorage.autostartTimer) {
              timerStorage.clearInterval(timerStorage.autostartTimer);
            }
            timerStorage.autostartTimer = undefined;
          } else {
            next({ type: UPDATE_TIMER_DATA, payload: {
                ...action.payload,
                autostartLastUpdateTimestamp: now(),
                autostartSecondsRemaining: timeRemaining
              }});
          }
        }, 1000);

        next({ type: UPDATE_TIMER_DATA, payload: {
          ...action.payload,
          autostartLastUpdateTimestamp: now()
        }});
      } else {
        if (timerStorage.autostartTimer) {
          timerStorage.clearInterval(timerStorage.autostartTimer);
        }
        if (timerStorage.timer) {
          timerStorage.clearInterval(timerStorage.timer);
        }

        timerStorage.timer = timerStorage.setInterval(() => {
          const gameEnded = !mw.getState().currentSessionHash;
          const timerNotRequired = !mw.getState().gameConfig?.useTimer;
          if (gameEnded || timerNotRequired) {
            if (timerStorage.timer) {
              timerStorage.clearInterval(timerStorage.timer);
            }
            return;
          }
          // Calc delta to support mobile suspending with js timers stopping
          let delta = (now() - (mw.getState().timer?.lastUpdateTimestamp || 0));
          let timeRemaining = (mw.getState().timer?.lastUpdateSecondsRemaining || 0) - delta;
          if (timeRemaining <= 0) {
            // timer is finished
            next({ type: UPDATE_TIMER_DATA, payload: {
              ...action.payload,
              lastUpdateTimestamp: now(),
              secondsRemaining: 0
            }});
            if (timerStorage.timer) {
              timerStorage.clearInterval(timerStorage.timer);
            }
            timerStorage.timer = undefined;
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
