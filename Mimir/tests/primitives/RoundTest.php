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
require_once __DIR__ . '/../../src/primitives/Round.php';
require_once __DIR__ . '/../../src/primitives/Session.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class RoundPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
    /**
     * @var SessionPrimitive
     */
    protected $_session;
    /**
     * @var EventPrimitive
     */
    protected $_event;
    /**
     * @var PlayerPrimitive[]
     */
    protected $_players;

    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();

        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setDescription('desc')
            ->setTimezone('UTC')
            ->setRuleset(\Common\Ruleset::instance('jpmlA'));
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3, 4]);
        foreach ($this->_players as $p) {
            (new PlayerRegistrationPrimitive($this->_ds))
                ->setReg($p, $this->_event)
                ->save();
        }

        $this->_session = (new SessionPrimitive($this->_ds))
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setReplayHash('');
        $this->_session->save();
    }

    public function testNewRound()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setWinner($this->_players[1])
            ->setLoser($this->_players[2])
            ->setHan(1)
            ->setFu(30)
            ->setDora(0)
            ->setKandora(0)
            ->setUradora(0)
            ->setKanuradora(0)
            ->setRiichiUsers([$this->_players[1]])
            ->setTempaiUsers([])
            ->setRoundIndex(1)
            ->setMultiRon(0)
            ->setYaku('');

        $this->assertEquals($this->_session->getId(), $newRound->getSessionId());
        $this->assertTrue($this->_session === $newRound->getSession());
        $this->assertTrue($this->_players[1] === $newRound->getWinner());
        $this->assertTrue($this->_players[2] === $newRound->getLoser());
        $this->assertEquals(1, count($newRound->getRiichiUsers()));
        $this->assertTrue($this->_players[1] === $newRound->getRiichiUsers()[0]);
        $this->assertEquals(0, count($newRound->getTempaiUsers()));
        $this->assertEquals('ron', $newRound->getOutcome());
        $this->assertEquals(1, $newRound->getRoundIndex());
        $this->assertEquals(1, $newRound->getHan());
        $this->assertEquals(30, $newRound->getFu());
        $this->assertEquals(0, $newRound->getDora());
        $this->assertEquals(0, $newRound->getKandora());
        $this->assertEquals(0, $newRound->getUradora());
        $this->assertEquals(0, $newRound->getKanuradora());
        $this->assertEquals(0, $newRound->getMultiRon());
        $this->assertEquals('', $newRound->getYaku());
        $this->assertTrue($this->_event === $newRound->getEvent());
        $this->assertEquals($this->_event->getId(), $newRound->getEventId());

        $success = $newRound->save();
        $this->assertTrue($success, "Saved round");
        $this->assertGreaterThan(0, $newRound->getId());
    }

    public function testFindRoundById()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setWinner($this->_players[2])
            ->setLoser($this->_players[3])
            ->setRoundIndex(1);
        $newRound->save();

        $roundsCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()]);
        $this->assertEquals(1, count($roundsCopy));
        $this->assertEquals('ron', $roundsCopy[0]->getOutcome());
        $this->assertTrue($newRound !== $roundsCopy[0]); // different objects!
    }

    public function testFindRoundBySession()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setWinner($this->_players[2])
            ->setLoser($this->_players[3])
            ->setRoundIndex(1);
        $newRound->save();

        $roundsCopy = RoundPrimitive::findBySessionIds($this->_ds, [$this->_session->getId()]);
        $this->assertEquals(1, count($roundsCopy));
        $this->assertEquals('ron', $roundsCopy[0]->getOutcome());
        $this->assertTrue($newRound !== $roundsCopy[0]); // different objects!
    }

    public function testUpdateRound()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setWinner($this->_players[2])
            ->setLoser($this->_players[3])
            ->setRoundIndex(1);
        $newRound->save();

        $roundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()]);
        $roundCopy[0]->setOutcome('tsumo')->save();

        $anotherRoundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()]);
        $this->assertEquals('tsumo', $anotherRoundCopy[0]->getOutcome());
    }

    public function testRelationSession()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setWinner($this->_players[2])
            ->setLoser($this->_players[3])
            ->setRoundIndex(1);
        $newRound->save();

        $roundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()])[0];
        $this->assertEquals($this->_session->getId(), $roundCopy->getSessionId()); // before fetch
        $this->assertNotEmpty($roundCopy->getSession());
        $this->assertEquals($this->_session->getId(), $roundCopy->getSession()->getId());
        $this->assertTrue($this->_session !== $roundCopy->getSession()); // different objects!
    }

    public function testRelationEvent()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setWinner($this->_players[2])
            ->setLoser($this->_players[3])
            ->setRoundIndex(1);
        $newRound->save();

        $roundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()])[0];
        $this->assertEquals($this->_event->getId(), $roundCopy->getEventId()); // before fetch
        $this->assertNotEmpty($roundCopy->getEvent());
        $this->assertEquals($this->_event->getId(), $roundCopy->getEvent()->getId());
        $this->assertTrue($this->_event !== $roundCopy->getEvent()); // different objects!
    }

    public function testRelationWinner()
    {
        $players = PlayerPrimitive::findById($this->_ds, [5]);
        $newUser = $players[0];

        $this->_players[1] = $newUser;
        $this->_session->setPlayers($this->_players)->save();

        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setWinner($newUser)
            ->setLoser($this->_players[3])
            ->setRoundIndex(1);
        $newRound->save();

        $roundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()])[0];
        $this->assertEquals($newUser->getId(), $roundCopy->getWinnerId()); // before fetch

        $this->assertNotEmpty($roundCopy->getWinner());
        $this->assertEquals($newUser->getId(), $roundCopy->getWinner()->getId());
        $this->assertTrue($newUser !== $roundCopy->getWinner()); // different objects!
    }

    public function testRelationLoser()
    {
        $players = PlayerPrimitive::findById($this->_ds, [5]);
        $newUser = $players[0];

        $this->_players[1] = $newUser;
        $this->_session->setPlayers($this->_players)->save();

        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('ron')
            ->setLoser($newUser)
            ->setWinner($this->_players[2])
            ->setRoundIndex(1);
        $newRound->save();

        $roundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()])[0];
        $this->assertEquals($newUser->getId(), $roundCopy->getLoserId()); // before fetch
        $this->assertNotEmpty($roundCopy->getLoser());
        $this->assertEquals($newUser->getId(), $roundCopy->getLoser()->getId());
        $this->assertTrue($newUser !== $roundCopy->getLoser()); // different objects!
    }

    public function testRelationTempaiUsers()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('draw')
            ->setTempaiUsers($this->_players)
            ->setRoundIndex(1);
        $newRound->save();

        $roundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()])[0];
        $this->assertEquals( // before fetch
            $this->_players[0]->getId(),
            explode(',', $roundCopy->getTempaiIds()[0])[0]
        );
        $this->assertNotEmpty($roundCopy->getTempaiUsers());
        $this->assertEquals($this->_players[0]->getId(), $roundCopy->getTempaiUsers()[0]->getId());
        $this->assertTrue($this->_players[0] !== $roundCopy->getTempaiUsers()[0]); // different objects!
    }

    public function testRelationRiichiUsers()
    {
        $newRound = new RoundPrimitive($this->_ds);
        $newRound
            ->setSession($this->_session)
            ->setOutcome('draw')
            ->setRiichiUsers($this->_players)
            ->setRoundIndex(1);
        $newRound->save();

        $roundCopy = RoundPrimitive::findById($this->_ds, [$newRound->getId()])[0];
        $this->assertEquals( // before fetch
            $this->_players[0]->getId(),
            explode(',', $roundCopy->getRiichiIds()[0])[0]
        );
        $this->assertNotEmpty($roundCopy->getRiichiUsers());
        $this->assertEquals($this->_players[0]->getId(), $roundCopy->getRiichiUsers()[0]->getId());
        $this->assertTrue($this->_players[0] !== $roundCopy->getRiichiUsers()[0]); // different objects!
    }
}
