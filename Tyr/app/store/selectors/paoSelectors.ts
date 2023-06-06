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
import { playerHasYakuWithPao } from '../util';
import { RoundOutcome } from '../../clients/proto/atoms.pb';

export function getFirstWinnerWithPao(state: IAppState): number | undefined {
  return getNextWinnerWithPao(state, undefined);
}

export function getNextWinnerWithPao(
  state: IAppState,
  currentPlayerId: number | undefined
): number | undefined {
  const gameConfig = state.gameConfig;
  if (
    !gameConfig ||
    state.currentScreen !== 'paoSelect' ||
    state.currentOutcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_RON
  ) {
    return undefined;
  }

  const allWinners = state.currentOutcome.wins;
  const winsIds = Object.keys(allWinners);

  if (winsIds.length === 1) {
    return undefined;
  }

  let currentWinnerIndex = -1;
  let nextPaoWinnerId = -1;
  let index = 0;

  if (currentPlayerId) {
    for (; index < winsIds.length && currentWinnerIndex === -1; index++) {
      const id = parseInt(winsIds[index].toString(), 10);
      if (id === currentPlayerId) {
        currentWinnerIndex = index;
      }
    }
  }

  for (; index < winsIds.length && nextPaoWinnerId === -1; index++) {
    const id = parseInt(winsIds[index].toString(), 10);
    const winner = allWinners[winsIds[index]];
    if (playerHasYakuWithPao(winner.yaku, gameConfig)) {
      nextPaoWinnerId = id;
    }
  }

  return nextPaoWinnerId !== -1 ? nextPaoWinnerId : undefined;
}
