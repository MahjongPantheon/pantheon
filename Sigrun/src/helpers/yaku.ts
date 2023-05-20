/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
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

export const yakuList = [
  {
    id: YakuId.RIICHI,
    name: (i18n: I18nService) => i18n._t('Riichi'),
  },
  {
    id: YakuId.DOUBLERIICHI,
    name: (i18n: I18nService) => i18n._t('Daburu riichi'),
  },
  {
    id: YakuId.OPENRIICHI,
    name: (i18n: I18nService) => i18n._t('Open riichi'),
  },
  {
    id: YakuId.IPPATSU,
    name: (i18n: I18nService) => i18n._t('Ippatsu'),
  },
  {
    id: YakuId.MENZENTSUMO,
    name: (i18n: I18nService) => i18n._t('Menzentsumo'),
  },
  {
    id: YakuId.CHIITOITSU,
    name: (i18n: I18nService) => i18n._t('Chiitoitsu'),
  },
  {
    id: YakuId.PINFU,
    name: (i18n: I18nService) => i18n._t('Pinfu'),
  },
  {
    id: YakuId.TANYAO,
    name: (i18n: I18nService) => i18n._t('Tanyao'),
  },
  {
    id: YakuId.CHANTA,
    name: (i18n: I18nService) => i18n._t('Chanta'),
  },
  {
    id: YakuId.JUNCHAN,
    name: (i18n: I18nService) => i18n._t('Junchan'),
  },
  {
    id: YakuId.IIPEIKOU,
    name: (i18n: I18nService) => i18n._t('Iipeikou'),
  },
  {
    id: YakuId.RYANPEIKOU,
    name: (i18n: I18nService) => i18n._t('Ryanpeikou'),
  },
  {
    id: YakuId.SANSHOKUDOUJUN,
    name: (i18n: I18nService) => i18n._t('Sanshoku'),
  },
  {
    id: YakuId.SANSHOKUDOUKOU,
    name: (i18n: I18nService) => i18n._t('Sanshoku doukou'),
  },
  {
    id: YakuId.ITTSU,
    name: (i18n: I18nService) => i18n._t('Ittsu'),
  },
  {
    id: YakuId.YAKUHAI1,
    name: (i18n: I18nService) => i18n._t('Yakuhai x1'),
  },
  {
    id: YakuId.YAKUHAI2,
    name: (i18n: I18nService) => i18n._t('Yakuhai x2'),
  },
  {
    id: YakuId.YAKUHAI3,
    name: (i18n: I18nService) => i18n._t('Yakuhai x3'),
  },
  {
    id: YakuId.YAKUHAI4,
    name: (i18n: I18nService) => i18n._t('Yakuhai x4'),
  },
  {
    id: YakuId.TOITOI,
    name: (i18n: I18nService) => i18n._t('Toitoi'),
  },
  {
    id: YakuId.HONITSU,
    name: (i18n: I18nService) => i18n._t('Honitsu'),
  },
  {
    id: YakuId.HONROTO,
    name: (i18n: I18nService) => i18n._t('Honroutou'),
  },
  {
    id: YakuId.SANANKOU,
    name: (i18n: I18nService) => i18n._t('Sanankou'),
  },
  {
    id: YakuId.SHOSANGEN,
    name: (i18n: I18nService) => i18n._t('Shousangen'),
  },
  {
    id: YakuId.SANKANTSU,
    name: (i18n: I18nService) => i18n._t('Sankantsu'),
  },
  {
    id: YakuId.HOUTEI,
    name: (i18n: I18nService) => i18n._t('Houtei raoyui'),
  },
  {
    id: YakuId.HAITEI,
    name: (i18n: I18nService) => i18n._t('Haitei'),
  },
  {
    id: YakuId.RINSHANKAIHOU,
    name: (i18n: I18nService) => i18n._t('Rinshan kaihou'),
  },
  {
    id: YakuId.CHANKAN,
    name: (i18n: I18nService) => i18n._t('Chankan'),
  },
  {
    id: YakuId.RENHOU,
    name: (i18n: I18nService) => i18n._t('Renhou'),
  },
  {
    id: YakuId.SUUKANTSU,
    name: (i18n: I18nService) => i18n._t('Suukantsu'),
  },
  {
    id: YakuId.SUUANKOU,
    name: (i18n: I18nService) => i18n._t('Suuankou'),
  },
  {
    id: YakuId.DAISANGEN,
    name: (i18n: I18nService) => i18n._t('Daisangen'),
  },
  {
    id: YakuId.SHOSUUSHII,
    name: (i18n: I18nService) => i18n._t('Shousuushii'),
  },
  {
    id: YakuId.DAISUUSHII,
    name: (i18n: I18nService) => i18n._t('Daisuushii'),
  },
  {
    id: YakuId.TSUUIISOU,
    name: (i18n: I18nService) => i18n._t('Tsuuiisou'),
  },
  {
    id: YakuId.CHINROTO,
    name: (i18n: I18nService) => i18n._t('Chinroutou'),
  },
  {
    id: YakuId.CHINITSU,
    name: (i18n: I18nService) => i18n._t('Chinitsu'),
  },
  {
    id: YakuId.CHUURENPOUTO,
    name: (i18n: I18nService) => i18n._t('Chuuren poutou'),
  },
  {
    id: YakuId.RYUUIISOU,
    name: (i18n: I18nService) => i18n._t('Ryuuiisou'),
  },
  {
    id: YakuId.KOKUSHIMUSOU,
    name: (i18n: I18nService) => i18n._t('Kokushi musou'),
  },
  {
    id: YakuId.TENHOU,
    name: (i18n: I18nService) => i18n._t('Tenhou'),
  },
  {
    id: YakuId.CHIHOU,
    name: (i18n: I18nService) => i18n._t('Chihou'),
  },
];

export const yakuNameMap = (i18n: I18nService) =>
  Object.values(yakuList).reduce((acc, y) => {
    acc.set(y.id, y.name(i18n));
    return acc;
  }, new Map<YakuId, string>());

export const yakuWithPao = [
  {
    id: YakuId.DAISANGEN,
    name: (i18n: I18nService) => i18n._t('Daisangen'),
  },
  {
    id: YakuId.DAISUUSHII,
    name: (i18n: I18nService) => i18n._t('Daisuushii'),
  },
  {
    id: YakuId.TSUUIISOU,
    name: (i18n: I18nService) => i18n._t('Tsuuiisou'),
  },
  {
    id: YakuId.RYUUIISOU,
    name: (i18n: I18nService) => i18n._t('Ryuuiisou'),
  },
  {
    id: YakuId.CHINROTO,
    name: (i18n: I18nService) => i18n._t('Chinroutou'),
  },
  {
    id: YakuId.SUUKANTSU,
    name: (i18n: I18nService) => i18n._t('Suukantsu'),
  },
];
