import { AppOutcome } from '#/interfaces/app';
import { LGameConfig } from '#/interfaces/local';
import { intersect } from '#/primitives/intersect';
import { unpack } from '#/primitives/yaku-compat';
import { Action, AnyAction } from 'redux';

export function playerHasYakuWithPao(yakuPack: string, gameConfig: LGameConfig): boolean {
  return intersect(unpack(yakuPack), gameConfig.yakuWithPao).length > 0;
}

export function winnerHasYakuWithPao(outcome: AppOutcome, gameConfig: LGameConfig): boolean {
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'tsumo':
      return playerHasYakuWithPao(outcome.yaku, gameConfig);
    case 'ron':
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
