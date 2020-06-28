import { IAppState } from '../interfaces';
import { LGameConfig, LWinItem } from '#/interfaces/local';
import { Player } from '#/interfaces/common';
import { YakuId } from '#/primitives/yaku';
import { AppOutcome } from '#/interfaces/app';
import { intersect } from '#/primitives/intersect';
import { unpack } from '#/primitives/yaku-compat';
import { memoize } from '#/primitives/memoize';
import { I18nService } from '#/services/i18n';

function _getWins(state: IAppState): LWinItem[] {
  switch (state.currentOutcome?.selectedOutcome) {
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

export const getWins: typeof _getWins = memoize(_getWins);

export function getMultiRonCount(state: IAppState): number {
  switch (state.currentOutcome?.selectedOutcome) {
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

export function getGameConfig(state: IAppState, key: keyof LGameConfig) {
  return state.gameConfig && state.gameConfig[key];
}

function _winnerHasYakuWithPao(state: IAppState): boolean {
  const outcome: AppOutcome | undefined = state.currentOutcome;
  const gameConfig: LGameConfig = state.gameConfig;
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

export const winnerHasYakuWithPao: typeof _winnerHasYakuWithPao = memoize(_winnerHasYakuWithPao);

export function getOutcome(state: IAppState) {
  return state.currentOutcome && state.currentOutcome.selectedOutcome;
}

function _getWinningUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      const foundWinner = outcome.winner && state.players?.find((val) => val.id === outcome.winner);
      return foundWinner ? [foundWinner] : [];
    case 'multiron':
      let users: Player[] = [];
      for (let w in outcome.wins) {
        if (!outcome.wins.hasOwnProperty(w)) {
          continue;
        }
        const foundWinner = state.players?.find((val) => val.id === outcome.wins[w].winner);
        if (foundWinner) {
          users.push(foundWinner);
        }
      }
      return users;
    case 'draw':
    case 'nagashi':
      return outcome.tempai.map((t) => state.players?.find((val) => val.id === t))
        .filter((p: Player | undefined): p is Player => !!p);
    default:
      return [];
  }
}

export const getWinningUsers: typeof _getWinningUsers = memoize(_getWinningUsers);

function _getLosingUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'ron':
    case 'multiron':
    case 'chombo':
      const foundLoser = state.players?.find((val) => val.id === outcome.loser);
      return foundLoser ? [foundLoser] : [];
    default:
      return [];
  }
}

export const getLosingUsers: typeof _getLosingUsers = memoize(_getLosingUsers);

function _getPaoUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      const foundPao = outcome.paoPlayerId && state.players?.find((val) => val.id === outcome.paoPlayerId);
      return foundPao ? [foundPao] : [];
    case 'multiron':
      return Object.keys(outcome.wins).reduce<Player[]>((acc, playerId) => {
        if (outcome.wins[playerId].paoPlayerId) {
          const foundPao = state.players?.find((val) => val.id === outcome.wins[playerId].paoPlayerId);
          if (foundPao) {
            acc.push(foundPao);
          }
        }
        return acc;
      }, []);
    default:
      return [];
  }
}

export const getPaoUsers: typeof _getPaoUsers = memoize(_getPaoUsers);

function _getDeadhandUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'draw':
    case 'nagashi':
      return outcome.deadhands.map((t) => state.players?.find((val) => val.id === t))
        .filter((p: Player | undefined): p is Player => !!p);
    default:
      return [];
  }
}

export const getDeadhandUsers: typeof _getDeadhandUsers = memoize(_getDeadhandUsers);

function _getNagashiUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'nagashi':
      return outcome.nagashi.map((t) => state.players?.find((val) => val.id === t))
        .filter((p: Player | undefined): p is Player => !!p);
    default:
      return [];
  }
}

export const getNagashiUsers: typeof _getNagashiUsers = memoize(_getNagashiUsers);

function _hasYaku(state: IAppState, id: YakuId) {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return -1 !== unpack(outcome.yaku).indexOf(id);
    case 'multiron':
      if (!state.multironCurrentWinner) {
        throw new Error('No winner selected');
      }
      return -1 !== unpack(outcome.wins[state.multironCurrentWinner].yaku).indexOf(id);
    default:
      return false;
  }
}

export const hasYaku: typeof _hasYaku = memoize(_hasYaku);

function _getRiichiUsers(state: IAppState): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'ron':
    case 'tsumo':
    case 'draw':
    case 'nagashi':
    case 'abort':
    case 'multiron':
      return outcome.riichiBets.map((r) => state.players?.find((val) => val.id === r))
        .filter((p: Player | undefined): p is Player => !!p);
    default:
      return [];
  }
}

export const getRiichiUsers: typeof _getRiichiUsers = memoize(_getRiichiUsers);

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

export const getCurrentTimerZone: typeof _getCurrentTimerZone = memoize(_getCurrentTimerZone);
