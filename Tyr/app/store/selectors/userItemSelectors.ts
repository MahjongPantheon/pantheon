import {
  getDeadhandUsers,
  getLosingUsers,
  getNagashiUsers,
  getRiichiUsers,
  getWinningUsers,
} from './mimirSelectors';
import { IAppState } from '../interfaces';
import { PlayerInSession } from '#/clients/atoms.pb';

export function winPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getWinningUsers(state).indexOf(userData);
}

export function losePressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getLosingUsers(state).indexOf(userData);
}

export function paoPressed(state: IAppState, userData: PlayerInSession) {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'RON':
      if (state.multironCurrentWinner) {
        return state.currentOutcome.wins[state.multironCurrentWinner].paoPlayerId === userData.id;
      }
      break;
    case 'TSUMO':
      return state.currentOutcome.paoPlayerId === userData.id;
    default:
  }
  return false;
}

export function riichiPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getRiichiUsers(state).indexOf(userData);
}

export function deadPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getDeadhandUsers(state).indexOf(userData);
}

export function nagashiPressed(state: IAppState, userData: PlayerInSession) {
  return -1 !== getNagashiUsers(state).indexOf(userData);
}

export function winDisabled(state: IAppState, userData: PlayerInSession) {
  if (!state.currentOutcome) {
    return false;
  }

  if (-1 !== ['DRAW', 'NAGASHI'].indexOf(state.currentOutcome.selectedOutcome)) {
    return -1 !== getDeadhandUsers(state).indexOf(userData);
  }

  // for multiron
  if (
    state.currentOutcome.selectedOutcome === 'RON' &&
    !state.gameConfig?.rulesetConfig.withAtamahane
  ) {
    return -1 !== getLosingUsers(state).indexOf(userData);
  }

  // for tsumo and ron without atamahane winner is only one
  return (
    (getWinningUsers(state).length > 0 && -1 === getWinningUsers(state).indexOf(userData)) ||
    -1 !== getLosingUsers(state).indexOf(userData)
  ); // and it should not be current loser
}

// for ron/chombo - loser is only one
export function loseDisabled(state: IAppState, userData: PlayerInSession) {
  return (
    (getLosingUsers(state).length > 0 && -1 === getLosingUsers(state).indexOf(userData)) ||
    -1 !== getWinningUsers(state).indexOf(userData)
  ); // and it should not be current winner
}

// no more than 3 players may have nagashi
export function nagashiDisabled(state: IAppState, userData: PlayerInSession) {
  return getNagashiUsers(state).length >= 3 && -1 === getNagashiUsers(state).indexOf(userData);
}
