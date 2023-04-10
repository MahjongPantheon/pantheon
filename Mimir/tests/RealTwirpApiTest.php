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

use Common\Country;
use Common\Event;
use Common\EventData;
use Common\Events_GetCountries_Payload;
use Common\Events_GetEvents_Payload;
use Common\Events_GetEventsById_Payload;
use Common\Events_GetRulesets_Payload;
use Common\Events_GetTimezones_Payload;
use Common\Events_RegisterPlayer_Payload;
use Common\Events_UnregisterPlayer_Payload;
use Common\Events_UpdateEvent_Payload;
use Common\EventType;
use Common\Games_CancelGame_Payload;
use Common\Games_EndGame_Payload;
use Common\Games_StartGame_Payload;
use Common\Generic_Event_Payload;
use Common\MyEvent;
use Common\Players_GetMyEvents_Payload;
use Common\RulesetConfig;
use Common\RulesetGenerated;

require_once __DIR__ . '/../src/Db.php';
require_once __DIR__ . '/../src/DataSource.php';
require_once __DIR__ . '/../src/primitives/Event.php';
require_once __DIR__ . '/../src/primitives/Session.php';
require_once __DIR__ . '/../src/primitives/PlayerHistory.php';

/**
 * Class RealApiTest: integration test suite
 * @package Mimir
 */
class RealTwirpApiTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var
     */
    protected $_client;
    /**
     * @var DataSource
     */
    protected $_ds;

    const CURRENT_PERSON = 1; // Used as Administrator ID in FreyClientMock

    /**
     * @throws \Exception
     */
    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();
        $this->_client = new \Common\MimirAdapter(
            'http://localhost:1349',
            null,
            null,
            null,
            '/v2'
        );
        $this->_client->withHeaders([
            'X-Twirp' => 'true',
            'X-Auth-Token' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
            'X-Internal-Query-Secret' => '198vdsh904hfbnkjv98whb2iusvd98b29bsdv98svbr9wghj',
            'X-Current-Person-Id' => self::CURRENT_PERSON
        ]);
    }

    protected function _createEvent(): EventPrimitive
    {
        $evt = (new EventPrimitive($this->_ds))
            ->setRulesetConfig(\Common\Ruleset::instance('ema')) // TODO: why 'tenhounet' rules fail? o_0
            ->setTimezone('UTC')
            ->setTitle('test')
            ->setDescription('test')
            ->setUseTimer(1)
            ->setAllowPlayerAppend(0)
            ->setGameDuration(1);
        $evt->save();
        return $evt;
    }

    /**
     * @param int $eventId
     * @return int[]
     * @throws \Exception
     */
    protected function _addPlayers(int $eventId): array
    {
        $ids = [10, 20, 30, 40];
        foreach ($ids as $id) {
            $this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
                ->setEventId($eventId)->setPlayerId($id));
        }
        return $ids;
    }

    /**
     * @param int $eventId
     * @param int[] $ids
     * @return void
     * @throws \Exception
     */
    protected function _removePlayers(int $eventId, array $ids)
    {
        $ids = [10, 20, 30, 40];
        foreach ($ids as $id) {
            $this->_client->UnregisterPlayer([], (new Events_UnregisterPlayer_Payload())
                ->setEventId($eventId)->setPlayerId($id));
        }
    }

    public function testGetRulesets()
    {
        $response = $this->_client->GetRulesets([], (new Events_GetRulesets_Payload()))->getRulesets();
        /** @var RulesetConfig[] $rulesets */
        $rulesets = iterator_to_array($response);

        $this->assertNotEmpty($rulesets);
        $this->assertInstanceOf(RulesetConfig::class, $rulesets[0]);
    }

    public function testGetTimezones()
    {
        $response = $this->_client->GetTimezones([], (new Events_GetTimezones_Payload())->setAddr('8.8.8.8'));
        $this->assertNotEmpty($response);
        // Google's 8.8.8.8 DNS server should be in Chicago timezone
        $this->assertEquals('America/Chicago', $response->getPreferredByIp());
        $tz = iterator_to_array($response->getTimezones());
        $this->assertNotEmpty($tz);
        $this->assertIsString($tz[0]);
    }

    public function testGetCountries()
    {
        $response = $this->_client->GetCountries([], (new Events_GetCountries_Payload())->setAddr('8.8.8.8'));
        $this->assertNotEmpty($response);
        // Google's 8.8.8.8 DNS server should be in the US
        $this->assertEquals('US', $response->getPreferredByIp());
        $countires = iterator_to_array($response->getCountries());
        $this->assertNotEmpty($countires);
        $this->assertInstanceOf(Country::class, $countires[0]);
    }

    public function testGetEvents()
    {
        $response = $this->_client->GetEvents([], (new Events_GetEvents_Payload())->setLimit(10)->setOffset(0));
        $this->assertEmpty(iterator_to_array($response->getEvents()));
        $this->assertEquals(0, $response->getTotal());

        /** @var EventPrimitive[] $events */
        $events = array_reduce([1, 2, 3, 4, 5], function ($acc, $i) {
            $ev = $this->_createEvent();
            $ev->setIsListed(1)->save();
            $acc []= $ev;
            return $acc;
        }, []);

        $response = $this->_client->GetEvents([], (new Events_GetEvents_Payload())->setLimit(10)->setOffset(0));
        $this->assertNotEmpty(iterator_to_array($response->getEvents()));
        $this->assertEquals(5, $response->getTotal());

        // Some pagination testing

        $response = $this->_client->GetEvents([], (new Events_GetEvents_Payload())->setLimit(2)->setOffset(0));
        $data = iterator_to_array($response->getEvents());
        $this->assertNotEmpty($data);
        $this->assertEquals(2, count($data));
        $this->assertEquals(5, $response->getTotal());

        $response = $this->_client->GetEvents([], (new Events_GetEvents_Payload())->setLimit(2)->setOffset(4));
        $data = iterator_to_array($response->getEvents());
        $this->assertNotEmpty($data);
        $this->assertEquals(1, count($data));
        $this->assertEquals(5, $response->getTotal());

        // IsListed flag testing

        $events[0]->setIsListed(0)->save();
        $events[1]->setIsListed(0)->save();

        $response = $this->_client->GetEvents([], (new Events_GetEvents_Payload())->setLimit(2)->setOffset(2)->setFilterUnlisted(true));
        $data = iterator_to_array($response->getEvents());
        $this->assertNotEmpty($data);
        $this->assertEquals(1, count($data));
        $this->assertEquals(3, $response->getTotal());

        // cleanup
        foreach ($events as $e) {
            $e->drop();
        }
    }

    public function testGetEventsById()
    {
        /** @var EventPrimitive[] $events */
        $events = array_reduce([1, 2, 3, 4, 5], function ($acc, $i) {
            $ev = $this->_createEvent();
            $acc []= $ev;
            return $acc;
        }, []);

        $response = iterator_to_array($this->_client->GetEventsById([], (new Events_GetEventsById_Payload())
            ->setIds([$events[0]->getId(), $events[1]->getId()]))
            ->getEvents());

        $this->assertNotEmpty($response);
        $this->assertEquals(2, count($response));
        $this->assertInstanceOf(Event::class, $response[0]);

        // cleanup
        foreach ($events as $e) {
            $e->drop();
        }
    }

    public function testGetMyEvents()
    {
        /** @var EventPrimitive[] $events */
        $events = array_reduce([1, 2, 3, 4, 5], function ($acc, $i) {
            $ev = $this->_createEvent();
            $acc []= $ev;
            return $acc;
        }, []);
        $this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
            ->setEventId($events[0]->getId())->setPlayerId(self::CURRENT_PERSON));
        $this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
            ->setEventId($events[1]->getId())->setPlayerId(self::CURRENT_PERSON));

        $response = iterator_to_array($this->_client->GetMyEvents([], (new Players_GetMyEvents_Payload()))->getEvents());
        $this->assertNotEmpty($response);
        $this->assertEquals(2, count($response));
        $this->assertInstanceOf(MyEvent::class, $response[0]);

        // cleanup
        $this->_client->UnregisterPlayer([], (new Events_UnregisterPlayer_Payload())
            ->setEventId($events[0]->getId())->setPlayerId(self::CURRENT_PERSON));
        $this->_client->UnregisterPlayer([], (new Events_UnregisterPlayer_Payload())
            ->setEventId($events[1]->getId())->setPlayerId(self::CURRENT_PERSON));
        foreach ($events as $e) {
            $e->drop();
        }
    }

    /**
     * @throws \Exception
     */
    public function testGetGameConfig()
    {
        $event = $this->_createEvent();
        $response = $this->_client->GetGameConfig(
            [],
            (new Generic_Event_Payload())->setEventId($event->getId())
        );
        $this->assertEquals(false, $response->getRulesetConfig()->getWithAbortives());
        $this->assertEquals(30000, $response->getRulesetConfig()->getStartPoints());
        $event->drop();
    }

    // use seeder to test these ones, probably move to separate test suite
//    public function testGetRatingTable()
//    {
//
//    }
//
//    public function testGetLastGames()
//    {
//
//    }
//
//    public function testGetGame()
//    {
//
//    }
//
//    public function testGetGamesSeries()
//    {
//
//    }
//
//    public function testGetCurrentSessions()
//    {
//
//    }
//
//    public function testGetAllRegisteredPlayers()
//    {
//
//    }
//
//    public function testGetTimerState()
//    {
//
//    }
//
//    public function testGetSessionOverview()
//    {
//
//    }
//
//    public function testGetPlayerStats()
//    {
//
//    }

    public function testCreateEvent()
    {
        $id = $this->_client->CreateEvent([], (new EventData())
            ->setTitle('New Event')
            ->setType(EventType::LOCAL)
            ->setMinGames(3)
            ->setAutostart(10)
            ->setDescription('New Event description')
            ->setDuration(75)
            ->setIsPrescripted(false)
            ->setIsTeam(false)
            ->setSeriesLength(3)
            ->setRulesetConfig(\Common\Ruleset::instance('ema')->rules())
            ->setTimezone('Asia/Novisibirsk'))->getEventId();

        $event = EventPrimitive::findById($this->_ds, [$id])[0];
        $this->assertEquals('New Event', $event->getTitle());
        $this->assertEquals(0, $event->getIsOnline());
        $this->assertEquals(0, $event->getSyncStart());
        $this->assertEquals(0, $event->getSyncEnd());
        $this->assertEquals(3, $event->getMinGamesCount());

        // TODO: fix in https://github.com/MahjongPantheon/pantheon/issues/282
        // $this->assertEquals(10, $event->getTimeToStart());

        $this->assertEquals('New Event description', $event->getDescription());
        $this->assertEquals(75, $event->getGameDuration());
        $this->assertEquals(false, $event->getIsPrescripted());
        $this->assertEquals(false, $event->getIsTeam());
        $this->assertEquals(3, $event->getSeriesLength());
        $this->assertEquals('Asia/Novisibirsk', $event->getTimezone());

        $event->drop();
    }

    public function testUpdateEvent()
    {
        $event = $this->_createEvent();

        $ret = $this->_client->UpdateEvent([], (new Events_UpdateEvent_Payload())
            ->setId($event->getId())
            ->setEvent((new EventData())
                ->setTitle('New Event')
                ->setType(EventType::LOCAL)
                ->setMinGames(3)
                ->setAutostart(10)
                ->setDescription('New Event description')
                ->setDuration(75)
                ->setIsPrescripted(false)
                ->setIsTeam(false)
                ->setRulesetConfig(\Common\Ruleset::instance('ema')->rules())
                ->setSeriesLength(3)
                ->setTimezone('Asia/Novisibirsk')))->getSuccess();

        $this->assertTrue($ret);
        // reload data
        $event = EventPrimitive::findById($this->_ds, [$event->getId()])[0];

        $this->assertEquals('New Event', $event->getTitle());
        $this->assertEquals(0, $event->getIsOnline());
        $this->assertEquals(0, $event->getSyncStart());
        $this->assertEquals(0, $event->getSyncEnd());
        $this->assertEquals(3, $event->getMinGamesCount());

        // TODO: fix in https://github.com/MahjongPantheon/pantheon/issues/282
        // $this->assertEquals(10, $event->getTimeToStart());

        $this->assertEquals('New Event description', $event->getDescription());
        $this->assertEquals(75, $event->getGameDuration());
        $this->assertEquals(false, $event->getIsPrescripted());
        $this->assertEquals(false, $event->getIsTeam());
        $this->assertEquals(3, $event->getSeriesLength());
        $this->assertEquals('Asia/Novisibirsk', $event->getTimezone());

        $event->drop();
    }

    public function testFinishEvent()
    {
        $event = $this->_createEvent();
        $this->assertEquals(false, $event->getIsFinished());
        $ret = $this->_client->FinishEvent([], (new Generic_Event_Payload())->setEventId($event->getId()))->getSuccess();
        $this->assertTrue($ret);
        // reload data
        $event = EventPrimitive::findById($this->_ds, [$event->getId()])[0];
        $this->assertEquals(true, $event->getIsFinished());
        $event->drop();
    }

    public function testToggleListed()
    {
        $event = $this->_createEvent();
        $this->assertEquals(false, $event->getIsListed());
        // toggle to on
        $ret = $this->_client->ToggleListed([], (new Generic_Event_Payload())->setEventId($event->getId()))->getSuccess();
        $this->assertTrue($ret);
        // reload data
        $event = EventPrimitive::findById($this->_ds, [$event->getId()])[0];
        $this->assertEquals(true, $event->getIsListed());
        // toggle to off
        $ret = $this->_client->ToggleListed([], (new Generic_Event_Payload())->setEventId($event->getId()))->getSuccess();
        $this->assertTrue($ret);
        // reload data
        $event = EventPrimitive::findById($this->_ds, [$event->getId()])[0];
        $this->assertEquals(false, $event->getIsListed());
        $event->drop();
    }

    public function testRegisterPlayer()
    {
        $event = $this->_createEvent();
        $this->assertTrue($this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(10))->getSuccess());
        $this->assertTrue($this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(20))->getSuccess());

        $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $event->getId());
        $this->assertEquals(2, count($regs));
        $this->assertEquals([10, 20], [$regs[0]->getPlayerId(), $regs[1]->getPlayerId()]);

        $regs[0]->drop();
        $regs[1]->drop();
        $event->drop();
    }

    public function testUnregisterPlayer()
    {
        $event = $this->_createEvent();
        $this->assertTrue($this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(10))->getSuccess());
        $this->assertTrue($this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(20))->getSuccess());

        $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $event->getId());
        $this->assertEquals(2, count($regs));
        $this->assertEquals([10, 20], [$regs[0]->getPlayerId(), $regs[1]->getPlayerId()]);

        $this->assertTrue($this->_client->UnregisterPlayer([], (new Events_UnregisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(10))->getSuccess());
        $this->assertTrue($this->_client->UnregisterPlayer([], (new Events_UnregisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(20))->getSuccess());

        $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $event->getId());
        $this->assertEquals(0, count($regs));

        $event->drop();
    }

    public function testStartGame()
    {
        $event = $this->_createEvent();
        $playerIds = $this->_addPlayers($event->getId());

        $hash = $this->_client->StartGame([], (new Games_StartGame_Payload())
            ->setEventId($event->getId())->setPlayers($playerIds))->getSessionHash();

        $this->assertNotEmpty($hash);
        $sessions = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertNotEmpty($sessions);
        $this->assertEquals(1, count($sessions));
        $this->assertEquals('inprogress', $sessions[0]->getStatus());

        $sessions[0]->drop();
        $this->_removePlayers($event->getId(), $playerIds);
        $event->drop();
    }

    public function testEndGameLocal()
    {
        $event = $this->_createEvent();
        $playerIds = $this->_addPlayers($event->getId());
        $this->_client->RegisterPlayer([], (new Events_RegisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(self::CURRENT_PERSON));

        $hash = $this->_client->StartGame([], (new Games_StartGame_Payload())
            ->setEventId($event->getId())
            ->setPlayers([$playerIds[0], $playerIds[1], $playerIds[2], self::CURRENT_PERSON]))->getSessionHash();

        $this->assertNotEmpty($hash);
        $sessions = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertNotEmpty($sessions);
        $this->assertEquals(1, count($sessions));
        $this->assertEquals('inprogress', $sessions[0]->getStatus());

        $this->assertTrue(
            $this->_client->EndGame([], (new Games_EndGame_Payload())->setSessionHash($hash))->getSuccess()
        );

        $sessions = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertNotEmpty($sessions);
        $this->assertEquals(1, count($sessions));
        $this->assertEquals('finished', $sessions[0]->getStatus());

        $this->_client->UnregisterPlayer([], (new Events_UnregisterPlayer_Payload())
            ->setEventId($event->getId())->setPlayerId(self::CURRENT_PERSON));
        $this->_removePlayers($event->getId(), $playerIds);
        foreach (SessionResultsPrimitive::findBySessionId($this->_ds, [$sessions[0]->getId()]) as $res) {
            $res->drop();
        }
        foreach (PlayerHistoryPrimitive::findBySession($this->_ds, $sessions[0]->getId()) as $res) {
            $res->drop();
        }
        $sessions[0]->drop();
        $event->drop();
    }

    public function testEndGameTournament()
    {
    }

    public function testCancelGame()
    {
        $event = $this->_createEvent();
        $playerIds = $this->_addPlayers($event->getId());

        $hash = $this->_client->StartGame([], (new Games_StartGame_Payload())
            ->setEventId($event->getId())->setPlayers($playerIds))->getSessionHash();

        $this->assertNotEmpty($hash);
        $sessions = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertNotEmpty($sessions);
        $this->assertEquals(1, count($sessions));
        $this->assertEquals('inprogress', $sessions[0]->getStatus());

        $this->assertTrue(
            $this->_client->CancelGame([], (new Games_CancelGame_Payload())->setSessionHash($hash))->getSuccess()
        );

        $sessions = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertNotEmpty($sessions);
        $this->assertEquals(1, count($sessions));
        $this->assertEquals('cancelled', $sessions[0]->getStatus());

        $sessions[0]->drop();
        $this->_removePlayers($event->getId(), $playerIds);
        $event->drop();
    }

    public function testFinalizeSession()
    {
    }

    public function testAddRound()
    {
    }

    public function testPreviewRound()
    {
    }

    public function testDropLastRound()
    {
    }

    public function testDefinalizeGame()
    {
    }

    public function testAddPenalty()
    {
    }

    public function testGetLastRound()
    {
    }

    public function testGetAllRounds()
    {
    }

    public function testGetLastRoundByHash()
    {
    }

    public function testAddOnlineReplay()
    {
    }

    public function testGetLastResults()
    {
    }

    public function testGetEventForEdit()
    {
    }

    public function testRebuildScoring()
    {
    }

    public function testGetTablesState()
    {
    }

    public function testStartTimer()
    {
    }

    public function testUpdatePlayerSeatingFlag()
    {
    }

    public function testGetAchievements()
    {
    }

    public function testGetAchievementsList()
    {
    }

    public function testToggleHideResults()
    {
    }

    public function testUpdatePlayersLocalIds()
    {
    }

    public function testUpdatePlayerReplacement()
    {
    }

    public function testUpdatePlayersTeams()
    {
    }

    public function testAddPenaltyGame()
    {
    }

    public function testGetPlayer()
    {
    }

    public function testGetCurrentSeating()
    {
    }

    public function testMakeShuffledSeating()
    {
    }

    public function testMakeSwissSeating()
    {
    }

    public function testResetSeating()
    {
    }

    public function testGenerateSwissSeating()
    {
    }

    public function testMakeIntervalSeating()
    {
    }

    public function testMakePrescriptedSeating()
    {
    }

    public function testGetNextPrescriptedSeating()
    {
    }

    public function testGetPrescriptedEventConfig()
    {
    }

    public function testUpdatePrescriptedEventConfig()
    {
    }

    public function testInitStartingTimer()
    {
    }

    public function testGetStartingTimer()
    {
    }
}
