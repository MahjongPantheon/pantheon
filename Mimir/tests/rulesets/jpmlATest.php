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

require_once __DIR__ . '/../../src/Ruleset.php';

class JPMLARulesetTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var \Common\Ruleset
     */
    protected $_ruleset;

    public function setUp()
    {
        $this->_ruleset = \Common\Ruleset::instance('jpmlA');
    }

    public function testUma()
    {
        $this->assertEquals(30000, $this->_ruleset->startPoints()); // If this changes, all below should be changed too

        // No tie

        $this->assertEquals(
            [1 => 120, -10, -30, -80],
            $this->_ruleset->uma([28000, 29000, 37000, 27000])
        ); // 1 leader

        $this->assertEquals(
            [1 => 80, 30, 10, -120],
            $this->_ruleset->uma([31000, 33000, 24000, 32000])
        ); // 1 loser

        $this->assertEquals(
            [1 => 80, 40, -40, -80],
            $this->_ruleset->uma([26000, 27000, 24000, 28000])
        ); // all losers

        $this->assertEquals(
            [1 => 80, 40, -40, -80],
            $this->_ruleset->uma([32000, 29000, 24000, 37000])
        ); // 2x2

        // Tie

        $this->assertEquals(
            [1 => 0, 0, 0, 0],
            $this->_ruleset->uma([30000, 30000, 30000, 30000])
        ); // all initial score

        $this->assertEquals(
            [1 => 120, -20, -20, -80],
            $this->_ruleset->uma([28000, 28000, 37000, 27000])
        ); // 1 leader, 2 === 3

        $this->assertEquals(
            [1 => 120, -10, -55, -55],
            $this->_ruleset->uma([27000, 28000, 37000, 27000])
        ); // 1 leader, 3 === 4

        $this->assertEquals(
            [1 => 55, 55, 10, -120],
            $this->_ruleset->uma([33000, 33000, 24000, 32000])
        ); // 1 loser, 1 === 2

        $this->assertEquals(
            [1 => 80, 20, 20, -120],
            $this->_ruleset->uma([33000, 32000, 24000, 32000])
        ); // 1 loser, 2 === 3

        $this->assertEquals(
            [1 => 60, 60, -40, -80],
            $this->_ruleset->uma([26000, 28000, 24000, 28000])
        ); // all losers, 1 === 2

        $this->assertEquals(
            [1 => 80, 40, -60, -60],
            $this->_ruleset->uma([24000, 29000, 24000, 28000])
        ); // all losers, 3 === 4

        $this->assertEquals(
            [1 => 80, 0, 0, -80],
            $this->_ruleset->uma([28000, 29000, 24000, 28000])
        ); // all losers, 2 === 3

        $this->assertEquals(
            [1 => 60, 60, -40, -80],
            $this->_ruleset->uma([32000, 29000, 24000, 32000])
        ); // 2x2, 1 === 2

        $this->assertEquals(
            [1 => 80, 40, -60, -60],
            $this->_ruleset->uma([36000, 24000, 24000, 32000])
        ); // 2x2, 3 === 4
    }
}
