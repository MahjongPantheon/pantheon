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
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class EventPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
    public function setUp()
    {
        $this->_ds = DataSource::__getCleanTestingInstance();
    }

    public function testNewEvent()
    {
        $newEvent = new EventPrimitive($this->_ds);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setIsOnline(1)
            ->setTimezone('UTC')
            ->setAllowPlayerAppend(0)
            ->setAutoSeating(1)
            ->setSortByGames(1)
            ->setSyncStart(1)
            ->setRuleset(\Common\Ruleset::instance('jpmlA'));

        $this->assertEquals('event1', $newEvent->getTitle());
        $this->assertEquals('eventdesc1', $newEvent->getDescription());
        $this->assertEquals(1, $newEvent->getIsOnline());
        $this->assertEquals(1, $newEvent->getAutoSeating());
        $this->assertEquals(1, $newEvent->getSortByGames());
        $this->assertEquals(1, $newEvent->getSyncStart());
        $this->assertEquals(0, $newEvent->getAllowPlayerAppend());
        $this->assertEquals('UTC', $newEvent->getTimezone());

        $success = $newEvent->save();
        $this->assertTrue($success, "Saved event");
        $this->assertGreaterThan(0, $newEvent->getId());
    }

    public function testFindEventById()
    {
        $newEvent = new EventPrimitive($this->_ds);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setTimezone('UTC')
            ->setRuleset(\Common\Ruleset::instance('jpmlA'))
            ->save();

        $eventCopy = EventPrimitive::findById($this->_ds, [$newEvent->getId()]);
        $this->assertEquals(1, count($eventCopy));
        $this->assertEquals('event1', $eventCopy[0]->getTitle());
        $this->assertTrue($newEvent !== $eventCopy[0]); // different objects!
    }

    public function testFindEventByLobby()
    {
        $newEvent = new EventPrimitive($this->_ds);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setTimezone('UTC')
            ->setRuleset(\Common\Ruleset::instance('jpmlA'))
            ->setLobbyId(123)
            ->save();

        $eventCopy = EventPrimitive::findByLobby($this->_ds, [$newEvent->getLobbyId()]);
        $this->assertEquals(1, count($eventCopy));
        $this->assertEquals('event1', $eventCopy[0]->getTitle());
        $this->assertTrue($newEvent !== $eventCopy[0]); // different objects!
    }

    public function testUpdateEvent()
    {
        $newEvent = new EventPrimitive($this->_ds);
        $newEvent
            ->setTitle('event1')
            ->setDescription('eventdesc1')
            ->setTimezone('UTC')
            ->setRuleset(\Common\Ruleset::instance('jpmlA'))
            ->save();

        $eventCopy = EventPrimitive::findById($this->_ds, [$newEvent->getId()]);
        $eventCopy[0]->setDescription('someanotherdesc')->save();

        $anotherEventCopy = EventPrimitive::findById($this->_ds, [$newEvent->getId()]);
        $this->assertEquals('someanotherdesc', $anotherEventCopy[0]->getDescription());
    }
}
