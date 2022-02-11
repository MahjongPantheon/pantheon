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
require_once __DIR__ . '/../../src/primitives/Session.php';
require_once __DIR__ . '/../../src/primitives/Round.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class SessionPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
    /**
     * @var EventPrimitive
     */
    protected $_event;
    /**
     * @var PlayerPrimitive[]
     */
    protected $_players;

    public function setUp()
    {
        $this->_ds = DataSource::__getCleanTestingInstance();

        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setTitleEn('title')
            ->setDescription('desc')
            ->setDescriptionEn('desc')
            ->setTimezone('UTC')
            ->setRuleset(\Common\Ruleset::instance('jpmlA'));
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3, 4]);
    }

    public function testNewSession()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->setPlayers($this->_players);

        $this->assertEquals('hash', $newSession->getReplayHash());
        $this->assertEquals(SessionPrimitive::STATUS_INPROGRESS, $newSession->getStatus());
        $this->assertTrue($this->_event === $newSession->getEvent());
        $this->assertTrue($this->_players[1] === $newSession->getPlayers()[1]);

        $success = $newSession->save();
        $this->assertTrue($success, "Saved session");
        $this->assertGreaterThan(0, $newSession->getId());
    }

    public function testFindSessionById()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $sessionCopy = SessionPrimitive::findById($this->_ds, [$newSession->getId()]);
        $this->assertEquals(1, count($sessionCopy));
        $this->assertEquals('hash', $sessionCopy[0]->getReplayHash());
        $this->assertTrue($newSession !== $sessionCopy[0]); // different objects!
    }

    public function testFindSessionByStatus()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $sessionCopy = SessionPrimitive::findByEventAndStatus($this->_ds, $this->_event->getId(), $newSession->getStatus());
        $this->assertEquals(1, count($sessionCopy));
        $this->assertEquals('hash', $sessionCopy[0]->getReplayHash());
        $this->assertTrue($newSession !== $sessionCopy[0]); // different objects!
    }

    public function testFindSessionByReplay()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $sessionCopy = SessionPrimitive::findByReplayHashAndEvent($this->_ds, $this->_event->getId(), $newSession->getReplayHash());
        $this->assertEquals(1, count($sessionCopy));
        $this->assertEquals(SessionPrimitive::STATUS_INPROGRESS, $sessionCopy[0]->getStatus());
        $this->assertTrue($newSession !== $sessionCopy[0]); // different objects!
    }

    public function testFindSessionByRepHash()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $this->assertNotEmpty($newSession->getRepresentationalHash());
        $sessionCopy = SessionPrimitive::findByRepresentationalHash($this->_ds, [$newSession->getRepresentationalHash()]);
        $this->assertEquals(1, count($sessionCopy));
        $this->assertEquals('hash', $sessionCopy[0]->getReplayHash());
        $this->assertTrue($newSession !== $sessionCopy[0]); // different objects!
    }

    public function testFindSessionByPlayerAndEvent()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $sessionCopy = SessionPrimitive::findByPlayerAndEvent($this->_ds, $this->_players[0]->getId(), $this->_event->getId());
        $this->assertEquals(1, count($sessionCopy));
        $this->assertEquals('hash', $sessionCopy[0]->getReplayHash());
        $this->assertTrue($newSession !== $sessionCopy[0]); // different objects!
    }

    public function testUpdateSession()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $sessionCopy = SessionPrimitive::findById($this->_ds, [$newSession->getId()]);
        $sessionCopy[0]->setReplayHash('someanotherhash')->save();
        $this->assertEquals($newSession->getRepresentationalHash(), $sessionCopy[0]->getRepresentationalHash());

        $anotherSessionCopy = SessionPrimitive::findById($this->_ds, [$newSession->getId()]);
        $this->assertEquals('someanotherhash', $anotherSessionCopy[0]->getReplayHash());
        $this->assertEquals($newSession->getRepresentationalHash(), $anotherSessionCopy[0]->getRepresentationalHash());
    }

    public function testUpdateSessionStateAfterSave()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $round = new RoundPrimitive($this->_ds);
        $round
            ->setOutcome('draw')
            ->setTempaiUsers([])
            ->setRiichiUsers([]);

        $newSession->updateCurrentState($round);
        $newSession->save();

        $sessionCopy = SessionPrimitive::findById($this->_ds, [$newSession->getId()]);
        $this->assertEquals(2, $sessionCopy[0]->getCurrentState()->getRound());
    }

    public function testRelationEvent()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $sessionCopy = SessionPrimitive::findById($this->_ds, [$newSession->getId()])[0];
        $this->assertEquals($this->_event->getId(), $sessionCopy->getEventId()); // before fetch
        $this->assertNotEmpty($sessionCopy->getEvent());
        $this->assertEquals($this->_event->getId(), $sessionCopy->getEvent()->getId());
        $this->assertTrue($this->_event !== $sessionCopy->getEvent()); // different objects!
    }

    public function testRelationPlayers()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->save();

        $sessionCopy = SessionPrimitive::findById($this->_ds, [$newSession->getId()])[0];
        $this->assertEquals( // before fetch
            $this->_players[0]->getId(),
            explode(',', $sessionCopy->getPlayersIds()[0])[0]
        );
        $this->assertNotEmpty($sessionCopy->getPlayers());
        $this->assertEquals($this->_players[0]->getId(), $sessionCopy->getPlayers()[0]->getId());
        $this->assertTrue($this->_players[0] !== $sessionCopy->getPlayers()[0]); // different objects!
    }

    public function testFindSeatings()
    {
        $newSession = new SessionPrimitive($this->_ds);
        $newSession
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setPlayers($this->_players)
            ->setReplayHash('hash')
            ->setEvent($this->_event)
            ->save();

        $seating = SessionPrimitive::getPlayersSeatingInEvent($this->_ds, $this->_event->getId());
        $this->assertEquals([
            ['player_id' => 1, 'order' => 1],
            ['player_id' => 2, 'order' => 2],
            ['player_id' => 3, 'order' => 3],
            ['player_id' => 4, 'order' => 4],
        ], $seating);
    }
}
