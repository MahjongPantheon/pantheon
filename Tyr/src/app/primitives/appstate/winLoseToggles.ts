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

export function toggleWinner(p: Player, outcome: AppOutcome) {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      outcome.winner = outcome.winner === p.id ? null : p.id;
      break;
    case 'draw':
      const pIdx = outcome.tempai.indexOf(p.id);
      if (pIdx === -1) {
        outcome.tempai.push(p.id);
      } else {
        outcome.tempai.splice(pIdx, 1);
        const rIdx = outcome.riichiBets.indexOf(p.id);
        if (rIdx !== -1) { // remove riichi if any
          outcome.riichiBets.splice(rIdx, 1);
        }
      }
      break;
    case 'multiron':
      if (outcome.wins[p.id]) {
        delete outcome.wins[p.id];
      } else {
        outcome.wins[p.id] = { // blank win item
          winner: p.id,
          han: 0,
          fu: 0,
          possibleFu: [],
          yaku: [],
          dora: 0,
          openHand: false
        };
      }
      outcome.multiRon = Object.keys(outcome.wins).length;
      break;
    default:
      throw new Error('No winners exist on this outcome');
  }
}

export function toggleLoser(p: Player, outcome: AppOutcome) {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'multiron':
    case 'chombo':
      outcome.loser = outcome.loser === p.id ? null : p.id;
      break;
    default:
      throw new Error('No losers exist on this outcome');
  }
}

export type PMap = { [key: number]: Player };

export function getWinningUsers(outcome: AppOutcome, playerIdMap: PMap): Player[] {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.winner
        ? [playerIdMap[outcome.winner]]
        : [];
    case 'multiron':
      let users = [];
      for (let w in outcome.wins) {
        users.push(playerIdMap[outcome.wins[w].winner]);
      }
      return users;
    case 'draw':
      return outcome.tempai.map((t) => playerIdMap[t]);
    default:
      return [];
  }
}

export function getLosingUsers(outcome: AppOutcome, playerIdMap: PMap): Player[] {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'multiron':
    case 'chombo':
      return outcome.loser
        ? [playerIdMap[outcome.loser]]
        : [];
    default:
      return [];
  }
}
