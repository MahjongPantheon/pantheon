import {
  RRoundOverviewAbort,
  RRoundOverviewChombo,
  RRoundOverviewDraw,
  RRoundOverviewInfo,
  RRoundOverviewMultiRon,
  RRoundOverviewNagashi,
  RRoundOverviewRon,
  RRoundOverviewTsumo,
} from '#/interfaces/remote';
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

function getYakuList(yaku: string, i18nService: I18nService) {
  const yakuIds = yaku.split(',').map((x) => parseInt(x, 10));
  return yakuIds.map((id) => yakuMap[id].name(i18nService));
}

export function getRoundOverviewBase(
  roundOverview: RRoundOverviewInfo,
  players: { [index: string]: string }
): IRoundOverviewBase {
  return {
    riichiOnTable: roundOverview.riichi,
    honbaOnTable: roundOverview.honba,
    riichiPlayers: roundOverview.riichiIds.map((id) => players[id]),
  };
}

export function getRoundOverviewRon(
  roundOverview: RRoundOverviewRon,
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewRon {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: roundOverview.outcome,
    riichiPlayers: roundOverview.riichiIds.map((id) => players[id]),
    loser: players[roundOverview.loser],
    winner: players[roundOverview.winner],
    paoPlayer: roundOverview.paoPlayer !== null ? players[roundOverview.paoPlayer] : undefined,
    yakuList: getYakuList(roundOverview.yaku, i18nService),
    han: roundOverview.han,
    fu: roundOverview.fu ?? undefined,
    dora: roundOverview.dora ?? undefined,
  };
}

export function getRoundOverviewMultiRon(
  roundOverview: RRoundOverviewMultiRon,
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewMultiRon {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: roundOverview.outcome,
    loser: players[roundOverview.loser],
    winnerList: roundOverview.winner.map((id) => players[id]),
    paoPlayerList: roundOverview.paoPlayer.map((id) => (id !== null ? players[id] : undefined)),
    yakuList: roundOverview.yaku.map((playerYaku) => getYakuList(playerYaku, i18nService)),
    hanList: roundOverview.han,
    fuList: roundOverview.fu.map((playerFu) => playerFu ?? undefined),
    doraList: roundOverview.dora.map((playerDora) => playerDora ?? undefined),
  };
}

export function getRoundOverviewTsumo(
  roundOverview: RRoundOverviewTsumo,
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewTsumo {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: roundOverview.outcome,
    riichiPlayers: roundOverview.riichiIds.map((id) => players[id]),
    winner: players[roundOverview.winner],
    paoPlayer: roundOverview.paoPlayer !== null ? players[roundOverview.paoPlayer] : undefined,
    yakuList: getYakuList(roundOverview.yaku, i18nService),
    han: roundOverview.han,
    fu: roundOverview.fu ?? undefined,
    dora: roundOverview.dora ?? undefined,
  };
}

export function getRoundOverviewDraw(
  roundOverview: RRoundOverviewDraw,
  players: { [index: string]: string }
): IRoundOverviewDraw {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: roundOverview.outcome,
    tempai: roundOverview.tempai.map((id) => players[id]),
  };
}

export function getRoundOverviewAbort(
  roundOverview: RRoundOverviewAbort,
  players: { [index: string]: string }
): IRoundOverviewAbort {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: roundOverview.outcome,
  };
}

export function getRoundOverviewChombo(
  roundOverview: RRoundOverviewChombo,
  players: { [index: string]: string }
): IRoundOverviewChombo {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: roundOverview.outcome,
    penaltyFor: players[roundOverview.penaltyFor],
  };
}

export function getRoundOverviewNagashi(
  roundOverview: RRoundOverviewNagashi,
  players: { [index: string]: string }
): IRoundOverviewNagashi {
  const roundBase = getRoundOverviewBase(roundOverview, players);
  return {
    ...roundBase,
    outcome: roundOverview.outcome,
    tempai: roundOverview.tempai.map((id) => players[id]),
    nagashi: roundOverview.nagashi.map((id) => players[id]),
  };
}

export function getRoundOverviewInfo(
  roundOverview: RRoundOverviewInfo,
  players: { [index: string]: string },
  i18nService: I18nService
): IRoundOverviewInfo {
  switch (roundOverview.outcome) {
    case 'ron':
      return getRoundOverviewRon(roundOverview, players, i18nService);
    case 'multiron':
      return getRoundOverviewMultiRon(roundOverview, players, i18nService);
    case 'tsumo':
      return getRoundOverviewTsumo(roundOverview, players, i18nService);
    case 'draw':
      return getRoundOverviewDraw(roundOverview, players);
    case 'abort':
      return getRoundOverviewAbort(roundOverview, players);
    case 'chombo':
      return getRoundOverviewChombo(roundOverview, players);
    case 'nagashi':
      return getRoundOverviewNagashi(roundOverview, players);
  }
}
