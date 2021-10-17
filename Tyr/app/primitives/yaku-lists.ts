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

import { Yaku } from '#/interfaces/common';
import { yakuList, YakuId } from './yaku';

export function filterAllowed(group: Yaku[][], allowed: number[]) {
  return group
    .map((ySet: Yaku[]) => ySet.filter((y: Yaku) => y.id === YakuId.__OPENHAND || allowed.indexOf(y.id) !== -1))
    .filter((ySet: Yaku[]) => ySet.length > 0);
}

export const yakuGroups = [
  yakuList.filter((y: Yaku) => [
    YakuId.__OPENHAND
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.RIICHI,
    YakuId.IPPATSU,
    YakuId.MENZENTSUMO
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.PINFU,
    YakuId.TANYAO
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.YAKUHAI1,
    YakuId.YAKUHAI2,
    YakuId.YAKUHAI3
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.ITTSU,
    YakuId.HONITSU,
    YakuId.CHINITSU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.TOITOI,
    YakuId.CHIITOITSU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.CHANTA,
    YakuId.JUNCHAN
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.SANSHOKUDOUJUN,
    YakuId.IIPEIKOU
  ].indexOf(y.id) !== -1),
];

export const yakuRareGroups = [
  yakuList.filter((y: Yaku) => [
    YakuId.DOUBLERIICHI,
    YakuId.OPENRIICHI
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.HONROTO,
    YakuId.SHOSANGEN,
    YakuId.YAKUHAI4
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.SANANKOU,
    YakuId.SANSHOKUDOUKOU,
    YakuId.SANKANTSU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.RYANPEIKOU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.HAITEI,
    YakuId.HOUTEI,
    YakuId.RINSHANKAIHOU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.CHANKAN,
    YakuId.RENHOU
  ].indexOf(y.id) !== -1),
];

export const yakumanGroups = [
  yakuList.filter((y: Yaku) => [
    YakuId.TENHOU,
    YakuId.CHIHOU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.DAISANGEN,
    YakuId.DAISUUSHII,
    YakuId.SHOSUUSHII
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.SUUANKOU,
    YakuId.SUUKANTSU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.CHINROTO,
    YakuId.TSUUIISOU,
    YakuId.KOKUSHIMUSOU
  ].indexOf(y.id) !== -1),

  yakuList.filter((y: Yaku) => [
    YakuId.RYUUIISOU,
    YakuId.CHUURENPOUTO
  ].indexOf(y.id) !== -1),
];
