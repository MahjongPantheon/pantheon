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
import { memoize } from '#/primitives/memoize';

function _getHan(state: IAppState, user?: number) {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'TSUMO':
      return outcome.han;
    case 'RON':
      const selected = user ?? state.multironCurrentWinner;
      if (!selected) {
        return 0; // data not loaded yet
      }
      return outcome.wins[selected].han;
    default:
      return 0;
  }
}

export const getHan = memoize(_getHan);

function _getFu(state: IAppState, user?: number) {
  const outcome = state.currentOutcome;
  let han: number;
  let fu: number;
  switch (outcome?.selectedOutcome) {
    case 'TSUMO':
      // Don't send fu to the server for limit hands
      fu = outcome.fu;
      han = outcome.han + outcome.dora;
      if (han >= 5) {
        fu = 0;
      }
      return fu;
    case 'RON':
      const selected = user ?? state.multironCurrentWinner;
      if (!selected) {
        return 0; // data not loaded yet
      }
      fu = outcome.wins[selected].fu;
      han = outcome.wins[selected].han + outcome.wins[selected].dora;
      if (han >= 5) {
        fu = 0;
      }
      return fu;
    default:
      return 0;
  }
}

export const getFu = memoize(_getFu);

function _getPossibleFu(state: IAppState) {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'TSUMO':
      return outcome.possibleFu;
    case 'RON':
      if (!state.multironCurrentWinner) {
        return []; // data not loaded yet
      }
      return outcome.wins[state.multironCurrentWinner].possibleFu;
    default:
      return [];
  }
}

export const getPossibleFu = memoize(_getPossibleFu);

function _getDora(state: IAppState, user?: number): number {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'TSUMO':
      return outcome.dora;
    case 'RON':
      const selected = user ?? state.multironCurrentWinner;
      if (!selected) {
        return 0; // data not loaded yet
      }
      return outcome.wins[selected].dora;
    default:
      return 0;
  }
}

export const getDora = memoize(_getDora);
