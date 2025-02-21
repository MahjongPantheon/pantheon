/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { Dispatch, MiddlewareAPI } from 'redux';
import { AppActionTypes, SET_TIMER, UPDATE_TIMER_DATA } from '../actions/interfaces';
import { IAppState, TimerStorage } from '../interfaces';

const now = () => Math.round(new Date().getTime() / 1000);

export const timerMw =
  (timerStorage: TimerStorage) =>
  (mw: MiddlewareAPI<Dispatch<AppActionTypes>, IAppState>) =>
  (next: Dispatch<AppActionTypes>) =>
  (action: AppActionTypes) => {
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
            const delta = now() - (mw.getState().timer?.autostartLastUpdateTimestamp ?? 0);
            const timeRemaining =
              (mw.getState().timer?.autostartLastUpdateSecondsRemaining ?? 0) - delta;
            if (timeRemaining <= 0) {
              // timer is finished
              next({
                type: UPDATE_TIMER_DATA,
                payload: {
                  ...action.payload,
                  autostartLastUpdateTimestamp: now(),
                  autostartSecondsRemaining: 0,
                },
              });
              if (timerStorage.autostartTimer) {
                timerStorage.clearInterval(timerStorage.autostartTimer);
              }
              timerStorage.autostartTimer = undefined;
            } else {
              next({
                type: UPDATE_TIMER_DATA,
                payload: {
                  ...action.payload,
                  autostartLastUpdateTimestamp: now(),
                  autostartSecondsRemaining: timeRemaining,
                },
              });
            }
          }, 1000);

          next({
            type: UPDATE_TIMER_DATA,
            payload: {
              ...action.payload,
              autostartLastUpdateTimestamp: now(),
            },
          });
        } else {
          if (timerStorage.autostartTimer) {
            timerStorage.clearInterval(timerStorage.autostartTimer);
          }
          if (timerStorage.timer) {
            timerStorage.clearInterval(timerStorage.timer);
          }

          timerStorage.timer = timerStorage.setInterval(() => {
            const gameEnded =
              !mw.getState().currentSessionHash && !mw.getState().currentOtherTableHash;
            const timerNotRequired = !mw.getState().gameConfig?.useTimer;
            if (gameEnded || timerNotRequired) {
              if (timerStorage.timer) {
                timerStorage.clearInterval(timerStorage.timer);
              }
              return;
            }
            // Calc delta to support mobile suspending with js timers stopping
            const delta = now() - (mw.getState().timer?.lastUpdateTimestamp ?? 0);
            const timeRemaining = (mw.getState().timer?.lastUpdateSecondsRemaining ?? 0) - delta;
            if (timeRemaining <= 0) {
              // timer is finished
              next({
                type: UPDATE_TIMER_DATA,
                payload: {
                  ...action.payload,
                  lastUpdateTimestamp: now(),
                  secondsRemaining: 0,
                },
              });
              if (timerStorage.timer) {
                timerStorage.clearInterval(timerStorage.timer);
              }
              timerStorage.timer = undefined;
            } else {
              next({
                type: UPDATE_TIMER_DATA,
                payload: {
                  ...action.payload,
                  lastUpdateTimestamp: now(),
                  secondsRemaining: timeRemaining,
                },
              });
            }
          }, 1000);

          next({
            type: UPDATE_TIMER_DATA,
            payload: {
              ...action.payload,
              lastUpdateTimestamp: now(),
            },
          });
        }
        break;
      default:
    }

    return next(action);
  };
