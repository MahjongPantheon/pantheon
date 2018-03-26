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
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';
require_once __DIR__ . '/../../src/models/OnlineSession.php';
require_once __DIR__ . '/../../src/models/PlayerStat.php';
require_once __DIR__ . '/../../src/models/Event.php';
require_once __DIR__ . '/../../src/models/EventRatingTable.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/helpers/onlineLog/Downloader.php';

/**
 * Class SessionTest: integration test suite
 * @package Mimir
 */
class OnlineSessionModelTest extends \PHPUnit_Framework_TestCase
{
    /**
     * @var Db
     */
    protected $_db;
    /**
     * @var PlayerPrimitive[]
     */
    protected $_players = [];
    /**
     * @var EventPrimitive
     */
    protected $_event;
    /**
     * @var Config
     */
    protected $_config;
    /**
     * @var Meta
     */
    protected $_meta;
    /**
     * @var string
     */
    protected $_gameContent;
    /**
     * @var string
     */
    protected $_gameLink;
    /**
     * @var string
     */
    protected $_gameId;

    public function setUp()
    {
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));
        $_SERVER['HTTP_X_AUTH_TOKEN'] = $this->_config->getValue('admin.god_token');

        $this->_meta = new Meta($_SERVER);
        $this->_db = Db::__getCleanTestingInstance();
        $this->_event = (new EventPrimitive($this->_db))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setType('online')
            ->setLobbyId('1111')
            ->setAllowPlayerAppend(1)
            ->setRuleset(Ruleset::instance('tenhounet'));
        $this->_event->save();

        $this->_gameContent = file_get_contents(__DIR__ . '/testdata/full_hanchan.xml');
        // we had to generate name of the game from current date and time
        // to be able pass game expiration logic
        $this->_gameId = date("YmdH") . 'gm-00a9-0000-40a46a1c';
        $this->_gameLink = base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=' . $this->_gameId;
    }

    private function playersRegistration($tenhouNicknames = [])
    {
        if (!$tenhouNicknames) {
            $tenhouNicknames = ['tenhou1', 'tenhou2', 'tenhou3', 'tenhou4'];
        }

        $this->_players = array_map(function ($i, $tenhouNickname) {
            $p = (new PlayerPrimitive($this->_db))
                ->setDisplayName('player' . $i)
                ->setIdent('oauth' . $i)
                ->setTenhouId($tenhouNickname);
            $p->save();
            return $p;
        }, [1, 2, 3, 4], $tenhouNicknames);
    }

    // Positive tests

    public function testAddOnlineGame()
    {
        $this->playersRegistration();

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $success = $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
        $this->assertTrue($success);

        $statModel = new PlayerStatModel($this->_db, $this->_config, $this->_meta);
        $stats = $statModel->getStats($this->_event->getId(), '1');
        $this->assertEquals(1 + 1, count($stats['rating_history'])); // initial + 1 game
        $this->assertEquals(1, count($stats['score_history']));
        $this->assertGreaterThan(1, count($stats['players_info']));
        $this->assertEquals(1, array_sum($stats['places_summary']));

        $eventModel = new EventRatingTableModel($this->_db, $this->_config, $this->_meta);
        $ratings = $eventModel->getRatingTable($this->_event, 'avg_place', 'asc');
        $this->assertNotEmpty($ratings);
        $this->assertEquals(1, $ratings[0]['games_played']);
        $this->assertEquals(4, $ratings[0]['id']);

        $sessionPrimitive = SessionPrimitive::findByEventAndStatus($this->_db, $this->_event->getId(), SessionPrimitive::STATUS_FINISHED);
        $this->assertEquals(1, count($sessionPrimitive));
        $session = $sessionPrimitive[0];
        $this->assertEquals($this->_event->getId(), $session->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_FINISHED, $session->getStatus());
        $this->assertEquals($this->_gameId, $session->getReplayHash());
        $this->assertEquals($this->_gameLink, $session->getReplayLink());

        $rounds = RoundPrimitive::findBySessionIds($this->_db, [$session->getId()]);
        $this->assertEquals(9, count($rounds));

        $registered = PlayerRegistrationPrimitive::findRegisteredPlayersByEvent($this->_db, $this->_event->getId());
        $this->assertEquals(4, count($registered));
    }

    public function testAddOnlineGameWithZeroPlayerAndNegativePlayer()
    {
        /**
         * Previous version failed to add a game with results that contains
         * player with 0 scores and player with negative scores
         */
        $gameContent = file_get_contents(__DIR__ . '/testdata/negative_scores.xml');

        $this->playersRegistration();

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $success = $session->addGame($this->_event->getId(), $this->_gameLink, $gameContent);
        $this->assertTrue($success);
    }

    // Negative tests

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionMessage "NoName" players are not allowed in replays
     */
    public function testAddGameWithNoNamePlayer()
    {
        $this->_gameContent = file_get_contents(__DIR__ . '/testdata/hanchan_with_noname.xml');
        $this->playersRegistration(['NoName', 'tenhou2', 'tenhou3', 'tenhou4']);

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionMessage Not all tenhou nicknames were registered in the system: tenhou1, tenhou2
     */
    public function testAddGameWithNotRegisteredInSystemPlayers()
    {
        $this->playersRegistration(['another1', 'another2', 'tenhou3', 'tenhou4']);

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionMessage Provided replay doesn't belong to the event lobby 2222
     */
    public function testAddGameFromDifferentLobby()
    {
        $this->playersRegistration();

        $this->_event->setLobbyId('2222');
        $this->_event->save();

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionMessage Replay is older than 27 hours (within JST timezone), so it can't be accepted
     */
    public function testAddExpiredGame()
    {
        $this->_gameId = date("YmdH", strtotime("-10 days")) . 'gm-00a9-0000-40a46a1c';
        $this->_gameLink = base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=' . $this->_gameId;

        $this->playersRegistration();

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    /**
     * @expectedException \Mimir\InvalidParametersException
     * @expectedExceptionMessage This game is already added to the system
     */
    public function testAddAlreadyAddedGame()
    {
        $this->playersRegistration();

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $success = $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
        $this->assertTrue($success);

        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    /**
     * @expectedException \Mimir\DownloadException
     * @expectedExceptionMessage Invalid replay link
     */
    public function testGameLinkValidation()
    {
        $downloader = new Downloader();

        $validDomain = base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=1';
        $this->assertTrue($downloader->validateUrl($validDomain));

        $invalidDomain = 'http://localhost/0/?log=1';
        $this->assertFalse($downloader->validateUrl($invalidDomain));
    }

    /**
     * @expectedException \Mimir\MalformedPayloadException
     * @expectedExceptionMessage Player id #1 is not registered for this event
     */
    public function testAddGameWithNotRegisteredToEventPlayers()
    {
        $this->playersRegistration();

        $this->_event->setAllowPlayerAppend(0);
        $this->_event->save();

        $session = new OnlineSessionModel($this->_db, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }
}
