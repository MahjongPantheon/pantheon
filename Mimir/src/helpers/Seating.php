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
namespace Riichi;

class Seating
{
    /**
     * Format seating data for better view
     *
     * @param $seating
     * @param $previousSeatings
     * @return array
     */
    public static function makeIntersectionsTable($seating, $previousSeatings)
    {
        $possibleIntersections = [
            [0, 1],
            [0, 2],
            [0, 3],
            [1, 2],
            [1, 3],
            [2, 3]
        ];

        // push new seating to our array, but reformat it first
        $newSeating = [];
        foreach ($seating as $player => $rating) {
            $newSeating []= $player;
        }
        $newSeating = array_chunk($newSeating, 4);
        $seatings = array_merge($previousSeatings, $newSeating);

        $intersectionData = [];
        foreach ($seatings as $game) {
            foreach ($possibleIntersections as $intersection) {
                // fill intersection data
                $intKey = $game[$intersection[0]].'+++'.$game[$intersection[1]];
                if (empty($intersectionData[$intKey])) {
                    $intersectionData[$intKey] = 1;
                } else {
                    $intersectionData[$intKey]++;
                }
            }
        }

        return $intersectionData;
    }

    /**
     * @param $playersMap array [id => rating] - current rating table
     * @param $previousSeatings array [ [id, id, id, id] ... ] - players ordered as eswn in table array
     * @param $groupsCount int - shuffling groups count
     * @param $randFactor int - RNG init seed
     * @return array [ id => rating, ... ] flattened players list, each four are a table ordered as eswn.
     */
    public static function generateTables($playersMap, $previousSeatings, $groupsCount, $randFactor)
    {
        /*
         * Simple random search. Too many variables for real optimising methods :(
         *
         * How it works:
         * - 1) Split rating table into $groupsCount independent groups
         * - 2) Init shuffler (with slightly different seed on each iteration)
         * - 3) Shuffle each group
         * - 4) Calculate intersection factor (see functions below)
         * - 5) Remember best factor and its input data
         * - 6) Repeat N times, then return best results.
         */

        $maxIterations = 1000;
        $bestSeating = [];
        $factor = 100500; // lower is better, so init with very big number;
        if (empty($playersMap)) {
            return [];
        }

        if (empty($previousSeatings)) {
            $previousSeatings = [];
        }
        $groups = array_chunk($playersMap, ceil(count($playersMap) / $groupsCount), true); // 1)
        for ($i = 0; $i < $maxIterations; $i++) {
            srand($randFactor + $i * 17); // 2)
            foreach ($groups as $k => $v) {
                $groups[$k] = self::shuffle($groups[$k]); // 3)
            }

            $flattenedGroups = array_reduce($groups, function ($acc, $el) {
                return $acc + $el;
            }, []);

            $newFactor = self::_calculateIntersectionFactor($flattenedGroups, $previousSeatings); // 4)
            if ($newFactor < $factor) {
                $factor = $newFactor;
                $bestSeating = $flattenedGroups; // 5)
            }
            usleep(500); // sleep some time to reduce cpu load
        } // 6)

        return self::_updatePlacesAtEachTable($bestSeating, $previousSeatings);
    }

    /**
     * Calculate generalized value of seating applicability.
     * Sequential games of same layers add +10 to factor, while simple crossings add only +1.
     * Less factor value is better!
     *
     * @param $seating array [id => rating] - Seating candidate
     * @param $previousSeatings array [ [id, id, id, id] ... ] - Previous seatings info
     * @return int
     */
    protected static function _calculateIntersectionFactor($seating, $previousSeatings)
    {
        $factor = 0;
        $crossings = [];

        $tablesCount = floor(count($seating) / 4);
        $games = array_chunk($previousSeatings, $tablesCount);

        // push new seating to our array, but reformat it first
        $newSeating = [];
        foreach ($seating as $player => $rating) {
            $newSeating []= $player;
        }
        $newSeating = array_chunk($newSeating, 4);
        $games []= $newSeating;

        foreach ($games as $gameIdx => $tables) {
            foreach ($tables as $game) { // this should be (12 * games count) iterations
                for ($i = 0; $i < count($game); $i++) { // strictly 4 iterations!
                    for ($j = 0; $j < count($game); $j++) { // strictly 3 iterations!
                        if ($j == $i) {
                            continue;
                        }
                        if (!isset($crossings[$game[$i]])) {
                            $crossings[$game[$i]] = [];
                        }
                        if (!isset($crossings[$game[$i]][$game[$j]])) {
                            $crossings[$game[$i]][$game[$j]] = [];
                        }

                        $crossings[$game[$i]][$game[$j]] [] = $gameIdx; // inject this to count sequential games
                    }
                }
            }
        }

        foreach ($crossings as /*$player => */$opponentsList) {
            foreach ($opponentsList as /*$opponent => */$crossingList) {
                if (count($crossingList) <= 1) {
                    continue;
                }

                $factor ++;
                sort($crossingList);
                for ($i = 0; $i < count($crossingList) - 1; $i++) {
                    if ($crossingList[$i+1] - $crossingList[$i] == 1) { // players will play two sequential games
                        $factor += 10;
                    }
                }
            }
        }

        return $factor / 2; // div by 2 because of symmetrical matrix counting
    }

    /**
     * Make sure players will initially sit to winds that they did not seat before
     * (or sat less times)
     *
     * @param $seating
     * @param $previousSeatings
     * @return array|null
     */
    protected static function _updatePlacesAtEachTable($seating, $previousSeatings)
    {
        $possiblePlacements = [
            '0123', '1023', '2013', '3012',
            '0132', '1032', '2031', '3021',
            '0213', '1203', '2103', '3102',
            '0231', '1230', '2130', '3120',
            '0312', '1302', '2301', '3201',
            '0321', '1320', '2310', '3210',
        ];

        $tables = array_chunk($seating, 4, true);
        $resultSeating = [];
        foreach ($tables as $tableWithRatings) {
            $table = array_keys($tableWithRatings);

            $bestResult = 10005000;
            $bestPlacement = null;
            foreach ($possiblePlacements as $placement) {
                $newResult = self::_calcSubSums(
                    $table[$placement[0]],
                    $table[$placement[1]],
                    $table[$placement[2]],
                    $table[$placement[3]],
                    $previousSeatings
                );

                if ($newResult < $bestResult) {
                    $bestResult = $newResult;
                    $bestPlacement = [
                        $table[$placement[0]] => $tableWithRatings[$table[$placement[0]]],
                        $table[$placement[1]] => $tableWithRatings[$table[$placement[1]]],
                        $table[$placement[2]] => $tableWithRatings[$table[$placement[2]]],
                        $table[$placement[3]] => $tableWithRatings[$table[$placement[3]]],
                    ];
                }
            }

            $resultSeating += $bestPlacement;
        }

        return $resultSeating;
    }

    /**
     * Calculate index of distribution equality for seating at particular
     * winds. Ideally, we want that seating, which produces smallest index.
     *
     * @param $player1
     * @param $player2
     * @param $player3
     * @param $player4
     * @param $prevData array - [ [id, id, id, id] ...] - assumed players are sorted as eswn at each table!
     * @return float|int
     */
    protected static function _calcSubSums($player1, $player2, $player3, $player4, $prevData)
    {
        $totalsum = 0;
        foreach ([$player1, $player2, $player3, $player4] as $idx => $player) {
            $buckets = [0 => 0, 1 => 0, 2 => 0, 3 => 0];
            $buckets[$idx] ++;

            foreach ($prevData as $table) {
                $idxAtTable = array_search($player, $table);
                $buckets[$idxAtTable] ++;
            }

            $totalsum += (
                abs($buckets[0] - $buckets[1]) +
                abs($buckets[0] - $buckets[2]) +
                abs($buckets[0] - $buckets[3]) +
                abs($buckets[1] - $buckets[2]) +
                abs($buckets[1] - $buckets[3]) +
                abs($buckets[2] - $buckets[3])
            );
        }

        return $totalsum;
    }

    /**
     * Shuffle array while maintaining its keys
     * Should rely on srand NRG seed
     *
     * @param $array
     * @return array
     */
    public static function shuffle(array $array)
    {
        $keys = array_keys($array);

        // shuffle using Fisher-Yates
        $i = count($keys);
        while (--$i) {
            $j = rand(0, $i); // this should rely on internal RNG seeded by srand to get predictable results!
            if ($i != $j) {
                // swap items
                $tmp = $keys[$j];
                $keys[$j] = $keys[$i];
                $keys[$i] = $tmp;
            }
        }

        $rand = [];
        foreach ($keys as $key) {
            $rand[$key] = $array[$key];
        }

        return $rand;
    }
}
