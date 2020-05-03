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

import {IAppState} from '../interfaces';
import { memoize } from '../../../helpers/memoize';

function _getHan(state: IAppState, user?: number) {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.han;
    case 'multiron':
      return outcome.wins[user || state.multironCurrentWinner].han;
    default:
      return 0;
  }
}

export const getHan = memoize(_getHan);

function _getFu(state: IAppState, user?: number) {
  const outcome = state.currentOutcome;
  let han: number;
  let fu: number;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      // Don't send fu to the server for limit hands
      fu = outcome.fu;
      han = outcome.han + outcome.dora;
      if (han >= 5) {
        fu = 0;
      }
      return fu;
    case 'multiron':
      fu = outcome.wins[user || state.multironCurrentWinner].fu;
      han = outcome.wins[user || state.multironCurrentWinner].han + outcome.wins[user || state.multironCurrentWinner].dora;
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
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.possibleFu;
    case 'multiron':
      return outcome.wins[state.multironCurrentWinner].possibleFu;
    default:
      return [];
  }
}

export const getPossibleFu = memoize(_getPossibleFu);

function _getDora(state: IAppState, user?: number) {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.dora;
    case 'multiron':
      return outcome.wins[user || state.multironCurrentWinner].dora;
    default:
      return 0;
  }
}

export const getDora = memoize(_getDora);
