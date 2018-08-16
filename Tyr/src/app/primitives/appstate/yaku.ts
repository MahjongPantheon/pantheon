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

import { AppOutcome } from '../../interfaces/app';
import { YakuId } from '../yaku';
import { getHan, getFixedFu } from '../yaku-values';
import { WinProps } from '../../interfaces/app';
import { getAllowedYaku as getAllowedYakuCompat, addYakuToList, initYakuGraph, limits } from '../yaku-compat';
import { LGameConfig } from '../../interfaces/local';
import { I18nService } from '../../services/i18n';
import { intersection } from 'lodash';

export const initYaku = initYakuGraph;

export function hasYaku(outcome: AppOutcome, id: YakuId, mrWinner: number) {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return -1 !== outcome.yaku.indexOf(id);
    case 'multiron':
      return -1 !== outcome.wins[mrWinner].yaku.indexOf(id);
    default:
      return false;
  }
}

export function getRequiredYaku(outcome: AppOutcome, mrWinner: number): YakuId[] {
  switch (outcome.selectedOutcome) {
    case 'ron':
      if (outcome.riichiBets.indexOf(outcome.winner) !== -1) {
        return [YakuId.RIICHI];
      }
      break;
    case 'tsumo':
      if (outcome.riichiBets.indexOf(outcome.winner) !== -1) {
        return [
          YakuId.RIICHI,
          YakuId.MENZENTSUMO
        ];
      }
    case 'multiron':
      if (outcome.riichiBets.indexOf(mrWinner) !== -1) {
        return [YakuId.RIICHI];
      }
    default:
      return [];
  }

  return [];
}

export function getSelectedYaku(outcome: AppOutcome, mrWinner: number): YakuId[] {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return [].concat(outcome.yaku);
    case 'multiron':
      return [].concat(outcome.wins[mrWinner].yaku);
    default:
      return [];
  }
}

function _addYakuToProps(outcome: AppOutcome, id: YakuId, props: WinProps, i18n: I18nService, bypassChecks: boolean = false): boolean {
  if (props.yaku.indexOf(id) !== -1) {
    return false;
  }

  if (!bypassChecks && id === YakuId.RIICHI && props.yaku.indexOf(YakuId.RIICHI) === -1) {
    alert(i18n._t('If you want to select a riichi, return back and press riichi button for the winner'));
    return false;
  }

  if (
    !bypassChecks &&
    id === YakuId.DOUBLERIICHI && (
      outcome.selectedOutcome === 'ron' ||
      outcome.selectedOutcome === 'tsumo' ||
      outcome.selectedOutcome === 'multiron'
    ) &&
    outcome.riichiBets.indexOf(props.winner) === -1
  ) {
    alert(i18n._t('If you want to select a riichi, return back and press riichi button for the winner'));
    return false;
  }

  if (limits.indexOf(id) !== -1) {
    // reset dora count if limit is added
    props.dora = 0;
  }

  props.yaku = addYakuToList(id, props.yaku);
  props.han = getHan(props.yaku);
  props.possibleFu = getFixedFu(props.yaku, outcome.selectedOutcome);
  if (
    -1 === props.possibleFu.indexOf(props.fu) ||
    id === YakuId.__OPENHAND // if open hand added, 40 fu must become 30 by default
  ) {
    props.fu = props.possibleFu[0];
  }

  return true;
}

export function addYaku(outcome: AppOutcome, id: YakuId, mrWinner: number, i18n: I18nService, bypassChecks: boolean = false): void {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      if (!_addYakuToProps(outcome, id, outcome, i18n, bypassChecks)) { // pass outcome to props - because we alter outcome itself
        return;
      }

      if (outcome.selectedOutcome === 'tsumo') {
        if (id === YakuId.MENZENTSUMO && outcome.yaku.indexOf(YakuId.__OPENHAND) !== -1) {
          removeYaku(outcome, YakuId.__OPENHAND, mrWinner, i18n);
        } else if (id === YakuId.__OPENHAND && outcome.yaku.indexOf(YakuId.MENZENTSUMO) !== -1) {
          removeYaku(outcome, YakuId.MENZENTSUMO, mrWinner, i18n);
        }
      }

      break;
    case 'multiron':
      let props = outcome.wins[mrWinner];
      _addYakuToProps(outcome, id, props, i18n, bypassChecks);
      break;
    default:
      throw new Error('No yaku may exist on this outcome');
  }
}

function _removeYakuFromProps(outcome: AppOutcome, id: YakuId, props: WinProps, mrWinner: number): boolean {
  if (props.yaku.indexOf(id) === -1) {
    return false;
  }

  if (getRequiredYaku(outcome, mrWinner).indexOf(id) !== -1) { // do not allow to disable required yaku
    return false;
  }
  const pIdx = props.yaku.indexOf(id);
  if (pIdx !== -1) {
    props.yaku.splice(pIdx, 1);
  }
  props.han = getHan(props.yaku);
  props.possibleFu = getFixedFu(props.yaku, outcome.selectedOutcome);
  if (-1 === props.possibleFu.indexOf(props.fu)) {
    props.fu = props.possibleFu[0];
  }

  return true;
}

export function removeYaku(outcome: AppOutcome, id: YakuId, mrWinner: number, i18n: I18nService): void {
  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      if (!_removeYakuFromProps(outcome, id, outcome, mrWinner)) { // pass outcome to props - because we alter outcome itself
        return;
      }

      if (outcome.selectedOutcome === 'tsumo') {
        if (id === YakuId.MENZENTSUMO && outcome.yaku.indexOf(YakuId.__OPENHAND) === -1) {
          addYaku(outcome, YakuId.__OPENHAND, mrWinner, i18n);
        } else if (id === YakuId.__OPENHAND && outcome.yaku.indexOf(YakuId.MENZENTSUMO) === -1) {
          addYaku(outcome, YakuId.MENZENTSUMO, mrWinner, i18n);
        }
      }
      break;
    // TODO: вернуть подавленные яку? или нет?
    case 'multiron':
      let props = outcome.wins[mrWinner];
      _removeYakuFromProps(outcome, id, props, mrWinner);
      break;
    default:
      throw new Error('No yaku may exist on this outcome');
  }
}

export function getAllowedYaku(outcome: AppOutcome, mrWinner: number): YakuId[] {
  switch (outcome.selectedOutcome) {
    case 'ron':
      return _excludeYaku(
        outcome,
        outcome.winner,
        outcome.yaku,
        getAllowedYakuCompat(outcome.yaku),
        [
          YakuId.MENZENTSUMO,
          YakuId.HAITEI,
          YakuId.TENHOU,
          YakuId.CHIHOU
        ]
      );
    case 'tsumo':
      return _excludeYaku(
        outcome,
        outcome.winner,
        outcome.yaku,
        getAllowedYakuCompat(outcome.yaku),
        [
          YakuId.HOUTEI,
          YakuId.CHANKAN,
          YakuId.RENHOU
        ]
      );
    case 'multiron':
      return _excludeYaku(
        outcome,
        mrWinner,
        outcome.wins[mrWinner].yaku,
        getAllowedYakuCompat(outcome.wins[mrWinner].yaku),
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

function _excludeYaku(outcome: AppOutcome, winner: number, rawYakuList: YakuId[], list: YakuId[], toBeExcluded: YakuId[]) {
  return list.filter((yaku: YakuId) => {
    if ( // disable ippatsu if riichi or double riichi is not selected
      yaku === YakuId.IPPATSU
      && (
        outcome.selectedOutcome === 'ron'
        || outcome.selectedOutcome === 'tsumo'
        || outcome.selectedOutcome === 'multiron'
      )
      && (rawYakuList.indexOf(YakuId.RIICHI) === -1 && rawYakuList.indexOf(YakuId.DOUBLERIICHI) === -1)
    ) {
      return false;
    }

    if (
      yaku === YakuId.__OPENHAND
      && (
        outcome.selectedOutcome === 'ron'
        || outcome.selectedOutcome === 'tsumo'
        || outcome.selectedOutcome === 'multiron'
      )
      && outcome.riichiBets.indexOf(winner) !== -1
    ) {
      return false; // disable open hand if one won with riichi
    }

    if (
      yaku === YakuId.RENHOU
      && outcome.selectedOutcome === 'ron'
      && outcome.winnerIsDealer
    ) {
      return false; // dealer can't win with renhou
    }

    if (
      yaku === YakuId.TENHOU
      && outcome.selectedOutcome === 'ron'
      && !outcome.winnerIsDealer
    ) {
      return false; // non-dealer can't win with tenhou
    }

    if (
      yaku === YakuId.CHIHOU
      && outcome.selectedOutcome === 'ron'
      && outcome.winnerIsDealer
    ) {
      return false; // dealer can't win with chihou
    }

    return toBeExcluded.indexOf(yaku) === -1;
  });
}

export function yakumanInYaku(outcome: AppOutcome, mrWinner: number): boolean {
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return _hasYakumanInYakuList(outcome, outcome, mrWinner);
    case 'multiron':
      let props = outcome.wins[mrWinner];
      return _hasYakumanInYakuList(outcome, props, mrWinner);
    default:
      throw new Error('No yaku may exist on this outcome');
  }
}

function _hasYakumanInYakuList(outcome: AppOutcome, props: WinProps, mrWinner: number): boolean {
  for (let y of props.yaku) {
    if (limits.indexOf(y) !== -1) {
      return true;
    }
  }

  return false;
}

export function winnerHasYakuWithPao(outcome: AppOutcome, gameConfig: LGameConfig) {
  if (!outcome) {
    return false;
  }

  switch (outcome.selectedOutcome) {
    case 'ron':
    case 'tsumo':
      return intersection(outcome.yaku, gameConfig.yakuWithPao).length > 0;
    case 'multiron':
      return Object.keys(outcome.wins).reduce<boolean>((acc, playerId) => {
        return acc || (intersection(outcome.wins[playerId].yaku, gameConfig.yakuWithPao).length > 0);
      }, false);
    default:
      throw new Error('No pao exist on this outcome');
  }
}
