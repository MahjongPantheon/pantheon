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
  getAllowedYaku as getAllowedYakuCompat,
  limits,
  unpack,
} from '../../helpers/yakuCompatibility';
import { IAppState } from '../interfaces';
import { YakuId } from '../../helpers/yaku';
import { WinProps, Yaku } from '../../helpers/interfaces';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';
import { memoize } from '../../helpers/memoize';
import { getWinningUsers, hasYaku } from './mimir';
import { filterAllowed, yakuCommon, yakumans, yakuRare } from '../../helpers/yakuLists';

export function getRequiredYaku(state: IAppState): Record<number, YakuId[]> {
  const outcome = state.currentOutcome;
  if (!outcome) {
    return {};
  }

  switch (outcome.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      if (outcome.winner && outcome.riichiBets.includes(outcome.winner)) {
        return {
          [outcome.winner]: [YakuId.RIICHI, YakuId.MENZENTSUMO],
        };
      }
      break;
    case RoundOutcome.ROUND_OUTCOME_RON:
      const users = getWinningUsers(state);
      return users.reduce(
        (acc, user) => {
          acc[user.id] = outcome.riichiBets.includes(user.id) ? [YakuId.RIICHI] : [];
          return acc;
        },
        {} as Record<number, YakuId[]>
      );
    default:
      return {};
  }

  return {};
}

export function getSelectedYaku(state: IAppState): Record<number, YakuId[]> {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return { [outcome.winner!]: unpack(outcome.yaku) };
    case RoundOutcome.ROUND_OUTCOME_RON:
      const users = getWinningUsers(state);
      return users.reduce(
        (acc: Record<number, YakuId[]>, p) => {
          acc[p.id] = unpack(outcome.wins[p.id].yaku);
          return acc;
        },
        {} as Record<number, YakuId[]>
      );
    default:
      return {};
  }
}

export function getAllowedYaku(state: IAppState): Record<number, YakuId[]> {
  let yakuList;
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      yakuList = unpack(outcome.yaku);
      return {
        [outcome.winner!]: _excludeYaku(
          state,
          outcome.winner,
          yakuList,
          getAllowedYakuCompat(state.yakuList, yakuList),
          [YakuId.HOUTEI, YakuId.CHANKAN, YakuId.RENHOU]
        ),
      };
    case RoundOutcome.ROUND_OUTCOME_RON:
      const users = getWinningUsers(state);
      return users.reduce(
        (acc, user) => {
          yakuList = unpack(outcome.wins[user.id].yaku);
          acc[user.id] = _excludeYaku(
            state,
            user.id,
            yakuList,
            getAllowedYakuCompat(state.yakuList, yakuList),
            [YakuId.MENZENTSUMO, YakuId.HAITEI, YakuId.TENHOU, YakuId.CHIHOU]
          );
          return acc;
        },
        {} as Record<number, YakuId[]>
      );
    default:
      return [];
  }
}

function _excludeYaku(
  state: IAppState,
  winner: number | undefined,
  rawYakuList: YakuId[],
  list: YakuId[],
  toBeExcluded: YakuId[]
) {
  const outcome = state.currentOutcome;
  if (!winner || !outcome) {
    return [];
  }

  return list.filter((yaku: YakuId) => {
    if (
      // disable ippatsu if riichi or double riichi is not selected
      yaku === YakuId.IPPATSU &&
      (outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO) &&
      !rawYakuList.includes(YakuId.RIICHI) &&
      !rawYakuList.includes(YakuId.DOUBLERIICHI)
    ) {
      return false;
    }

    if (
      yaku === YakuId.__OPENHAND &&
      (outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO) &&
      outcome.riichiBets.includes(winner)
    ) {
      return false; // disable open hand if one won with riichi
    }

    if (
      yaku === YakuId.RENHOU &&
      outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON &&
      outcome.wins[winner].winnerIsDealer
    ) {
      return false; // dealer can't win with renhou
    }

    if (
      yaku === YakuId.TENHOU &&
      (outcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_TSUMO || !outcome.winnerIsDealer)
    ) {
      return false; // non-dealer can't win with tenhou
    }

    if (
      yaku === YakuId.CHIHOU &&
      (outcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_TSUMO || outcome.winnerIsDealer)
    ) {
      return false; // dealer can't win with chihou
    }

    return !toBeExcluded.includes(yaku);
  });
}

export function yakumanInYaku(state: IAppState): Record<number, boolean> {
  const outcome = state.currentOutcome;
  if (!outcome) {
    return {};
  }

  switch (outcome.selectedOutcome) {
    case RoundOutcome.ROUND_OUTCOME_TSUMO:
      return { [outcome.winner!]: _hasYakumanInYakuList(outcome) };
    case RoundOutcome.ROUND_OUTCOME_RON:
      const users = getWinningUsers(state);
      return users.reduce(
        (acc, user) => {
          acc[user.id] = _hasYakumanInYakuList(outcome.wins[user.id]);
          return acc;
        },
        {} as Record<number, boolean>
      );
    default:
      throw new Error('No yaku may exist on this outcome');
  }
}

function _hasYakumanInYakuList(props: WinProps): boolean {
  const yakuList = unpack(props.yaku);
  for (const y of yakuList) {
    if (limits.includes(y)) {
      return true;
    }
  }

  return false;
}

function _getYakuList(state: IAppState): { [id: number]: Yaku[] } {
  if (!state.gameConfig) {
    return {};
  }

  const yakuList: { [key: number]: Yaku[] } = {};
  const allowedYaku = [...state.gameConfig.rulesetConfig.allowedYaku, YakuId.__OPENHAND];
  for (const user of getWinningUsers(state)) {
    const simple = filterAllowed(yakuCommon, allowedYaku);
    const rare = filterAllowed(yakuRare, allowedYaku);
    const yakuman = filterAllowed(yakumans, allowedYaku);
    yakuList[user.id] = simple.concat(rare).concat(yakuman);
  }

  return yakuList;
}

export const getYakuList = memoize(_getYakuList);

export function getDisabledYaku(state: IAppState): Record<number, Array<number>> {
  const yakuList = getYakuList(state);
  const allowedYaku = getAllowedYaku(state);
  const users = getWinningUsers(state);

  return users.reduce(
    (acc: Record<number, Array<number>>, p) => {
      acc[p.id] = [];
      for (const yaku of yakuList[p.id]) {
        if (!allowedYaku[p.id].includes(yaku.id) && !hasYaku(state, yaku.id)[p.id]) {
          acc[p.id].push(yaku.id);
        }
      }
      return acc;
    },
    {} as Record<number, Array<number>>
  );
}
