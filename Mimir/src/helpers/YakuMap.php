<?php
/*  Mimir: mahjong games storage
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
namespace Mimir;

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
define('Y_YAKUHAI5', 17);
define('Y_OPENRIICHI', 44);

class YakuMap
{
    public static function allYaku()
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
            Y_YAKUHAI5,
            Y_OPENRIICHI
        ];
    }

    /**
     * Get full yaku list except of some yaku
     *
     * @param $except
     * @return array
     */
    public static function listExcept($except)
    {
        return array_diff(self::allYaku(), $except);
    }

    /**
     * @param string $yakuList csv: 'yaku,han,yaku2,han...'
     * @param string $yakumanList csv: 'yakuman,yakuman2...'
     * @return array ['yaku' => [...], 'dora' => int, 'han' => int, 'yakuman' => int]
     */
    public static function fromTenhou($yakuList, $yakumanList)
    {
        $yakuList = self::_toArray($yakuList);
        $yakumanList = self::_toArray($yakumanList);
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

        $yakuhaiCountMap = [1 => Y_YAKUHAI1, Y_YAKUHAI2, Y_YAKUHAI3, Y_YAKUHAI4, Y_YAKUHAI5];
        $result = [
            'yaku' => [],
            'dora' => 0,
            'han'  => 0,
            'yakuman' => 0
        ];

        $yakuhaiCount = 0;

        for ($i = 0; $i < count($yakuList); $i += 2) {
            $key = $yakuList[$i];
            $value = $yakuList[$i + 1];

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
            $key = $yakumanList[$i];
            $result['yaku'] [] = $tenhouYakuMap[$key];
            $result['yakuman'] ++;
        }

        if ($result['yakuman'] > 0) {
            $result['han'] = -$result['yakuman']; // storage-specific representation
        }

        return $result;
    }

    private static function _toArray($list)
    {
        return array_filter(explode(',', $list), function ($el) {
            return $el !== null && $el !== '' && $el !== false;
        });
    }
}
