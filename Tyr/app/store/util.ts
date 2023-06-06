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

import { AppOutcome } from '../interfaces/app';
import { intersect } from '../primitives/intersect';
import { unpack } from '../primitives/yaku-compat';
import { Action, AnyAction } from 'redux';
import { GameConfig, RoundOutcome } from '../clients/proto/atoms.pb';

export function playerHasYakuWithPao(yakuPack: string, gameConfig: GameConfig): boolean {
  return intersect(unpack(yakuPack), gameConfig.rulesetConfig.yakuWithPao).length > 0;
}

export function winnerHasYakuWithPao(outcome: AppOutcome, gameConfig: GameConfig): boolean {
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return playerHasYakuWithPao(outcome.yaku, gameConfig);
    case RoundOutcome.ROUND_OUTCOME_RON:
      return Object.keys(outcome.wins).reduce<boolean>((acc, playerId) => {
        return acc || playerHasYakuWithPao(outcome.wins[playerId].yaku, gameConfig);
      }, false);
    default:
      throw new Error('No pao exist on this outcome');
  }
}

type RReducer<S = any, A extends Action = AnyAction> = (state: S, action: A) => S;
export const reduceReducers = <S, A extends Action>(
  initialState: S,
  reducers: RReducer<S, A>[]
) => {
  return (prevState: S, value: A) => {
    const valueIsUndefined = typeof value === 'undefined';

    if (valueIsUndefined && initialState) {
      return initialState;
    }

    return reducers.reduce((newState, reducer, index) => {
      if (typeof reducer === 'undefined') {
        throw new TypeError(`An undefined reducer was passed in at index ${index}`);
      }

      return reducer(newState, value);
    }, prevState || initialState);
  };
};
