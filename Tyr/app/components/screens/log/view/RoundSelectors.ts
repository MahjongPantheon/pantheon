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

import {
  IRoundOverviewAbort,
  IRoundOverviewChombo,
  IRoundOverviewDraw,
  IRoundOverviewInfo,
  IRoundOverviewMultiRon,
  IRoundOverviewNagashi,
  IRoundOverviewRon,
  IRoundOverviewTsumo,
} from '#/components/screens/log/view/RoundTypes';
import { I18nService } from '#/services/i18n';
import { RoundOutcome } from '#/clients/proto/atoms.pb';

function getHandAmount(loc: I18nService, han: number, fu?: number): string {
  if (han < 0) {
    return loc._t('yakuman');
  }

  const str = loc._t('%1 han', [han]);

  if (han < 5 && fu) {
    return loc._t('%1 han %2 fu', [han, fu]);
  }
  return str;
}

function getPaoLine(loc: I18nService, paoPlayer: string) {
  return loc._t('Pao from: %1', [paoPlayer]);
}

function getHonbaLine(loc: I18nService, honbaOnTable: number) {
  return loc._t('Honba: %1', [honbaOnTable]);
}

function getTempaiLine(loc: I18nService, tempai: string[]) {
  return loc._t('Tempai: %1', [tempai.join(', ')]);
}

function getRiichiLine(loc: I18nService, riichiPlayers: string[], riichiOnTable: number) {
  let riichiStr;
  if (riichiPlayers.length) {
    riichiStr = riichiPlayers.join(', ');
    if (riichiOnTable) {
      riichiStr += ` + ${riichiOnTable}`;
    }
  } else {
    riichiStr = riichiOnTable.toString();
  }

  return loc._t('Riichi bets: %1', [riichiStr]);
}

function getYakuLine(loc: I18nService, yakuList: string[], dora?: number) {
  const doraStr = loc._t('dora %1', [dora]);
  const yakuStr = [...yakuList, dora ? doraStr : null].filter((el) => !!el).join(', ');
  return `${yakuStr}`;
}

function getRoundDescriptionRon(info: IRoundOverviewRon, loc: I18nService) {
  const {
    winner,
    loser,
    paoPlayer,
    han,
    fu,
    dora,
    yakuList,
    riichiPlayers,
    riichiOnTable,
    honbaOnTable,
  } = info;

  const lines: string[] = [];
  lines.push(loc._t('Ron, %1', [getHandAmount(loc, han, fu)]));
  lines.push(loc._t('%1 ← %2', [winner, loser]));
  lines.push(getYakuLine(loc, yakuList, dora));
  if (paoPlayer) {
    lines.push(getPaoLine(loc, paoPlayer));
  }
  lines.push('');
  lines.push(getRiichiLine(loc, riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(loc, honbaOnTable));

  return lines;
}

function getRoundDescriptionMultiron(info: IRoundOverviewMultiRon, loc: I18nService) {
  const {
    loser,
    winnerList,
    hanList,
    fuList,
    doraList,
    yakuList,
    paoPlayerList,
    riichiPlayers,
    riichiOnTable,
    honbaOnTable,
  } = info;

  const lines: string[] = [];
  lines.push(loc._t('Multiron, from %1', [loser]));
  lines.push('');

  winnerList.forEach((winner, i) => {
    const han = hanList[i];
    const fu = fuList[i];
    const dora = doraList[i];
    const winnerYakuList = yakuList[i];
    const paoPlayer = paoPlayerList[i];

    lines.push(getHandAmount(loc, han, fu));
    lines.push(winner);
    lines.push(getYakuLine(loc, winnerYakuList, dora));
    if (paoPlayer) {
      lines.push(getPaoLine(loc, paoPlayer));
    }
    lines.push('');
  });

  lines.push(getRiichiLine(loc, riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(loc, honbaOnTable));

  return lines;
}

function getRoundDescriptionTsumo(info: IRoundOverviewTsumo, loc: I18nService) {
  const { winner, paoPlayer, han, fu, dora, yakuList, riichiPlayers, riichiOnTable, honbaOnTable } =
    info;

  const lines: string[] = [];
  lines.push(loc._t('Tsumo, %1', [getHandAmount(loc, han, fu)]));
  lines.push(winner);
  lines.push(getYakuLine(loc, yakuList, dora));
  if (paoPlayer) {
    lines.push(getPaoLine(loc, paoPlayer));
  }
  lines.push('');
  lines.push(getRiichiLine(loc, riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(loc, honbaOnTable));

  return lines;
}

function getRoundDescriptionDraw(info: IRoundOverviewDraw, loc: I18nService) {
  const { tempai, riichiPlayers, riichiOnTable, honbaOnTable } = info;

  const lines: string[] = [];
  lines.push(loc._t('Exhaustive draw'));
  lines.push(getTempaiLine(loc, tempai));
  lines.push('');
  lines.push(getRiichiLine(loc, riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(loc, honbaOnTable));
  return lines;
}

function getRoundDescriptionAbort(info: IRoundOverviewAbort, loc: I18nService) {
  const { riichiPlayers, riichiOnTable, honbaOnTable } = info;

  const lines: string[] = [];
  lines.push(loc._t('Abortive draw'));

  lines.push('');
  lines.push(getRiichiLine(loc, riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(loc, honbaOnTable));

  return lines;
}

function getRoundDescriptionChombo(info: IRoundOverviewChombo, loc: I18nService) {
  const { penaltyFor, riichiPlayers, riichiOnTable, honbaOnTable } = info;

  const lines: string[] = [];
  lines.push(loc._t('Chombo'));
  lines.push(penaltyFor);
  lines.push('');
  lines.push(getRiichiLine(loc, riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(loc, honbaOnTable));

  return lines;
}

function getRoundDescriptionNagashi(info: IRoundOverviewNagashi, loc: I18nService) {
  const { nagashi, tempai, riichiPlayers, riichiOnTable, honbaOnTable } = info;

  const lines: string[] = [];
  lines.push(loc._t('Nagashi mangan'));
  lines.push(nagashi.join(', '));
  lines.push(getTempaiLine(loc, tempai));
  lines.push('');
  lines.push(getRiichiLine(loc, riichiPlayers, riichiOnTable));
  lines.push(getHonbaLine(loc, honbaOnTable));

  return lines;
}

export function getRoundDescription(info: IRoundOverviewInfo, loc: I18nService): string[] {
  switch (info.outcome) {
    case RoundOutcome.ROUND_OUTCOME_RON:
      return getRoundDescriptionRon(info, loc);
    case RoundOutcome.ROUND_OUTCOME_MULTIRON:
      return getRoundDescriptionMultiron(info, loc);
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return getRoundDescriptionTsumo(info, loc);
    case RoundOutcome.ROUND_OUTCOME_DRAW:
      return getRoundDescriptionDraw(info, loc);
    case RoundOutcome.ROUND_OUTCOME_ABORT:
      return getRoundDescriptionAbort(info, loc);
    case RoundOutcome.ROUND_OUTCOME_CHOMBO:
      return getRoundDescriptionChombo(info, loc);
    case RoundOutcome.ROUND_OUTCOME_NAGASHI:
      return getRoundDescriptionNagashi(info, loc);
  }
}
