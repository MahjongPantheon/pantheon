<?php
/*  Rheda: visualizer and control panel
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
namespace Rheda;

require_once __DIR__ . '/Array.php';

class SortitionHelper
{
    protected static $_possibleIntersections = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 3]
    ];

    /**
     * @return ((array|mixed|null)[]|mixed)[]
     *
     * @psalm-return array{0: array<int, array|null>, 1: list<mixed>, 2: mixed, 3: array<empty, empty>|mixed}
     */
    public static function generate($randFactor, $userList, $ratingsData, $previousPlacements, $groupsCount): array
    {
        $maxIterations = 1000;
        $bestGroupsMap = [];
        $factor = 100500;
        $groups = array_chunk($userList, ceil(count($userList) / $groupsCount), true);

        for ($i = 0; $i < $maxIterations; $i++) {
            srand($randFactor + $i*5);
            foreach ($groups as $k => $v) {
                shuffle($groups[$k]);
            }

            $newFactor = self::_calculateFactor(array_reduce($groups, function ($acc, $el) {
                return array_merge($acc, $el);
            }, []), $ratingsData);
            if ($newFactor < $factor) {
                $factor = $newFactor;
                $bestGroupsMap = $groups;
            }
            usleep(500); // sleep some time to reduce cpu load
        }

        $sortition = array_values(array_reduce($bestGroupsMap, function ($acc, $el) {
            return array_merge($acc, $el);
        }, []));
        $bestIntersection = self::_calcIntersection($ratingsData, $sortition);

        // count intersections of players
        $bestIntersectionSets = array_reduce($bestIntersection, function ($acc, $el) {
            if (empty($acc[$el])) {
                $acc[$el] = 0;
            }
            $acc[$el]++;
            return $acc;
        }, []);
        unset($bestIntersectionSets[1]);

        $tables = array_chunk($sortition, 4);
        foreach ($tables as $k => $v) {
            $tables[$k] = self::_calcPlacement($v, $previousPlacements);
        }

        return [$tables, $sortition, $bestIntersection, $bestIntersectionSets];
    }

    /**
     * Detect optimal place (wind) at the table according to previous seating data
     *
     * @param $tablePlayers [{username -> #name}, {username -> #name}, {username -> #name}, {username -> #name}]
     * @param $previousPlacements [{#name -> [[player_num -> 1], [player_num -> 2], [player_num -> 0]]}, ...]
     * @param array $tablePlayers
     *
     */
    protected static function _calcPlacement(array $tablePlayers, $previousPlacements)
    {
        $possiblePlacements = [
            '0123', '1023', '2013', '3012',
            '0132', '1032', '2031', '3021',
            '0213', '1203', '2103', '3102',
            '0231', '1230', '2130', '3120',
            '0312', '1302', '2301', '3201',
            '0321', '1320', '2310', '3210',
        ];

        $bestResult = 10005000;
        $bestPlacement = null;
        foreach ($possiblePlacements as $placement) {
            $newResult = self::_calcSubSums(
                $tablePlayers[$placement[0]]['username'],
                $tablePlayers[$placement[1]]['username'],
                $tablePlayers[$placement[2]]['username'],
                $tablePlayers[$placement[3]]['username'],
                $previousPlacements
            );

            if ($newResult < $bestResult) {
                $bestResult = $newResult;
                $bestPlacement = [
                    [
                        'username' => $tablePlayers[$placement[0]]['username'],
                        'rating' => $tablePlayers[$placement[0]]['rating']
                    ],
                    [
                        'username' => $tablePlayers[$placement[1]]['username'],
                        'rating' => $tablePlayers[$placement[1]]['rating']
                    ],
                    [
                        'username' => $tablePlayers[$placement[2]]['username'],
                        'rating' => $tablePlayers[$placement[2]]['rating']
                    ],
                    [
                        'username' => $tablePlayers[$placement[3]]['username'],
                        'rating' => $tablePlayers[$placement[3]]['rating']
                    ]
                ];
            }
        }

        return $bestPlacement;
    }

    /**
     * Calculate sum of differences of place indexes. The less is sum, the more uniform is distribution.
     *
     * @param $player1
     * @param $player2
     * @param $player3
     * @param $player4
     * @param $prevData
     * @return float|int
     */
    protected static function _calcSubSums($player1, $player2, $player3, $player4, $prevData)
    {
        $totalsum = 0;
        foreach ([$player1, $player2, $player3, $player4] as $idx => $player) {
            $playerData = $prevData[$player];
            $buckets = [0 => 0, 1 => 0, 2 => 0, 3 => 0];
            $buckets[$idx] ++;

            foreach ($playerData as $item) {
                $buckets[$item['player_num']] ++;
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
     * @param array $sortition
     *
     * @return int[]
     *
     * @psalm-return array<string, int>
     */
    protected static function _calcIntersection($ratingsData, array $sortition): array
    {
        $intersectionData = [];

        $data = ArrayHelpers::elm2Key($ratingsData, 'game_id', true);
        $data = array_merge($data, array_chunk($sortition, 4));

        foreach ($data as $game) {
            foreach (self::$_possibleIntersections as $intersection) {
                // fill intersection data
                $intKey = $game[$intersection[0]]['username'].'+++'.$game[$intersection[1]]['username'];
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
     * Calculate generalized factor of seating acceptability.
     * Takes into account sequential crossings of players.
     *
     * @param $playersMap array Ordered player list
     * @param $ratingsData array previous seating data
     *
     * @return float|int
     */
    protected static function _calculateFactor(array $playersMap, $ratingsData)
    {
        $factor = 0;

        $tablesCount = floor(count($playersMap) / 4);
        $ratingsData = array_map(function ($el) use ($tablesCount) {
            $el['game_index'] = floor($el['game_id'] / $tablesCount);
            return $el;
        }, $ratingsData);

        $newGameId = (4 * (1 + end($ratingsData)['game_id']));
        $newGameIndex = floor($newGameId / (4 * $tablesCount));
        foreach ($playersMap as $player) {
            $ratingsData []= [
                'username' => $player['username'],
                'game_id' => floor($newGameId ++ / 4),
                'game_index' => $newGameIndex,
            ];
        }

        $crossings = [];
        $data = ArrayHelpers::elm2Key($ratingsData, 'game_id', true);
        foreach ($data as $game) { // this should be (16 * games count) iterations
            for ($i = 0; $i < count($game); $i++) { // strictly 4 iterations!
                for ($j = 0; $j < count($game); $j++) { // strictly 4 iterations!
                    if ($j == $i) {
                        continue;
                    }
                    if (!isset($crossings[$game[$i]['username']])) {
                        $crossings[$game[$i]['username']] = [];
                    }
                    if (!isset($crossings[$game[$i]['username']][$game[$j]['username']])) {
                        $crossings[$game[$i]['username']][$game[$j]['username']] = [];
                    }

                    $crossings[$game[$i]['username']][$game[$j]['username']] []= $game[0]['game_index'];
                }
            }
        }

        foreach ($crossings as /*$user => */$opponentsList) {
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
}
