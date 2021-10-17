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

class Seating
{
    /**
     * Swiss seating entry point
     * Wrapper for formats conformity
     *
     * @param array $playersMap [id => rating] - current rating table
     * @param array $previousSeatings [ [id, id, id, id] ... ] - players ordered as eswn in table array
     * @return array [ id => rating, ... ] flattened players list, each four are a table ordered as eswn.
     */
    public static function swissSeating($playersMap, $previousSeatings)
    {
        $indexToPlayer = array_keys($playersMap);
        $playerToIndex = array_flip($indexToPlayer);
        $indexToRating = array_values($playersMap); // playerTotalGamePoints

        $playedWith = [];
        foreach ($indexToPlayer as $id1) {
            $playedWith[$playerToIndex[$id1]] = [];
            foreach ($indexToPlayer as $id2) {
                $playedWith[$playerToIndex[$id1]][$playerToIndex[$id2]] = 0;
            }
        }

        foreach ($previousSeatings as $table) {
            for ($i = 0; $i < 4; $i ++) {
                for ($j = 0; $j < 4; $j ++) {
                    if ($i == $j) {
                        continue;
                    }
                    $playedWith[$playerToIndex[$table[$i]]][$playerToIndex[$table[$j]]] ++;
                }
            }
        }

        $playerTable = self::_swissSeatingOriginal($indexToRating, $playedWith);
        asort($playerTable);
        $seating = [];
        foreach ($playerTable as $playerIndex => $tableIndex) {
            $seating[$indexToPlayer[$playerIndex]] = $indexToRating[$playerIndex];
        }

        return $seating;
    }

    /**
     * Format seating data for better view
     *
     * @param array $seating
     * @param array $previousSeatings
     * @return array
     */
    public static function makeIntersectionsTable(array $seating, array $previousSeatings)
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
     * @param array $playersMap [id => rating] - current rating table
     * @param array $previousSeatings [ [id, id, id, id] ... ] - players ordered as eswn in table array
     * @param int $groupsCount - shuffling groups count
     * @param int $randFactor - RNG init seed
     *
     * @return array|null [ id => rating, ... ] flattened players list, each four are a table ordered as eswn.
     */
    public static function shuffledSeating($playersMap, $previousSeatings, int $groupsCount, int $randFactor): ?array
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
        /** @var array[] $groups */
        $groups = array_chunk($playersMap, (int)ceil(count($playersMap) / $groupsCount), true); // 1)
        for ($i = 0; $i < $maxIterations; $i++) {
            srand($randFactor + $i * 17); // 2)
            foreach ($groups as $k => $v) {
                $groups[$k] = self::shuffle($groups[$k]); // 3)
            }

            /** @var array $flattenedGroups */
            $flattenedGroups = [];
            foreach ($groups as $group) {
                foreach ($group as $k => $v) {
                    $flattenedGroups[$k] = $v;
                }
            }

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
     * @param array $seating [id => rating] - Seating candidate
     * @param array $previousSeatings [ [id, id, id, id] ... ] - Previous seatings info
     *
     * @return float|int
     */
    protected static function _calculateIntersectionFactor(array $seating, array $previousSeatings)
    {
        $factor = 0;
        $crossings = [];

        $tablesCount = floor(count($seating) / 4);
        $games = array_chunk($previousSeatings, (int)$tablesCount);

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
     * @param array $seating
     * @param array $previousSeatings
     * @return array|null
     */
    protected static function _updatePlacesAtEachTable(array $seating, array $previousSeatings)
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
            /** @var int[] $table */
            $table = array_keys($tableWithRatings);

            $bestResult = 10005000;
            $bestPlacement = [];
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
     * @param int $player1
     * @param int $player2
     * @param int $player3
     * @param int $player4
     * @param array $prevData - [ [id, id, id, id] ...] - assumed players are sorted as eswn at each table!
     *
     * @return float|int
     */
    protected static function _calcSubSums(int $player1, int $player2, int $player3, int $player4, array $prevData)
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
     * Swiss seating generator
     * Code & algorithm were taken from mahjongsoft.ru website and ported from javascript.
     *
     * $playedWith is mutated during algorithm work.
     *
     * @param array $playerTotalGamePoints - rating points sum as array: [ player index -> points ]
     * @param array $playedWith - matrix of intersections [ playerIdx1 -> [ playerIdx2 -> N ... ] ... ]
     * @param int[][] $playedWith
     *
     * @return array
     */
    protected static function _swissSeatingOriginal(array $playerTotalGamePoints, array &$playedWith)
    {
        $isPlaying = [];
        $playerTable = []; // мап "игрок -> номер стола", тут харнятся все позиции за столами
        $numPlayers = count($playerTotalGamePoints);
        for ($i = 0; $i < $numPlayers; $i++) {
            $isPlaying[$i] = false;
            $playerTable[$i] = -1;
        }

        $maxCrossings = 0;
        // adjust initial max crossings to make better performance by the cost of less precision
        $maxCrossingsPrecisionFactor = 0;
        $iteration = 0;
        while (!self::_makeSwissSeating(
            $isPlaying,
            $maxCrossings,
            $maxCrossingsPrecisionFactor,
            $numPlayers,
            $playerTable,
            $playerTotalGamePoints,
            $playedWith,
            $iteration
        )) {
            $maxCrossings++;
        }

        return $playerTable;
    }

    /**
     * Recursive swiss seating algorithm.
     * Taken from mahjongsoft.ru
     *
     * @param array $isPlaying - list of flags: [ playerIdx -> isInGame? ]
     * @param int $maxCrossings - integer factor of max allowed intersections
     * @param int $maxCrossingsPrecisionFactor - addition to max crossings to relax requirements if too many iterations passed
     * @param int $numPlayers - players count
     * @param int[] $playerTable - seating: [ playerIdx -> tableIdx ]
     * @param array $playerTotalGamePoints - rating points sum as array: [ player index -> points ]
     * @param array $playedWith - matrix of intersections [ playerIdx1 -> [ playerIdx2 -> N ... ] ... ]
     * @param int $iteration - current iteration of calculations
     *
     * @return bool
     */
    protected static function _makeSwissSeating(
        array &$isPlaying,
        int $maxCrossings,
        int &$maxCrossingsPrecisionFactor,
        int $numPlayers,
        array &$playerTable,
        &$playerTotalGamePoints,
        &$playedWith,
        int &$iteration
    ) {
        $iteration++;
        if ($iteration > 15000) {
            $maxCrossingsPrecisionFactor++;
            $iteration = 0;
        }

        // check if everybody have taken a seat, and quit with success if yes
        $isAllPlaying = true;
        for ($i = 0; $i < $numPlayers; $i++) {
            if (!$isPlaying[$i]) {
                $isAllPlaying = false;
                break;
            }
        }
        if ($isAllPlaying) {
            return true;
        }

        // find table with highest index and highest players count already at that table
        $maxTable = 0;
        $numPlayersOnMaxTable = 0;
        $playersOnMaxTable = [];
        for ($i = 0; $i < $numPlayers; $i++) {
            if ($playerTable[$i] > $maxTable) {
                $maxTable = $playerTable[$i];
                $playersOnMaxTable[0] = $i;
                $numPlayersOnMaxTable = 1;
            } else if ($playerTable[$i] == $maxTable) {
                $playersOnMaxTable[$numPlayersOnMaxTable++] = $i;
            }
        }

        // if table is already filled, take next table and place there a player with highest rating
        if ($numPlayersOnMaxTable == 0 || $numPlayersOnMaxTable == 4) {
            if ($numPlayersOnMaxTable == 4) {
                $maxTable++;
            }
            // find a player with highest rating
            $maxGP = -2147483648;
            $maxRatingPlayer = -1;
            for ($i = 0; $i < $numPlayers; $i++) {
                if (!$isPlaying[$i]) {
                    if ($playerTotalGamePoints[$i] > $maxGP) {
                        $maxGP = $playerTotalGamePoints[$i];
                        $maxRatingPlayer = $i;
                    }
                }
            }

            // check 'playing' flag and place the player to the table, then call the procedure recursively
            $isPlaying[$maxRatingPlayer] = true;
            $playerTable[$maxRatingPlayer] = $maxTable;
            if (self::_makeSwissSeating(
                $isPlaying,
                $maxCrossings + $maxCrossingsPrecisionFactor,
                $maxCrossingsPrecisionFactor,
                $numPlayers,
                $playerTable,
                $playerTotalGamePoints,
                $playedWith,
                $iteration
            )) {
                return true;
            } else {
                // failed to make a seating: falling back
                $isPlaying[$maxRatingPlayer] = false;
                $playerTable[$maxRatingPlayer] = -1;
                return false;
            }
        } else {
            // there are already players at the table: we should take next players with highest ratings
            $numNextPlayers = 0;
            $nextPlayers = [];
            $curCrossings = 0; // current intersections count; first try to make seating without intersections
            while (true) {
                for ($i = 0; $i < $numPlayers; $i++) {
                    if (!$isPlaying[$i]) {
                        // check if players have already played at the same table
                        $numCrossings = 0;
                        for ($j = 0; $j < $numPlayersOnMaxTable; $j++) {
                            $numCrossings += $playedWith[$i][$playersOnMaxTable[$j]];
                        }

                        if ($numCrossings <= $curCrossings) {
                            $nextPlayers[$numNextPlayers++] = $i;
                        }
                    }
                }
                if ($numNextPlayers > 0) {
                    break;
                } else if ($curCrossings == $maxCrossings + $maxCrossingsPrecisionFactor) {
                    return false;
                } else {
                    $curCrossings++;
                }
            }

            // sort players by rating
            for ($i = 0; $i < $numNextPlayers - 1; $i++) {
                for ($j = $i + 1; $j < $numNextPlayers; $j++) {
                    if ($playerTotalGamePoints[$nextPlayers[$i]] < $playerTotalGamePoints[$nextPlayers[$j]]) {
                        $t = $nextPlayers[$i];
                        $nextPlayers[$i] = $nextPlayers[$j];
                        $nextPlayers[$j] = $t;
                    }
                }
            }

            // substitute candidates for seating, then make a check
            for ($i = 0; $i < $numNextPlayers; $i++) {
                // check 'playing' flag and place the player to the table, then call the procedure recursively
                $isPlaying[$nextPlayers[$i]] = true;
                $playerTable[$nextPlayers[$i]] = $maxTable;
                for ($j = 0; $j < $numPlayersOnMaxTable; $j++) {
                    $playedWith[$nextPlayers[$i]][$playersOnMaxTable[$j]]++;
                    $playedWith[$playersOnMaxTable[$j]][$nextPlayers[$i]]++;
                }
                // return success if we found a seating, or falling back otherwise
                if (self::_makeSwissSeating(
                    $isPlaying,
                    $maxCrossings + $maxCrossingsPrecisionFactor - $curCrossings,
                    $maxCrossingsPrecisionFactor,
                    $numPlayers,
                    $playerTable,
                    $playerTotalGamePoints,
                    $playedWith,
                    $iteration
                )) {
                    return true;
                } else {
                    $isPlaying[$nextPlayers[$i]] = false;
                    $playerTable[$nextPlayers[$i]] = -1;
                    for ($j = 0; $j < $numPlayersOnMaxTable; $j++) {
                        $playedWith[$nextPlayers[$i]][$playersOnMaxTable[$j]]--;
                        $playedWith[$playersOnMaxTable[$j]][$nextPlayers[$i]]--;
                    }
                }
            }
            return false;
        }
    }

    /**
     * Run this method before shuffle
     *
     * @return void
     */
    public static function shuffleSeed(): void
    {
        srand(crc32(microtime()));
    }

    /**
     * Shuffle array while maintaining its keys
     * Should rely on srand RNG seed: run shuffleSeed before this!
     *
     * @param array $array
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

    /**
     * Make interval seating
     * Players from the top are seating with interval of $step, but if table count is
     * not divisible by $step, rest of players are seated with step 1.
     *
     * @param array $currentRatingTable :ordered list
     * @param int $step
     * @param bool $randomize
     *
     * @return array
     * @throws \Exception
     */
    public static function makeIntervalSeating(array $currentRatingTable, int $step, bool $randomize = false)
    {
        srand(crc32(microtime()));
        $tables = [];
        $currentTable = [];

        // These guys from bottom could not be placed with desired interval, so they play with interval 1
        $playersToSeatWithNoInterval = 4 * ((count($currentRatingTable) / 4) % $step);
        // These guys from top should be placed as required
        $playersPossibleToSeatWithInterval = count($currentRatingTable) - $playersToSeatWithNoInterval;

        // Fill tables with interval of $step
        for ($offset = 0; $offset < $step; $offset++) {
            for ($i = 0; $i < $playersPossibleToSeatWithInterval; $i += $step) {
                $currentTable []= $currentRatingTable[$offset + $i]['id'];
                if (count($currentTable) == 4) {
                    $tables []= $randomize ? self::shuffle($currentTable) : $currentTable;
                    $currentTable = [];
                }
            }
        }

        // Fill rest of tables with interval 1
        for ($i = $playersPossibleToSeatWithInterval; $i < count($currentRatingTable); $i++) {
            $currentTable []= $currentRatingTable[$i]['id'];
            if (count($currentTable) == 4) {
                $tables []= $randomize ? self::shuffle($currentTable) : $currentTable;
                $currentTable = [];
            }
        }

        return $tables;
    }

    /**
     * @param int[][] $prescriptForSession
     * @param PlayerPrimitive[] $players [local_id => player_id, .... ]
     * @return array [id => int, local_id => int][][]
     */
    public static function makePrescriptedSeating($prescriptForSession, $players)
    {
        return array_map(function ($table) use ($players) {
            return array_map(function ($localId) use ($players) {
                return ['id' => $players[$localId], 'local_id' => $localId];
            }, $table);
        }, $prescriptForSession);
    }
}
