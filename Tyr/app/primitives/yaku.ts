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
import { I18nService } from '../services/i18n';

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
  OPENRIICHI = 44,
}

export interface YakuMap<T> {
  [YakuId.__OPENHAND]: T;
  [YakuId.TOITOI]: T;
  [YakuId.HONROTO]: T;
  [YakuId.SANANKOU]: T;
  [YakuId.SANSHOKUDOUKOU]: T;
  [YakuId.SANKANTSU]: T;
  [YakuId.SUUKANTSU]: T;
  [YakuId.SUUANKOU]: T;
  [YakuId.PINFU]: T;
  [YakuId.IIPEIKOU]: T;
  [YakuId.RYANPEIKOU]: T;
  [YakuId.SANSHOKUDOUJUN]: T;
  [YakuId.ITTSU]: T;
  [YakuId.YAKUHAI1]: T;
  [YakuId.YAKUHAI2]: T;
  [YakuId.YAKUHAI3]: T;
  [YakuId.YAKUHAI4]: T;
  [YakuId.SHOSANGEN]: T;
  [YakuId.DAISANGEN]: T;
  [YakuId.SHOSUUSHII]: T;
  [YakuId.DAISUUSHII]: T;
  [YakuId.TSUUIISOU]: T;
  [YakuId.TANYAO]: T;
  [YakuId.CHANTA]: T;
  [YakuId.JUNCHAN]: T;
  [YakuId.CHINROTO]: T;
  [YakuId.HONITSU]: T;
  [YakuId.CHINITSU]: T;
  [YakuId.CHUURENPOUTO]: T;
  [YakuId.RYUUIISOU]: T;
  [YakuId.CHIITOITSU]: T;
  [YakuId.KOKUSHIMUSOU]: T;
  [YakuId.RIICHI]: T;
  [YakuId.DOUBLERIICHI]: T;
  [YakuId.IPPATSU]: T;
  [YakuId.MENZENTSUMO]: T;
  [YakuId.HAITEI]: T;
  [YakuId.RINSHANKAIHOU]: T;
  [YakuId.TENHOU]: T;
  [YakuId.CHIHOU]: T;
  [YakuId.HOUTEI]: T;
  [YakuId.CHANKAN]: T;
  [YakuId.RENHOU]: T;
  [YakuId.OPENRIICHI]: T;
}

// Sequence of yaku here is very important for packing and unpacking, see yaku-compat.ts
export const yakuList: Yaku[] = [
  {
    id: YakuId.__OPENHAND,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Opened hand'),
    shortName: (i18n: I18nService) => i18n._t('Opened hand'),
  },
  {
    id: YakuId.TOITOI,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Toitoi'),
    shortName: (i18n: I18nService) => i18n._t('Toitoi'),
  },
  {
    id: YakuId.HONROTO,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Honroutou'),
    shortName: (i18n: I18nService) => i18n._t('Honroutou'),
  },
  {
    id: YakuId.SANANKOU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Sanankou'),
    shortName: (i18n: I18nService) => i18n._t('Sanankou'),
  },
  {
    id: YakuId.SANKANTSU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Sankantsu'),
    shortName: (i18n: I18nService) => i18n._t('Sankantsu'),
  },
  {
    id: YakuId.SUUKANTSU,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Suukantsu'),
    shortName: (i18n: I18nService) => i18n._t('Suukantsu'),
  },
  {
    id: YakuId.SUUANKOU,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Suuankou'),
    shortName: (i18n: I18nService) => i18n._t('Suuankou'),
  },
  {
    id: YakuId.PINFU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Pinfu'),
    shortName: (i18n: I18nService) => i18n._t('Pinfu'),
  },
  {
    id: YakuId.IIPEIKOU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Iipeikou'),
    shortName: (i18n: I18nService) => i18n._t('Iipeikou'),
  },
  {
    id: YakuId.RYANPEIKOU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Ryanpeikou'),
    shortName: (i18n: I18nService) => i18n._t('Ryanpeikou'),
  },
  {
    id: YakuId.SANSHOKUDOUJUN,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Sanshoku'),
    shortName: (i18n: I18nService) => i18n._t('Sanshoku'),
  },
  {
    id: YakuId.SANSHOKUDOUKOU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Sanshoku doukou'),
    shortName: (i18n: I18nService) => i18n._t('Sanshoku doukou'),
  },
  {
    id: YakuId.ITTSU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Ittsu'),
    shortName: (i18n: I18nService) => i18n._t('Ittsu'),
  },
  {
    id: YakuId.YAKUHAI1,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Yakuhai x1'),
    shortName: (i18n: I18nService) => i18n._t('Yakuhai'),
  },
  {
    id: YakuId.YAKUHAI2,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Yakuhai x2'),
    shortName: (i18n: I18nService) => i18n._t('x2'),
  },
  {
    id: YakuId.YAKUHAI3,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Yakuhai x3'),
    shortName: (i18n: I18nService) => i18n._t('x3'),
  },
  {
    id: YakuId.YAKUHAI4,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Yakuhai x4'),
    shortName: (i18n: I18nService) => i18n._t('x4'),
  },
  {
    id: YakuId.SHOSANGEN,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Shousangen'),
    shortName: (i18n: I18nService) => i18n._t('Shousangen'),
  },
  {
    id: YakuId.DAISANGEN,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Daisangen'),
    shortName: (i18n: I18nService) => i18n._t('Daisangen'),
  },
  {
    id: YakuId.SHOSUUSHII,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Shousuushii'),
    shortName: (i18n: I18nService) => i18n._t('Shousuushii'),
  },
  {
    id: YakuId.DAISUUSHII,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Daisuushii'),
    shortName: (i18n: I18nService) => i18n._t('Daisuushii'),
  },
  {
    id: YakuId.TSUUIISOU,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Tsuuiisou'),
    shortName: (i18n: I18nService) => i18n._t('Tsuuiisou'),
  },
  {
    id: YakuId.TANYAO,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Tanyao'),
    shortName: (i18n: I18nService) => i18n._t('Tanyao'),
  },
  {
    id: YakuId.CHANTA,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Chanta'),
    shortName: (i18n: I18nService) => i18n._t('Chanta'),
  },
  {
    id: YakuId.JUNCHAN,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Junchan'),
    shortName: (i18n: I18nService) => i18n._t('Junchan'),
  },
  {
    id: YakuId.CHINROTO,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Chinroutou'),
    shortName: (i18n: I18nService) => i18n._t('Chinroutou'),
  },
  {
    id: YakuId.HONITSU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Honitsu'),
    shortName: (i18n: I18nService) => i18n._t('Honitsu'),
  },
  {
    id: YakuId.CHINITSU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Chinitsu'),
    shortName: (i18n: I18nService) => i18n._t('Chinitsu'),
  },
  {
    id: YakuId.CHUURENPOUTO,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Chuuren poutou'),
    shortName: (i18n: I18nService) => i18n._t('Chuuren poutou'),
  },
  {
    id: YakuId.RYUUIISOU,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Ryuuiisou'),
    shortName: (i18n: I18nService) => i18n._t('Ryuuiisou'),
  },
  {
    id: YakuId.CHIITOITSU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Chiitoitsu'),
    shortName: (i18n: I18nService) => i18n._t('Chiitoitsu'),
  },
  {
    id: YakuId.KOKUSHIMUSOU,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Kokushi musou'),
    shortName: (i18n: I18nService) => i18n._t('Kokushi musou'),
  },
  {
    id: YakuId.RIICHI,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Riichi'),
    shortName: (i18n: I18nService) => i18n._t('Riichi'),
  },
  {
    id: YakuId.DOUBLERIICHI,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Daburu riichi'),
    shortName: (i18n: I18nService) => i18n._t('Daburu'),
  },
  {
    id: YakuId.IPPATSU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Ippatsu'),
    shortName: (i18n: I18nService) => i18n._t('Ippatsu'),
  },
  {
    id: YakuId.MENZENTSUMO,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Menzentsumo'),
    shortName: (i18n: I18nService) => i18n._t('Menzentsumo'),
  },
  {
    id: YakuId.HAITEI,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Haitei'),
    shortName: (i18n: I18nService) => i18n._t('Haitei'),
  },
  {
    id: YakuId.RINSHANKAIHOU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Rinshan kaihou'),
    shortName: (i18n: I18nService) => i18n._t('Rinshan'),
  },
  {
    id: YakuId.TENHOU,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Tenhou'),
    shortName: (i18n: I18nService) => i18n._t('Tenhou'),
  },
  {
    id: YakuId.CHIHOU,
    yakuman: true,
    name: (i18n: I18nService) => i18n._t('Chiihou'),
    shortName: (i18n: I18nService) => i18n._t('Chiihou'),
  },
  {
    id: YakuId.HOUTEI,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Houtei raoyui'),
    shortName: (i18n: I18nService) => i18n._t('Houtei'),
  },
  {
    id: YakuId.CHANKAN,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Chankan'),
    shortName: (i18n: I18nService) => i18n._t('Chankan'),
  },
  {
    id: YakuId.RENHOU,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Renhou'),
    shortName: (i18n: I18nService) => i18n._t('Renhou'),
  },
  {
    id: YakuId.OPENRIICHI,
    yakuman: false,
    name: (i18n: I18nService) => i18n._t('Open riichi'),
    shortName: (i18n: I18nService) => i18n._t('Open riichi'),
  },
];

export const yakuMap: { [id: number]: Yaku } = {};
yakuList.forEach((y) => (yakuMap[y.id] = y));

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
  YakuId.RENHOU,
];

export function sortByViewPriority(list: Yaku[]): Yaku[] {
  return viewPriority
    .map<Yaku | null>((id: YakuId) => (!list.includes(yakuMap[id]) ? null : yakuMap[id]))
    .filter((y): y is Yaku => !!y);
}
