/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { I18nService } from '../../services/i18n';
import { yakuMap } from '../../helpers/yaku';
import { RoundOutcome, RoundState } from '../../clients/proto/atoms.pb';
import {
  IRoundOverviewAbort,
  IRoundOverviewBase,
  IRoundOverviewChombo,
  IRoundOverviewDraw,
  IRoundOverviewInfo,
  IRoundOverviewMultiRon,
  IRoundOverviewNagashi,
  IRoundOverviewRon,
  IRoundOverviewTsumo,
  PlayerDescriptor,
} from '../../helpers/interfaces';

function getYakuList(yaku: number[], i18nService: I18nService): string[] {
  return yaku.map((id) => yakuMap[id].name(i18nService));
}

function getPlayerName(players: (PlayerDescriptor & { title?: string })[], id?: number) {
  const player = players.find((p) => p.id === id);
  return player?.playerName ?? player?.title ?? '';
}

export function getRoundOverviewBase(
  roundOverview: RoundState,
  players: PlayerDescriptor[]
): Omit<IRoundOverviewBase, 'outcome'> {
  return {
    riichiOnTable: roundOverview.riichi,
    honbaOnTable: roundOverview.honba,
    riichiPlayers: roundOverview.riichiIds.map((id) => getPlayerName(players, id)),
  };
}

export function getRoundOverviewRon(
  roundOverview: RoundState,
  players: PlayerDescriptor[],
  i18nService: I18nService
): IRoundOverviewRon {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: RoundOutcome.ROUND_OUTCOME_RON,
    riichiPlayers: roundOverview.riichiIds.map((id) => getPlayerName(players, id)),
    loser: getPlayerName(players, roundOverview.round.ron?.loserId),
    winner: getPlayerName(players, roundOverview.round.ron?.winnerId),
    paoPlayer: roundOverview.round.ron?.paoPlayerId
      ? getPlayerName(players, roundOverview.round.ron?.paoPlayerId)
      : undefined,
    yakuList: getYakuList(roundOverview.round.ron?.yaku ?? [], i18nService),
    han: roundOverview.round.ron?.han ?? 0,
    fu: roundOverview.round.ron?.fu ?? undefined,
    dora: roundOverview.round.ron?.dora ?? undefined,
  };
}

export function getRoundOverviewMultiRon(
  roundOverview: RoundState,
  players: PlayerDescriptor[],
  i18nService: I18nService
): IRoundOverviewMultiRon {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: RoundOutcome.ROUND_OUTCOME_MULTIRON,
    loser: getPlayerName(players, roundOverview.round.multiron?.loserId),
    winnerList:
      roundOverview.round.multiron?.wins.map((win) => getPlayerName(players, win.winnerId)) ?? [],
    paoPlayerList:
      roundOverview.round.multiron?.wins.map((win) =>
        win.paoPlayerId ? getPlayerName(players, win.paoPlayerId) : undefined
      ) ?? [],
    yakuList:
      roundOverview.round.multiron?.wins.map((win) => getYakuList(win.yaku, i18nService)) ?? [],
    hanList: roundOverview.round.multiron?.wins.map((win) => win.han) ?? [],
    fuList: roundOverview.round.multiron?.wins.map((win) => win.fu ?? undefined) ?? [],
    doraList: roundOverview.round.multiron?.wins.map((win) => win.dora ?? undefined) ?? [],
  };
}

export function getRoundOverviewTsumo(
  roundOverview: RoundState,
  players: PlayerDescriptor[],
  i18nService: I18nService
): IRoundOverviewTsumo {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
    riichiPlayers: roundOverview.riichiIds.map((id) => getPlayerName(players, id)),
    winner: getPlayerName(players, roundOverview.round.tsumo?.winnerId),
    paoPlayer: roundOverview.round.tsumo?.paoPlayerId
      ? getPlayerName(players, roundOverview.round.tsumo?.paoPlayerId)
      : undefined,
    yakuList: getYakuList(roundOverview.round.tsumo?.yaku ?? [], i18nService),
    han: roundOverview.round.tsumo?.han ?? 0,
    fu: roundOverview.round.tsumo?.fu ?? undefined,
    dora: roundOverview.round.tsumo?.dora ?? undefined,
  };
}

export function getRoundOverviewDraw(
  roundOverview: RoundState,
  players: PlayerDescriptor[]
): IRoundOverviewDraw {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
    tempai: roundOverview.round.draw?.tempai.map((id) => getPlayerName(players, id)) ?? [],
  };
}

export function getRoundOverviewAbort(
  roundOverview: RoundState,
  players: PlayerDescriptor[]
): IRoundOverviewAbort {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: RoundOutcome.ROUND_OUTCOME_ABORT,
  };
}

export function getRoundOverviewChombo(
  roundOverview: RoundState,
  players: PlayerDescriptor[]
): IRoundOverviewChombo {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: RoundOutcome.ROUND_OUTCOME_CHOMBO,
    penaltyFor: getPlayerName(players, roundOverview.round.chombo?.loserId),
  };
}

export function getRoundOverviewNagashi(
  roundOverview: RoundState,
  players: PlayerDescriptor[]
): IRoundOverviewNagashi {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: RoundOutcome.ROUND_OUTCOME_NAGASHI,
    tempai: roundOverview.round.nagashi?.tempai.map((id) => getPlayerName(players, id)) ?? [],
    nagashi: roundOverview.round.nagashi?.nagashi.map((id) => getPlayerName(players, id)) ?? [],
  };
}

export function getRoundOverviewInfo(
  roundOverview: RoundState,
  players: PlayerDescriptor[],
  i18nService: I18nService
): IRoundOverviewInfo {
  switch (roundOverview.outcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
      return getRoundOverviewRon(roundOverview, players, i18nService);
    case RoundOutcome.ROUND_OUTCOME_MULTIRON:
      return getRoundOverviewMultiRon(roundOverview, players, i18nService);
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return getRoundOverviewTsumo(roundOverview, players, i18nService);
    case RoundOutcome.ROUND_OUTCOME_DRAW:
      return getRoundOverviewDraw(roundOverview, players);
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      return getRoundOverviewAbort(roundOverview, players);
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      return getRoundOverviewChombo(roundOverview, players);
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return getRoundOverviewNagashi(roundOverview, players);
    default:
      throw new Error('Unspecified outcome');
  }
}
