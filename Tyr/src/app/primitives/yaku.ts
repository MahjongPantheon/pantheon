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
    name: "Открытая рука",
    shortName: "Открытая рука",
  },
  {
    id: YakuId.TOITOI,
    yakuman: false,
    name: "Тойтой",
    shortName: "Тойтой",
  },
  {
    id: YakuId.HONROTO,
    yakuman: false,
    name: "Хонрото",
    shortName: "Хонрото"
  },
  {
    id: YakuId.SANANKOU,
    yakuman: false,
    name: "Сананко",
    shortName: "Сананко"
  },
  {
    id: YakuId.SANKANTSU,
    yakuman: false,
    name: "Санканцу",
    shortName: "Санканцу"
  },
  {
    id: YakuId.SUUKANTSU,
    yakuman: true,
    name: "Сууканцу",
    shortName: "Сууканцу",
  },
  {
    id: YakuId.SUUANKOU,
    yakuman: true,
    name: "Сууанко",
    shortName: "Сууанко"
  },
  {
    id: YakuId.PINFU,
    yakuman: false,
    name: "Пинфу",
    shortName: "Пинфу"
  },
  {
    id: YakuId.IIPEIKOU,
    yakuman: false,
    name: "Иипейко",
    shortName: "Иипейко"
  },
  {
    id: YakuId.RYANPEIKOU,
    yakuman: false,
    name: "Рянпейко",
    shortName: "Рянпейко"
  },
  {
    id: YakuId.SANSHOKUDOUJUN,
    yakuman: false,
    name: "Саншоку",
    shortName: "Саншоку"
  },
  {
    id: YakuId.SANSHOKUDOUKOU,
    yakuman: false,
    name: "Саншоку доко",
    shortName: "Сандоко"
  },
  {
    id: YakuId.ITTSU,
    yakuman: false,
    name: "Иццу",
    shortName: "Иццу"
  },
  {
    id: YakuId.YAKUHAI1,
    yakuman: false,
    name: "Якухай 1",
    shortName: "Якухай",
  },
  {
    id: YakuId.YAKUHAI2,
    yakuman: false,
    name: "Якухай 2",
    shortName: "x2",
  },
  {
    id: YakuId.YAKUHAI3,
    yakuman: false,
    name: "Якухай 3",
    shortName: "x3",
  },
  {
    id: YakuId.YAKUHAI4,
    yakuman: false,
    name: "Якухай 4",
    shortName: "x4"
  },
  //{
  //  id: YakuId.YAKUHAI5,
  //  yakuman: false,
  //  name: "Якухай 5",
  //  shortName: "x5"
  //},
  {
    id: YakuId.SHOSANGEN,
    yakuman: false,
    name: "Шосанген",
    shortName: "Шосанген"
  },
  {
    id: YakuId.DAISANGEN,
    yakuman: true,
    name: "Дайсанген",
    shortName: "Дайсанген"
  },
  {
    id: YakuId.SHOSUUSHII,
    yakuman: true,
    name: "Шосуши",
    shortName: "Шосуши",
  },
  {
    id: YakuId.DAISUUSHII,
    yakuman: true,
    name: "Дайсуши",
    shortName: "Дайсуши"
  },
  {
    id: YakuId.TSUUIISOU,
    yakuman: true,
    name: "Цуисо",
    shortName: "Цуисо"
  },
  {
    id: YakuId.TANYAO,
    yakuman: false,
    name: "Таняо",
    shortName: "Таняо"
  },
  {
    id: YakuId.CHANTA,
    yakuman: false,
    name: "Чанта",
    shortName: "Чанта"
  },
  {
    id: YakuId.JUNCHAN,
    yakuman: false,
    name: "Джунчан",
    shortName: "Джунчан"
  },
  {
    id: YakuId.CHINROTO,
    yakuman: true,
    name: "Чинрото",
    shortName: "Чинрото"
  },
  {
    id: YakuId.HONITSU,
    yakuman: false,
    name: "Хоницу",
    shortName: "Хоницу"
  },
  {
    id: YakuId.CHINITSU,
    yakuman: false,
    name: "Чиницу",
    shortName: "Чиницу"
  },
  {
    id: YakuId.CHUURENPOUTO,
    yakuman: true,
    name: "Чууренпото",
    shortName: "Чууренпото"
  },
  {
    id: YakuId.RYUUIISOU,
    yakuman: true,
    name: "Рюисо",
    shortName: "Рюисо"
  },
  {
    id: YakuId.CHIITOITSU,
    yakuman: false,
    name: "Чиитойцу",
    shortName: "Чиитойцу"
  },
  {
    id: YakuId.KOKUSHIMUSOU,
    yakuman: true,
    name: "Кокушимусо",
    shortName: "Кокушимусо"
  },
  {
    id: YakuId.RIICHI,
    yakuman: false,
    name: "Риичи",
    shortName: "Риичи",
  },
  {
    id: YakuId.DOUBLERIICHI,
    yakuman: false,
    name: "Дабл риичи",
    shortName: "Дабури"
  },
  {
    id: YakuId.IPPATSU,
    yakuman: false,
    name: "Иппацу",
    shortName: "Иппацу",
  },
  {
    id: YakuId.MENZENTSUMO,
    yakuman: false,
    name: "Цумо",
    shortName: "Цумо",
  },
  {
    id: YakuId.HAITEI,
    yakuman: false,
    name: "Хайтей",
    shortName: "Хайтей"
  },
  {
    id: YakuId.RINSHANKAIHOU,
    yakuman: false,
    name: "Риншан кайхо",
    shortName: "Риншан"
  },
  {
    id: YakuId.TENHOU,
    yakuman: true,
    name: "Тенхо",
    shortName: "Тенхо"
  },
  {
    id: YakuId.CHIHOU,
    yakuman: true,
    name: "Чихо",
    shortName: "Чихо"
  },
  {
    id: YakuId.HOUTEI,
    yakuman: false,
    name: "Хотей",
    shortName: "Хотей"
  },
  {
    id: YakuId.CHANKAN,
    yakuman: false,
    name: "Чанкан",
    shortName: "Чанкан"
  },
  {
    id: YakuId.RENHOU,
    yakuman: false,
    name: "Ренхо",
    shortName: "Ренхо"
  },
  {
    id: YakuId.OPENRIICHI,
    yakuman: false,
    name: "Опен риичи",
    shortName: "Опен"
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
