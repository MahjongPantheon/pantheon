import { AppOutcome } from '#/interfaces/app';
import { intersect } from '#/primitives/intersect';
import { unpack } from '#/primitives/yaku-compat';
import { Action, AnyAction } from 'redux';
import { GameConfig } from '#/clients/atoms.pb';

export function playerHasYakuWithPao(yakuPack: string, gameConfig: GameConfig): boolean {
  return intersect(unpack(yakuPack), gameConfig.rulesetConfig.yakuWithPao).length > 0;
}

export function winnerHasYakuWithPao(outcome: AppOutcome, gameConfig: GameConfig): boolean {
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'TSUMO':
      return playerHasYakuWithPao(outcome.yaku, gameConfig);
    case 'RON':
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
