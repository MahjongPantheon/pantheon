/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import { AppState } from '.';
import { LTimerState } from '../../interfaces/local';

export interface TimerData {
  timeRemaining: number;
  lastUpdateTimeRemaining: number;
  lastUpdateTimestamp: number;
  waiting: boolean;
}

// module-level singleton vars
let timerData: TimerData;
const now = () => Math.round((new Date()).getTime() / 1000);
let timer: NodeJS.Timer | null = null;

export function initTimer(state: LTimerState) {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  timerData = {
    timeRemaining: state.timeRemaining || 0,
    lastUpdateTimeRemaining: state.timeRemaining || 0,
    lastUpdateTimestamp: now(),
    waiting: state.waitingForTimer
  };

  if (state.waitingForTimer) {
    return;
  }

  timer = setInterval(() => {
    // Calc delta to support mobile suspending with js timers stopping
    let delta = now() - timerData.lastUpdateTimestamp;
    timerData.timeRemaining = timerData.lastUpdateTimeRemaining - delta;
    if (timerData.timeRemaining <= 0) {
      timerData.timeRemaining = 0;
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}

export function getTimeRemaining(): number {
  return timerData.timeRemaining;
}

export function timerIsWaiting(): boolean {
  return timerData.waiting;
}

export function getCurrentTimerZone(state: AppState, yellowZoneAlreadyPlayed: boolean) {
  let zoneLength;
  switch (state.getGameConfig('timerPolicy')) {
    case 'redZone':
      zoneLength = state.getGameConfig('redZone');
      if (zoneLength && (state.getTimeRemaining() < zoneLength) && !timerData.waiting) {
        return 'redZone';
      }
      break;
    case 'yellowZone':
      zoneLength = state.getGameConfig('yellowZone');
      if (zoneLength && (state.getTimeRemaining() < zoneLength) && !timerData.waiting) {
        return yellowZoneAlreadyPlayed ? 'redZone' : 'yellowZone';
      }
      break;
    default: ;
  }
  return 'none';
}
