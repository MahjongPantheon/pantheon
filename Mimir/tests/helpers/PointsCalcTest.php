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

require_once __DIR__ . '/../../src/helpers/PointsCalc.php';
require_once __DIR__ . '/../util/MockRuleset.php';

class PointsTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var MockRuleset
     */
    protected $_ruleset;

    protected $_playerIds = [1, 2, 3, 4];
    protected $_currentScores = [
        1 => 0,
        2 => 0,
        3 => 0,
        4 => 0
    ];

    public function setUp()
    {
        $this->_ruleset = new MockRuleset();
        $this->_ruleset->setRule('withKazoe', true);
        $this->_ruleset->setRule('withKiriageMangan', false);
    }

    public function tearDown()
    {
    }

    public function testRonBasic()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            2, // han
            50, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 3200, 0, -3200, 0], $actualPoints);
    }

    public function testRonBasicDealer()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            2, // han
            50, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 4800, 0, -4800, 0], $actualPoints);
    }

    public function testRonLimit()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            20, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 5200, 0, -5200, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 7700, 0, -7700, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8000, 0, -8000, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            6, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 12000, 0, -12000, 0], $actualPoints);
    }

    public function testRonKiriage()
    {
        $this->_ruleset->setRule('withKiriageMangan', true);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8000, 0, -8000, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            3, // han
            60, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8000, 0, -8000, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 12000, 0, -12000, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            3, // han
            60, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 12000, 0, -12000, 0], $actualPoints);
    }

    public function testRonLimitDealer()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            20, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 7700, 0, -7700, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 11600, 0, -11600, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            4, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 12000, 0, -12000, 0], $actualPoints);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            6, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 18000, 0, -18000, 0], $actualPoints);
    }

    public function testKazoe()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            14, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 32000, 0, -32000, 0], $actualPoints);

        $this->_ruleset->setRule('withKazoe', false);

        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            14, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 24000, 0, -24000, 0], $actualPoints);
    }

    public function testTsumoBasic()
    {
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer id
            $this->_currentScores,
            2, // winner id
            2, // han
            50, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => -1600, 3200, -800, -800], $actualPoints);
    }

    public function testTsumoDealer()
    {
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer id
            $this->_currentScores,
            1, // winner id
            2, // han
            50, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 4800, -1600, -1600, -1600], $actualPoints);
    }

    public function testTsumoLimit()
    {
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            4, // han
            20, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 5200, -2600, -1300, -1300], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            4, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 7900, -3900, -2000, -2000], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            4, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8000, -4000, -2000, -2000], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            6, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 12000, -6000, -3000, -3000], $actualPoints);
    }

    public function testTsumoKiriage()
    {
        $this->_ruleset->setRule('withKiriageMangan', true);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            4, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8000, -4000, -2000, -2000], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            3, // han
            60, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8000, -4000, -2000, -2000], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer
            $this->_currentScores,
            1, // winner id
            4, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 12000, -4000, -4000, -4000], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer
            $this->_currentScores,
            1, // winner id
            3, // han
            60, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 12000, -4000, -4000, -4000], $actualPoints);
    }

    public function testDraw()
    {
        $this->assertEquals(
            [1 => 0, 0, 0, 0],
            PointsCalc::draw($this->_currentScores, [], [])
        );
        $this->assertEquals(
            [1 => 3000, -1000, -1000, -1000],
            PointsCalc::draw($this->_currentScores, [1], [])
        );
        $this->assertEquals(
            [1 => 1500, -1500, 1500, -1500],
            PointsCalc::draw($this->_currentScores, [1, 3], [])
        );
        $this->assertEquals(
            [1 => 1000, -3000, 1000, 1000],
            PointsCalc::draw($this->_currentScores, [1, 3, 4], [])
        );
        $this->assertEquals(
            [1 => -1000, -1000, 0, -1000],
            PointsCalc::draw($this->_currentScores, [1, 2, 3, 4], [1, 2, 4])
        );
    }

    public function testAbort()
    {
        $this->assertEquals(
            [1 => -1000, -1000, 0, -1000],
            PointsCalc::abort($this->_currentScores, [1, 2, 4])
        );
    }

    public function testChombo()
    {
        $this->_ruleset->setRule('extraChomboPayments', false);
        $this->assertEquals(
            [1 => 0, 0, 0, 0],
            PointsCalc::chombo($this->_ruleset, 1, 2, $this->_currentScores)
        );
        $this->assertEquals(
            [1 => 0, 0, 0, 0],
            PointsCalc::chombo($this->_ruleset, 1, 1, $this->_currentScores)
        );

        $this->_ruleset->setRule('extraChomboPayments', true);
        $this->assertEquals(
            [1 => 4000, -8000, 2000, 2000],
            PointsCalc::chombo($this->_ruleset, 1, 2, $this->_currentScores)
        );
        $this->assertEquals(
            [1 => -12000, 4000, 4000, 4000],
            PointsCalc::chombo($this->_ruleset, 1, 1, $this->_currentScores)
        );
    }

    public function testHonba()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            6, // han
            40, // fu
            [], // riichi list
            3, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 18900, 0, -18900, 0], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer
            $this->_currentScores,
            1, // winner id
            5, // han
            30, // fu
            [], // riichi list
            4, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 13200, -4400, -4400, -4400], $actualPoints);
    }

    public function testRiichiBets()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            true, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            6, // han
            40, // fu
            [], // riichi list
            0, // honba
            3, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 21000, 0, -18000, 0], $actualPoints);

        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer
            $this->_currentScores,
            1, // winner id
            5, // han
            30, // fu
            [], // riichi list
            0, // honba
            4, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 16000, -4000, -4000, -4000], $actualPoints);
    }

    public function testYakuman()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            -1, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 32000, 0, -32000, 0], $actualPoints);
    }

    public function testPaoTsumo()
    {
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            -1, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            3 // pao player id
        );

        $this->assertEquals([1 => 32000, 0, -32000, 0], $actualPoints);
    }

    public function testPaoRon()
    {
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            2, // loser id
            -1, // han
            40, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            3 // pao player id
        );

        $this->assertEquals([1 => 32000, -16000, -16000, 0], $actualPoints);
    }

    public function testNagashi()
    {
        $this->assertEquals(
            [1 => 12000, -4000, -4000, -4000],
            PointsCalc::nagashi($this->_currentScores, 1, [], [1])
        );

        $this->assertEquals(
            [1 => 12000, -4000, -5000, -5000],
            PointsCalc::nagashi($this->_currentScores, 1, [3,4], [1])
        );

        $this->assertEquals(
            [1 => -4000, 8000, -2000, -2000],
            PointsCalc::nagashi($this->_currentScores, 1, [], [2])
        );

        $this->assertEquals(
            [1 => -4000, 8000, -2000, -3000],
            PointsCalc::nagashi($this->_currentScores, 1, [4], [2])
        );
    }

    public function testNagashiMultiple()
    {
        $this->assertEquals(
            [1 => 8000, 4000, -6000, -6000],
            PointsCalc::nagashi($this->_currentScores, 1, [], [1,2])
        );

        $this->assertEquals(
            [1 => 8000, 3000, -6000, -7000],
            PointsCalc::nagashi($this->_currentScores, 1, [2,4], [1,2])
        );

        $this->assertEquals(
            [1 => -8000, 6000, 6000, -4000],
            PointsCalc::nagashi($this->_currentScores, 1, [], [2,3])
        );

        $this->assertEquals(
            [1 => -9000, 6000, 6000, -5000],
            PointsCalc::nagashi($this->_currentScores, 1, [1,4], [2,3])
        );

        $this->assertEquals(
            [1 => 4000, 2000, 2000, -8000],
            PointsCalc::nagashi($this->_currentScores, 1, [], [1,2,3])
        );

        $this->assertEquals(
            [1 => -12000, 4000, 4000, 4000],
            PointsCalc::nagashi($this->_currentScores, 1, [], [2,3,4])
        );
    }
}
