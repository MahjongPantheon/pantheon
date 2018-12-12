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
import { intersection } from 'lodash';

export function toggleWinner(p: Player, outcome: AppOutcome, players: Player[]) {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      outcome.winner = outcome.winner === p.id ? null : p.id;
      outcome.winnerIsDealer = outcome.winner !== null && getDealerId(outcome, players) === p.id;
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
    case 'nagashi':
      const tIdx = outcome.tempai.indexOf(p.id);
      if (tIdx === -1) {
        outcome.tempai.push(p.id);
      } else {
        outcome.tempai.splice(tIdx, 1);
      }
      break;
    case 'multiron':
      if (outcome.wins[p.id]) {
        delete outcome.wins[p.id];
      } else {
        outcome.wins[p.id] = { // blank win item
          winner: p.id,
          winnerIsDealer: getDealerId(outcome, players) === p.id,
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

export function toggleLoser(p: Player, outcome: AppOutcome, players: Player[]) {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'multiron':
    case 'chombo':
      outcome.loser = outcome.loser === p.id ? null : p.id;
      outcome.loserIsDealer = outcome.loser !== null && getDealerId(outcome, players) === p.id;
      break;
    default:
      throw new Error('No losers exist on this outcome');
  }
}

export function togglePao(p: Player, outcome: AppOutcome, yakuWithPao: YakuId[]) {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      outcome.paoPlayerId = outcome.paoPlayerId === p.id ? null : p.id;
      break;
    case 'multiron':
      for (let playerId in outcome.wins) {
        if (intersection(outcome.wins[playerId].yaku, yakuWithPao).length !== 0) {
          outcome.wins[playerId].paoPlayerId = outcome.wins[playerId].paoPlayerId === p.id ? null : p.id;
        }
      }
      break;
    default:
      throw new Error('No pao exist on this outcome');
  }
}

export function toggleDeadhand(p: Player, outcome: AppOutcome) {
  switch (outcome.selectedOutcome) {
    case 'draw':
      const pIdx = outcome.deadhands.indexOf(p.id);
      if (pIdx === -1) {
        outcome.deadhands.push(p.id);
        const rIdx = outcome.tempai.indexOf(p.id);
        if (rIdx !== -1) { // remove tempai of dead user
          outcome.tempai.splice(rIdx, 1);
        }
      } else {
        outcome.deadhands.splice(pIdx, 1);
        const rIdx = outcome.riichiBets.indexOf(p.id);
        if (rIdx !== -1) { // if we remove dead hand from riichi user, he should become tempai
          outcome.tempai.push(p.id);
        }
      }
      break;
    default:
      throw new Error('No losers exist on this outcome');
  }
}

export function toggleNagashi(p: Player, outcome: AppOutcome) {
  switch (outcome.selectedOutcome) {
    case 'nagashi':
      const pIdx = outcome.nagashi.indexOf(p.id);
      if (pIdx === -1) {
        outcome.nagashi.push(p.id);
      } else {
        outcome.nagashi.splice(pIdx, 1);
      }
      break;
    default:
      throw new Error('No nagashi exist on this outcome');
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
    case 'nagashi':
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

export function getPaoUsers(outcome: AppOutcome, playerIdMap: PMap): Player[] {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.paoPlayerId
        ? [playerIdMap[outcome.paoPlayerId]]
        : [];
    case 'multiron':
      return Object.keys(outcome.wins).reduce<Player[]>((acc, playerId) => {
        if (outcome.wins[playerId].paoPlayerId) {
          acc.push(playerIdMap[outcome.wins[playerId].paoPlayerId]);
        }
        return acc;
      }, []);
    default:
      return [];
  }
}

export function getDeadhandUsers(outcome: AppOutcome, playerIdMap: PMap): Player[] {
  switch (outcome.selectedOutcome) {
    case 'draw':
      return outcome.deadhands.map((t) => playerIdMap[t]);
    default:
      return [];
  }
}

export function getNagashiUsers(outcome: AppOutcome, playerIdMap: PMap): Player[] {
  switch (outcome.selectedOutcome) {
    case 'nagashi':
      return outcome.nagashi.map((t) => playerIdMap[t]);
    default:
      return [];
  }
}

/**
 * Get id of player who is dealer in this round
 */
function getDealerId(outcome: AppOutcome, playersList: Player[]): number {
  let players = [playersList[0], playersList[1], playersList[2], playersList[3]];
  for (let i = 1; i < outcome.roundIndex; i++) {
    players = [players.pop()].concat(players);
  }

  return players[0].id;
}
