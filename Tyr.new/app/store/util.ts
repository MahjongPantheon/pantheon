import { AppOutcome } from '#/interfaces/app';
import { LGameConfig } from '#/interfaces/local';
import { intersect } from '#/primitives/intersect';
import {unpack} from '#/primitives/yaku-compat';
import { Action, AnyAction } from 'redux';

export function winnerHasYakuWithPao(outcome: AppOutcome, gameConfig: LGameConfig): boolean {
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return intersect(unpack(outcome.yaku), gameConfig.yakuWithPao).length > 0;
    case 'multiron':
      return Object.keys(outcome.wins).reduce<boolean>((acc, playerId) => {
        return acc || (intersect(unpack(outcome.wins[playerId].yaku), gameConfig.yakuWithPao).length > 0);
      }, false);
    default:
      throw new Error('No pao exist on this outcome');
  }
}

type RReducer<S = any, A extends Action = AnyAction> = (state: S, action: A) => S;
export const reduceReducers = <S, A extends Action>(initialState: S, reducers: RReducer<S, A>[]) => {
  return (prevState: S, value: A) => {
    const valueIsUndefined = typeof value === 'undefined';

    if (valueIsUndefined && initialState) {
      return initialState;
    }

    return reducers.reduce((newState, reducer, index) => {
      if (typeof reducer === 'undefined') {
        throw new TypeError(
          `An undefined reducer was passed in at index ${index}`
        );
      }

      return reducer(newState, value);
    }, initialState);
  };
};
