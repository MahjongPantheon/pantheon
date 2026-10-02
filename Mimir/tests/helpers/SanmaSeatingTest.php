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

use Common\WindShuffleMode;

require_once __DIR__ . '/../../src/helpers/Seating.php';

/**
 * Seating with 3-player (sanma) tables.
 */
class SanmaSeatingTest extends \PHPUnit\Framework\TestCase
{
    public function testIntersectionsTableForThreePlayerTables()
    {
        $players = [
            1 => 1500,
            2 => 1500,
            3 => 1500,
            4 => 1500,
            5 => 1500,
            6 => 1500
        ];

        $previousSeating = [
            [1, 2, 3],
            [4, 5, 6]
        ];

        $table = Seating::makeIntersectionsTable($players, $previousSeating, 3);
        $check = [
            '1+++2',
            '1+++3',
            '2+++3',

            '4+++5',
            '4+++6',
            '5+++6',
        ];

        foreach ($check as $i) {
            $this->assertEquals(2, $table[$i]); // last seating is exactly same as previous -> expect 2 everywhere
        }
        $this->assertEquals(count($check), count($table));
    }

    public function testInitialRandomSeatingSanma()
    {
        $players = [
            1 => 1500,
            2 => 1500,
            3 => 1500,
            4 => 1500,
            5 => 1500,
            6 => 1500,
            7 => 1500,
            8 => 1500,
            9 => 1500
        ];

        $seating = Seating::shuffledSeating(
            $players,
            [],
            /* group count = */ 1,
            /* seed = */ 3464752,
            WindShuffleMode::WIND_SHUFFLE_MODE_RANDOM,
            /* table size = */ 3
        );
        $this->assertEquals(9, count($seating));
        $this->assertEquals($seating, $players); // same keys & values...
        $this->assertNotEquals(json_encode($seating), json_encode($players)); // ...but different order
    }

    public function testSanmaSeatingNotIntersectsAfterFirstGame()
    {
        $players = [
            1 => 1500,
            2 => 1500,
            3 => 1500,
            4 => 1500,
            5 => 1500,
            6 => 1500,
            7 => 1500,
            8 => 1500,
            9 => 1500
        ];

        $previousSeating = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ];

        $seating = Seating::shuffledSeating(
            $players,
            $previousSeating,
            /* group count = */ 1,
            /* seed = */ 3462352,
            WindShuffleMode::WIND_SHUFFLE_MODE_BALANCED,
            /* table size = */ 3
        );
        $intersections = Seating::makeIntersectionsTable($seating, $previousSeating, 3);
        foreach ($intersections as $i) {
            $this->assertEquals(1, $i);
        }
    }

    public function testBalancedWindShuffleKeepsSanmaTablesIntact()
    {
        $seating = [
            1 => 1500,
            2 => 1500,
            3 => 1500,
            4 => 1500,
            5 => 1500,
            6 => 1500
        ];

        $shuffled = Seating::makeWindShuffle(
            $seating,
            [[1, 2, 3], [4, 5, 6]],
            WindShuffleMode::WIND_SHUFFLE_MODE_BALANCED,
            /* table size = */ 3
        );

        $this->assertEquals(6, count($shuffled));
        $tables = array_chunk(array_keys($shuffled), 3);
        sort($tables[0]);
        sort($tables[1]);
        $this->assertEquals([1, 2, 3], $tables[0]);
        $this->assertEquals([4, 5, 6], $tables[1]);
    }
}
