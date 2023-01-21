import { IAppState } from '../interfaces';
import { yakumanInYaku } from './yaku';
import { getFu, getHan, getPossibleFu } from './hanFu';
import { getLosingUsers, getNagashiUsers, getWinningUsers } from './mimirSelectors';

export function doraOptions(state: IAppState) {
  if (yakumanInYaku(state)) {
    return [0];
  }

  if (state.gameConfig?.rulesetTitle === 'jpmlA') {
    // TODO: make withUradora/withKandora config items and use them, not title!
    return [0, 1, 2, 3, 4];
  }

  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
}

export function fuOptions(state: IAppState) {
  return getPossibleFu(state);
}

export function selectedFu(state: IAppState) {
  return getFu(state);
}

export function selectedDora(state: IAppState) {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'tsumo':
      return state.currentOutcome.dora;
    case 'ron':
      if (!state.multironCurrentWinner) {
        return 0; // data not yet loaded
      }
      return state.currentOutcome.wins[state.multironCurrentWinner].dora;
    default:
      return undefined;
  }
}

export function han(state: IAppState): number {
  return getHan(state);
}

export function mayGoNextFromYakuSelect(state: IAppState) {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'tsumo':
      return getHan(state) != 0;
    case 'ron':
      const out = state.currentOutcome;
      return getWinningUsers(state).reduce((acc, user) => acc && out.wins[user.id].han != 0, true);
    default:
      return undefined;
  }
}

export function mayGoNextFromPlayersSelect(state: IAppState) {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'tsumo':
      return getWinningUsers(state).length === 1;
    case 'draw':
    case 'abort':
    case 'nagashi':
      return true;
    case 'ron':
      return getWinningUsers(state).length >= 1 && getLosingUsers(state).length === 1;
    case 'chombo':
      return getLosingUsers(state).length === 1;
    default:
      return undefined;
  }
}

export function mayGoNextFromNagashiSelect(state: IAppState) {
  return getNagashiUsers(state).length >= 1;
}
