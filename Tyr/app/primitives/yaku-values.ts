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

import { YakuId as Y } from './yaku';
import { RoundOutcome } from '#/clients/proto/atoms.pb';

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
  [Y.OPENRIICHI, 1, 0],
];

const openHandValues: { [key: number]: number } = {};
const closedHandValues: { [key: number]: number } = {};

handValues.forEach((item) => {
  if (item[1] !== 0) {
    closedHandValues[item[0]] = item[1];
  }
  if (item[2] !== 0) {
    openHandValues[item[0]] = item[2];
  }
});

export function getFixedFu(yakuList: Y[], outcome: RoundOutcome): number[] {
  if (yakuList.includes(Y.CHIITOITSU)) {
    return [25];
  }

  if (
    yakuList.includes(Y.PINFU) &&
    yakuList.includes(Y.MENZENTSUMO) &&
    !yakuList.includes(Y.__OPENHAND)
  ) {
    return [20];
  }

  if (outcome === RoundOutcome.ROUND_OUTCOME_RON && !yakuList.includes(Y.__OPENHAND)) {
    if (yakuList.includes(Y.PINFU)) {
      return [30];
    }
    return [40, 50, 60, 70, 80, 90, 100, 110];
  }

  return [30, 40, 50, 60, 70, 80, 90, 100, 110];
}

export function getHan(yakuList: Y[]): number {
  const openHand = yakuList.includes(Y.__OPENHAND);

  return yakuList.reduce((acc, id) => {
    if (id === Y.__OPENHAND) {
      return acc;
    }
    return acc + (openHand ? openHandValues[id] : closedHandValues[id]);
  }, 0);
}
