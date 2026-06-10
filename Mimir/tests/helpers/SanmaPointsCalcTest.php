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

use Common\Ruleset;

require_once __DIR__ . '/../../src/helpers/PointsCalc.php';

/**
 * 3-player (sanma) scoring: with-tsumo-loss mode.
 * Scores hold only the 3 real players; the ghost seat never appears here.
 */
class SanmaPointsTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var Ruleset
     */
    protected $_ruleset;

    protected $_currentScores = [
        1 => 0,
        2 => 0,
        3 => 0
    ];

    protected function setUp(): void
    {
        $this->_ruleset = \Common\Ruleset::instance('sanma');
        $this->_ruleset
            ->rules()
            ->setWithKazoe(true)
            ->setWithKiriageMangan(false);
    }

    public function testTsumoBasic()
    {
        // 30fu 2han: base 480 -> ko pays 500, oya pays 1000; winner gets
        // 1500 instead of yonma 2000 (tsumo loss)
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            2, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 1500, -1000, -500], $actualPoints);
    }

    public function testTsumoBasicDealer()
    {
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer
            $this->_currentScores,
            1, // winner id
            2, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 2000, -1000, -1000], $actualPoints);
    }

    public function testTsumoMangan()
    {
        // Child mangan tsumo: 2000 + 4000 = 6000 total (8000 in yonma)
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            5, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 6000, -4000, -2000], $actualPoints);
    }

    public function testTsumoManganDealer()
    {
        // Dealer mangan tsumo: 2 x 4000 = 8000 total (12000 in yonma)
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            1, // dealer
            $this->_currentScores,
            1, // winner id
            5, // han
            30, // fu
            [], // riichi list
            0, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8000, -4000, -4000], $actualPoints);
    }

    public function testTsumoHonba()
    {
        // 100 per payer per honba: winner receives 200/honba (not 300)
        $actualPoints = PointsCalc::tsumo(
            $this->_ruleset,
            2, // dealer
            $this->_currentScores,
            1, // winner id
            5, // han
            30, // fu
            [], // riichi list
            2, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 6400, -4200, -2200], $actualPoints);
    }

    public function testRonUnchanged()
    {
        // Ron value and honba payment are the same as in yonma
        $actualPoints = PointsCalc::ron(
            $this->_ruleset,
            false, // dealer
            $this->_currentScores,
            1, // winner id
            3, // loser id
            5, // han
            30, // fu
            [], // riichi list
            1, // honba
            0, // riichi bets count
            null // pao player id
        );

        $this->assertEquals([1 => 8300, 0, -8300], $actualPoints);
    }

    public function testDrawDefaultPayments()
    {
        $this->assertEquals(
            [1 => 0, 0, 0],
            PointsCalc::draw($this->_ruleset, $this->_currentScores, [], [])
        );
        $this->assertEquals(
            [1 => 0, 0, 0],
            PointsCalc::draw($this->_ruleset, $this->_currentScores, [1, 2, 3], [])
        );
        $this->assertEquals(
            [1 => 3000, -1500, -1500],
            PointsCalc::draw($this->_ruleset, $this->_currentScores, [1], [])
        );
        $this->assertEquals(
            [1 => 1500, 1500, -3000],
            PointsCalc::draw($this->_ruleset, $this->_currentScores, [1, 2], [])
        );
    }

    public function testDrawCustomPayments()
    {
        $this->_ruleset->rules()->setSanmaDrawPayments(4000);
        $this->assertEquals(
            [1 => 4000, -2000, -2000],
            PointsCalc::draw($this->_ruleset, $this->_currentScores, [1], [])
        );
        $this->assertEquals(
            [1 => 2000, 2000, -4000],
            PointsCalc::draw($this->_ruleset, $this->_currentScores, [1, 2], [])
        );
    }

    public function testDrawWithRiichi()
    {
        $this->assertEquals(
            [1 => 3000, -2500, -1500],
            PointsCalc::draw($this->_ruleset, $this->_currentScores, [1], [2])
        );
    }

    public function testChombo()
    {
        $this->_ruleset->rules()->setExtraChomboPayments(false);
        $this->assertEquals(
            [1 => 0, 0, 0],
            PointsCalc::chombo($this->_ruleset, 1, 2, $this->_currentScores)
        );

        // Flat payment to each player regardless of dealership
        $this->_ruleset->rules()->setExtraChomboPayments(true);
        $this->assertEquals(
            [1 => 6000, -12000, 6000],
            PointsCalc::chombo($this->_ruleset, 1, 2, $this->_currentScores)
        );
        $this->assertEquals(
            [1 => -12000, 6000, 6000],
            PointsCalc::chombo($this->_ruleset, 1, 1, $this->_currentScores)
        );

        $this->_ruleset->rules()->setSanmaChomboPayments(4000);
        $this->assertEquals(
            [1 => 4000, -8000, 4000],
            PointsCalc::chombo($this->_ruleset, 1, 2, $this->_currentScores)
        );
    }

    public function testNagashi()
    {
        // Mangan tsumo equivalents with tsumo loss
        $this->assertEquals(
            [1 => 8000, -4000, -4000],
            PointsCalc::nagashi($this->_ruleset, $this->_currentScores, 1, [], [1])
        );
        $this->assertEquals(
            [1 => -4000, 6000, -2000],
            PointsCalc::nagashi($this->_ruleset, $this->_currentScores, 1, [], [2])
        );
        $this->assertEquals(
            [1 => -8000, 4000, 4000],
            PointsCalc::nagashi($this->_ruleset, $this->_currentScores, 1, [], [2, 3])
        );
    }

    public function testNagashiTooManyOwners()
    {
        $this->expectException(InvalidParametersException::class);
        PointsCalc::nagashi($this->_ruleset, $this->_currentScores, 1, [], [1, 2, 3]);
    }
}
