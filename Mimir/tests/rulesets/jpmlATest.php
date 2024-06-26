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

    protected function setUp(): void
    {
        $this->_ruleset = \Common\Ruleset::instance('jpmlA');
    }

    public function testUma()
    {
        $this->assertEquals(30000, $this->_ruleset->rules()->getStartPoints()); // If this changes, all below should be changed too

        // No tie

        $this->assertEquals(
            [12000, -1000, -3000, -8000],
            $this->_ruleset->uma([28000, 29000, 37000, 27000])
        ); // 1 leader

        $this->assertEquals(
            [8000, 3000, 1000, -12000],
            $this->_ruleset->uma([31000, 33000, 24000, 32000])
        ); // 1 loser

        $this->assertEquals(
            [8000, 4000, -4000, -8000],
            $this->_ruleset->uma([26000, 27000, 24000, 28000])
        ); // all losers

        $this->assertEquals(
            [8000, 4000, -4000, -8000],
            $this->_ruleset->uma([32000, 29000, 24000, 37000])
        ); // 2x2

        // Tie

        $this->assertEquals(
            [0, 0, 0, 0],
            $this->_ruleset->uma([30000, 30000, 30000, 30000])
        ); // all initial score

        $this->assertEquals(
            [12000, -2000, -2000, -8000],
            $this->_ruleset->uma([28000, 28000, 37000, 27000])
        ); // 1 leader, 2 === 3

        $this->assertEquals(
            [12000, -1000, -5500, -5500],
            $this->_ruleset->uma([27000, 28000, 37000, 27000])
        ); // 1 leader, 3 === 4

        $this->assertEquals(
            [5500, 5500, 1000, -12000],
            $this->_ruleset->uma([33000, 33000, 24000, 32000])
        ); // 1 loser, 1 === 2

        $this->assertEquals(
            [8000, 2000, 2000, -12000],
            $this->_ruleset->uma([33000, 32000, 24000, 32000])
        ); // 1 loser, 2 === 3

        $this->assertEquals(
            [6000, 6000, -4000, -8000],
            $this->_ruleset->uma([26000, 28000, 24000, 28000])
        ); // all losers, 1 === 2

        $this->assertEquals(
            [8000, 4000, -6000, -6000],
            $this->_ruleset->uma([24000, 29000, 24000, 28000])
        ); // all losers, 3 === 4

        $this->assertEquals(
            [8000, 0, 0, -8000],
            $this->_ruleset->uma([28000, 29000, 24000, 28000])
        ); // all losers, 2 === 3

        $this->assertEquals(
            [6000, 6000, -4000, -8000],
            $this->_ruleset->uma([32000, 29000, 24000, 32000])
        ); // 2x2, 1 === 2

        $this->assertEquals(
            [8000, 4000, -6000, -6000],
            $this->_ruleset->uma([36000, 24000, 24000, 32000])
        ); // 2x2, 3 === 4
    }
}
