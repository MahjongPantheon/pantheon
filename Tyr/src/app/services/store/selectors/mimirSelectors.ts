import { IAppState } from '../interfaces';
import { LGameConfig, LWinItem } from '../../../interfaces/local';
import { Player } from '../../../interfaces/common';
import { YakuId } from '../../../primitives/yaku';
import { AppOutcome } from '../../../interfaces/app';
import { intersection } from 'lodash';
import { unpack } from '../../../primitives/yaku-compat';
import { memoize } from '../../../helpers/memoize';
import { I18nService } from '../../i18n';

function _getWins(state: IAppState): LWinItem[] {
  switch (state.currentOutcome.selectedOutcome) {
    case 'multiron':
      let wins: LWinItem[] = [];
      for (let i in state.currentOutcome.wins) {
        if (!state.currentOutcome.wins.hasOwnProperty(i)) {
          continue;
        }
        let v = state.currentOutcome.wins[i];
        wins.push({
          winner: v.winner,
          han: v.han,
          fu: v.fu,
          dora: v.dora,
          paoPlayerId: v.paoPlayerId,
          uradora: 0,
          kandora: 0,
          kanuradora: 0,
          yaku: unpack(v.yaku),
          openHand: v.openHand
        });
      }
      return wins;
    default:
      return [];
  }
}

export const getWins = memoize(_getWins);

export function getMultiRonCount(state: IAppState): number {
  switch (state.currentOutcome.selectedOutcome) {
    case 'multiron':
      return state.currentOutcome.multiRon;
    default:
      return 0;
  }
}

export function getEventTitle(i18n: I18nService, state: IAppState): string {
  if (state.isUniversalWatcher) {
    return i18n._t('Games overview');
  } else {
    return state.gameConfig && state.gameConfig.eventTitle || i18n._t('Loading...');
  }
}

export function getGameConfig(state: IAppState, key: string) {
  return state.gameConfig && state.gameConfig[key];
}

function _winnerHasYakuWithPao(state: IAppState): boolean {
  const outcome: AppOutcome = state.currentOutcome;
  const gameConfig: LGameConfig = state.gameConfig;
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return intersection(unpack(outcome.yaku), gameConfig.yakuWithPao).length > 0;
    case 'multiron':
      return Object.keys(outcome.wins).reduce<boolean>((acc, playerId) => {
        return acc || (intersection(unpack(outcome.wins[playerId].yaku), gameConfig.yakuWithPao).length > 0);
      }, false);
    default:
      throw new Error('No pao exist on this outcome');
  }
}

export const winnerHasYakuWithPao = memoize(_winnerHasYakuWithPao);

export function getOutcome(state: IAppState) {
  return state.currentOutcome && state.currentOutcome.selectedOutcome;
}

function _getWinningUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.winner
        ? [state.players.find((val) => val.id === outcome.winner)]
        : [];
    case 'multiron':
      let users = [];
      for (let w in outcome.wins) {
        if (!outcome.wins.hasOwnProperty(w)) {
          continue;
        }
        users.push(state.players.find((val) => val.id === outcome.wins[w].winner));
      }
      return users;
    case 'draw':
    case 'nagashi':
      return outcome.tempai.map((t) => state.players.find((val) => val.id === t));
    default:
      return [];
  }
}

export const getWinningUsers = memoize(_getWinningUsers);

function _getLosingUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'multiron':
    case 'chombo':
      return outcome.loser
        ? [state.players.find((val) => val.id === outcome.loser)]
        : [];
    default:
      return [];
  }
}

export const getLosingUsers = memoize(_getLosingUsers);

function _getPaoUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.paoPlayerId
        ? [state.players.find((val) => val.id === outcome.paoPlayerId)]
        : [];
    case 'multiron':
      return Object.keys(outcome.wins).reduce<Player[]>((acc, playerId) => {
        if (outcome.wins[playerId].paoPlayerId) {
          acc.push(state.players.find((val) => val.id === outcome.wins[playerId].paoPlayerId));
        }
        return acc;
      }, []);
    default:
      return [];
  }
}

export const getPaoUsers = memoize(_getPaoUsers);

function _getDeadhandUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'draw':
    case 'nagashi':
      return outcome.deadhands.map((t) => state.players.find((val) => val.id === t));
    default:
      return [];
  }
}

export const getDeadhandUsers = memoize(_getDeadhandUsers);

function _getNagashiUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'nagashi':
      return outcome.nagashi.map((t) => state.players.find((val) => val.id === t));
    default:
      return [];
  }
}

export const getNagashiUsers = memoize(_getNagashiUsers);

// TODO: this should be done in UI - check
function _hasYaku(state: IAppState, id: YakuId) {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return -1 !== unpack(outcome.yaku).indexOf(id);
    case 'multiron':
      return -1 !== unpack(outcome.wins[state.multironCurrentWinner].yaku).indexOf(id);
    default:
      return false;
  }
}

export const hasYaku = memoize(_hasYaku);

function _getRiichiUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
    case 'draw':
    case 'nagashi':
    case 'abort':
    case 'multiron':
      return outcome.riichiBets.map((r) => state.players.find((val) => val.id === r));
    default:
      return [];
  }
}

export const getRiichiUsers = memoize(_getRiichiUsers);

function _getCurrentTimerZone(state: IAppState) {
  let zoneLength;
  switch (state.gameConfig.timerPolicy) {
    case 'redZone':
      zoneLength = state.gameConfig.redZone;
      if (zoneLength && (state.timer.secondsRemaining < zoneLength) && !state.timer.waiting) {
        return 'redZone';
      }
      break;
    case 'yellowZone':
      zoneLength = state.gameConfig.yellowZone;
      if (zoneLength && (state.timer.secondsRemaining < zoneLength) && !state.timer.waiting) {
        return state.yellowZoneAlreadyPlayed ? 'redZone' : 'yellowZone';
      }
      break;
    default:
  }
  return 'none';
}

export const getCurrentTimerZone = memoize(_getCurrentTimerZone);
