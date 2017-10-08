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
import { YakuId as Y, yakuList } from './yaku';

const handValues: [Y, number, number][] = [
  [Y.TOITOI, 2, 2],
  [Y.HONROTO, 2, 2],
  [Y.SANANKOU, 2, 2],
  [Y.SANSHOKUDOUKOU, 2, 2],
  [Y.SANKANTSU, 2, 2],
  [Y.SUUKANTSU, -1, -1],
  [Y.SUUANKOU, -1, 0],
  [Y.PINFU, 1, 0],
  [Y.IIPEIKOU, 1, 0],
  [Y.RYANPEIKOU, 3, 0],
  [Y.SANSHOKUDOUJUN, 2, 1],
  [Y.ITTSU, 2, 1],
  [Y.YAKUHAI1, 1, 1],
  [Y.YAKUHAI2, 2, 2],
  [Y.YAKUHAI3, 3, 3],
  [Y.YAKUHAI4, 4, 4],
  [Y.SHOSANGEN, 2, 2],
  [Y.DAISANGEN, -1, -1],
  [Y.SHOSUUSHII, -1, -1],
  [Y.DAISUUSHII, -1, -1],
  [Y.TSUUIISOU, -1, -1],
  [Y.TANYAO, 1, 1],
  [Y.CHANTA, 2, 1],
  [Y.JUNCHAN, 3, 2],
  [Y.CHINROTO, -1, -1],
  [Y.HONITSU, 3, 2],
  [Y.CHINITSU, 6, 5],
  [Y.CHUURENPOUTO, -1, 0],
  [Y.RYUUIISOU, -1, -1],
  [Y.CHIITOITSU, 2, 0],
  [Y.KOKUSHIMUSOU, -1, 0],
  [Y.RIICHI, 1, 0],
  [Y.DOUBLERIICHI, 2, 0],
  [Y.IPPATSU, 1, 0],
  [Y.MENZENTSUMO, 1, 0],
  [Y.HAITEI, 1, 1],
  [Y.RINSHANKAIHOU, 1, 1],
  [Y.TENHOU, -1, 0],
  [Y.CHIHOU, -1, 0],
  [Y.HOUTEI, 1, 1],
  [Y.CHANKAN, 1, 1],
  [Y.RENHOU, 5, 0],
  [Y.OPENRIICHI, 1, 0]
];

let openHandValues: { [key: number]: number } = {};
let closedHandValues: { [key: number]: number } = {};

handValues.forEach((item) => {
  if (item[1] !== 0) {
    closedHandValues[item[0]] = item[1];
  }
  if (item[2] !== 0) {
    openHandValues[item[0]] = item[2];
  }
});

export function getFixedFu(yakuList: Y[], outcome: "ron" | "tsumo" | "multiron" | "chombo" | "draw" | "abort"): number[] {
  if (yakuList.indexOf(Y.CHIITOITSU) !== -1) {
    return [25];
  }

  if (yakuList.indexOf(Y.PINFU) !== -1
    && yakuList.indexOf(Y.MENZENTSUMO) !== -1
    && yakuList.indexOf(Y.__OPENHAND) === -1
  ) {
    return [20];
  }

  if ((outcome === 'ron' || outcome === 'multiron') && yakuList.indexOf(Y.__OPENHAND) === -1) {
    if (yakuList.indexOf(Y.PINFU) !== -1) {
      return [30];
    }
    return [40, 50, 60, 70, 80, 90, 100, 110];
  }

  return [30, 40, 50, 60, 70, 80, 90, 100, 110];
}

export function getHan(yakuList: Y[]): number {
  const openHand = (yakuList.indexOf(Y.__OPENHAND) !== -1);

  return yakuList.reduce((acc, id) => {
    if (id === Y.__OPENHAND) {
      return acc;
    }
    return acc + (openHand ? openHandValues[id] : closedHandValues[id]);
  }, 0);
}
