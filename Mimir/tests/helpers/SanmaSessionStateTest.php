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

require_once __DIR__ . '/../../src/helpers/SessionState.php';
require_once __DIR__ . '/../../src/primitives/Round.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Session.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

/**
 * Session state in 3-player (sanma) mode: ghost seat is filtered out,
 * dealership rotates over 3 seats, hanchan is East 1-3 + South 1-3.
 */
class SanmaSessionStateTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
    /**
     * @var Ruleset
     */
    protected $_ruleset;
    /**
     * @var PlayerPrimitive[]
     */
    protected $_players = [];
    /**
     * @var SessionState
     */
    protected $_state;

    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();
        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3], true);

        $this->_ruleset = Ruleset::instance('sanma');
        $this->_ruleset->rules()
            ->setWithButtobi(false)
            ->setWithLeadingDealerGameOver(false)
            ->setWithKiriageMangan(false);
        // Session always passes 4 ids including the ghost seat
        $this->_state = new SessionState($this->_ruleset, [1, 2, 3, \Common\Constants::GHOST_PLAYER_ID]);
    }

    public function testInitialStateHasNoGhost()
    {
        $this->assertEquals([
            1 => 35000,
                 35000,
                 35000
        ], $this->_state->getScores());
        $this->assertEquals(1, $this->_state->getCurrentDealer());
    }

    public function testInitWithoutGhostAlsoAccepted()
    {
        $state = new SessionState($this->_ruleset, [1, 2, 3]);
        $this->assertEquals(3, count($state->getScores()));
    }

    public function testWrongPlayersCount()
    {
        $this->expectException(InvalidParametersException::class);
        new SessionState($this->_ruleset, [1, 2, 3, 4]);
    }

    public function testTsumoScores()
    {
        $round = new RoundPrimitive($this->_ds);
        $round
            ->setOutcome('tsumo')
            ->setWinner($this->_players[1])
            ->setHan(5)
            ->setFu(30)
            ->setDora(1)
            ->setRiichiUsers([]);
        $this->_state->update($round);

        // Child mangan tsumo with tsumo loss: +6000 (dealer -4000, ko -2000)
        $this->assertEquals([
            1 => 35000 - 4000,
                 35000 + 6000,
                 35000 - 2000
        ], $this->_state->getScores());
        $this->assertEquals(2, $this->_state->getRound());
        $this->assertEquals(2, $this->_state->getCurrentDealer());
    }

    public function testDrawScoresAndDealerRepeat()
    {
        $round = new RoundPrimitive($this->_ds);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([$this->_players[0]])
            ->setRiichiUsers([]);
        $this->_state->update($round);

        // Dealer keeps tempai: round is not advanced, honba is added
        $this->assertEquals([
            1 => 35000 + 3000,
                 35000 - 1500,
                 35000 - 1500
        ], $this->_state->getScores());
        $this->assertEquals(1, $this->_state->getRound());
        $this->assertEquals(1, $this->_state->getHonba());
    }

    public function testDealerRotationOverThreeSeats()
    {
        $expectedDealers = [2, 3, 1, 2, 3];
        foreach ($expectedDealers as $expectedDealer) {
            $round = new RoundPrimitive($this->_ds);
            $round
                ->setOutcome('draw')
                ->setTempaiUsers([]) // dealer noten -> always advance
                ->setRiichiUsers([]);
            $this->_state->update($round);
            $this->assertEquals($expectedDealer, $this->_state->getCurrentDealer());
        }
    }

    public function testGameEndsAfterSouth3()
    {
        // Hanchan = 6 dealerships (E1-E3, S1-S3)
        for ($i = 0; $i < 6; $i++) {
            $this->assertFalse($this->_state->isFinished());
            $round = new RoundPrimitive($this->_ds);
            $round
                ->setOutcome('draw')
                ->setTempaiUsers([])
                ->setRiichiUsers([]);
            $this->_state->update($round);
        }

        $this->assertEquals(7, $this->_state->getRound());
        $this->assertTrue($this->_state->isFinished());
    }

    public function testTonpuusenEndsAfterEast3()
    {
        $this->_ruleset->rules()->setTonpuusen(true);
        for ($i = 0; $i < 3; $i++) {
            $this->assertFalse($this->_state->isFinished());
            $round = new RoundPrimitive($this->_ds);
            $round
                ->setOutcome('draw')
                ->setTempaiUsers([])
                ->setRiichiUsers([]);
            $this->_state->update($round);
        }

        $this->assertEquals(4, $this->_state->getRound());
        $this->assertTrue($this->_state->isFinished());
    }

    public function testButtobi()
    {
        $this->_ruleset->rules()->setWithButtobi(true);

        $round = new RoundPrimitive($this->_ds);
        $round
            ->setOutcome('ron')
            ->setWinner($this->_players[1])
            ->setLoser($this->_players[2])
            ->setHan(-2) // double yakuman: 64000 > 35000 start points
            ->setFu(0)
            ->setDora(0)
            ->setRiichiUsers([]);
        $this->_state->update($round);

        $this->assertTrue($this->_state->isFinished());
    }

    public function testFromJsonRestoresSanmaState()
    {
        $json = $this->_state->toJson();
        $this->assertNotEmpty($json);
        $restored = SessionState::fromJson(
            $this->_ruleset,
            [1, 2, 3, \Common\Constants::GHOST_PLAYER_ID],
            (string)$json
        );
        $this->assertEquals($this->_state->getScores(), $restored->getScores());
        $this->assertEquals($this->_state->getCurrentDealer(), $restored->getCurrentDealer());
    }
}
