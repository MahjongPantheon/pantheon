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

require_once __DIR__ . '/../../src/helpers/Seating.php';

class SeatingTest extends \PHPUnit_Framework_TestCase
{
    public function testMakeIntersectionsTable()
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
            9 => 1500,
            10 => 1500,
            11 => 1500,
            12 => 1500,
            13 => 1500,
            14 => 1500,
            15 => 1500,
            16 => 1500
        ];

        $previousSeating = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];

        $table = Seating::makeIntersectionsTable($players, $previousSeating);
        $check = [
            '1+++2',
            '1+++3',
            '1+++4',
            '2+++3',
            '2+++4',
            '3+++4',

            '5+++6',
            '5+++7',
            '5+++8',
            '6+++7',
            '6+++8',
            '7+++8',

            '9+++10',
            '9+++11',
            '9+++12',
            '10+++11',
            '10+++12',
            '11+++12',

            '13+++14',
            '13+++15',
            '13+++16',
            '14+++15',
            '14+++16',
            '15+++16',
        ];

        foreach ($check as $i) {
            $this->assertEquals(2, $table[$i]); // last seating is exactly same as previous -> expect 2 everywhere
        }
        $this->assertEquals(count($check), count($table));
    }

    // single group

    public function testInitialRandomSeating()
    {
        $players = [
            '1' => 1500,
            '2' => 1500,
            '3' => 1500,
            '4' => 1500,
            '5' => 1500,
            '6' => 1500,
            '7' => 1500,
            '8' => 1500,
            '9' => 1500,
            '10' => 1500,
            '11' => 1500,
            '12' => 1500
        ];

        $seating = Seating::generateTables($players, [], /* group count = */ 1, /* seed = */ 3464752);
        $this->assertEquals(12, count($seating));
        $this->assertEquals($seating, $players);
        $this->assertNotEquals(json_encode($seating), json_encode($players));
    }

    public function testSeatingNotIntersectsAfterFirstGame()
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
            9 => 1500,
            10 => 1500,
            11 => 1500,
            12 => 1500,
            13 => 1500,
            14 => 1500,
            15 => 1500,
            16 => 1500
        ];

        $previousSeating = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];

        $seating = Seating::generateTables(
            $players,
            $previousSeating,
            /* group count = */ 1, /* seed = */
            3462352
        );
        $intersections = Seating::makeIntersectionsTable($seating, $previousSeating);
        foreach ($intersections as $i) {
            $this->assertEquals(1, $i);
        }
    }

    public function testSeatingAfterSeveralGames()
    {
        $this->markTestSkipped();

        $players = [
            1 => 1500,
            2 => 1500,
            3 => 1500,
            4 => 1500,
            5 => 1500,
            6 => 1500,
            7 => 1500,
            8 => 1500,
            9 => 1500,
            10 => 1500,
            11 => 1500,
            12 => 1500,
            13 => 1500,
            14 => 1500,
            15 => 1500,
            16 => 1500
        ];

        $previousSeating = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15],
            [4, 8, 12, 16]
        ];

        $seating = Seating::generateTables(
            $players,
            $previousSeating,
            /* group count = */ 1, /* seed = */
            9486370
        );

        $intersections = Seating::makeIntersectionsTable($seating, $previousSeating);
        foreach ($intersections as $i) {
            $this->assertEquals(1, $i);
        }
    }

    // two groups

    public function testWinnersLosersSeating()
    {
        $players = [
            1 => 1508,
            2 => 1507,
            3 => 1506,
            4 => 1505,
            5 => 1504,
            6 => 1503,
            7 => 1502,
            8 => 1501,

            9 => 1499,
            10 => 1498,
            11 => 1497,
            12 => 1496,
            13 => 1495,
            14 => 1494,
            15 => 1493,
            16 => 1492
        ];

        $previousSeating = [
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16]
        ];

        $seating = Seating::generateTables(
            $players,
            $previousSeating,
            /* group count = */ 2, /* seed = */
            3462352
        );

        list($winners, $losers) = array_chunk($seating, 8);
        foreach ($winners as $score) {
            $this->assertTrue($score > 1500);
        }
        foreach ($losers as $score) {
            $this->assertTrue($score < 1500);
        }

        $intersections = Seating::makeIntersectionsTable($seating, $previousSeating);
        foreach ($intersections as $i) {
            $this->assertTrue($i <= 2); // may be 2, as of stricter conditions
        }
    }
}
