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

import { Yaku } from '../interfaces/common';
import { yakuList, YakuId } from './yaku';

export function filterAllowed(group: Yaku[][], allowed: number[]) {
  return group
    .map((ySet: Yaku[]) =>
      ySet.filter((y: Yaku) => y.id === YakuId.__OPENHAND || allowed.includes(y.id))
    )
    .filter((ySet: Yaku[]) => ySet.length > 0);
}

export const yakuGroups = [
  yakuList.filter((y: Yaku) => [YakuId.__OPENHAND].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.RIICHI, YakuId.IPPATSU, YakuId.MENZENTSUMO].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.PINFU, YakuId.TANYAO].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.YAKUHAI1, YakuId.YAKUHAI2, YakuId.YAKUHAI3].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.ITTSU, YakuId.HONITSU, YakuId.CHINITSU].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.TOITOI, YakuId.CHIITOITSU].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.CHANTA, YakuId.JUNCHAN].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.SANSHOKUDOUJUN, YakuId.IIPEIKOU].includes(y.id)),
];

export const yakuRareGroups = [
  yakuList.filter((y: Yaku) => [YakuId.DOUBLERIICHI, YakuId.OPENRIICHI].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.HONROTO, YakuId.SHOSANGEN, YakuId.YAKUHAI4].includes(y.id)),

  yakuList.filter((y: Yaku) =>
    [YakuId.SANANKOU, YakuId.SANSHOKUDOUKOU, YakuId.SANKANTSU].includes(y.id)
  ),

  yakuList.filter((y: Yaku) => [YakuId.RYANPEIKOU].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.HAITEI, YakuId.HOUTEI, YakuId.RINSHANKAIHOU].includes(y.id)),

  yakuList.filter((y: Yaku) => [YakuId.CHANKAN, YakuId.RENHOU].includes(y.id)),
];

export const yakumanGroups = [
  yakuList.filter((y: Yaku) => [YakuId.TENHOU, YakuId.CHIHOU].includes(y.id)),

  yakuList.filter((y: Yaku) =>
    [YakuId.DAISANGEN, YakuId.DAISUUSHII, YakuId.SHOSUUSHII].includes(y.id)
  ),

  yakuList.filter((y: Yaku) => [YakuId.SUUANKOU, YakuId.SUUKANTSU].includes(y.id)),

  yakuList.filter((y: Yaku) =>
    [YakuId.CHINROTO, YakuId.TSUUIISOU, YakuId.KOKUSHIMUSOU].includes(y.id)
  ),

  yakuList.filter((y: Yaku) => [YakuId.RYUUIISOU, YakuId.CHUURENPOUTO].includes(y.id)),
];
