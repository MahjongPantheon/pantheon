import {IAppState} from '../interfaces';
import {yakumanInYaku} from './yaku';
import {getFu, getHan, getPossibleFu} from './hanFu';
import {getEventTitle, getLosingUsers, getNagashiUsers, getWinningUsers} from './mimirSelectors';

export function doraOptions(state: IAppState) {
  if (yakumanInYaku(state)) {
    return [0];
  }

  if (state.gameConfig.rulesetTitle === 'jpmlA') {
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
  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return state.currentOutcome.dora;
    case 'multiron':
      return state.currentOutcome.wins[state.multironCurrentWinner].dora;
    default:
      return null;
  }
}

export function isMultiron(state: IAppState) {
  return state.currentOutcome.selectedOutcome === 'multiron';
}

// TODO: not really a selector
export function multironTitle(state: IAppState) {
  if (state.currentOutcome.selectedOutcome === 'multiron' && state.currentOutcome.multiRon === 3) {
    return i18n._t('Triple ron');
  }
  if (state.currentOutcome.selectedOutcome === 'multiron' && state.currentOutcome.multiRon === 2) {
    return i18n._t('Double ron');
  }
}

// TODO: not really a selector
export function outcome(state: IAppState) {
  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
      return i18n._t('Ron');
    case 'multiron':
      return i18n._t('Double/Triple ron');
    case 'tsumo':
      return i18n._t('Tsumo');
    case 'draw':
      return i18n._t('Exhaustive draw');
    case 'abort':
      return i18n._t('Abortive draw');
    case 'nagashi':
      return i18n._t('Nagashi: select tenpai');
    case 'chombo':
      return i18n._t('Chombo');
    default:
      return '';
  }
}

export function han(state: IAppState): number {
  return getHan(state);
}

export function tournamentTitle(state: IAppState): string {
  return getEventTitle(state);
}

export function mayGoNextFromYakuSelect(state: IAppState) {
  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return getHan(state) != 0;
    case 'multiron':
      const out = state.currentOutcome;
      return getWinningUsers(state)
        .reduce((acc, user) => acc && (out.wins[user.id].han != 0), true);
  }
}

export function mayGoNextFromPlayersSelect(state: IAppState) {
  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
      return getWinningUsers(state).length === 1
        && getLosingUsers(state).length === 1;
    case 'tsumo':
      return getWinningUsers(state).length === 1;
    case 'draw':
    case 'abort':
    case 'nagashi':
      return true;
    case 'multiron':
      return getWinningUsers(state).length >= 1
        && getLosingUsers(state).length === 1;
    case 'chombo':
      return getLosingUsers(state).length === 1;
  }
}

export function mayGoNextFromNagashiSelect(state: IAppState) {
  return getNagashiUsers(state).length >= 1;
}
