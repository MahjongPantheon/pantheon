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

        $seating = Seating::shuffledSeating($players, [], /* group count = */ 1, /* seed = */ 3464752);
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

        $seating = Seating::shuffledSeating(
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

        $seating = Seating::shuffledSeating(
            $players,
            $previousSeating,
            /* group count = */ 1, /* seed = */
            9486370
        );

        $intersections = Seating::makeIntersectionsTable($seating, $previousSeating);
        foreach ($intersections as $i) {
            // shuffled seating is not as good as swiss and may produce intersections even in second game
            $this->assertLessThanOrEqual(2, $i);
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

        $seating = Seating::shuffledSeating(
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

    public function testSwissSeatingAfterSeveralGames()
    {
        $players = [
            1 => -1200,
            2 => 9200,
            3 => -13700,
            4 => 4400,
            5 => -27400,
            6 => 10500,
            7 => -29500,
            8 => -8000,
            9 => -23700,
            10 => -9000,
            11 => 1900,
            12 => -38200,
            13 => -1000,
            14 => 13400,
            15 => -34900,
            16 => -19200,
            17 => 8500,
            18 => 11700,
            19 => -32100,
            20 => -4700,
            21 => -15100,
            22 => -2000,
            23 => -25700,
            24 => 21400,
            25 => 40000,
            26 => 64200,
            27 => -14700,
            28 => 49500,
            29 => 35400,
            30 => 1900,
            31 => 59400,
            32 => -31300,
        ];

        $previousSeating = [
            // session 1
            [1, 2, 3, 4],
            [5, 6, 7, 8],
            [9, 10, 11, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
            [21, 22, 23, 24],
            [25, 26, 27, 28],
            [29, 30, 31, 32],

            // session 2
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15],
            [4, 8, 12, 16],
            [17, 21, 25, 29],
            [18, 22, 26, 30],
            [19, 23, 27, 31],
            [20, 24, 28, 32],

            // session 3
            [26, 14, 31, 24],
            [29, 28, 18, 6],
            [25, 11, 30, 2],
            [4, 22, 13, 17],
            [20, 1, 8, 10],
            [27, 16, 21, 3],
            [7, 9, 23, 32],
            [5, 12, 19, 15],

            // session 4
            [13, 26, 29, 2],
            [11, 28, 17, 31],
            [18, 24, 4, 25],
            [1, 27, 30, 14],
            [9, 6, 15, 22],
            [21, 12, 20, 7],
            [3, 32, 8, 19],
            [16, 5, 10, 23],

            // session 5
            [26, 17, 6, 1],
            [25, 13, 31, 20],
            [4, 14, 28, 21],
            [29, 11, 5, 24],
            [2, 18, 9, 8],
            [23, 12, 3, 30],
            [16, 19, 7, 22],
            [32, 15, 27, 10],

            // session 6
            [26, 20, 11, 4],
            [31, 21, 1, 18],
            [28, 30, 16, 9],
            [12, 25, 32, 6],
            [29, 8, 23, 15],
            [24, 19, 13, 10],
            [3, 5, 22, 14],
            [2, 17, 7, 27],

            // session 7
            [11, 26, 8, 21],
            [30, 4, 31, 6],
            [12, 2, 22, 28],
            [25, 9, 19, 14],
            [29, 24, 16, 1],
            [10, 3, 13, 18],
            [5, 23, 17, 20],
            [32, 15, 27, 7],

            // session 8
            [26, 7, 10, 31],
            [23, 1, 25, 28],
            [20, 22, 27, 29],
            [30, 8, 17, 24],
            [32, 18, 14, 11],
            [13, 21, 19, 6],
            [16, 2, 4, 5],
            [12, 3, 9, 15]
        ];

        $seating = Seating::swissSeating($players, $previousSeating);

        $intersections = Seating::makeIntersectionsTable($seating, $previousSeating);
        foreach ($intersections as $i) {
            // Swiss seating should produce seating of 32 players in 8 games with no more than 2 intersections of each pair
            $this->assertLessThanOrEqual(2, $i);
        }
    }

    public function testIntervalSeating()
    {
        $players = [
            ['id' => 1],
            ['id' => 2],
            ['id' => 3],
            ['id' => 4],
            ['id' => 5],
            ['id' => 6],
            ['id' => 7],
            ['id' => 8],
            ['id' => 9],
            ['id' => 10],
            ['id' => 11],
            ['id' => 12],
            ['id' => 13],
            ['id' => 14],
            ['id' => 15],
            ['id' => 16],
            ['id' => 17],
            ['id' => 18],
            ['id' => 19],
            ['id' => 20],
        ];

        $seating = Seating::makeIntervalSeating($players, 2);
        $this->assertEquals([
            [1, 3, 5, 7],
            [9, 11, 13, 15],
            [2, 4, 6, 8],
            [10, 12, 14, 16],
            [17, 18, 19, 20],
        ], $seating, 'Seating with step 2');

        $seating = Seating::makeIntervalSeating($players, 3);
        $this->assertEquals([
            [1, 4, 7, 10],
            [2, 5, 8, 11],
            [3, 6, 9, 12],
            [13, 14, 15, 16],
            [17, 18, 19, 20],
        ], $seating, 'Seating with step 3');

        $seating = Seating::makeIntervalSeating($players, 4);
        $this->assertEquals([
            [1, 5, 9, 13],
            [2, 6, 10, 14],
            [3, 7, 11, 15],
            [4, 8, 12, 16],
            [17, 18, 19, 20],
        ], $seating, 'Seating with step 4');

        $seating = Seating::makeIntervalSeating($players, 5);
        $this->assertEquals([
            [1, 6, 11, 16],
            [2, 7, 12, 17],
            [3, 8, 13, 18],
            [4, 9, 14, 19],
            [5, 10, 15, 20],
        ], $seating, 'Seating with step 5');
    }

    public function testRandomizer()
    {
        $ordered = [1, 2, 3, 4, 5, 6, 7, 8];
        Seating::shuffleSeed();
        $shuffled = Seating::shuffle($ordered);
        $this->assertEquals(8, count($shuffled));
        $this->assertEquals($shuffled, $ordered);
        $this->assertNotEquals(json_encode($shuffled), json_encode($ordered));
    }
}
