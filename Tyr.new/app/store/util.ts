import { AppOutcome } from '#/interfaces/app';
import { LGameConfig } from '#/interfaces/local';
import { intersect } from '#/primitives/intersect';
import {unpack} from '#/primitives/yaku-compat';

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
