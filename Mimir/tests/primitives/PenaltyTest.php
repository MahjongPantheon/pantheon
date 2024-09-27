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
namespace primitives;

use Mimir\DataSource;
use Mimir\EventPrimitive;
use Mimir\PenaltyPrimitive;
use Mimir\PlayerPrimitive;

require_once __DIR__ . '/../../src/Ruleset.php';
require_once __DIR__ . '/../../src/primitives/Session.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/Penalty.php';
require_once __DIR__ . '/../../src/Db.php';

class PenaltyPrimitiveTest extends \PHPUnit\Framework\TestCase
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

    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();

        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setDescription('desc')
            ->setTimezone('UTC')
            ->setRulesetConfig(\Common\Ruleset::instance('jpmlA'));
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3, 4]);
    }

    public function testNewPenaltyItem()
    {
        $item = new PenaltyPrimitive($this->_ds);
        $item
            ->setEvent($this->_event)
            ->setPlayer($this->_players[0])
            ->setAssignedBy($this->_players[3]->getId())
            ->setAmount(10000)
            ->setReason('Test')
            ->setCreatedAt(date('Y-m-d H:i:s'));

        $this->assertEquals($this->_session->getId(), $item->getSessionId());
        $this->assertEquals($this->_players[0]->getId(), $item->getPlayerId());
        $this->assertEquals($this->_players[3]->getId(), $item->getAssignedBy());
        $this->assertTrue($this->_players[0] === $item->getPlayer());
        $this->assertEquals(10000, $item->getAmount());
        $this->assertEquals('Test', $item->getReason());

        $success = $item->save();
        $this->assertTrue($success, "Saved round");
        $this->assertGreaterThan(0, $item->getId());
    }

    public function testUpdatePenaltyItem()
    {
        $item = new PenaltyPrimitive($this->_ds);
        $item
            ->setEvent($this->_event)
            ->setPlayer($this->_players[0])
            ->setAssignedBy($this->_players[3]->getId())
            ->setAmount(10000)
            ->setReason('Test')
            ->setCreatedAt(date('Y-m-d H:i:s'))
            ->save();

        $itemCopy = PenaltyPrimitive::findById($this->_ds, [$item->getId()]);
        $itemCopy[0]->setCancelled(1)->setCancelledReason('Testtest')->save();

        $anotherItemCopy = PenaltyPrimitive::findById($this->_ds, [$item->getId()]);
        $this->assertEquals(10000, $anotherItemCopy[0]->getAmount());
        $this->assertEquals(1, $anotherItemCopy[0]->getCancelled());
        $this->assertEquals('Testtest', $anotherItemCopy[0]->getCancelledReason());
    }

    public function testRelationEvent()
    {
        $item = new PenaltyPrimitive($this->_ds);
        $item
            ->setEvent($this->_event)
            ->setPlayer($this->_players[0])
            ->setAssignedBy($this->_players[3]->getId())
            ->setAmount(10000)
            ->setReason('Test')
            ->setCreatedAt(date('Y-m-d H:i:s'))
            ->save();

        $itemCopy = PenaltyPrimitive::findById($this->_ds, [$item->getId()])[0];
        $this->assertEquals($this->_event->getId(), $itemCopy->getEventId()); // before fetch
        $this->assertNotEmpty($itemCopy->getEvent());
        $this->assertEquals($this->_event->getId(), $itemCopy->getEvent()->getId());
        $this->assertTrue($this->_event !== $itemCopy->getEvent()); // different objects!
    }

    public function testRelationPlayer()
    {
        $item = new PenaltyPrimitive($this->_ds);
        $item
            ->setEvent($this->_event)
            ->setPlayer($this->_players[0])
            ->setAssignedBy($this->_players[3]->getId())
            ->setAmount(10000)
            ->setReason('Test')
            ->setCreatedAt(date('Y-m-d H:i:s'))
            ->save();

        $itemCopy = PenaltyPrimitive::findById($this->_ds, [$item->getId()])[0];
        $this->assertEquals($this->_players[0]->getId(), $itemCopy->getPlayerId()); // before fetch
        $this->assertNotEmpty($itemCopy->getPlayer());
        $this->assertEquals($this->_players[0]->getId(), $itemCopy->getPlayer()->getId());
        $this->assertTrue($this->_players[0] !== $itemCopy->getPlayer()); // different objects!
    }
}
