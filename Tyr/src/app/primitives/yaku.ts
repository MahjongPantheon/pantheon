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

import { Yaku } from '../interfaces/common';

export enum YakuId {
  __OPENHAND = -1,
  TOITOI = 1,
  HONROTO = 2,
  SANANKOU = 3,
  SANSHOKUDOUKOU = 4,
  SANKANTSU = 5,
  SUUKANTSU = 6,
  SUUANKOU = 7,
  PINFU = 8,
  IIPEIKOU = 9,
  RYANPEIKOU = 10,
  SANSHOKUDOUJUN = 11,
  ITTSU = 12,
  YAKUHAI1 = 13,
  YAKUHAI2 = 14,
  YAKUHAI3 = 15,
  YAKUHAI4 = 16,
  YAKUHAI5 = 17,
  SHOSANGEN = 18,
  DAISANGEN = 19,
  SHOSUUSHII = 20,
  DAISUUSHII = 21,
  TSUUIISOU = 22,
  TANYAO = 23,
  CHANTA = 24,
  JUNCHAN = 25,
  CHINROTO = 26,
  HONITSU = 27,
  CHINITSU = 28,
  CHUURENPOUTO = 29,
  RYUUIISOU = 30,
  CHIITOITSU = 31,
  KOKUSHIMUSOU = 32,
  RIICHI = 33,
  DOUBLERIICHI = 34,
  IPPATSU = 35,
  MENZENTSUMO = 36,
  HAITEI = 37,
  RINSHANKAIHOU = 38,
  TENHOU = 39,
  CHIHOU = 40,
  HOUTEI = 41,
  CHANKAN = 42,
  RENHOU = 43,
  OPENRIICHI = 44
}

export const yakuList: Yaku[] = [
  {
    id: YakuId.__OPENHAND,
    yakuman: false,
    name: "Opened hand",
    shortName: "Opened hand",
  },
  {
    id: YakuId.TOITOI,
    yakuman: false,
    name: "Toitoi",
    shortName: "Toitoi",
  },
  {
    id: YakuId.HONROTO,
    yakuman: false,
    name: "Honroutou",
    shortName: "Honroutou"
  },
  {
    id: YakuId.SANANKOU,
    yakuman: false,
    name: "Sanankou",
    shortName: "Sanankou"
  },
  {
    id: YakuId.SANKANTSU,
    yakuman: false,
    name: "Sankantsu",
    shortName: "Sankantsu"
  },
  {
    id: YakuId.SUUKANTSU,
    yakuman: true,
    name: "Suukantsu",
    shortName: "Suukantsu",
  },
  {
    id: YakuId.SUUANKOU,
    yakuman: true,
    name: "Suuankou",
    shortName: "Suuankou"
  },
  {
    id: YakuId.PINFU,
    yakuman: false,
    name: "Pinfu",
    shortName: "Pinfu"
  },
  {
    id: YakuId.IIPEIKOU,
    yakuman: false,
    name: "Iipeikou",
    shortName: "Iipeikou"
  },
  {
    id: YakuId.RYANPEIKOU,
    yakuman: false,
    name: "Ryanpeikou",
    shortName: "Ryanpeikou"
  },
  {
    id: YakuId.SANSHOKUDOUJUN,
    yakuman: false,
    name: "Sanshoku",
    shortName: "Sanshoku"
  },
  {
    id: YakuId.SANSHOKUDOUKOU,
    yakuman: false,
    name: "Sanshoku doukou",
    shortName: "Sanshoku doukou"
  },
  {
    id: YakuId.ITTSU,
    yakuman: false,
    name: "Ittsu",
    shortName: "Ittsu"
  },
  {
    id: YakuId.YAKUHAI1,
    yakuman: false,
    name: "Yakuhai 1",
    shortName: "Yakuhai",
  },
  {
    id: YakuId.YAKUHAI2,
    yakuman: false,
    name: "Yakuhai 2",
    shortName: "x2",
  },
  {
    id: YakuId.YAKUHAI3,
    yakuman: false,
    name: "Yakuhai 3",
    shortName: "x3",
  },
  {
    id: YakuId.YAKUHAI4,
    yakuman: false,
    name: "Yakuhai 4",
    shortName: "x4"
  },
  {
    id: YakuId.SHOSANGEN,
    yakuman: false,
    name: "Shousangen",
    shortName: "Shousangen"
  },
  {
    id: YakuId.DAISANGEN,
    yakuman: true,
    name: "Daisangen",
    shortName: "Daisangen"
  },
  {
    id: YakuId.SHOSUUSHII,
    yakuman: true,
    name: "Shousuushii",
    shortName: "Shousuushii",
  },
  {
    id: YakuId.DAISUUSHII,
    yakuman: true,
    name: "Daisuushii",
    shortName: "Daisuushii"
  },
  {
    id: YakuId.TSUUIISOU,
    yakuman: true,
    name: "Tsuuiisou",
    shortName: "Tsuuiisou"
  },
  {
    id: YakuId.TANYAO,
    yakuman: false,
    name: "Tanyao",
    shortName: "Tanyao"
  },
  {
    id: YakuId.CHANTA,
    yakuman: false,
    name: "Chanta",
    shortName: "Chanta"
  },
  {
    id: YakuId.JUNCHAN,
    yakuman: false,
    name: "Junchan",
    shortName: "Junchan"
  },
  {
    id: YakuId.CHINROTO,
    yakuman: true,
    name: "Chinroutou",
    shortName: "Chinroutou"
  },
  {
    id: YakuId.HONITSU,
    yakuman: false,
    name: "Honitsu",
    shortName: "Honitsu"
  },
  {
    id: YakuId.CHINITSU,
    yakuman: false,
    name: "Chinitsu",
    shortName: "Chinitsu"
  },
  {
    id: YakuId.CHUURENPOUTO,
    yakuman: true,
    name: "Chuuren poutou",
    shortName: "Chuuren poutou"
  },
  {
    id: YakuId.RYUUIISOU,
    yakuman: true,
    name: "Ryuuiisou",
    shortName: "Ryuuiisou"
  },
  {
    id: YakuId.CHIITOITSU,
    yakuman: false,
    name: "Chiitoitsu",
    shortName: "Chiitoitsu"
  },
  {
    id: YakuId.KOKUSHIMUSOU,
    yakuman: true,
    name: "Kokushi musou",
    shortName: "Kokushi musou"
  },
  {
    id: YakuId.RIICHI,
    yakuman: false,
    name: "Riichi",
    shortName: "Riichi",
  },
  {
    id: YakuId.DOUBLERIICHI,
    yakuman: false,
    name: "Daburu riichi",
    shortName: "Daburu"
  },
  {
    id: YakuId.IPPATSU,
    yakuman: false,
    name: "Ippatsu",
    shortName: "Ippatsu",
  },
  {
    id: YakuId.MENZENTSUMO,
    yakuman: false,
    name: "Tsumo",
    shortName: "Tsumo",
  },
  {
    id: YakuId.HAITEI,
    yakuman: false,
    name: "Haitei",
    shortName: "Haitei"
  },
  {
    id: YakuId.RINSHANKAIHOU,
    yakuman: false,
    name: "Rinshan kaihou",
    shortName: "Rinshan"
  },
  {
    id: YakuId.TENHOU,
    yakuman: true,
    name: "Tenhou",
    shortName: "Tenhou"
  },
  {
    id: YakuId.CHIHOU,
    yakuman: true,
    name: "Chiihou",
    shortName: "Chiihou"
  },
  {
    id: YakuId.HOUTEI,
    yakuman: false,
    name: "Houtei raoyui",
    shortName: "Houtei"
  },
  {
    id: YakuId.CHANKAN,
    yakuman: false,
    name: "Chankan",
    shortName: "Chankan"
  },
  {
    id: YakuId.RENHOU,
    yakuman: false,
    name: "Renhou",
    shortName: "Renhou"
  },
  {
    id: YakuId.OPENRIICHI,
    yakuman: false,
    name: "Open riichi",
    shortName: "Open riichi"
  },
];

export const yakuMap: { [id: number]: Yaku } = {};
yakuList.forEach((y) => yakuMap[y.id] = y);

const viewPriority = [
  YakuId.RIICHI,
  YakuId.DOUBLERIICHI,
  YakuId.OPENRIICHI,
  YakuId.IPPATSU,
  YakuId.MENZENTSUMO,
  YakuId.CHIITOITSU,
  YakuId.CHINITSU,
  YakuId.TANYAO,
  YakuId.PINFU,
  YakuId.SANSHOKUDOUJUN,
  YakuId.CHANTA,
  YakuId.JUNCHAN,
  YakuId.ITTSU,
  YakuId.IIPEIKOU,
  YakuId.RYANPEIKOU,
  YakuId.SHOSANGEN,
  YakuId.HONITSU,
  YakuId.YAKUHAI1,
  YakuId.YAKUHAI2,
  YakuId.YAKUHAI3,
  YakuId.YAKUHAI4,
  YakuId.YAKUHAI5,
  YakuId.TOITOI,
  YakuId.SANKANTSU,
  YakuId.SANANKOU,
  YakuId.HONROTO,
  YakuId.SANSHOKUDOUKOU,
  YakuId.HAITEI,
  YakuId.HOUTEI,
  YakuId.CHANKAN,
  YakuId.RINSHANKAIHOU,
  YakuId.SUUKANTSU,
  YakuId.SUUANKOU,
  YakuId.DAISANGEN,
  YakuId.SHOSUUSHII,
  YakuId.DAISUUSHII,
  YakuId.TSUUIISOU,
  YakuId.CHINROTO,
  YakuId.CHUURENPOUTO,
  YakuId.RYUUIISOU,
  YakuId.KOKUSHIMUSOU,
  YakuId.TENHOU,
  YakuId.CHIHOU,
  YakuId.RENHOU
];

export function sortByViewPriority(list: Yaku[]): Yaku[] {
  return viewPriority
    .map<Yaku | null>((id: YakuId) => list.indexOf(yakuMap[id]) === -1 ? null : yakuMap[id])
    .filter((y) => !!y);
}
