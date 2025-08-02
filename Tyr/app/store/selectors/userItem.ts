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

import {
  getDeadhandUsers,
  getLosingUsers,
  getNagashiUsers,
  getRiichiUsers,
  getWinningUsers,
} from './mimir';
import { IAppState } from '../interfaces';
import { PlayerInSession, RoundOutcome } from 'tsclients/proto/atoms.pb';

export function winPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getWinningUsers(state).indexOf(userData);
}

export function losePressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getLosingUsers(state).indexOf(userData);
}

export function riichiPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getRiichiUsers(state).indexOf(userData);
}

export function deadPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getDeadhandUsers(state).indexOf(userData);
}

export function nagashiPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getNagashiUsers(state).indexOf(userData);
}

export function winDisabled(state: IAppState, userData: PlayerInSession) {
  if (!state.currentOutcome) {
    return false;
  }

  if (
    -1 !==
    (
      [RoundOutcome.ROUND_OUTCOME_DRAW, RoundOutcome.ROUND_OUTCOME_NAGASHI] as RoundOutcome[]
    ).indexOf(state.currentOutcome.selectedOutcome)
  ) {
    return -1 !== getDeadhandUsers(state).indexOf(userData);
  }

  // for multiron
  if (
    state.currentOutcome.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON &&
    !state.gameConfig?.rulesetConfig.withAtamahane
  ) {
    // In case of triple ron AND we have abortives enabled, disable win button if 1 or 2 winners already selected.
    const disableTripleRon =
      state.gameConfig?.rulesetConfig.withAbortives && getWinningUsers(state).length >= 2;
    return -1 !== getLosingUsers(state).indexOf(userData) || disableTripleRon;
  }

  // for tsumo and ron without atamahane winner is only one
  return (
    (getWinningUsers(state).length > 0 && -1 === getWinningUsers(state).indexOf(userData)) ||
    -1 !== getLosingUsers(state).indexOf(userData)
  ); // and it should not be current loser
}

// for ron/chombo - loser is only one
export function loseDisabled(state: IAppState, userData: PlayerInSession) {
  return (
    (getLosingUsers(state).length > 0 && -1 === getLosingUsers(state).indexOf(userData)) ||
    -1 !== getWinningUsers(state).indexOf(userData)
  ); // and it should not be current winner
}

// no more than 3 players may have nagashi
export function nagashiDisabled(state: IAppState, userData: PlayerInSession) {
  return getNagashiUsers(state).length >= 3 && -1 === getNagashiUsers(state).indexOf(userData);
}
