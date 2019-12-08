import { AppOutcome } from "../../interfaces/app";
import { LGameConfig } from "../../interfaces/local";
import { intersection } from "lodash";

export function winnerHasYakuWithPao(outcome: AppOutcome, gameConfig: LGameConfig): boolean {
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return intersection(outcome.yaku, gameConfig.yakuWithPao).length > 0;
    case 'multiron':
      return Object.keys(outcome.wins).reduce<boolean>((acc, playerId) => {
        return acc || (intersection(outcome.wins[playerId].yaku, gameConfig.yakuWithPao).length > 0);
      }, false);
    default:
      throw new Error('No pao exist on this outcome');
  }
}
