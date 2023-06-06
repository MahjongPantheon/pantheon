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

import { YakuId as Y, yakuList } from './yaku';
import { Yaku } from '../interfaces/common';
import { Node, Graph, EdgeType } from './graph';

// TODO: придумать что-нибудь, чтобы вся эта ерунда не занимала столько места в бандле.
// В константы перевести может?

const yakuSuppressedByLimits = [
  Y.TOITOI,
  Y.HONROTO,
  Y.SANANKOU,
  Y.SANSHOKUDOUKOU,
  Y.SANKANTSU,
  Y.PINFU,
  Y.IIPEIKOU,
  Y.RYANPEIKOU,
  Y.SANSHOKUDOUJUN,
  Y.ITTSU,
  Y.YAKUHAI1,
  Y.YAKUHAI2,
  Y.YAKUHAI3,
  Y.YAKUHAI4,
  Y.SHOSANGEN,
  Y.TANYAO,
  Y.CHANTA,
  Y.JUNCHAN,
  Y.HONITSU,
  Y.CHINITSU,
  Y.CHIITOITSU,
  Y.RIICHI,
  Y.DOUBLERIICHI,
  Y.IPPATSU,
  Y.MENZENTSUMO,
  Y.HAITEI,
  Y.RINSHANKAIHOU,
  Y.HOUTEI,
  Y.CHANKAN,
  Y.OPENRIICHI,
];

export const limits = [
  Y.SUUKANTSU,
  Y.SUUANKOU,
  Y.DAISANGEN,
  Y.SHOSUUSHII,
  Y.DAISUUSHII,
  Y.TSUUIISOU,
  Y.CHINROTO,
  Y.CHUURENPOUTO,
  Y.RYUUIISOU,
  Y.KOKUSHIMUSOU,
  Y.TENHOU,
  Y.CHIHOU,
  Y.RENHOU,
];

// Meaning:
// - first yaku always CONTAINS second one,
// OR
// - second yaku is completely disabled by first yaku (as for yakuman, for ex.)
const suppressingYaku = [
  [Y.HONROTO, Y.CHANTA],
  [Y.RYANPEIKOU, Y.IIPEIKOU],
  [Y.YAKUHAI2, Y.YAKUHAI1],
  [Y.YAKUHAI3, Y.YAKUHAI2],
  [Y.YAKUHAI3, Y.YAKUHAI1],
  [Y.YAKUHAI4, Y.YAKUHAI3],
  [Y.YAKUHAI4, Y.YAKUHAI2],
  [Y.YAKUHAI4, Y.YAKUHAI1],
  [Y.JUNCHAN, Y.CHANTA],
  [Y.CHINITSU, Y.HONITSU],
  [Y.CHIITOITSU, Y.IIPEIKOU],
  [Y.RYANPEIKOU, Y.CHIITOITSU],
  [Y.DOUBLERIICHI, Y.RIICHI],
  [Y.DAISUUSHII, Y.SHOSUUSHII],

  [Y.__OPENHAND, Y.CHIITOITSU],
  [Y.__OPENHAND, Y.CHUURENPOUTO],
  [Y.__OPENHAND, Y.DOUBLERIICHI],
  [Y.__OPENHAND, Y.IIPEIKOU],
  [Y.__OPENHAND, Y.IPPATSU],
  [Y.__OPENHAND, Y.KOKUSHIMUSOU],
  [Y.__OPENHAND, Y.OPENRIICHI],
  [Y.__OPENHAND, Y.PINFU],
  [Y.__OPENHAND, Y.RIICHI],
  [Y.__OPENHAND, Y.RYANPEIKOU],
  [Y.__OPENHAND, Y.SUUANKOU],

  // [Y.__OPENHAND, Y.MENZENTSUMO], // Note: do not uncomment, this is handled on upper level by disabling buttons
  // [Y.MENZENTSUMO, Y.__OPENHAND], // Note: do not uncomment, this is handled on upper level by disabling buttons
].concat(
  limits
    .map((limit) => yakuSuppressedByLimits.map((yaku) => [limit, yaku]))
    .reduce((acc, arr) => acc.concat(arr))
);

const combinableYaku = [
  [Y.__OPENHAND, Y.TOITOI],
  [Y.__OPENHAND, Y.HONROTO],
  [Y.__OPENHAND, Y.SANANKOU],
  [Y.__OPENHAND, Y.SANSHOKUDOUKOU],
  [Y.__OPENHAND, Y.SANKANTSU],
  [Y.__OPENHAND, Y.SUUKANTSU],
  [Y.__OPENHAND, Y.SANSHOKUDOUJUN],
  [Y.__OPENHAND, Y.ITTSU],
  [Y.__OPENHAND, Y.YAKUHAI1],
  [Y.__OPENHAND, Y.YAKUHAI2],
  [Y.__OPENHAND, Y.YAKUHAI3],
  [Y.__OPENHAND, Y.YAKUHAI4],
  [Y.__OPENHAND, Y.SHOSANGEN],
  [Y.__OPENHAND, Y.DAISANGEN],
  [Y.__OPENHAND, Y.SHOSUUSHII],
  [Y.__OPENHAND, Y.DAISUUSHII],
  [Y.__OPENHAND, Y.TSUUIISOU],
  [Y.__OPENHAND, Y.TANYAO],
  [Y.__OPENHAND, Y.CHANTA],
  [Y.__OPENHAND, Y.JUNCHAN],
  [Y.__OPENHAND, Y.CHINROTO],
  [Y.__OPENHAND, Y.HONITSU],
  [Y.__OPENHAND, Y.CHINITSU],
  [Y.__OPENHAND, Y.RYUUIISOU],
  [Y.__OPENHAND, Y.HAITEI],
  [Y.__OPENHAND, Y.RINSHANKAIHOU],
  [Y.__OPENHAND, Y.HOUTEI],
  [Y.__OPENHAND, Y.CHANKAN],
  [Y.__OPENHAND, Y.MENZENTSUMO], // TODO: this is handled on upper level by disabling buttons

  [Y.TOITOI, Y.HONROTO], // this is actually a requirement!
  [Y.TOITOI, Y.SANANKOU],
  [Y.TOITOI, Y.SANSHOKUDOUKOU],
  [Y.TOITOI, Y.SANKANTSU],
  [Y.TOITOI, Y.YAKUHAI1],
  [Y.TOITOI, Y.YAKUHAI2],
  [Y.TOITOI, Y.YAKUHAI3],
  [Y.TOITOI, Y.YAKUHAI4],
  [Y.TOITOI, Y.SHOSANGEN],
  [Y.TOITOI, Y.TANYAO],
  [Y.TOITOI, Y.HONITSU],
  [Y.TOITOI, Y.CHINITSU],
  [Y.TOITOI, Y.RIICHI],
  [Y.TOITOI, Y.DOUBLERIICHI],
  [Y.TOITOI, Y.IPPATSU],
  [Y.TOITOI, Y.HAITEI],
  [Y.TOITOI, Y.RINSHANKAIHOU],
  [Y.TOITOI, Y.HOUTEI],
  [Y.TOITOI, Y.OPENRIICHI],

  [Y.HONROTO, Y.SANANKOU],
  [Y.HONROTO, Y.SANSHOKUDOUKOU],
  [Y.HONROTO, Y.SANKANTSU],
  [Y.HONROTO, Y.YAKUHAI1],
  [Y.HONROTO, Y.YAKUHAI2],
  [Y.HONROTO, Y.YAKUHAI3],
  [Y.HONROTO, Y.YAKUHAI4],
  [Y.HONROTO, Y.SHOSANGEN],
  [Y.HONROTO, Y.HONITSU],
  [Y.HONROTO, Y.CHIITOITSU],
  [Y.HONROTO, Y.RIICHI],
  [Y.HONROTO, Y.DOUBLERIICHI],
  [Y.HONROTO, Y.MENZENTSUMO],
  [Y.HONROTO, Y.IPPATSU],
  [Y.HONROTO, Y.HAITEI],
  [Y.HONROTO, Y.RINSHANKAIHOU],
  [Y.HONROTO, Y.HOUTEI],
  [Y.HONROTO, Y.OPENRIICHI],

  [Y.SANANKOU, Y.SANSHOKUDOUKOU],
  [Y.SANANKOU, Y.SANKANTSU],
  [Y.SANANKOU, Y.YAKUHAI1],
  [Y.SANANKOU, Y.YAKUHAI2],
  [Y.SANANKOU, Y.YAKUHAI3],
  [Y.SANANKOU, Y.YAKUHAI4],
  [Y.SANANKOU, Y.SHOSANGEN],
  [Y.SANANKOU, Y.TANYAO],
  [Y.SANANKOU, Y.HONITSU],
  [Y.SANANKOU, Y.CHINITSU],
  [Y.SANANKOU, Y.RIICHI],
  [Y.SANANKOU, Y.IPPATSU],
  [Y.SANANKOU, Y.DOUBLERIICHI],
  [Y.SANANKOU, Y.MENZENTSUMO],
  [Y.SANANKOU, Y.HAITEI],
  [Y.SANANKOU, Y.RINSHANKAIHOU],
  [Y.SANANKOU, Y.HOUTEI],
  [Y.SANANKOU, Y.CHANKAN],
  [Y.SANANKOU, Y.OPENRIICHI],
  [Y.SANANKOU, Y.CHANTA],
  [Y.SANANKOU, Y.JUNCHAN],

  [Y.SANSHOKUDOUKOU, Y.SANKANTSU],
  [Y.SANSHOKUDOUKOU, Y.YAKUHAI1],
  [Y.SANSHOKUDOUKOU, Y.YAKUHAI2],
  [Y.SANSHOKUDOUKOU, Y.TANYAO],
  [Y.SANSHOKUDOUKOU, Y.CHANTA],
  [Y.SANSHOKUDOUKOU, Y.JUNCHAN],
  [Y.SANSHOKUDOUKOU, Y.RIICHI],
  [Y.SANSHOKUDOUKOU, Y.DOUBLERIICHI],
  [Y.SANSHOKUDOUKOU, Y.IPPATSU],
  [Y.SANSHOKUDOUKOU, Y.MENZENTSUMO],
  [Y.SANSHOKUDOUKOU, Y.HAITEI],
  [Y.SANSHOKUDOUKOU, Y.RINSHANKAIHOU],
  [Y.SANSHOKUDOUKOU, Y.HOUTEI],
  [Y.SANSHOKUDOUKOU, Y.CHANKAN],
  [Y.SANSHOKUDOUKOU, Y.OPENRIICHI],

  [Y.SANKANTSU, Y.YAKUHAI1],
  [Y.SANKANTSU, Y.YAKUHAI2],
  [Y.SANKANTSU, Y.YAKUHAI3],
  [Y.SANKANTSU, Y.YAKUHAI4],
  [Y.SANKANTSU, Y.SHOSANGEN],
  [Y.SANKANTSU, Y.TANYAO],
  [Y.SANKANTSU, Y.HONITSU],
  [Y.SANKANTSU, Y.CHINITSU],
  [Y.SANKANTSU, Y.RIICHI],
  [Y.SANKANTSU, Y.DOUBLERIICHI],
  [Y.SANKANTSU, Y.IPPATSU],
  [Y.SANKANTSU, Y.MENZENTSUMO],
  [Y.SANKANTSU, Y.HAITEI],
  [Y.SANKANTSU, Y.RINSHANKAIHOU],
  [Y.SANKANTSU, Y.HOUTEI],
  [Y.SANKANTSU, Y.CHANKAN],
  [Y.SANKANTSU, Y.CHANTA],
  [Y.SANKANTSU, Y.JUNCHAN],
  [Y.SANKANTSU, Y.OPENRIICHI],

  [Y.PINFU, Y.IIPEIKOU],
  [Y.PINFU, Y.RYANPEIKOU],
  [Y.PINFU, Y.SANSHOKUDOUJUN],
  [Y.PINFU, Y.ITTSU],
  [Y.PINFU, Y.TANYAO],
  [Y.PINFU, Y.CHANTA],
  [Y.PINFU, Y.JUNCHAN],
  [Y.PINFU, Y.HONITSU],
  [Y.PINFU, Y.CHINITSU],
  [Y.PINFU, Y.RIICHI],
  [Y.PINFU, Y.DOUBLERIICHI],
  [Y.PINFU, Y.IPPATSU],
  [Y.PINFU, Y.MENZENTSUMO],
  [Y.PINFU, Y.HAITEI],
  [Y.PINFU, Y.HOUTEI],
  [Y.PINFU, Y.CHANKAN],
  [Y.PINFU, Y.OPENRIICHI],

  [Y.IIPEIKOU, Y.SANSHOKUDOUJUN],
  [Y.IIPEIKOU, Y.ITTSU],
  [Y.IIPEIKOU, Y.YAKUHAI1],
  [Y.IIPEIKOU, Y.YAKUHAI2],
  [Y.IIPEIKOU, Y.TANYAO],
  [Y.IIPEIKOU, Y.CHANTA],
  [Y.IIPEIKOU, Y.JUNCHAN],
  [Y.IIPEIKOU, Y.HONITSU],
  [Y.IIPEIKOU, Y.CHINITSU],
  [Y.IIPEIKOU, Y.RIICHI],
  [Y.IIPEIKOU, Y.DOUBLERIICHI],
  [Y.IIPEIKOU, Y.IPPATSU],
  [Y.IIPEIKOU, Y.MENZENTSUMO],
  [Y.IIPEIKOU, Y.HAITEI],
  [Y.IIPEIKOU, Y.RINSHANKAIHOU],
  [Y.IIPEIKOU, Y.HOUTEI],
  [Y.IIPEIKOU, Y.CHANKAN],
  [Y.IIPEIKOU, Y.OPENRIICHI],
  [Y.IIPEIKOU, Y.SHOSANGEN],

  [Y.RYANPEIKOU, Y.TANYAO],
  [Y.RYANPEIKOU, Y.CHANTA],
  [Y.RYANPEIKOU, Y.JUNCHAN],
  [Y.RYANPEIKOU, Y.HONITSU],
  [Y.RYANPEIKOU, Y.CHINITSU],
  [Y.RYANPEIKOU, Y.RIICHI],
  [Y.RYANPEIKOU, Y.DOUBLERIICHI],
  [Y.RYANPEIKOU, Y.IPPATSU],
  [Y.RYANPEIKOU, Y.MENZENTSUMO],
  [Y.RYANPEIKOU, Y.HAITEI],
  [Y.RYANPEIKOU, Y.HOUTEI],
  [Y.RYANPEIKOU, Y.OPENRIICHI],

  [Y.SANSHOKUDOUJUN, Y.YAKUHAI1],
  [Y.SANSHOKUDOUJUN, Y.YAKUHAI2],
  [Y.SANSHOKUDOUJUN, Y.TANYAO],
  [Y.SANSHOKUDOUJUN, Y.CHANTA],
  [Y.SANSHOKUDOUJUN, Y.JUNCHAN],
  [Y.SANSHOKUDOUJUN, Y.RIICHI],
  [Y.SANSHOKUDOUJUN, Y.DOUBLERIICHI],
  [Y.SANSHOKUDOUJUN, Y.IPPATSU],
  [Y.SANSHOKUDOUJUN, Y.MENZENTSUMO],
  [Y.SANSHOKUDOUJUN, Y.HAITEI],
  [Y.SANSHOKUDOUJUN, Y.RINSHANKAIHOU],
  [Y.SANSHOKUDOUJUN, Y.HOUTEI],
  [Y.SANSHOKUDOUJUN, Y.CHANKAN],
  [Y.SANSHOKUDOUJUN, Y.OPENRIICHI],

  [Y.ITTSU, Y.YAKUHAI1],
  [Y.ITTSU, Y.YAKUHAI2],
  [Y.ITTSU, Y.HONITSU],
  [Y.ITTSU, Y.CHINITSU],
  [Y.ITTSU, Y.RIICHI],
  [Y.ITTSU, Y.DOUBLERIICHI],
  [Y.ITTSU, Y.IPPATSU],
  [Y.ITTSU, Y.MENZENTSUMO],
  [Y.ITTSU, Y.HAITEI],
  [Y.ITTSU, Y.RINSHANKAIHOU],
  [Y.ITTSU, Y.HOUTEI],
  [Y.ITTSU, Y.CHANKAN],
  [Y.ITTSU, Y.OPENRIICHI],

  [Y.YAKUHAI1, Y.CHANTA],
  [Y.YAKUHAI1, Y.HONITSU],
  [Y.YAKUHAI1, Y.RIICHI],
  [Y.YAKUHAI1, Y.DOUBLERIICHI],
  [Y.YAKUHAI1, Y.IPPATSU],
  [Y.YAKUHAI1, Y.MENZENTSUMO],
  [Y.YAKUHAI1, Y.HAITEI],
  [Y.YAKUHAI1, Y.RINSHANKAIHOU],
  [Y.YAKUHAI1, Y.HOUTEI],
  [Y.YAKUHAI1, Y.CHANKAN],
  [Y.YAKUHAI1, Y.OPENRIICHI],

  [Y.YAKUHAI2, Y.SHOSANGEN], // Actually a requirement!
  [Y.YAKUHAI2, Y.CHANTA],
  [Y.YAKUHAI2, Y.HONITSU],
  [Y.YAKUHAI2, Y.RIICHI],
  [Y.YAKUHAI2, Y.DOUBLERIICHI],
  [Y.YAKUHAI2, Y.IPPATSU],
  [Y.YAKUHAI2, Y.MENZENTSUMO],
  [Y.YAKUHAI2, Y.HAITEI],
  [Y.YAKUHAI2, Y.RINSHANKAIHOU],
  [Y.YAKUHAI2, Y.HOUTEI],
  [Y.YAKUHAI2, Y.CHANKAN],
  [Y.YAKUHAI2, Y.OPENRIICHI],

  [Y.YAKUHAI3, Y.SHOSANGEN],
  [Y.YAKUHAI3, Y.CHANTA],
  [Y.YAKUHAI3, Y.HONITSU],
  [Y.YAKUHAI3, Y.RIICHI],
  [Y.YAKUHAI3, Y.DOUBLERIICHI],
  [Y.YAKUHAI3, Y.IPPATSU],
  [Y.YAKUHAI3, Y.MENZENTSUMO],
  [Y.YAKUHAI3, Y.HAITEI],
  [Y.YAKUHAI3, Y.RINSHANKAIHOU],
  [Y.YAKUHAI3, Y.HOUTEI],
  [Y.YAKUHAI3, Y.CHANKAN],
  [Y.YAKUHAI3, Y.OPENRIICHI],

  [Y.YAKUHAI4, Y.SHOSANGEN],
  [Y.YAKUHAI4, Y.CHANTA],
  [Y.YAKUHAI4, Y.HONITSU],
  [Y.YAKUHAI4, Y.RIICHI],
  [Y.YAKUHAI4, Y.DOUBLERIICHI],
  [Y.YAKUHAI4, Y.IPPATSU],
  [Y.YAKUHAI4, Y.MENZENTSUMO],
  [Y.YAKUHAI4, Y.HAITEI],
  [Y.YAKUHAI4, Y.RINSHANKAIHOU],
  [Y.YAKUHAI4, Y.HOUTEI],
  [Y.YAKUHAI4, Y.CHANKAN],
  [Y.YAKUHAI4, Y.OPENRIICHI],

  [Y.SHOSANGEN, Y.CHANTA],
  [Y.SHOSANGEN, Y.HONITSU],
  [Y.SHOSANGEN, Y.RIICHI],
  [Y.SHOSANGEN, Y.DOUBLERIICHI],
  [Y.SHOSANGEN, Y.IPPATSU],
  [Y.SHOSANGEN, Y.MENZENTSUMO],
  [Y.SHOSANGEN, Y.HAITEI],
  [Y.SHOSANGEN, Y.RINSHANKAIHOU],
  [Y.SHOSANGEN, Y.HOUTEI],
  [Y.SHOSANGEN, Y.CHANKAN],
  [Y.SHOSANGEN, Y.OPENRIICHI],

  [Y.TANYAO, Y.CHINITSU],
  [Y.TANYAO, Y.CHIITOITSU],
  [Y.TANYAO, Y.RIICHI],
  [Y.TANYAO, Y.DOUBLERIICHI],
  [Y.TANYAO, Y.IPPATSU],
  [Y.TANYAO, Y.MENZENTSUMO],
  [Y.TANYAO, Y.HAITEI],
  [Y.TANYAO, Y.RINSHANKAIHOU],
  [Y.TANYAO, Y.HOUTEI],
  [Y.TANYAO, Y.CHANKAN],
  [Y.TANYAO, Y.OPENRIICHI],

  [Y.CHANTA, Y.HONITSU],
  [Y.CHANTA, Y.RIICHI],
  [Y.CHANTA, Y.DOUBLERIICHI],
  [Y.CHANTA, Y.IPPATSU],
  [Y.CHANTA, Y.MENZENTSUMO],
  [Y.CHANTA, Y.HAITEI],
  [Y.CHANTA, Y.RINSHANKAIHOU],
  [Y.CHANTA, Y.HOUTEI],
  [Y.CHANTA, Y.CHANKAN],
  [Y.CHANTA, Y.OPENRIICHI],

  [Y.JUNCHAN, Y.CHINITSU],
  [Y.JUNCHAN, Y.RIICHI],
  [Y.JUNCHAN, Y.DOUBLERIICHI],
  [Y.JUNCHAN, Y.IPPATSU],
  [Y.JUNCHAN, Y.MENZENTSUMO],
  [Y.JUNCHAN, Y.HAITEI],
  [Y.JUNCHAN, Y.RINSHANKAIHOU],
  [Y.JUNCHAN, Y.HOUTEI],
  [Y.JUNCHAN, Y.CHANKAN],
  [Y.JUNCHAN, Y.OPENRIICHI],

  [Y.HONITSU, Y.CHIITOITSU],
  [Y.HONITSU, Y.RIICHI],
  [Y.HONITSU, Y.DOUBLERIICHI],
  [Y.HONITSU, Y.IPPATSU],
  [Y.HONITSU, Y.MENZENTSUMO],
  [Y.HONITSU, Y.HAITEI],
  [Y.HONITSU, Y.RINSHANKAIHOU],
  [Y.HONITSU, Y.HOUTEI],
  [Y.HONITSU, Y.CHANKAN],
  [Y.HONITSU, Y.OPENRIICHI],

  [Y.CHINITSU, Y.CHIITOITSU],
  [Y.CHINITSU, Y.RIICHI],
  [Y.CHINITSU, Y.DOUBLERIICHI],
  [Y.CHINITSU, Y.IPPATSU],
  [Y.CHINITSU, Y.MENZENTSUMO],
  [Y.CHINITSU, Y.HAITEI],
  [Y.CHINITSU, Y.RINSHANKAIHOU],
  [Y.CHINITSU, Y.HOUTEI],
  [Y.CHINITSU, Y.CHANKAN],
  [Y.CHINITSU, Y.OPENRIICHI],

  [Y.CHIITOITSU, Y.RIICHI],
  [Y.CHIITOITSU, Y.DOUBLERIICHI],
  [Y.CHIITOITSU, Y.IPPATSU],
  [Y.CHIITOITSU, Y.MENZENTSUMO],
  [Y.CHIITOITSU, Y.HAITEI],
  [Y.CHIITOITSU, Y.HOUTEI],
  [Y.CHIITOITSU, Y.OPENRIICHI],

  [Y.RIICHI, Y.IPPATSU],
  [Y.RIICHI, Y.MENZENTSUMO],
  [Y.RIICHI, Y.HAITEI],
  [Y.RIICHI, Y.RINSHANKAIHOU],
  [Y.RIICHI, Y.HOUTEI],
  [Y.RIICHI, Y.CHANKAN],
  [Y.RIICHI, Y.OPENRIICHI],

  [Y.DOUBLERIICHI, Y.IPPATSU],
  [Y.DOUBLERIICHI, Y.MENZENTSUMO],
  [Y.DOUBLERIICHI, Y.HAITEI],
  [Y.DOUBLERIICHI, Y.RINSHANKAIHOU],
  [Y.DOUBLERIICHI, Y.HOUTEI],
  [Y.DOUBLERIICHI, Y.CHANKAN],
  [Y.DOUBLERIICHI, Y.OPENRIICHI],

  [Y.IPPATSU, Y.MENZENTSUMO],
  [Y.IPPATSU, Y.HAITEI],
  [Y.IPPATSU, Y.CHANKAN],
  [Y.IPPATSU, Y.OPENRIICHI],

  [Y.MENZENTSUMO, Y.HAITEI],
  [Y.MENZENTSUMO, Y.RINSHANKAIHOU],
  [Y.MENZENTSUMO, Y.OPENRIICHI],

  [Y.HAITEI, Y.OPENRIICHI],

  [Y.RINSHANKAIHOU, Y.OPENRIICHI],
];

const combinableYakumans = [
  [Y.SUUKANTSU, Y.SUUANKOU],
  [Y.SUUKANTSU, Y.DAISANGEN],
  [Y.SUUKANTSU, Y.SHOSUUSHII],
  [Y.SUUKANTSU, Y.DAISUUSHII],
  [Y.SUUKANTSU, Y.TSUUIISOU],
  [Y.SUUKANTSU, Y.CHINROTO],
  [Y.SUUKANTSU, Y.RYUUIISOU],

  [Y.SUUANKOU, Y.DAISANGEN],
  [Y.SUUANKOU, Y.SHOSUUSHII],
  [Y.SUUANKOU, Y.DAISUUSHII],
  [Y.SUUANKOU, Y.TSUUIISOU],
  [Y.SUUANKOU, Y.CHINROTO],
  [Y.SUUANKOU, Y.RYUUIISOU],
  [Y.SUUANKOU, Y.TENHOU],
  [Y.SUUANKOU, Y.CHIHOU],

  [Y.DAISANGEN, Y.TSUUIISOU],
  [Y.DAISANGEN, Y.TENHOU],
  [Y.DAISANGEN, Y.CHIHOU],

  [Y.SHOSUUSHII, Y.TSUUIISOU],
  [Y.SHOSUUSHII, Y.TENHOU],
  [Y.SHOSUUSHII, Y.CHIHOU],

  [Y.DAISUUSHII, Y.TSUUIISOU],
  [Y.DAISUUSHII, Y.TENHOU],
  [Y.DAISUUSHII, Y.CHIHOU],

  [Y.TSUUIISOU, Y.TENHOU],
  [Y.TSUUIISOU, Y.CHIHOU],

  [Y.CHINROTO, Y.TENHOU],
  [Y.CHINROTO, Y.CHIHOU],

  [Y.CHUURENPOUTO, Y.TENHOU],
  [Y.CHUURENPOUTO, Y.CHIHOU],

  [Y.RYUUIISOU, Y.TENHOU],
  [Y.RYUUIISOU, Y.CHIHOU],

  [Y.KOKUSHIMUSOU, Y.TENHOU],
  [Y.KOKUSHIMUSOU, Y.CHIHOU],

  [Y.CHUURENPOUTO, Y.TENHOU],
  [Y.CHUURENPOUTO, Y.CHIHOU],
];

const nodes: { [key: string]: Node<Yaku> } = {};
for (const yaku of yakuList) {
  nodes[yaku.id] = { id: yaku.id, data: yaku };
}

export function makeYakuGraph(multiYakumans = false) {
  const yakuGraph = new Graph<Yaku>();
  for (const yaku of yakuList) {
    yakuGraph.addNode(nodes[yaku.id]);
  }

  for (const comb of combinableYaku) {
    yakuGraph.addBiEdge(nodes[comb[0]], nodes[comb[1]], EdgeType.Combines);
  }

  if (multiYakumans) {
    for (const comb of combinableYakumans) {
      yakuGraph.addBiEdge(nodes[comb[0]], nodes[comb[1]], EdgeType.Combines);
    }
  }

  for (const supr of suppressingYaku) {
    yakuGraph.addEdge(nodes[supr[0]], nodes[supr[1]], EdgeType.Suppresses);
    yakuGraph.addEdge(nodes[supr[1]], nodes[supr[0]], EdgeType.IsSuppressed);
  }

  return yakuGraph;
}

/*
  Идея для проверки совместимости яку:
  - Граф связей, если яку сочетается с другим яку - между ними есть ребро.
  - Сочетаемость группы яку проверяется как равенство единице диаметра подграфа, включающего все яку группы.
  Другими словами, все яку должны быть попарно сочетаемыми. Третьими словами, подграф должен быть полносвязным.
  - Допустимость добавления нового яку в группу проверяется простым обходом группы и проверкой наличия ребра до нужного яку.
  - Причина отсечения конкретного яку - отсутствие прямого ребра с уже выбарнными яку. Можно выводить где-то.
*/

export function addYakuToList(yakuGraph: Graph<Yaku>, yaku: Y, selectedYaku: Y[]): Y[] {
  return yakuGraph
    .tryAddAllowedNode(
      selectedYaku.map((id) => nodes[id]),
      nodes[yaku]
    )
    .map((node) => node.data.id);
}

export function getAllowedYaku(yakuGraph: Graph<Yaku> | undefined, enabledYaku: Y[]): Y[] {
  if (!yakuGraph) {
    return [];
  }
  return yakuGraph.getAllowedNodes(enabledYaku.map((id) => nodes[id])).map((node) => node.data.id);
}

export function pack(list: Y[]): string {
  return yakuList.reduce((acc: string, el) => {
    return acc + (!list.includes(el.id) ? '.' : '+');
  }, '');
}

export function unpack(list: string): Y[] {
  let index = 0;
  return yakuList.reduce((acc: Y[], el) => {
    return list[index++] === '+' ? acc.concat(el.id) : acc;
  }, [] as Y[]);
}
