export const enum Yaku {
  DOUBLERIICHI,
  DAISANGEN,
  DAISUUSHII,
  JUNCHAN,
  IIPEIKOU,
  IPPATSU,
  ITTSU,
  KOKUSHIMUSOU,
  MENZENTSUMO,
  PINFU,
  RENHOU,
  RIICHI,
  RINSHANKAIHOU,
  RYUUIISOU,
  RYANPEIKOU,
  SANANKOU,
  SANKANTSU,
  SANSHOKUDOUJUN,
  SANSHOKUDOUKOU,
  SUUANKOU,
  SUUKANTSU,
  TANYAO,
  TENHOU,
  TOITOI,
  HAITEI,
  HONITSU,
  HONROTO,
  HOUTEI,
  TSUUIISOU,
  CHANKAN,
  CHANTA,
  CHIITOITSU,
  CHINITSU,
  CHINROTO,
  CHIHOU,
  CHUURENPOUTO,
  SHOSANGEN,
  SHOSUUSHII,
  YAKUHAI1,
  YAKUHAI2,
  YAKUHAI3,
  YAKUHAI4,
  OPENRIICHI,
  SUUANKOUTANKI,
  CHUURENPOUTOPURE,
  KOKUSHIMUSOU13,
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
  // [10, 13], // yakuhai place wind ton
  // [11, 13], // yakuhai place wind nan
  // [12, 13], // yakuhai place wind sha
  // [13, 13], // yakuhai place wind pei
  // [14, 13], // yakuhai round wind ton
  // [15, 13], // yakuhai round wind nan
  // [16, 13], // yakuhai round wind sha
  // [17, 13], // yakuhai round wind pei
  // [18, 13], // yakuhai haku
  // [19, 13], // yakuhai hatsu
  // [20, 13], // yakuhai chun
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

const yakuhaiCountMap = new Map([
  [1, Yaku.YAKUHAI1],
  [2, Yaku.YAKUHAI2],
  [3, Yaku.YAKUHAI3],
  [4, Yaku.YAKUHAI4],
]);

/**
 * @param yakuList string|string[] csv: 'yaku,han,yaku2,han...'
 * @param yakumanList string|string[] csv: 'yakuman,yakuman2...'
 */
export function fromTenhou(
  yakuList: string | string[],
  yakumanList: string | string[]
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
  let yakuhaiCount = 0;

  for (let i = 0; i < yListArr.length; i += 2) {
    const key = parseInt(yListArr[i], 10);
    const value = parseInt(yListArr[i + 1], 10);
    if (key >= 52 && key <= 54) {
      result.dora += value;
      result.han += value;
    } else if (key >= 10 && key <= 20) {
      yakuhaiCount++;
    } else if (tenhouIdMap.has(key)) {
      result.yaku.push(tenhouIdMap.get(key)!);
      result.han += value;
    }
  }

  if (yakuhaiCount > 0 && yakuhaiCountMap.has(yakuhaiCount)) {
    result.yaku.push(yakuhaiCountMap.get(yakuhaiCount)!);
    result.han += yakuhaiCount;
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

  return result;
}
