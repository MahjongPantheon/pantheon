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
require_once __DIR__ . '/../../src/primitives/PlayerHistory.php';
require_once __DIR__ . '/../../src/Db.php';

class PlayerHistoryPrimitiveTest extends \PHPUnit\Framework\TestCase
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
     * @var SessionPrimitive
     */
    protected $_anotherSession;
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

        $this->_session = (new SessionPrimitive($this->_ds))
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->_setRepresentationalHash('93471260812749')
            ->setEndDate('2025-08-17 17:00:00')
            ->setReplayHash('');
        $this->_session->save();

        $this->_anotherSession = (new SessionPrimitive($this->_ds))
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->_setRepresentationalHash('982737468764')
            ->setEndDate('2025-08-19 19:00:00')
            ->setReplayHash('');
        $this->_anotherSession->save();
    }

    public function testNewHistoryItem()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1);

        $this->assertEquals($this->_session->getId(), $item->getSessionId());
        $this->assertTrue($this->_session === $item->getSession());
        $this->assertEquals($this->_players[0]->getId(), $item->getPlayerId());
        $this->assertTrue($this->_players[0] === $item->getPlayer());
        $this->assertEquals(1500, $item->getRating());

        $success = $item->save();
        $this->assertTrue($success, "Saved round");
        $this->assertGreaterThan(0, $item->getId());
    }

    public function testFindLastItemByPlayerAndEvent()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();
        $item2 = new PlayerHistoryPrimitive($this->_ds);
        $item2
            ->setSession($this->_session)
            ->setPlayer($this->_players[1])
            ->_setRating(1600)
            ->_setAvgPlace(2)
            ->_setGamesPlayed(1)
            ->save();
        $item3 = new PlayerHistoryPrimitive($this->_ds);
        $item3
            ->setSession($this->_anotherSession)
            ->setPlayer($this->_players[0])
            ->_setRating(1700)
            ->_setAvgPlace(1)
            ->_setGamesPlayed(1)
            ->save();

        $itemCopy = PlayerHistoryPrimitive::findLastByEventAndPlayer(
            $this->_ds,
            $this->_event->getId(),
            $this->_players[0]->getId()
        )[0];

        $this->assertTrue($itemCopy instanceof PlayerHistoryPrimitive);
        $this->assertEquals(1700, $itemCopy->getRating());
        $this->assertEquals($this->_players[0]->getId(), $itemCopy->getPlayerId());
        $this->assertTrue($itemCopy !== $item); // different objects!
    }

    public function testFindLastItemByPlayerEventAndDate()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(-10000)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();
        $item2 = new PlayerHistoryPrimitive($this->_ds);
        $item2
            ->setSession($this->_anotherSession)
            ->setPlayer($this->_players[0])
            ->_setRating(30000)
            ->_setAvgPlace(2)
            ->_setGamesPlayed(3)
            ->save();

        // both without passing date
        $items = PlayerHistoryPrimitive::findLastByEventAndDateTo(
            $this->_ds,
            [$this->_event->getId()],
            null
        );
        $this->assertEquals(count($items), 1);
        $this->assertEquals($items[0]->getRating(), 30000);
        $this->assertEquals($items[0]->getAvgPlace(), 2);
        $this->assertEquals($items[0]->getGamesPlayed(), 3);

        // both
        $items = PlayerHistoryPrimitive::findLastByEventAndDateTo(
            $this->_ds,
            [$this->_event->getId()],
            new \DateTime('2025-08-20 20:00:00')
        );
        $this->assertEquals(count($items), 1);
        $this->assertEquals($items[0]->getRating(), 30000);
        $this->assertEquals($items[0]->getAvgPlace(), 2);
        $this->assertEquals($items[0]->getGamesPlayed(), 3);

        // only first
        $items = PlayerHistoryPrimitive::findLastByEventAndDateTo(
            $this->_ds,
            [$this->_event->getId()],
            new \DateTime('2025-08-18 18:00:00')
        );
        $this->assertEquals(count($items), 1);
        $this->assertEquals($items[0]->getRating(), -10000);
        $this->assertEquals($items[0]->getAvgPlace(), 3);
        $this->assertEquals($items[0]->getGamesPlayed(), 1);

        // none
        $items = PlayerHistoryPrimitive::findLastByEventAndDateTo(
            $this->_ds,
            [$this->_event->getId()],
            new \DateTime('2025-08-16 16:00:00')
        );
        $this->assertEquals(count($items), 0);
    }

    public function testFindAllPlayersLastItemByEvent()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();
        $item2 = new PlayerHistoryPrimitive($this->_ds);
        $item2
            ->setSession($this->_session)
            ->setPlayer($this->_players[1])
            ->_setRating(1600)
            ->_setAvgPlace(2)
            ->_setGamesPlayed(1)
            ->save();
        $item3 = new PlayerHistoryPrimitive($this->_ds);
        $item3
            ->setSession($this->_anotherSession)
            ->setPlayer($this->_players[0])
            ->_setRating(1700)
            ->_setAvgPlace(1)
            ->_setGamesPlayed(1)
            ->save();

        $items = PlayerHistoryPrimitive::findLastByEvent(
            $this->_ds,
            [$this->_event->getId()]
        );

        $this->assertTrue($items[0] instanceof PlayerHistoryPrimitive);
        $this->assertTrue($items[0] !== $item && $items[0] !== $item2 && $items[0] !== $item3); // different objects!

        $this->assertEquals($this->_players[1]->getId(), $items[0]->getPlayerId());
        $this->assertEquals($this->_players[0]->getId(), $items[1]->getPlayerId());
        $this->assertEquals(1600, $items[0]->getRating());
        $this->assertEquals(1700, $items[1]->getRating());
    }

    public function testFindAllItemsByPlayerAndEvent()
    {
        $item1 = new PlayerHistoryPrimitive($this->_ds);
        $item1
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();
        $item2 = new PlayerHistoryPrimitive($this->_ds);
        $item2
            ->setSession($this->_session)
            ->setPlayer($this->_players[1])
            ->_setRating(1600)
            ->_setAvgPlace(2)
            ->_setGamesPlayed(1)
            ->save();
        $item3 = new PlayerHistoryPrimitive($this->_ds);
        $item3
            ->setSession($this->_anotherSession)
            ->setPlayer($this->_players[0])
            ->_setRating(1700)
            ->_setAvgPlace(1)
            ->_setGamesPlayed(1)
            ->save();

        $items = PlayerHistoryPrimitive::findAllByEvent(
            $this->_ds,
            $this->_event->getId(),
            $this->_players[0]->getId()
        );

        $this->assertEquals(2, count($items));
        $this->assertEquals(1500, $items[0]->getRating());
        $this->assertEquals(1700, $items[1]->getRating()); // TODO: probably will fail when sorting is introduced

        $this->assertEquals($this->_players[0]->getId(), $items[0]->getPlayerId());
        $this->assertEquals($this->_players[0]->getId(), $items[1]->getPlayerId());

        $this->assertTrue($items[0] !== $item1); // different objects!
        $this->assertTrue($items[1] !== $item3); // different objects!
    }

    public function testFindItemByPlayerAndSession()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();
        $item2 = new PlayerHistoryPrimitive($this->_ds);
        $item2
            ->setSession($this->_session)
            ->setPlayer($this->_players[1])
            ->_setRating(1600)
            ->_setAvgPlace(2)
            ->_setGamesPlayed(1)
            ->save();
        $item3 = new PlayerHistoryPrimitive($this->_ds);
        $item3
            ->setSession($this->_anotherSession)
            ->setPlayer($this->_players[0])
            ->_setRating(1700)
            ->_setAvgPlace(1)
            ->_setGamesPlayed(1)
            ->save();

        [$itemCopy] = PlayerHistoryPrimitive::findBySessionAndPlayer(
            $this->_ds,
            $this->_players[0]->getId(),
            $this->_session->getId()
        );

        $this->assertTrue($itemCopy instanceof PlayerHistoryPrimitive);
        $this->assertEquals(1500, $itemCopy->getRating());
        $this->assertEquals($this->_players[0]->getId(), $itemCopy->getPlayerId());
        $this->assertTrue($itemCopy !== $item); // different objects!
    }

    public function testUpdateHistoryItem()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();

        $itemCopy = PlayerHistoryPrimitive::findById($this->_ds, [$item->getId()]);
        $itemCopy[0]->_setRating(1000)->_setAvgPlace(4)->_setGamesPlayed(2)->save();

        $anotherItemCopy = PlayerHistoryPrimitive::findById($this->_ds, [$item->getId()]);
        $this->assertEquals(1000, $anotherItemCopy[0]->getRating());
        $this->assertEquals(4, $anotherItemCopy[0]->getAvgPlace());
        $this->assertEquals(2, $anotherItemCopy[0]->getGamesPlayed());
    }

    public function testRelationSession()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();

        $itemCopy = PlayerHistoryPrimitive::findById($this->_ds, [$item->getId()])[0];
        $this->assertEquals($this->_session->getId(), $itemCopy->getSessionId()); // before fetch
        $this->assertNotEmpty($itemCopy->getSession());
        $this->assertEquals($this->_session->getId(), $itemCopy->getSession()->getId());
        $this->assertTrue($this->_session !== $itemCopy->getSession()); // different objects!
    }

    public function testRelationEvent()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();

        $itemCopy = PlayerHistoryPrimitive::findById($this->_ds, [$item->getId()])[0];
        $this->assertEquals($this->_event->getId(), $itemCopy->getEventId()); // before fetch
        $this->assertNotEmpty($itemCopy->getEvent());
        $this->assertEquals($this->_event->getId(), $itemCopy->getEvent()->getId());
        $this->assertTrue($this->_event !== $itemCopy->getEvent()); // different objects!
    }

    public function testRelationPlayer()
    {
        $item = new PlayerHistoryPrimitive($this->_ds);
        $item
            ->setSession($this->_session)
            ->setPlayer($this->_players[0])
            ->_setRating(1500)
            ->_setAvgPlace(3)
            ->_setGamesPlayed(1)
            ->save();

        $itemCopy = PlayerHistoryPrimitive::findById($this->_ds, [$item->getId()])[0];
        $this->assertEquals($this->_players[0]->getId(), $itemCopy->getPlayerId()); // before fetch
        $this->assertNotEmpty($itemCopy->getPlayer());
        $this->assertEquals($this->_players[0]->getId(), $itemCopy->getPlayer()->getId());
        $this->assertTrue($this->_players[0] !== $itemCopy->getPlayer()); // different objects!
    }
}
