import { intersect } from '#/primitives/intersect';
import { unpack } from '#/primitives/yaku-compat';
import {
  getDeadhandUsers,
  getLosingUsers,
  getNagashiUsers,
  getRiichiUsers,
  getWinningUsers,
} from './mimirSelectors';
import { IAppState } from '../interfaces';
import { Player } from '#/interfaces/common';

export function showWinButton(state: IAppState) {
  if (!state.currentOutcome) {
    return false;
  }
  return (
    -1 !== ['ron', 'tsumo', 'draw', 'nagashi'].indexOf(state.currentOutcome.selectedOutcome) &&
    state.currentScreen !== 'paoSelect' &&
    state.currentScreen !== 'nagashiSelect'
  );
}

export function showPaoButton(state: IAppState) {
  if (!state.gameConfig || state.currentScreen !== 'paoSelect') {
    return false;
  }

  switch (state.currentOutcome?.selectedOutcome) {
    case 'tsumo':
      return state.currentOutcome.winner !== state.currentPlayerId;
    case 'ron': // todo check
      // no pao for loser and winner with yakuman
      if (state.currentOutcome.loser === state.currentPlayerId) {
        return false;
      }
      for (const idx in state.currentOutcome.wins) {
        if (!state.currentOutcome.wins.hasOwnProperty(idx)) {
          continue;
        }
        const win = state.currentOutcome.wins[idx];
        if (
          win.winner === state.currentPlayerId &&
          intersect(unpack(win.yaku), state.gameConfig.yakuWithPao).length !== 0
        ) {
          return false;
        }
      }
      return true;
    default:
      return undefined;
  }
}

export function showLoseButton(state: IAppState) {
  if (!state.currentOutcome) {
    return false;
  }
  return (
    -1 !== ['ron', 'chombo'].indexOf(state.currentOutcome.selectedOutcome) &&
    state.currentScreen !== 'paoSelect' &&
    state.currentScreen !== 'nagashiSelect'
  );
}

export function showRiichiButton(state: IAppState) {
  if (!state.currentOutcome) {
    return false;
  }
  return (
    -1 !==
      ['ron', 'tsumo', 'abort', 'draw', 'nagashi'].indexOf(state.currentOutcome.selectedOutcome) &&
    state.currentScreen !== 'paoSelect' &&
    state.currentScreen !== 'nagashiSelect'
  );
}

export function showDeadButton(state: IAppState) {
  if (!state.currentOutcome) {
    return false;
  }
  return (
    -1 !== ['draw', 'nagashi'].indexOf(state.currentOutcome.selectedOutcome) &&
    state.currentScreen !== 'paoSelect' &&
    state.currentScreen !== 'nagashiSelect'
  );
}

export function showNagashiButton(state: IAppState) {
  if (!state.currentOutcome) {
    return false;
  }
  return (
    -1 !== ['nagashi'].indexOf(state.currentOutcome.selectedOutcome) &&
    state.currentScreen !== 'paoSelect' &&
    state.currentScreen === 'nagashiSelect'
  );
}

export function winPressed(state: IAppState, userData: Player) {
  return -1 !== getWinningUsers(state).indexOf(userData);
}

export function losePressed(state: IAppState, userData: Player) {
  return -1 !== getLosingUsers(state).indexOf(userData);
}

export function paoPressed(state: IAppState, userData: Player) {
  switch (state.currentOutcome?.selectedOutcome) {
    case 'ron':
      if (state.multironCurrentWinner) {
        return state.currentOutcome.wins[state.multironCurrentWinner].paoPlayerId === userData.id;
      }
      break;
    case 'tsumo':
      return state.currentOutcome.paoPlayerId === userData.id;
    default:
  }
  return false;
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
  if (!state.currentOutcome) {
    return false;
  }

  if (-1 !== ['draw', 'nagashi'].indexOf(state.currentOutcome.selectedOutcome)) {
    return -1 !== getDeadhandUsers(state).indexOf(userData);
  }

  // for multiron
  if (state.currentOutcome.selectedOutcome === 'ron' && !state.gameConfig?.withAtamahane) {
    return -1 !== getLosingUsers(state).indexOf(userData);
  }

  // for tsumo and ron without atamahane winner is only one
  return (
    (getWinningUsers(state).length > 0 && -1 === getWinningUsers(state).indexOf(userData)) ||
    -1 !== getLosingUsers(state).indexOf(userData)
  ); // and it should not be current loser
}

// for ron/chombo - loser is only one
export function loseDisabled(state: IAppState, userData: Player) {
  return (
    (getLosingUsers(state).length > 0 && -1 === getLosingUsers(state).indexOf(userData)) ||
    -1 !== getWinningUsers(state).indexOf(userData)
  ); // and it should not be current winner
}

// no more than 3 players may have nagashi
export function nagashiDisabled(state: IAppState, userData: Player) {
  return getNagashiUsers(state).length >= 3 && -1 === getNagashiUsers(state).indexOf(userData);
}

export function paoDisabled(_state: IAppState, _userData: Player) {}

// riichi & dead hand can't be disabled
