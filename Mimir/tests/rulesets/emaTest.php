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

class EmaRulesetTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var \Common\Ruleset
     */
    protected $_ruleset;

    protected function setUp(): void
    {
        $this->_ruleset = \Common\Ruleset::instance('ema');
    }

    public function testUma()
    {
        $this->assertEquals(30000, $this->_ruleset->startPoints()); // If this changes, all below should be changed too

        $this->assertEquals(
            [1 => 0, 0, 0, 0],
            $this->_ruleset->uma([30000, 30000, 30000, 30000])
        ); // all initial/equal score

        $this->assertEquals(
            [1 => 15000, 0, 0, -15000],
            $this->_ruleset->uma([28000, 28000, 37000, 27000])
        ); // 1 leader, 2 === 3

        $this->assertEquals(
            [1 => 15000, 5000, -10000, -10000],
            $this->_ruleset->uma([27000, 28000, 37000, 27000])
        ); // 1 leader, 3 === 4

        $this->assertEquals(
            [1 => 15000, -5000, -5000, -5000],
            $this->_ruleset->uma([27000, 27000, 37000, 27000])
        ); // 1 leader, 2 === 3 === 4

        $this->assertEquals(
            [1 => 10000, 10000, -5000, -15000],
            $this->_ruleset->uma([33000, 33000, 24000, 32000])
        ); // 1 loser, 1 === 2

        $this->assertEquals(
            [1 => 15000, 0, 0, -15000],
            $this->_ruleset->uma([33000, 32000, 24000, 32000])
        ); // 1 loser, 2 === 3

        $this->assertEquals(
            [1 => 5000, 5000, 5000, -15000],
            $this->_ruleset->uma([32000, 32000, 24000, 32000])
        ); // 1 loser, 1 === 2 === 3

        $this->assertEquals(
            [1 => 10000, 10000, -5000, -15000],
            $this->_ruleset->uma([32000, 29000, 24000, 32000])
        ); // 2x2, 1 === 2

        $this->assertEquals(
            [1 => 15000, 5000, -10000, -10000],
            $this->_ruleset->uma([36000, 24000, 24000, 32000])
        ); // 2x2, 3 === 4

        $this->assertEquals(
            [1 => 10000, 10000, -10000, -10000],
            $this->_ruleset->uma([36000, 24000, 24000, 36000])
        ); // 2x2, 1 === 2 && 3 === 4
    }
}
