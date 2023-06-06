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

import { IAppState } from '../interfaces';
import { memoize } from '../../primitives/memoize';

// TODO ##2: из-за постоянных обновлений таймера в стейте селекторы могут работать не столь эффективно.
//  Нужно делать остальные селекторы более специальными.
function _getTimeRemaining(state: IAppState): { minutes: number; seconds: number } | undefined {
  if (!state.gameConfig?.useTimer || state.timer?.waiting) {
    return undefined;
  }

  const min = Math.floor((state.timer?.secondsRemaining ?? 0) / 60);

  if (min < 0) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }
  return {
    minutes: min,
    seconds: (state.timer?.secondsRemaining ?? 0) % 60,
  };
}

function _getAutostartTimeRemaining(
  state: IAppState
): { minutes: number; seconds: number } | undefined {
  if (!state.gameConfig?.useTimer || !state.timer?.waiting) {
    return undefined;
  }

  const min = Math.floor((state.timer?.autostartSecondsRemaining || 0) / 60);

  if (min < 0) {
    return {
      minutes: 0,
      seconds: 0,
    };
  }
  return {
    minutes: min,
    seconds: (state.timer?.autostartSecondsRemaining || 0) % 60,
  };
}

export const getTimeRemaining = memoize(_getTimeRemaining);
export const getAutostartTimeRemaining = memoize(_getAutostartTimeRemaining);

export function formatTime(minutes: number, seconds: number) {
  return minutes.toString() + ':' + (seconds < 10 ? '0' + seconds.toString() : seconds.toString());
}
