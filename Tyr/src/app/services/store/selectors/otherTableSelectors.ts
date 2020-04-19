import {YakuId, yakuMap} from '../../../primitives/yaku';
import {RRoundPaymentsInfo} from '../../../interfaces/remote';
import { memoize } from 'lodash';
import {Player} from '../../../interfaces/common';

// Other table's last round sub-screen specific selectors

function _getWins(info: RRoundPaymentsInfo, players: Player[]): Array<{ winner: string, loser: string, han: number, fu: number, dora: number, yakuList: string }> {
  switch (info.outcome) {
    case 'ron':
    case 'tsumo':
      return [{
        winner: _getPlayerName(players, info.winner),
        loser: _getLoserName(info, players),
        yakuList: _getYakuList(info.yaku),
        han: info.han,
        fu: info.fu,
        dora: info.dora
      }];
    case 'multiron':
      let wins = [];
      for (let idx in info.winner) {
        wins.push({
          winner: _getPlayerName(players, info.winner[idx]),
          loser: _getLoserName(info, players),
          yakuList: _getYakuList(info.yaku[idx]),
          han: info.han[idx],
          fu: info.fu[idx],
          dora: info.dora[idx]
        });
      }
      return wins;
    }
}

export const getWins = memoize(_getWins);

export function getPenalty(info: RRoundPaymentsInfo, players: Player[]) {
  if (info.outcome !== 'chombo') {
    return;
  }
  return _getPlayerName(players, info.penaltyFor);
}

function _getTempaiPlayers(info: RRoundPaymentsInfo, players: Player[]) {
  if (info.outcome !== 'draw') {
    return;
  }

  return Object.keys(info.payments.direct)
    .map((i) => parseInt(i.split('<-')[0], 10))
    .filter((value, index, self) => self.indexOf(value) === index)
    .map((i) => _getPlayerName(players, i))
    .join(', ');
}

export const getTempaiPlayers = memoize(_getTempaiPlayers);

function _getNotenPlayers(info: RRoundPaymentsInfo, players: Player[]) {
  if (info.outcome !== 'draw') {
    return;
  }
  return Object.keys(info.payments.direct)
    .map((i) => parseInt(i.split('<-')[1], 10))
    .filter((value, index, self) => self.indexOf(value) === index)
    .map((i) => _getPlayerName(players, i))
    .join(', ');
}

export const getNotenPlayers = memoize(_getNotenPlayers);

function _getRiichiPlayers(info: RRoundPaymentsInfo, players: Player[]) {
  return info.riichiIds.map(
    (p) => _getPlayerName(players, parseInt(p, 10))
  ).join(', ');
}

export const getRiichiPlayers = memoize(_getRiichiPlayers);

function _getYakuList(str: string) {
  const yakuIds: YakuId[] = str.split(',').map((y) => parseInt(y, 10));
  const yakuNames: string[] = yakuIds.map((y) => yakuMap[y].name(i18n).toLowerCase()); // TODO
  return yakuNames.join(', ');
}

function _getPlayerName(players: Player[], playerId: number): string {
  for (let i in players) {
    if (players[i].id == playerId) {
      return players[i].displayName;
    }
  }
  return '';
}

function _getLoserName(info: RRoundPaymentsInfo, players: Player[]) {
  for (let i in info.payments.direct) {
    return _getPlayerName(players, parseInt(i.split('<-')[1], 10));
  }
}
