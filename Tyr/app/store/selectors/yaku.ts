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
import {
  aggregatedYakuhai,
  canSelectShosangen,
  getWindYaku,
  getYakuhaiToAdd,
  yakuhai,
  windYaku,
} from '../../helpers/yakuhai';
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

  return list.filter((yakuId: YakuId) => {
    const yaku = getWindYaku(
      yakuId,
      outcome.roundIndex,
      state.players?.findIndex((p) => p.id === winner) ?? -1
    );
    if (yaku && !yaku.includes(yakuId)) {
      return false;
    }

    if (
      state.gameConfig?.rulesetConfig.useAggregatedYakuhai
        ? yakuhai.includes(yakuId)
        : aggregatedYakuhai.includes(yakuId)
    ) {
      return false;
    }

    if (yakuId === YakuId.SHOSANGEN && !canSelectShosangen(rawYakuList)) return false;
    if (
      yakuId === YakuId.TANYAO &&
      rawYakuList.includes(YakuId.__OPENHAND) &&
      !state.gameConfig?.rulesetConfig.withKuitan
    )
      return false;
    if (yakuId === YakuId.MENZENTSUMO && rawYakuList.includes(YakuId.__OPENHAND)) return false;

    if (yakuhai.includes(yakuId)) {
      const allowed = state.gameConfig?.rulesetConfig.allowedYaku ?? [];
      const added = (yaku ?? [yakuId]).filter((id) => allowed.includes(id));
      if (!getYakuhaiToAdd(rawYakuList, added)) {
        return false;
      }
    }

    if (
      // disable ippatsu if riichi or double riichi is not selected
      yakuId === YakuId.IPPATSU &&
      (outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO) &&
      !rawYakuList.includes(YakuId.RIICHI) &&
      !rawYakuList.includes(YakuId.DOUBLERIICHI)
    ) {
      return false;
    }

    if (
      yakuId === YakuId.__OPENHAND &&
      (outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON ||
        outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_TSUMO) &&
      outcome.riichiBets.includes(winner)
    ) {
      return false; // disable open hand if one won with riichi
    }

    if (
      yakuId === YakuId.RENHOU &&
      outcome?.selectedOutcome === RoundOutcome.ROUND_OUTCOME_RON &&
      outcome.wins[winner].winnerIsDealer
    ) {
      return false; // dealer can't win with renhou
    }

    if (
      yakuId === YakuId.TENHOU &&
      (outcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_TSUMO || !outcome.winnerIsDealer)
    ) {
      return false; // non-dealer can't win with tenhou
    }

    if (
      yakuId === YakuId.CHIHOU &&
      (outcome?.selectedOutcome !== RoundOutcome.ROUND_OUTCOME_TSUMO || outcome.winnerIsDealer)
    ) {
      return false; // dealer can't win with chihou
    }

    return !toBeExcluded.includes(yakuId);
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
  const aggregated = state.gameConfig.rulesetConfig.useAggregatedYakuhai;
  for (const user of getWinningUsers(state)) {
    const simple = filterAllowed(yakuCommon, allowedYaku);
    const rare = filterAllowed(yakuRare, allowedYaku);
    const yakuman = filterAllowed(yakumans, allowedYaku);
    yakuList[user.id] = simple
      .concat(rare)
      .concat(yakuman)
      .filter((y) => {
        if (aggregated ? yakuhai.includes(y.id) : aggregatedYakuhai.includes(y.id)) {
          return false;
        }
        const pair = windYaku.find((candidate) => candidate.includes(y.id));
        if (!pair) {
          return true;
        }
        const yaku = getWindYaku(
          y.id,
          state.currentOutcome?.roundIndex ?? 1,
          state.players?.findIndex((p) => p.id === user.id) ?? -1
        )!;
        const representative = yaku.find((id) => allowedYaku.includes(id)) ?? pair[0];
        return y.id === representative;
      });
  }

  return yakuList;
}

export const getYakuList = memoize(_getYakuList);

export function getDoubleWindYaku(state: IAppState): Record<number, YakuId | undefined> {
  const result: Record<number, YakuId | undefined> = {};
  if (!state.currentOutcome || !state.players || !state.gameConfig) return result;
  if (state.gameConfig.rulesetConfig.useAggregatedYakuhai) return result;
  const allowed = state.gameConfig.rulesetConfig.allowedYaku;
  const roundIndex = state.currentOutcome.roundIndex;
  const visible = getYakuList(state);
  for (const user of getWinningUsers(state)) {
    const playerIndex = state.players.findIndex((player) => player.id === user.id);
    if (playerIndex < 0) continue;
    const wind = windYaku.find(
      (pair) =>
        pair.every((id) => allowed.includes(id)) &&
        getWindYaku(pair[0], roundIndex, playerIndex)?.length === 2
    );
    if (wind) result[user.id] = visible[user.id]?.find((yaku) => wind.includes(yaku.id))?.id;
  }
  return result;
}

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
