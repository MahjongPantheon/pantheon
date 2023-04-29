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

import { memoize } from '#/primitives/memoize';
import { PlayerInSession } from '#/clients/proto/atoms.pb';

function _getSeating(
  round: number,
  overviewShift: number,
  currentPlayerId: number,
  playersList: PlayerInSession[],
  riichiBets?: string[],
  penaltyFor?: number,
  paoPlayer?: number
) {
  let players: PlayerInSession[] = ([] as PlayerInSession[]).concat(playersList);

  let seating = ['東', '南', '西', '北'];
  for (let i = 1; i < round; i++) {
    seating = [seating.pop()!].concat(seating);
  }

  let roundOffset = 0;
  for (; roundOffset < 4 + (overviewShift || 0); roundOffset++) {
    if (players[0].id === currentPlayerId) {
      break;
    }

    players = players.slice(1).concat(players[0]);
    seating = seating.slice(1).concat(seating[0]);
  }

  // Riichi bets
  const riichi = [false, false, false, false];
  const riichiIds = (riichiBets ?? []).map((id: string) => parseInt(id, 10)); // TODO: get it out to formatters
  players.forEach((p, idx) => {
    riichi[idx] = riichiIds.includes(p.id);
  });

  // Chombo penalties
  const chombo = [false, false, false, false];
  players.forEach((p, idx) => {
    chombo[idx] = penaltyFor === p.id;
  });

  // Pao
  const pao = [false, false, false, false];
  players.forEach((p, idx) => {
    pao[idx] = paoPlayer === p.id;
  });

  return { players, seating, roundOffset, riichi, chombo, pao };
}

export const getSeating: typeof _getSeating = memoize(_getSeating);
