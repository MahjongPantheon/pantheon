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
import { memoize } from '../../helpers/memoize';
import { RoundOutcome } from '../../clients/proto/atoms.pb';

function _getHan(state: IAppState, user: number) {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return outcome.han;
    case RoundOutcome.ROUND_OUTCOME_RON:
      return outcome.wins[user].han;
    default:
      return 0;
  }
}

export const getHan = memoize(_getHan);

function _getFu(state: IAppState, user: number) {
  const outcome = state.currentOutcome;
  let han: number;
  let fu: number;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      // Don't send fu to the server for limit hands
      fu = outcome.fu;
      han = outcome.han + outcome.dora;
      if (han >= 5) {
        fu = 0;
      }
      return fu;
    case RoundOutcome.ROUND_OUTCOME_RON:
      fu = outcome.wins[user].fu;
      han = outcome.wins[user].han + outcome.wins[user].dora;
      if (han >= 5) {
        fu = 0;
      }
      return fu;
    default:
      return 0;
  }
}

export const getFu = memoize(_getFu);

function _getPossibleFu(state: IAppState, user: number) {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return outcome.possibleFu;
    case RoundOutcome.ROUND_OUTCOME_RON:
      return outcome.wins[user].possibleFu;
    default:
      return [];
  }
}

export const getPossibleFu = memoize(_getPossibleFu);

function _getDora(state: IAppState, user: number): number {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return outcome.dora;
    case RoundOutcome.ROUND_OUTCOME_RON:
      return outcome.wins[user].dora;
    default:
      return 0;
  }
}

export const getDora = memoize(_getDora);
