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

import { Player } from '../../interfaces/common';
import { AppOutcome } from '../../interfaces/app';
import { YakuId } from '../yaku';

export function toggleRiichi(
  p: Player,
  outcome: AppOutcome,
  removeYaku: (y: YakuId) => void
) {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
    case 'abort':
    case 'draw':
    case 'multiron':
      if (
        outcome.selectedOutcome === 'draw' &&
        outcome.tempai.indexOf(p.id) === -1 &&
        outcome.deadhands.indexOf(p.id) === -1
      ) {
        outcome.tempai.push(p.id); // add tempai on riichi click
      }

      const pIdx = outcome.riichiBets.indexOf(p.id);
      if (pIdx === -1) {
        outcome.riichiBets.push(p.id);
        // We don't add riichi here, because it's added as
        // required yaku on yaku selector init, see getRequiredYaku
        return;
      }

      outcome.riichiBets.splice(pIdx, 1);

      // Remove riichi yaku if user is winner
      if (
        outcome.selectedOutcome !== 'ron' &&
        outcome.selectedOutcome !== 'tsumo'
      ) {
        return;
      }

      if (outcome.winner === p.id) {
        removeYaku(YakuId.RIICHI);
        removeYaku(YakuId.IPPATSU);
      }

      break;
    default:
      throw new Error('No winners exist on this outcome');
  }
}

export type PMap = { [key: number]: Player };

export function getRiichiUsers(outcome: AppOutcome, playerIdMap: PMap): Player[] {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
    case 'draw':
    case 'abort':
    case 'multiron':
      return outcome.riichiBets.map((r) => playerIdMap[r]);
    default:
      return [];
  }
}
