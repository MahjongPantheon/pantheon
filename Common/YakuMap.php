<?php
/*  Pantheon common files
 *  Copyright (C) 2016  o.klimenko aka ctizen
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
namespace Common;

define('Y_DOUBLERIICHI', 34);
define('Y_DAISANGEN', 19);
define('Y_DAISUUSHII', 21);
define('Y_JUNCHAN', 25);
define('Y_IIPEIKOU', 9);
define('Y_IPPATSU', 35);
define('Y_ITTSU', 12);
define('Y_KOKUSHIMUSOU', 32);
define('Y_MENZENTSUMO', 36);
define('Y_PINFU', 8);
define('Y_RENHOU', 43);
define('Y_RIICHI', 33);
define('Y_RINSHANKAIHOU', 38);
define('Y_RYUUIISOU', 30);
define('Y_RYANPEIKOU', 10);
define('Y_SANANKOU', 3);
define('Y_SANKANTSU', 5);
define('Y_SANSHOKUDOUJUN', 11);
define('Y_SANSHOKUDOUKOU', 4);
define('Y_SUUANKOU', 7);
define('Y_SUUKANTSU', 6);
define('Y_TANYAO', 23);
define('Y_TENHOU', 39);
define('Y_TOITOI', 1);
define('Y_HAITEI', 37);
define('Y_HONITSU', 27);
define('Y_HONROTO', 2);
define('Y_HOUTEI', 41);
define('Y_TSUUIISOU', 22);
define('Y_CHANKAN', 42);
define('Y_CHANTA', 24);
define('Y_CHIITOITSU', 31);
define('Y_CHINITSU', 28);
define('Y_CHINROTO', 26);
define('Y_CHIHOU', 40);
define('Y_CHUURENPOUTO', 29);
define('Y_SHOSANGEN', 18);
define('Y_SHOSUUSHII', 20);
define('Y_YAKUHAI1', 13);
define('Y_YAKUHAI2', 14);
define('Y_YAKUHAI3', 15);
define('Y_YAKUHAI4', 16);
define('Y_OPENRIICHI', 44);

class YakuMap
{
    /**
     * @return int[]
     */
    public static function allPaoYaku(): array
    {
        return [
            Y_DAISANGEN,
            Y_DAISUUSHII,
            Y_SUUKANTSU,
            Y_CHINROTO,
            Y_TSUUIISOU,
            Y_RYUUIISOU
        ];
    }

    /**
     * @return int[]
     *
     * @psalm-return array{0: int, 1: int, 2: int, 3: int, 4: int, 5: int, 6: int, 7: int, 8: int, 9: int, 10: int, 11: int, 12: int, 13: int, 14: int, 15: int, 16: int, 17: int, 18: int, 19: int, 20: int, 21: int, 22: int, 23: int, 24: int, 25: int, 26: int, 27: int, 28: int, 29: int, 30: int, 31: int, 32: int, 33: int, 34: int, 35: int, 36: int, 37: int, 38: int, 39: int, 40: int, 41: int, 42: int, 43: int}
     */
    public static function allYaku(): array
    {
        return [
            Y_DOUBLERIICHI,
            Y_DAISANGEN,
            Y_DAISUUSHII,
            Y_JUNCHAN,
            Y_IIPEIKOU,
            Y_IPPATSU,
            Y_ITTSU,
            Y_KOKUSHIMUSOU,
            Y_MENZENTSUMO,
            Y_PINFU,
            Y_RENHOU,
            Y_RIICHI,
            Y_RINSHANKAIHOU,
            Y_RYUUIISOU,
            Y_RYANPEIKOU,
            Y_SANANKOU,
            Y_SANKANTSU,
            Y_SANSHOKUDOUJUN,
            Y_SANSHOKUDOUKOU,
            Y_SUUANKOU,
            Y_SUUKANTSU,
            Y_TANYAO,
            Y_TENHOU,
            Y_TOITOI,
            Y_HAITEI,
            Y_HONITSU,
            Y_HONROTO,
            Y_HOUTEI,
            Y_TSUUIISOU,
            Y_CHANKAN,
            Y_CHANTA,
            Y_CHIITOITSU,
            Y_CHINITSU,
            Y_CHINROTO,
            Y_CHIHOU,
            Y_CHUURENPOUTO,
            Y_SHOSANGEN,
            Y_SHOSUUSHII,
            Y_YAKUHAI1,
            Y_YAKUHAI2,
            Y_YAKUHAI3,
            Y_YAKUHAI4,
            Y_OPENRIICHI
        ];
    }

    /**
     * @return array
     *
     * @psalm-return array{34: mixed, 19: mixed, 21: mixed, 25: mixed, 9: mixed, 35: mixed, 12: mixed, 32: mixed, 36: mixed, 8: mixed, 43: mixed, 33: mixed, 38: mixed, 30: mixed, 10: mixed, 3: mixed, 5: mixed, 11: mixed, 4: mixed, 7: mixed, 6: mixed, 23: mixed, 39: mixed, 1: mixed, 37: mixed, 27: mixed, 2: mixed, 41: mixed, 22: mixed, 42: mixed, 24: mixed, 31: mixed, 28: mixed, 26: mixed, 40: mixed, 29: mixed, 18: mixed, 20: mixed, 13: mixed, 14: mixed, 15: mixed, 16: mixed, 17: mixed, 44: mixed}
     */
    public static function getTranslations(): array
    {
        return [
            34 => _t("Daburu riichi"),
            19 => _t("Dai sangen"),
            21 => _t("Dai suushii"),
            25 => _t("Junchan"),
            9  => _t("Iipeikou"),
            35 => _t("Ippatsu"),
            12 => _t("Itsu"),
            32 => _t("Kokushi musou"),
            36 => _t("Menzen tsumo"),
            8  => _t("Pinfu"),
            43 => _t("Renhou"),
            33 => _t("Riichi"),
            38 => _t("Rinshan kaihou"),
            30 => _t("Ryuu iisou"),
            10 => _t("Ryan peikou"),
            3  => _t("San ankou"),
            5  => _t("San kantsu"),
            11 => _t("Sanshoku"),
            4  => _t("Sanshoku dokou"),
            7  => _t("Suu ankou"),
            6  => _t("Suu kantsu"),
            23 => _t("Tanyao"),
            39 => _t("Tenhou"),
            1  => _t("Toi-toi"),
            37 => _t("Haitei"),
            27 => _t("Honitsu"),
            2  => _t("Honroutou"),
            41 => _t("Houtei"),
            22 => _t("Tsuu iisou"),
            42 => _t("Chan kan"),
            24 => _t("Chanta"),
            31 => _t("Chiitoitsu"),
            28 => _t("Chinitsu"),
            26 => _t("Chinroutou"),
            40 => _t("Chihou"),
            29 => _t("Chuuren pooto"),
            18 => _t("Shou sangen"),
            20 => _t("Shou suushii"),
            13 => _t("Yakuhai x1"),
            14 => _t("Yakuhai x2"),
            15 => _t("Yakuhai x3"),
            16 => _t("Yakuhai x4"),
            17 => _t("Yakuhai x5"),
            44 => _t("Open riichi")
        ];
    }

    /**
     * Get full yaku list except of some yaku
     *
     * @param int[] $except
     * @return array
     */
    public static function listExcept(array $except)
    {
        return array_values(array_diff(self::allYaku(), $except));
    }

    /**
     * @param string $yList csv: 'yaku,han,yaku2,han...'
     * @param string $ymanList csv: 'yakuman,yakuman2...'
     * @return array ['yaku' => [...], 'dora' => int, 'han' => int, 'yakuman' => int]
     */
    public static function fromTenhou($yList, $ymanList)
    {
        $yakuList = is_array($yList) ? $yList : self::_toArray($yList);
        $yakumanList = is_array($ymanList) ? $ymanList : self::_toArray($ymanList);
        $tenhouYakuMap = [
            0 => Y_MENZENTSUMO,
            1 => Y_RIICHI,
            2 => Y_IPPATSU,
            3 => Y_CHANKAN,
            4 => Y_RINSHANKAIHOU,
            5 => Y_HAITEI,
            6 => Y_HOUTEI,
            7 => Y_PINFU,
            8 => Y_TANYAO,
            9 => Y_IIPEIKOU,
//          10 => 13, // yakuhai place wind ton
//          11 => 13, // yakuhai place wind nan
//          12 => 13, // yakuhai place wind sha
//          13 => 13, // yakuhai place wind pei
//          14 => 13, // yakuhai round wind ton
//          15 => 13, // yakuhai round wind nan
//          16 => 13, // yakuhai round wind sha
//          17 => 13, // yakuhai round wind pei
//          18 => 13, // yakuhai haku
//          19 => 13, // yakuhai hatsu
//          20 => 13, // yakuhai chun
            21 => Y_DOUBLERIICHI,
            22 => Y_CHIITOITSU,
            23 => Y_CHANTA,
            24 => Y_ITTSU,
            25 => Y_SANSHOKUDOUJUN,
            26 => Y_SANSHOKUDOUKOU,
            27 => Y_SANKANTSU,
            28 => Y_TOITOI,
            29 => Y_SANANKOU,
            30 => Y_SHOSANGEN,
            31 => Y_HONROTO,
            32 => Y_RYANPEIKOU,
            33 => Y_JUNCHAN,
            34 => Y_HONITSU,
            35 => Y_CHINITSU,
            36 => Y_RENHOU,
            37 => Y_TENHOU,
            38 => Y_CHIHOU,
            39 => Y_DAISANGEN,
            40 => Y_SUUANKOU,
            41 => Y_SUUANKOU, // tanki
            42 => Y_TSUUIISOU,
            43 => Y_RYUUIISOU,
            44 => Y_CHINROTO,
            45 => Y_CHUURENPOUTO,
            46 => Y_CHUURENPOUTO, // 9-machi
            47 => Y_KOKUSHIMUSOU,
            48 => Y_KOKUSHIMUSOU, // 13-machi
            49 => Y_DAISUUSHII,
            50 => Y_SHOSUUSHII,
            51 => Y_SUUKANTSU
//          52 => -1, // dora
//          53 => -1, // uradora
//          54 => -1 // akadora
        ];

        $yakuhaiCountMap = [1 => Y_YAKUHAI1, Y_YAKUHAI2, Y_YAKUHAI3, Y_YAKUHAI4];
        $result = [
            'yaku' => [],
            'dora' => 0,
            'han'  => 0,
            'yakuman' => 0
        ];

        $yakuhaiCount = 0;

        for ($i = 0; $i < count($yakuList); $i += 2) {
            $key = intval($yakuList[$i]);
            $value = intval($yakuList[$i + 1]);

            if ($key >= 52 && $key <= 54) {
                $result['dora'] += $value;
                $result['han'] += $value;
            } elseif ($key >= 10 && $key <= 20) {
                $yakuhaiCount ++;
            } else {
                $result['yaku'] [] = $tenhouYakuMap[$key];
                $result['han'] += $value;
            }
        }

        if ($yakuhaiCount > 0) {
            $result['yaku'] [] = $yakuhaiCountMap[$yakuhaiCount];
            $result['han'] += $yakuhaiCount;
        }

        for ($i = 0; $i < count($yakumanList); $i ++) {
            $key = intval($yakumanList[$i]);
            $result['yaku'] [] = $tenhouYakuMap[$key];
            $result['yakuman'] ++;
        }

        if ($result['yakuman'] > 0) {
            $result['han'] = -$result['yakuman']; // storage-specific representation
        }

        return $result;
    }

    /**
     * @return string[]
     *
     * @psalm-return array<int, string>
     */
    private static function _toArray(string $list): array
    {
        return array_filter(explode(',', $list), function ($el) {
            return $el !== null && $el !== '' && $el !== false;
        });
    }
}
