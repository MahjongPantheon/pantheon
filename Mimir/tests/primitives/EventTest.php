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
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Formation.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class EventPrimitiveTest extends \PHPUnit_Framework_TestCase
{
    protected $_db;
    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();
    }

    public function testNewEvent()
    {
        $newEvent = new EventPrimitive($this->_db);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setIsOnline(1)
            ->setTimezone('UTC')
            ->setAllowPlayerAppend(0)
            ->setAutoSeating(1)
            ->setIsTextlog(0)
            ->setSortByGames(1)
            ->setSyncStart(1)
            ->setRuleset(Ruleset::instance('jpmlA'));

        $this->assertEquals('event1', $newEvent->getTitle());
        $this->assertEquals('eventdesc1', $newEvent->getDescription());
        $this->assertEquals(1, $newEvent->getIsOnline());
        $this->assertEquals(1, $newEvent->getAutoSeating());
        $this->assertEquals(1, $newEvent->getSortByGames());
        $this->assertEquals(1, $newEvent->getSyncStart());
        $this->assertEquals(0, $newEvent->getAllowPlayerAppend());
        $this->assertEquals(0, $newEvent->getIsTextlog());
        $this->assertEquals('UTC', $newEvent->getTimezone());

        $success = $newEvent->save();
        $this->assertTrue($success, "Saved event");
        $this->assertGreaterThan(0, $newEvent->getId());
    }

    public function testFindEventById()
    {
        $newEvent = new EventPrimitive($this->_db);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setTimezone('UTC')
            ->setType('online')
            ->setRuleset(Ruleset::instance('jpmlA'))
            ->save();

        $eventCopy = EventPrimitive::findById($this->_db, [$newEvent->getId()]);
        $this->assertEquals(1, count($eventCopy));
        $this->assertEquals('event1', $eventCopy[0]->getTitle());
        $this->assertTrue($newEvent !== $eventCopy[0]); // different objects!
    }

    public function testFindEventByLobby()
    {
        $newEvent = new EventPrimitive($this->_db);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setTimezone('UTC')
            ->setType('online')
            ->setRuleset(Ruleset::instance('jpmlA'))
            ->setLobbyId(123)
            ->save();

        $eventCopy = EventPrimitive::findByLobby($this->_db, [$newEvent->getLobbyId()]);
        $this->assertEquals(1, count($eventCopy));
        $this->assertEquals('event1', $eventCopy[0]->getTitle());
        $this->assertTrue($newEvent !== $eventCopy[0]); // different objects!
    }

    public function testUpdateEvent()
    {
        $newEvent = new EventPrimitive($this->_db);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setTimezone('UTC')
            ->setType('online')
            ->setRuleset(Ruleset::instance('jpmlA'))
            ->save();

        $eventCopy = EventPrimitive::findById($this->_db, [$newEvent->getId()]);
        $eventCopy[0]->setDescription('someanotherdesc')->save();

        $anotherEventCopy = EventPrimitive::findById($this->_db, [$newEvent->getId()]);
        $this->assertEquals('someanotherdesc', $anotherEventCopy[0]->getDescription());
    }

    public function testRelationOwnerUser()
    {
        $newUser = new PlayerPrimitive($this->_db);
        $newUser
            ->setDisplayName('user1')
            ->setIdent('someident')
            ->setTenhouId('someid');
        $newUser->save();

        $newEvent = new EventPrimitive($this->_db);
        $newEvent
            ->setTitle('event1')
            ->setOwnerPlayer($newUser)
            ->setTimezone('UTC')
            ->setDescription('eventdesc1')
            ->setType('online')
            ->setRuleset(Ruleset::instance('jpmlA'))
            ->save();

        $eventCopy = EventPrimitive::findById($this->_db, [$newEvent->getId()])[0];
        $this->assertEquals($newUser->getId(), $eventCopy->getOwnerPlayerId()); // before fetch
        $this->assertNotEmpty($eventCopy->getOwnerPlayer());
        $this->assertEquals($newUser->getId(), $eventCopy->getOwnerPlayer()->getId());
        $this->assertTrue($newUser !== $eventCopy->getOwnerPlayer()); // different objects!
    }

    public function testRelationOwnerFormation()
    {
        $newUser = new PlayerPrimitive($this->_db);
        $newUser
            ->setDisplayName('user1')
            ->setIdent('someident')
            ->setTenhouId('someid');
        $newUser->save();

        $newFormation = new FormationPrimitive($this->_db);
        $newFormation
            ->setPrimaryOwner($newUser)
            ->setTitle('f1')
            ->setDescription('fdesc1')
            ->setCity('city')
            ->setContactInfo('someinfo')
            ->save();

        $newEvent = new EventPrimitive($this->_db);
        $newEvent
            ->setTitle('event1')
            ->setOwnerFormation($newFormation)
            ->setDescription('eventdesc1')
            ->setTimezone('UTC')
            ->setType('online')
            ->setRuleset(Ruleset::instance('jpmlA'))
            ->save();

        $eventCopy = EventPrimitive::findById($this->_db, [$newEvent->getId()])[0];
        $this->assertEquals($newFormation->getId(), $eventCopy->getOwnerFormationId()); // before fetch
        $this->assertNotEmpty($eventCopy->getOwnerFormation());
        $this->assertEquals($newFormation->getId(), $eventCopy->getOwnerFormation()->getId());
        $this->assertTrue($newFormation !== $eventCopy->getOwnerFormation()); // different objects!
    }
}
