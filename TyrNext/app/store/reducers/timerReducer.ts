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

import { AppActionTypes, UPDATE_TIMER_DATA } from '../actions/interfaces';
import { IAppState } from '../interfaces';

export function timerReducer(state: IAppState, action: AppActionTypes): IAppState {
  switch (action.type) {
    case UPDATE_TIMER_DATA:
      return {
        ...state,
        timer: {
          ...state.timer,
          waiting: action.payload.waiting,
          secondsRemaining: action.payload.secondsRemaining ?? 0,
          autostartSecondsRemaining: action.payload.autostartSecondsRemaining ?? 0,
          autostartLastUpdateSecondsRemaining: action.payload.autostartLastUpdateTimestamp
            ? action.payload.autostartSecondsRemaining ?? 0
            : state.timer?.autostartLastUpdateSecondsRemaining ?? 0,
          autostartLastUpdateTimestamp:
            action.payload.autostartLastUpdateTimestamp ??
            state.timer?.autostartLastUpdateTimestamp ??
            0,
          lastUpdateTimestamp:
            action.payload.lastUpdateTimestamp ?? state.timer?.lastUpdateTimestamp ?? 0,
          lastUpdateSecondsRemaining: action.payload.lastUpdateTimestamp
            ? action.payload.secondsRemaining ?? 0
            : state.timer?.lastUpdateSecondsRemaining ?? 0,
        },
      };
    default:
      return state;
  }
}
