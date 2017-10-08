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

require_once __DIR__ . '/../../src/helpers/SessionState.php';
require_once __DIR__ . '/../../src/primitives/Round.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Session.php';
require_once __DIR__ . '/../../src/primitives/MultiRound.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class SessionStateTest extends \PHPUnit_Framework_TestCase
{
    protected $_db;
    /**
     * @var MockRuleset
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
    /**
     * @var SessionPrimitive
     */
    protected $_session;
    /**
     * @var EventPrimitive
     */
    protected $_event;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
        $this->_event = (new EventPrimitive($this->_db))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setType('online')
            ->setRuleset(Ruleset::instance('jpmlA'));
        $this->_event->save();

        $this->_players = array_map(function ($i) {
            $p = (new PlayerPrimitive($this->_db))
                ->setDisplayName('player' . $i)
                ->setIdent('oauth' . $i)
                ->setTenhouId('tenhou' . $i);
            $p->save();
            return $p;
        }, [1, 2, 3, 4]);

        $this->_session = (new SessionPrimitive($this->_db))
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->setStatus('inprogress')
            ->setReplayHash('');
        $this->_session->save();

        $this->_ruleset = new MockRuleset();
        $this->_ruleset->setRule('startPoints', 30000);
        $this->_ruleset->setRule('withKiriageMangan', false);
        $this->_state = new SessionState($this->_ruleset, array_map(function (PlayerPrimitive $player) {
            return $player->getId();
        }, $this->_players));
    }

    public function tearDown()
    {
    }

    public function testRon()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('ron')
            ->setWinner($this->_players[1])
            ->setLoser($this->_players[0])
            ->setHan(3)
            ->setFu(30)
            ->setDora(1)
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[1]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(2, $this->_state->getRound());
        $this->assertEquals(0, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000 - 3900,
                 30000 + 3900 + 1000,
                 30000 - 1000,
                 30000
        ], $this->_state->getScores());
    }

    public function testRonDealer()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('ron')
            ->setWinner($this->_players[0])
            ->setLoser($this->_players[1])
            ->setHan(3)
            ->setFu(30)
            ->setDora(1)
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[0]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(1, $this->_state->getRound());
        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000 + 5800 + 1000,
                 30000 - 5800,
                 30000 - 1000,
                 30000
        ], $this->_state->getScores());
    }

    public function testMultiRon()
    {
        $rounds = [
            (new RoundPrimitive($this->_db))
                ->setSession($this->_session)
                ->setOutcome('ron')
                ->setWinner($this->_players[1])
                ->setLoser($this->_players[0])
                ->setHan(3)
                ->setFu(30)
                ->setDora(1)
                ->setRiichiUsers([$this->_players[1]]),
            (new RoundPrimitive($this->_db))
                ->setSession($this->_session)
                ->setOutcome('ron')
                ->setWinner($this->_players[3])
                ->setLoser($this->_players[0])
                ->setHan(2)
                ->setFu(30)
                ->setDora(1)
                ->setRiichiUsers([$this->_players[2]]),
        ];

        $this->_state->update((new MultiRoundPrimitive($this->_db))->_setRounds($rounds));

        $this->assertEquals($this->_players[1]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(2, $this->_state->getRound());
        $this->assertEquals(0, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000 - 3900                - 2000,
                 30000 + 3900 - 1000 + 1000         + 1000,
                 30000                              - 1000,
                 30000                       + 2000
        ], $this->_state->getScores());
    }

    public function testMultiRonWithRiichi()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([])
            ->setRiichiUsers([$this->_players[1]]);
        $this->_state->update($round);

        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals(1, $this->_state->getRiichiBets());

        $rounds = [
            (new RoundPrimitive($this->_db))
                ->setSession($this->_session)
                ->setOutcome('ron')
                ->setWinner($this->_players[0])
                ->setLoser($this->_players[1])
                ->setHan(3)
                ->setFu(30)
                ->setDora(1)
                ->setRiichiUsers([$this->_players[0]]),
            (new RoundPrimitive($this->_db))
                ->setSession($this->_session)
                ->setOutcome('ron')
                ->setWinner($this->_players[3])
                ->setLoser($this->_players[1])
                ->setHan(2)
                ->setFu(30)
                ->setDora(1)
                ->setRiichiUsers([$this->_players[2]]),
        ];

        $this->_state->update((new MultiRoundPrimitive($this->_db))->_setRounds($rounds));

        $this->assertEquals($this->_players[2]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(3, $this->_state->getRound());
        $this->assertEquals(0, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000        + 3900 - 1000 + 1000        + 300,
                 30000 - 1000 - 3900 - 2000               - 600, // renchan payments go to each winner
                 30000                      - 1000,
                 30000               + 2000 + 1000 + 1000 + 300,
        ], $this->_state->getScores());
    }

    public function testTsumo()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('tsumo')
            ->setWinner($this->_players[1])
            ->setHan(3)
            ->setFu(30)
            ->setDora(1)
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[1]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(2, $this->_state->getRound());
        $this->assertEquals(0, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000 - 2000,
                 30000 + 4000 + 1000,
                 30000 - 1000 - 1000,
                 30000 - 1000
        ], $this->_state->getScores());
    }

    public function testTsumoDealer()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('tsumo')
            ->setWinner($this->_players[0])
            ->setHan(3)
            ->setFu(30)
            ->setDora(1)
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[0]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(1, $this->_state->getRound());
        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000 + 6000 + 1000,
                 30000 - 2000,
                 30000 - 2000 - 1000,
                 30000 - 2000
        ], $this->_state->getScores());
    }

    public function testDrawDealerNoten()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([$this->_players[1]])
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[1]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(2, $this->_state->getRound());
        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals(1, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000 - 1000,
                 30000 + 3000,
                 30000 - 1000 - 1000,
                 30000 - 1000
        ], $this->_state->getScores());
    }

    public function testDrawDealerTempai()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([$this->_players[0], $this->_players[1]])
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[0]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(1, $this->_state->getRound());
        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals(1, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000 + 1500,
                 30000 + 1500,
                 30000 - 1500 - 1000,
                 30000 - 1500
        ], $this->_state->getScores());
    }

    public function testDrawEverybodyNoten()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([])
            ->setRiichiUsers([]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[1]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(2, $this->_state->getRound());
        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000,
                 30000,
                 30000,
                 30000
        ], $this->_state->getScores());
    }

    public function testAbort()
    {
        $this->_ruleset->setRule('withAbortives', true);
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('abort')
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[0]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(1, $this->_state->getRound());
        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals(1, $this->_state->getRiichiBets());
        $this->assertEquals([
            1 => 30000,
                 30000,
                 30000 - 1000,
                 30000
        ], $this->_state->getScores());
    }

    /**
     * @expectedException \Riichi\InvalidParametersException
     */
    public function testAbortWhenNotAllowed()
    {
        $this->_ruleset->setRule('withAbortives', false);
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('abort')
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);
    }

    public function testChombo()
    {
        $this->_ruleset->setRule('chomboPenalty', 20);
        $this->_ruleset->setRule('extraChomboPayments', false);
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('chombo')
            ->setLoser($this->_players[1])
            ->setRiichiUsers([$this->_players[2]]);
        $this->_state->update($round);

        $this->assertEquals($this->_players[0]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(1, $this->_state->getRound());
        $this->assertEquals(0, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([$this->_players[1]->getId() => -20], $this->_state->getPenalties());
        $this->assertEquals([
            1 => 30000,
                 30000,
                 30000,
                 30000
        ], $this->_state->getScores());

        // now with payments

        $this->_ruleset->setRule('extraChomboPayments', true);
        $this->_state->update($round);

        $this->assertEquals($this->_players[0]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(1, $this->_state->getRound());
        $this->assertEquals(0, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([$this->_players[1]->getId() => -40], $this->_state->getPenalties());
        $this->assertEquals([
            1 => 30000 + 4000,
                 30000 - 8000,
                 30000 + 2000,
                 30000 + 2000
        ], $this->_state->getScores());
    }

    public function testGainRiichiBetsAfterDraw()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([$this->_players[3]])
            ->setRiichiUsers([$this->_players[3]]);
        $this->_state->update($round);

        $this->assertEquals(1, $this->_state->getRiichiBets());
        $this->assertEquals(1, $this->_state->getHonba());
        $this->assertEquals([
            1 => 30000 - 1000,
                 30000 - 1000,
                 30000 - 1000,
                 30000 + 3000 - 1000
        ], $this->_state->getScores());

        // next round

        $nextround = new RoundPrimitive($this->_db);
        $nextround
            ->setOutcome('ron')
            ->setWinner($this->_players[0])
            ->setLoser($this->_players[1])
            ->setRiichiUsers([$this->_players[0]])
            ->setHan(3)
            ->setFu(30)
            ->setDora(1);
        $this->_state->update($nextround);

        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals(0, $this->_state->getHonba());
        $this->assertEquals([
            // score + win + prev.riichi + honba
            1 => 29000 + 3900 + 1000 + 300 - 1000 +  1000, // current riichi bet goes to table and back
                 29000 - 3900 - 300,
                 29000,
                 33000 - 1000
        ], $this->_state->getScores());
    }

    public function testSerialDraw()
    {
        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([])
            ->setRiichiUsers([]);
        $this->_state->update($round);
        $this->_state->update($round);
        $this->_state->update($round);
        $this->_state->update($round);
        $this->_state->update($round);
        $this->_state->update($round);
        $this->_state->update($round);

        $this->assertEquals($this->_players[3]->getId(), $this->_state->getCurrentDealer());
        $this->assertEquals(8, $this->_state->getRound());
        $this->assertEquals(7, $this->_state->getHonba());
        $this->assertEquals(0, $this->_state->getRiichiBets());
        $this->assertEquals([
                1 => 30000,
                30000,
                30000,
                30000
            ], $this->_state->getScores());
    }

    public function testSessionStateToJson()
    {
        $this->assertEquals(
            '{"_scores":{"1":30000,"2":30000,"3":30000,"4":30000},"_penalties":[],"_extraPenaltyLog":[],"_round":1,"_honba":0,"_riichiBets":0,"_prematurelyFinished":false,"_roundJustChanged":true,"_yellowZoneAlreadyPlayed":false}',
            $this->_state->toJson()
        );

        $round = new RoundPrimitive($this->_db);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([])
            ->setRiichiUsers([]);
        $this->_state->update($round);

        $this->assertEquals(
            '{"_scores":{"1":30000,"2":30000,"3":30000,"4":30000},"_penalties":[],"_extraPenaltyLog":[],"_round":2,"_honba":1,"_riichiBets":0,"_prematurelyFinished":false,"_roundJustChanged":true,"_yellowZoneAlreadyPlayed":false}',
            $this->_state->toJson()
        );
    }

    public function testSessionStateFromJson()
    {
        $json1 = '{"_scores":{"1":30000,"2":30000,"3":30000,"4":30000},"_penalties":[],"_extraPenaltyLog":[],"_round":1,"_honba":0,"_riichiBets":0,"_prematurelyFinished":false,"_roundJustChanged":true,"_yellowZoneAlreadyPlayed":false}';

        $state = SessionState::fromJson(
            $this->_ruleset,
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players),
            $json1
        );

        $this->assertEquals([1 => 30000, 30000, 30000, 30000], $state->getScores());
        $this->assertEquals(1, $state->getRound());
        $this->assertEquals(0, $state->getHonba());

        $json2 = '{"_scores":{"1":30000,"2":30000,"3":30000,"4":30000},"_penalties":[],"_extraPenaltyLog":[],"_round":2,"_honba":1,"_riichiBets":0,"_prematurelyFinished":false,"_roundJustChanged":true,"_yellowZoneAlreadyPlayed":false}';

        $state = SessionState::fromJson(
            $this->_ruleset,
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players),
            $json2
        );

        $this->assertEquals([1 => 30000, 30000, 30000, 30000], $state->getScores());
        $this->assertEquals(2, $state->getRound());
        $this->assertEquals(1, $state->getHonba());
    }
}
