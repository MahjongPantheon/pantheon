/*
 * Tyr - Allows online game recording in japanese (riichi) mahjong sessions
 * Copyright (C) 2016 Oleg Klimenko aka ctizen <me@ctizen.net>
 *
 * This file is part of Tyr.
 *
 * Tyr is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Tyr is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tyr.  If not, see <http://www.gnu.org/licenses/>.
 */

import { getAllowedYaku as getAllowedYakuCompat, limits, unpack } from '#/primitives/yaku-compat';
import { IAppState } from '../interfaces';
import { YakuId } from '#/primitives/yaku';
import { WinProps } from '#/interfaces/app';

export function getRequiredYaku(state: IAppState, currentWinner?: number): YakuId[] {
  const outcome = state.currentOutcome;
  if (!outcome) {
    return [];
  }

  const existingYaku: YakuId[] = getSelectedYaku(state);
  switch (outcome.selectedOutcome) {
    case 'tsumo':
      if (outcome.winner && outcome.riichiBets.indexOf(outcome.winner) !== -1) {
        return [
          YakuId.RIICHI,
          YakuId.MENZENTSUMO
        ].filter((y) => !existingYaku.includes(y));
      }
      break;
    case 'ron':
      const winner = currentWinner || state.multironCurrentWinner;
      if (!winner) {
        throw new Error('No winner selected');
      }
      if (outcome.riichiBets.indexOf(winner) !== -1) {
        return [YakuId.RIICHI].filter((y) => !existingYaku.includes(y));
      }
      break;
    default:
      return [];
  }

  return [];
}

export function getSelectedYaku(state: IAppState): YakuId[] {
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'tsumo':
      return unpack(outcome.yaku);
    case 'ron':
      if (!state.multironCurrentWinner) {
        throw new Error('No winner selected');
      }
      return unpack(outcome.wins[state.multironCurrentWinner].yaku);
    default:
      return [];
  }
}

export function getAllowedYaku(state: IAppState): YakuId[] {
  let yakuList;
  const outcome = state.currentOutcome;
  switch (outcome?.selectedOutcome) {
    case 'tsumo':
      yakuList = unpack(outcome.yaku);
      return _excludeYaku(
        state,
        outcome.winner,
        yakuList,
        getAllowedYakuCompat(state.yakuList, yakuList),
        [
          YakuId.HOUTEI,
          YakuId.CHANKAN,
          YakuId.RENHOU
        ]
      );
    case 'ron':
      if (!state.multironCurrentWinner) {
        throw new Error('No winner selected');
      }
      yakuList = unpack(outcome.wins[state.multironCurrentWinner].yaku);
      return _excludeYaku(
        state,
        state.multironCurrentWinner,
        yakuList,
        getAllowedYakuCompat(state.yakuList, yakuList),
        [
          YakuId.MENZENTSUMO,
          YakuId.HAITEI,
          YakuId.TENHOU,
          YakuId.CHIHOU
        ]
      );
    default:
      return [];
  }
}

function _excludeYaku(state: IAppState, winner: number | undefined, rawYakuList: YakuId[], list: YakuId[], toBeExcluded: YakuId[]) {
  const outcome = state.currentOutcome;
  if (!winner || !outcome) {
    return [];
  }

  return list.filter((yaku: YakuId) => {
    if ( // disable ippatsu if riichi or double riichi is not selected
      yaku === YakuId.IPPATSU
      && (
        outcome?.selectedOutcome === 'ron'
        || outcome?.selectedOutcome === 'tsumo'
      )
      && (rawYakuList.indexOf(YakuId.RIICHI) === -1 && rawYakuList.indexOf(YakuId.DOUBLERIICHI) === -1)
    ) {
      return false;
    }

    if (
      yaku === YakuId.__OPENHAND
      && (
        outcome?.selectedOutcome === 'ron'
        || outcome?.selectedOutcome === 'tsumo'
      )
      && outcome.riichiBets.indexOf(winner) !== -1
    ) {
      return false; // disable open hand if one won with riichi
    }

    if (
      yaku === YakuId.RENHOU
      && outcome?.selectedOutcome === 'ron'
      && outcome.wins[winner].winnerIsDealer
    ) {
      return false; // dealer can't win with renhou
    }

    if (
      yaku === YakuId.TENHOU
      && (
        outcome?.selectedOutcome !== 'tsumo'
        || !outcome.winnerIsDealer
      )
    ) {
      return false; // non-dealer can't win with tenhou
    }

    if (
      yaku === YakuId.CHIHOU
      && (
        outcome?.selectedOutcome !== 'tsumo'
        || outcome.winnerIsDealer
      )
    ) {
      return false; // dealer can't win with chihou
    }

    return toBeExcluded.indexOf(yaku) === -1;
  });
}

export function yakumanInYaku(state: IAppState): boolean {
  const outcome = state.currentOutcome;
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'tsumo':
      return _hasYakumanInYakuList(outcome);
    case 'ron':
      if (!state.multironCurrentWinner) {
        return false; // data not loaded yet
      }
      let props = outcome.wins[state.multironCurrentWinner];
      return _hasYakumanInYakuList(props);
    default:
      throw new Error('No yaku may exist on this outcome');
  }
}

function _hasYakumanInYakuList(props: WinProps): boolean {
  const yakuList = unpack(props.yaku);
  for (let y of yakuList) {
    if (limits.indexOf(y) !== -1) {
      return true;
    }
  }

  return false;
}
