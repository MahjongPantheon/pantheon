import { YakuId, yakuMap } from '#/primitives/yaku';
import { RRoundPaymentsInfo } from '#/interfaces/remote';
import { memoize } from '#/primitives/memoize';
import { Player } from '#/interfaces/common';
import { I18nService } from '#/services/i18n';

// Last round sub-screen specific selectors (both for other table and for current table)

type WinState = Array<{
  winner: string;
  loser?: string;
  han: number;
  fu: number;
  dora: number;
  yakuList: string;
}>;
function _getWins(
  info: RRoundPaymentsInfo,
  players: Player[],
  i18n: I18nService
): WinState | undefined {
  switch (info.outcome) {
    case 'ron':
    case 'tsumo':
      return [
        {
          winner: _getPlayerName(players, info.winner),
          loser: _getLoserName(info, players),
          yakuList: _getYakuList(i18n, info.yaku),
          han: info.han,
          fu: info.fu,
          dora: info.dora,
        },
      ];
    case 'multiron':
      const wins = [];
      for (const idx in info.winner) {
        if (!info.winner.hasOwnProperty(idx)) {
          continue;
        }
        wins.push({
          winner: _getPlayerName(players, info.winner[idx]),
          loser: _getLoserName(info, players),
          yakuList: _getYakuList(i18n, info.yaku[idx]),
          han: info.han[idx],
          fu: info.fu[idx],
          dora: info.dora[idx],
        });
      }
      return wins;
  }
}

export const getWins = memoize(_getWins);

export function getPenalty(info: RRoundPaymentsInfo, players: Player[]) {
  if (info.outcome !== 'chombo' || !info.penaltyFor) {
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
  return info.riichiIds.map((p) => _getPlayerName(players, parseInt(p, 10))).join(', ');
}

export const getRiichiPlayers = memoize(_getRiichiPlayers);

function _getYakuList(i18n: I18nService, str: string) {
  const yakuIds: YakuId[] = str.split(',').map((y) => parseInt(y, 10));
  const yakuNames: string[] = yakuIds.map((y) => yakuMap[y].name(i18n).toLowerCase());
  return yakuNames.join(', ');
}

function _getPlayerName(players: Player[], playerId: number): string {
  for (const i in players) {
    if (players[i].id === playerId) {
      return players[i].displayName;
    }
  }
  return '';
}

function _getLoserName(info: RRoundPaymentsInfo, players: Player[]) {
  for (const i in info.payments.direct) {
    if (!info.payments.direct.hasOwnProperty(i)) {
      continue;
    }
    return _getPlayerName(players, parseInt(i.split('<-')[1], 10));
  }
}
