import {
  IRoundOverviewInfo,
  IRoundOverviewBase,
  IRoundOverviewMultiRon,
  IRoundOverviewRon,
  IRoundOverviewTsumo,
  IRoundOverviewDraw,
  IRoundOverviewAbort,
  IRoundOverviewChombo,
  IRoundOverviewNagashi,
} from '#/components/screens/log/view/RoundTypes';
import { I18nService } from '#/services/i18n';
import { yakuMap } from '#/primitives/yaku';
import { RoundState } from '#/clients/atoms.pb';

function getYakuList(yaku: number[], i18nService: I18nService): string[] {
  return yaku.map((id) => yakuMap[id].name(i18nService));
}

export function getRoundOverviewBase(
  roundOverview: RoundState,
  players: { [index: string]: string }
): Omit<IRoundOverviewBase, 'outcome'> {
  return {
    riichiOnTable: roundOverview.riichi,
    honbaOnTable: roundOverview.honba,
    riichiPlayers: roundOverview.riichiIds.map((id) => players[id]),
  };
}

export function getRoundOverviewRon(
  roundOverview: RoundState,
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewRon {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: 'RON',
    riichiPlayers: roundOverview.riichiIds.map((id) => players[id]),
    loser: players[roundOverview.round.ron?.loserId!],
    winner: players[roundOverview.round.ron?.winnerId!],
    paoPlayer: roundOverview.round.ron?.paoPlayerId
      ? players[roundOverview.round.ron?.paoPlayerId]
      : undefined,
    yakuList: getYakuList(roundOverview.round.ron?.yaku ?? [], i18nService),
    han: roundOverview.round.ron?.han ?? 0,
    fu: roundOverview.round.ron?.fu ?? undefined,
    dora: roundOverview.round.ron?.dora ?? undefined,
  };
}

export function getRoundOverviewMultiRon(
  roundOverview: RoundState,
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewMultiRon {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: 'MULTIRON',
    loser: players[roundOverview.round.multiron?.loserId!],
    winnerList: roundOverview.round.multiron?.wins.map((win) => players[win.winnerId]) ?? [],
    paoPlayerList:
      roundOverview.round.multiron?.wins.map((win) =>
        win.paoPlayerId ? players[win.paoPlayerId] : undefined
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
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewTsumo {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: 'TSUMO',
    riichiPlayers: roundOverview.riichiIds.map((id) => players[id]),
    winner: players[roundOverview.round.tsumo?.winnerId!],
    paoPlayer: roundOverview.round.tsumo?.paoPlayerId
      ? players[roundOverview.round.tsumo?.paoPlayerId]
      : undefined,
    yakuList: getYakuList(roundOverview.round.tsumo?.yaku ?? [], i18nService),
    han: roundOverview.round.tsumo?.han ?? 0,
    fu: roundOverview.round.tsumo?.fu ?? undefined,
    dora: roundOverview.round.tsumo?.dora ?? undefined,
  };
}

export function getRoundOverviewDraw(
  roundOverview: RoundState,
  players: { [index: string]: string }
): IRoundOverviewDraw {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: 'DRAW',
    tempai: roundOverview.round.draw?.tempai.map((id) => players[id]) ?? [],
  };
}

export function getRoundOverviewAbort(
  roundOverview: RoundState,
  players: { [index: string]: string }
): IRoundOverviewAbort {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: 'ABORT',
  };
}

export function getRoundOverviewChombo(
  roundOverview: RoundState,
  players: { [index: string]: string }
): IRoundOverviewChombo {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: 'CHOMBO',
    penaltyFor: players[roundOverview.round.chombo?.loserId!],
  };
}

export function getRoundOverviewNagashi(
  roundOverview: RoundState,
  players: { [index: string]: string }
): IRoundOverviewNagashi {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: 'NAGASHI',
    tempai: roundOverview.round.nagashi?.tempai.map((id) => players[id]) ?? [],
    nagashi: roundOverview.round.nagashi?.nagashi.map((id) => players[id]) ?? [],
  };
}

export function getRoundOverviewInfo(
  roundOverview: RoundState,
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewInfo {
  switch (roundOverview.outcome) {
    case 'RON':
      return getRoundOverviewRon(roundOverview, players, i18nService);
    case 'MULTIRON':
      return getRoundOverviewMultiRon(roundOverview, players, i18nService);
    case 'TSUMO':
      return getRoundOverviewTsumo(roundOverview, players, i18nService);
    case 'DRAW':
      return getRoundOverviewDraw(roundOverview, players);
    case 'ABORT':
      return getRoundOverviewAbort(roundOverview, players);
    case 'CHOMBO':
      return getRoundOverviewChombo(roundOverview, players);
    case 'NAGASHI':
      return getRoundOverviewNagashi(roundOverview, players);
  }
}
