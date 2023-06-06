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
import { YakuId } from '../../primitives/yaku';
import { unpack } from '../../primitives/yaku-compat';
import { memoize } from '../../primitives/memoize';
import { PlayerInSession, RoundOutcome } from '../../clients/proto/atoms.pb';

export function getOutcome(state: IAppState) {
  return state.currentOutcome && state.currentOutcome.selectedOutcome;
}

function _getWinningUsers(state: IAppState): PlayerInSession[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO: {
      const foundWinner = outcome.winner && state.players?.find((val) => val.id === outcome.winner);
      return foundWinner ? [foundWinner] : [];
    }
    case RoundOutcome.ROUND_OUTCOME_RON: {
      const users: PlayerInSession[] = [];
      for (const w in outcome.wins) {
        if (!outcome.wins.hasOwnProperty(w)) {
          continue;
        }
        const foundWinner = state.players?.find((val) => val.id === outcome.wins[w].winner);
        if (foundWinner) {
          users.push(foundWinner);
        }
      }
      return users;
    }
    case RoundOutcome.ROUND_OUTCOME_DRAW:
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return outcome.tempai
        .map((t) => state.players?.find((val) => val.id === t))
        .filter((p: PlayerInSession | undefined): p is PlayerInSession => !!p);
    default:
      return [];
  }
}

export const getWinningUsers: typeof _getWinningUsers = memoize(_getWinningUsers);

function _getLosingUsers(state: IAppState): PlayerInSession[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      const foundLoser = state.players?.find((val) => val.id === outcome.loser);
      return foundLoser ? [foundLoser] : [];
    default:
      return [];
  }
}

export const getLosingUsers: typeof _getLosingUsers = memoize(_getLosingUsers);

function _getPaoUsers(state: IAppState): PlayerInSession[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO: {
      const foundPao =
        outcome.paoPlayerId && state.players?.find((val) => val.id === outcome.paoPlayerId);
      return foundPao ? [foundPao] : [];
    }
    case RoundOutcome.ROUND_OUTCOME_RON: {
      return Object.keys(outcome.wins).reduce<PlayerInSession[]>((acc, playerId) => {
        if (outcome.wins[playerId].paoPlayerId) {
          const foundPao = state.players?.find(
            (val) => val.id === outcome.wins[playerId].paoPlayerId
          );
          if (foundPao) {
            acc.push(foundPao);
          }
        }
        return acc;
      }, []);
    }
    default:
      return [];
  }
}

export const getPaoUsers: typeof _getPaoUsers = memoize(_getPaoUsers);

function _getDeadhandUsers(state: IAppState): PlayerInSession[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_DRAW:
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return outcome.deadhands
        .map((t) => state.players?.find((val) => val.id === t))
        .filter((p: PlayerInSession | undefined): p is PlayerInSession => !!p);
    default:
      return [];
  }
}

export const getDeadhandUsers: typeof _getDeadhandUsers = memoize(_getDeadhandUsers);

function _getNagashiUsers(state: IAppState): PlayerInSession[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return outcome.nagashi
        .map((t) => state.players?.find((val) => val.id === t))
        .filter((p: PlayerInSession | undefined): p is PlayerInSession => !!p);
    default:
      return [];
  }
}

export const getNagashiUsers: typeof _getNagashiUsers = memoize(_getNagashiUsers);

function _hasYaku(state: IAppState, id: YakuId) {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return -1 !== unpack(outcome.yaku).indexOf(id);
    case RoundOutcome.ROUND_OUTCOME_RON:
      if (!state.multironCurrentWinner) {
        throw new Error('No winner selected');
      }
      return -1 !== unpack(outcome.wins[state.multironCurrentWinner].yaku).indexOf(id);
    default:
      return false;
  }
}

export const hasYaku: typeof _hasYaku = memoize(_hasYaku);

function _getRiichiUsers(state: IAppState): PlayerInSession[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
    case RoundOutcome.ROUND_OUTCOME_DRAW:
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      return outcome.riichiBets
        .map((r) => state.players?.find((val) => val.id === r))
        .filter((p: PlayerInSession | undefined): p is PlayerInSession => !!p);
    default:
      return [];
  }
}

export const getRiichiUsers: typeof _getRiichiUsers = memoize(_getRiichiUsers);
