import {IAppState} from "../interfaces";
import {LGameConfig, LWinItem} from "../../../interfaces/local";
import {Player} from "../../../interfaces/common";
import {YakuId} from "../../../primitives/yaku";
import {AppOutcome} from "../../../interfaces/app";
import {intersection} from "lodash";
import {unpack} from "../../../primitives/yaku-compat";

export function mimirSelector(state: IAppState) {}

function getWins(state: IAppState): LWinItem[] {
  switch (state.currentOutcome.selectedOutcome) {
    case 'multiron':
      let wins: LWinItem[] = [];
      for (let i in state.currentOutcome.wins) {
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
          yaku: v.yaku,
          openHand: v.openHand
        });
      }
      return wins;
    default:
      return [];
  }
}

function getMultiRonCount(state: IAppState): number {
  switch (state.currentOutcome.selectedOutcome) {
    case 'multiron':
      return state.currentOutcome.multiRon;
    default:
      return 0;
  }
}

function getEventTitle(state: IAppState): string {
  if (state.isUniversalWatcher) {
    return i18n._t('Games overview');
  } else {
    return state.gameConfig && state.gameConfig.eventTitle || i18n._t('Loading...');
  }
}

function getGameConfig(state:IAppState, key: string) {
  return state.gameConfig && state.gameConfig[key];
}

function winnerHasYakuWithPao(state: IAppState): boolean {
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

function getOutcome(state: IAppState) {
  return state.currentOutcome && state.currentOutcome.selectedOutcome;
}


type PMap = { [key: number]: Player };

function getWinningUsers(state: IAppState, playerIdMap: PMap): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.winner
        ? [playerIdMap[outcome.winner]]
        : [];
    case 'multiron':
      let users = [];
      for (let w in outcome.wins) {
        users.push(playerIdMap[outcome.wins[w].winner]);
      }
      return users;
    case 'draw':
    case 'nagashi':
      return outcome.tempai.map((t) => playerIdMap[t]);
    default:
      return [];
  }
}

function getLosingUsers(state: IAppState, playerIdMap: PMap): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'multiron':
    case 'chombo':
      return outcome.loser
        ? [playerIdMap[outcome.loser]]
        : [];
    default:
      return [];
  }
}

function getPaoUsers(state: IAppState, playerIdMap: PMap): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return outcome.paoPlayerId
        ? [playerIdMap[outcome.paoPlayerId]]
        : [];
    case 'multiron':
      return Object.keys(outcome.wins).reduce<Player[]>((acc, playerId) => {
        if (outcome.wins[playerId].paoPlayerId) {
          acc.push(playerIdMap[outcome.wins[playerId].paoPlayerId]);
        }
        return acc;
      }, []);
    default:
      return [];
  }
}

function getDeadhandUsers(state: IAppState, playerIdMap: PMap): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'draw':
    case 'nagashi':
      return outcome.deadhands.map((t) => playerIdMap[t]);
    default:
      return [];
  }
}

function getNagashiUsers(state: IAppState, playerIdMap: PMap): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'nagashi':
      return outcome.nagashi.map((t) => playerIdMap[t]);
    default:
      return [];
  }
}

// TODO: this should be done in UI - check
function hasYaku(state: IAppState, id: YakuId) {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return -1 !== outcome.yaku.indexOf(id);
    case 'multiron':
      return -1 !== outcome.wins[state.multironCurrentWinner].yaku.indexOf(id);
    default:
      return false;
  }
}


function getRiichiUsers(state: IAppState, playerIdMap: PMap): Player[] {
  const outcome = state.currentOutcome;
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
    case 'draw':
    case 'nagashi':
    case 'abort':
    case 'multiron':
      return outcome.riichiBets.map((r) => playerIdMap[r]);
    default:
      return [];
  }
}

