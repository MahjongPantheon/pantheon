import {intersection} from 'lodash';
import {unpack} from '../../../primitives/yaku-compat';
import {
  getDeadhandUsers,
  getLosingUsers,
  getNagashiUsers,
  getPaoUsers,
  getRiichiUsers,
  getWinningUsers
} from './mimirSelectors';
import {IAppState} from '../interfaces';
import {Player} from "../../../interfaces/common";

export function showWinButton(state: IAppState) {
  return -1 !== ['ron', 'multiron', 'tsumo', 'draw', 'nagashi']
    .indexOf(state.currentOutcome.selectedOutcome) && state.currentScreen !== 'paoSelect' && state.currentScreen !== 'nagashiSelect';
}

export function showPaoButton(state: IAppState) {
  if (state.currentScreen !== 'paoSelect') {
    return false;
  }

  switch (state.currentOutcome.selectedOutcome) {
    case 'ron':
      return state.currentOutcome.winner !== this.userData.id && state.currentOutcome.loser !== this.userData.id;
    case 'tsumo':
      return state.currentOutcome.winner !== this.userData.id;
    case 'multiron':
      // no pao for loser and winner with yakuman
      if (state.currentOutcome.loser === this.userData.id) {
        return false;
      }
      for (let idx in state.currentOutcome.wins) {
        let win = state.currentOutcome.wins[idx];
        if (
          win.winner === this.userData.id &&
          intersection(unpack(win.yaku), state.gameConfig.yakuWithPao).length !== 0
        ) {
          return false;
        }
      }
      return true;
  }
}

export function showLoseButton(state: IAppState) {
  return -1 !== ['ron', 'multiron', 'chombo']
    .indexOf(state.currentOutcome.selectedOutcome) && state.currentScreen !== 'paoSelect' && state.currentScreen !== 'nagashiSelect';
}

export function showRiichiButton(state: IAppState) {
  return -1 !== ['ron', 'multiron', 'tsumo', 'abort', 'draw', 'nagashi']
    .indexOf(state.currentOutcome.selectedOutcome) && state.currentScreen !== 'paoSelect' && state.currentScreen !== 'nagashiSelect';
}

export function showDeadButton(state: IAppState) {
  return -1 !== ['draw', 'nagashi']
    .indexOf(state.currentOutcome.selectedOutcome) && state.currentScreen !== 'paoSelect' && state.currentScreen !== 'nagashiSelect';
}

export function showNagashiButton(state: IAppState) {
  return -1 !== ['nagashi']
    .indexOf(state.currentOutcome.selectedOutcome) && state.currentScreen !== 'paoSelect' && state.currentScreen === 'nagashiSelect';
}

export function winPressed(state: IAppState, userData: Player) {
  return -1 !== getWinningUsers(state).indexOf(userData);
}

export function losePressed(state: IAppState, userData: Player) {
  return -1 !== getLosingUsers(state).indexOf(userData);
}

export function paoPressed(state: IAppState, userData: Player) {
  return -1 !== getPaoUsers(state).indexOf(userData);
}

export function riichiPressed(state: IAppState, userData: Player) {
  return -1 !== getRiichiUsers(state).indexOf(userData);
}

export function deadPressed(state: IAppState, userData: Player) {
  return -1 !== getDeadhandUsers(state).indexOf(userData);
}

export function nagashiPressed(state: IAppState, userData: Player) {
  return -1 !== getNagashiUsers(state).indexOf(userData);
}

export function winDisabled(state: IAppState, userData: Player) {
  if (-1 !== ['draw', 'nagashi'].indexOf(state.currentOutcome.selectedOutcome)) {
    return -1 !== getDeadhandUsers(state).indexOf(userData)
  }

  if (state.currentOutcome.selectedOutcome === 'multiron') {
    return -1 !== getLosingUsers(state).indexOf(userData)
  }

  // for ron/tsumo winner is only one
  return (
    getWinningUsers(state).length > 0
    && -1 === getWinningUsers(state).indexOf(userData)
  ) || -1 !== getLosingUsers(state).indexOf(userData); // and it should not be current loser
}

// for ron/multiron/chombo - loser is only one
export function loseDisabled(state: IAppState, userData: Player) {
  return (
    getLosingUsers(state).length > 0
    && -1 === getLosingUsers(state).indexOf(userData)
  ) || -1 !== getWinningUsers(state).indexOf(userData); // and it should not be current winner
}

// no more than 3 players may have nagashi
export function nagashiDisabled(state: IAppState, userData: Player) {
  return getNagashiUsers(state).length >= 3
    && -1 === getNagashiUsers(state).indexOf(userData);
}

// riichi & dead hand can't be disabled
