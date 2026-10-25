export const enum Yaku {
  DOUBLERIICHI = 34,
  DAISANGEN = 19,
  DAISUUSHII = 21,
  JUNCHAN = 25,
  IIPEIKOU = 9,
  IPPATSU = 35,
  ITTSU = 12,
  KOKUSHIMUSOU = 32,
  MENZENTSUMO = 36,
  PINFU = 8,
  RENHOU = 43,
  RIICHI = 33,
  RINSHANKAIHOU = 38,
  RYUUIISOU = 30,
  RYANPEIKOU = 10,
  SANANKOU = 3,
  SANKANTSU = 5,
  SANSHOKUDOUJUN = 11,
  SANSHOKUDOUKOU = 4,
  SUUANKOU = 7,
  SUUKANTSU = 6,
  TANYAO = 23,
  TENHOU = 39,
  TOITOI = 1,
  HAITEI = 37,
  HONITSU = 27,
  HONROTO = 2,
  HOUTEI = 41,
  TSUUIISOU = 22,
  CHANKAN = 42,
  CHANTA = 24,
  CHIITOITSU = 31,
  CHINITSU = 28,
  CHINROTO = 26,
  CHIHOU = 40,
  CHUURENPOUTO = 29,
  SHOSANGEN = 18,
  SHOSUUSHII = 20,
  // Aggregated yakuhai IDs; used by aggregated mode and historical hands.
  YAKUHAI1 = 13,
  YAKUHAI2 = 14,
  YAKUHAI3 = 15,
  YAKUHAI4 = 16,
  OPENRIICHI = 44,
  SUUANKOUTANKI = 45,
  CHUURENPOUTOPURE = 46,
  KOKUSHIMUSOU13 = 47,
  EAST_SEAT_WIND = 48,
  EAST_ROUND_WIND = 49,
  SOUTH_SEAT_WIND = 50,
  SOUTH_ROUND_WIND = 51,
  WEST_SEAT_WIND = 52,
  WEST_ROUND_WIND = 53,
  NORTH_SEAT_WIND = 54,
  NORTH_ROUND_WIND = 55,
  RED_DRAGON = 56,
  GREEN_DRAGON = 57,
  WHITE_DRAGON = 58,
}

export const allYakuList = [
  Yaku.DOUBLERIICHI,
  Yaku.DAISANGEN,
  Yaku.DAISUUSHII,
  Yaku.JUNCHAN,
  Yaku.IIPEIKOU,
  Yaku.IPPATSU,
  Yaku.ITTSU,
  Yaku.KOKUSHIMUSOU,
  Yaku.MENZENTSUMO,
  Yaku.PINFU,
  Yaku.RENHOU,
  Yaku.RIICHI,
  Yaku.RINSHANKAIHOU,
  Yaku.RYUUIISOU,
  Yaku.RYANPEIKOU,
  Yaku.SANANKOU,
  Yaku.SANKANTSU,
  Yaku.SANSHOKUDOUJUN,
  Yaku.SANSHOKUDOUKOU,
  Yaku.SUUANKOU,
  Yaku.SUUKANTSU,
  Yaku.TANYAO,
  Yaku.TENHOU,
  Yaku.TOITOI,
  Yaku.HAITEI,
  Yaku.HONITSU,
  Yaku.HONROTO,
  Yaku.HOUTEI,
  Yaku.TSUUIISOU,
  Yaku.CHANKAN,
  Yaku.CHANTA,
  Yaku.CHIITOITSU,
  Yaku.CHINITSU,
  Yaku.CHINROTO,
  Yaku.CHIHOU,
  Yaku.CHUURENPOUTO,
  Yaku.SHOSANGEN,
  Yaku.SHOSUUSHII,
  Yaku.YAKUHAI1,
  Yaku.YAKUHAI2,
  Yaku.YAKUHAI3,
  Yaku.YAKUHAI4,
  Yaku.OPENRIICHI,
  Yaku.SUUANKOUTANKI,
  Yaku.CHUURENPOUTOPURE,
  Yaku.KOKUSHIMUSOU13,
  Yaku.EAST_SEAT_WIND,
  Yaku.EAST_ROUND_WIND,
  Yaku.SOUTH_SEAT_WIND,
  Yaku.SOUTH_ROUND_WIND,
  Yaku.WEST_SEAT_WIND,
  Yaku.WEST_ROUND_WIND,
  Yaku.NORTH_SEAT_WIND,
  Yaku.NORTH_ROUND_WIND,
  Yaku.RED_DRAGON,
  Yaku.GREEN_DRAGON,
  Yaku.WHITE_DRAGON,
];

export function yakuListExcept(yaku: Yaku[]) {
  return allYakuList.filter((y) => !yaku.includes(y));
}

const tenhouIdMap = new Map([
  [0, Yaku.MENZENTSUMO],
  [1, Yaku.RIICHI],
  [2, Yaku.IPPATSU],
  [3, Yaku.CHANKAN],
  [4, Yaku.RINSHANKAIHOU],
  [5, Yaku.HAITEI],
  [6, Yaku.HOUTEI],
  [7, Yaku.PINFU],
  [8, Yaku.TANYAO],
  [9, Yaku.IIPEIKOU],
  [10, Yaku.EAST_SEAT_WIND],
  [11, Yaku.SOUTH_SEAT_WIND],
  [12, Yaku.WEST_SEAT_WIND],
  [13, Yaku.NORTH_SEAT_WIND],
  [14, Yaku.EAST_ROUND_WIND],
  [15, Yaku.SOUTH_ROUND_WIND],
  [16, Yaku.WEST_ROUND_WIND],
  [17, Yaku.NORTH_ROUND_WIND],
  [18, Yaku.WHITE_DRAGON],
  [19, Yaku.GREEN_DRAGON],
  [20, Yaku.RED_DRAGON],
  [21, Yaku.DOUBLERIICHI],
  [22, Yaku.CHIITOITSU],
  [23, Yaku.CHANTA],
  [24, Yaku.ITTSU],
  [25, Yaku.SANSHOKUDOUJUN],
  [26, Yaku.SANSHOKUDOUKOU],
  [27, Yaku.SANKANTSU],
  [28, Yaku.TOITOI],
  [29, Yaku.SANANKOU],
  [30, Yaku.SHOSANGEN],
  [31, Yaku.HONROTO],
  [32, Yaku.RYANPEIKOU],
  [33, Yaku.JUNCHAN],
  [34, Yaku.HONITSU],
  [35, Yaku.CHINITSU],
  [36, Yaku.RENHOU],
  [37, Yaku.TENHOU],
  [38, Yaku.CHIHOU],
  [39, Yaku.DAISANGEN],
  [40, Yaku.SUUANKOU],
  [41, Yaku.SUUANKOUTANKI], // tanki
  [42, Yaku.TSUUIISOU],
  [43, Yaku.RYUUIISOU],
  [44, Yaku.CHINROTO],
  [45, Yaku.CHUURENPOUTO],
  [46, Yaku.CHUURENPOUTOPURE], // 9-machi
  [47, Yaku.KOKUSHIMUSOU],
  [48, Yaku.KOKUSHIMUSOU13], // 13-machi
  [49, Yaku.DAISUUSHII],
  [50, Yaku.SHOSUUSHII],
  [51, Yaku.SUUKANTSU],
  // [52, -1], // dora
  // [53, -1], // uradora
  // [54, -1], // akadora
]);

/**
 * @param yakuList string|string[] csv: 'yaku,han,yaku2,han...'
 * @param yakumanList string|string[] csv: 'yakuman,yakuman2...'
 */
export function fromTenhou(
  yakuList: string | string[],
  yakumanList: string | string[],
  useAggregatedYakuhai = false
): {
  yaku: Yaku[];
  dora: number;
  han: number;
  yakuman: number;
} {
  const yListArr = Array.isArray(yakuList) ? yakuList : yakuList.split(',').filter((y) => !!y);
  const ymanListArr = Array.isArray(yakumanList)
    ? yakumanList
    : yakumanList.split(',').filter((y) => !!y);
  const result: ReturnType<typeof fromTenhou> = {
    yaku: [],
    dora: 0,
    han: 0,
    yakuman: 0,
  };

  for (let i = 0; i < yListArr.length; i += 2) {
    const key = parseInt(yListArr[i], 10);
    const value = parseInt(yListArr[i + 1], 10);
    if (key >= 52 && key <= 54) {
      result.dora += value;
      result.han += value;
    } else if (tenhouIdMap.has(key)) {
      result.yaku.push(tenhouIdMap.get(key)!);
      result.han += value;
    }
  }

  for (const yman of ymanListArr) {
    const key = parseInt(yman, 10);
    if (tenhouIdMap.has(key)) {
      result.yaku.push(tenhouIdMap.get(key)!);
      result.yakuman++;
    }
  }

  if (result.yakuman > 0) {
    result.han = -result.yakuman;
  }

  if (useAggregatedYakuhai) {
    const isIndividualYakuhai = (id: Yaku) => id >= Yaku.EAST_SEAT_WIND && id <= Yaku.WHITE_DRAGON;
    const count = result.yaku.filter(isIndividualYakuhai).length;
    const aggregated = [Yaku.YAKUHAI1, Yaku.YAKUHAI2, Yaku.YAKUHAI3, Yaku.YAKUHAI4];
    if (count > 0 && count <= aggregated.length) {
      result.yaku = result.yaku
        .filter((id) => !isIndividualYakuhai(id))
        .concat(aggregated[count - 1]);
    }
  }

  return result;
}
