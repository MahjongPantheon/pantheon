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
class OnlineSessionModelTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
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
    protected $_chipsGameContent;
    /**
     * @var string
     */
    protected $_gameLink;
    /**
     * @var string
     */
    protected $_gameId;

    protected function setUp(): void
    {
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));

        $this->_ds = DataSource::__getCleanTestingInstance();
        $this->_meta = new Meta($this->_ds->remote(), new \Common\Storage('localhost'), $this->_config, $_SERVER);
        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setIsOnline(1)
            ->setDescription('desc')
            ->setLobbyId('1111')
            ->setAllowPlayerAppend(1)
            ->setRuleset(\Common\Ruleset::instance('tenhounet'));
        $this->_event->save();

        $this->_gameContent = file_get_contents(__DIR__ . '/testdata/full_hanchan.xml');
        $this->_chipsGameContent = file_get_contents(__DIR__ . '/testdata/chips_tonpusen.xml');
        // we had to generate name of the game from current date and time
        // to be able pass game expiration logic
        $this->_gameId = date("YmdH") . 'gm-00a9-0000-40a46a1c';
        $this->_gameLink = base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=' . $this->_gameId;
    }

    /**
     * @param array $tenhouNicknames
     * @throws InvalidParametersException
     */
    private function playersRegistration($tenhouNicknames)
    {
        $this->_players = PlayerPrimitive::findByTenhouId($this->_ds, $tenhouNicknames);
        foreach ($this->_players as $p) {
            (new PlayerRegistrationPrimitive($this->_ds))
                ->setReg($p, $this->_event)
                ->save();
        }
    }

    // Positive tests

    public function testAddOnlineGame()
    {
        $this->playersRegistration(['player1', 'player2', 'player3', 'player4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $result = $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
        $this->assertIsObject($result);

        $statModel = new PlayerStatModel($this->_ds, $this->_config, $this->_meta);
        $stats = $statModel->getStats([$this->_event->getId()], '1');
        $this->assertEquals(1 + 1, count($stats['rating_history'])); // initial + 1 game
        $this->assertEquals(1, count($stats['score_history']));
        $this->assertGreaterThan(1, count($stats['players_info']));
        $this->assertEquals(1, array_sum($stats['places_summary']));

        $eventModel = new EventRatingTableModel($this->_ds, $this->_config, $this->_meta);
        $ratings = $eventModel->getRatingTable([$this->_event], 'avg_place', 'asc');
        $this->assertNotEmpty($ratings);
        $this->assertEquals(1, $ratings[0]['games_played']);
        $this->assertEquals(4, $ratings[0]['id']);

        $sessionPrimitive = SessionPrimitive::findByEventAndStatus($this->_ds, $this->_event->getId(), SessionPrimitive::STATUS_FINISHED);
        $this->assertEquals(1, count($sessionPrimitive));
        $session = $sessionPrimitive[0];
        $this->assertEquals($this->_event->getId(), $session->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_FINISHED, $session->getStatus());
        $this->assertEquals($this->_gameId, $session->getReplayHash());
        $this->assertEquals($this->_gameLink, $session->getReplayLink());

        $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$session->getId()]);
        $this->assertEquals(9, count($rounds));

        $registered = PlayerRegistrationPrimitive::findRegisteredPlayersByEvent($this->_ds, $this->_event->getId());
        $this->assertEquals(4, count($registered));
    }

    public function testAddOnlineGameWithZeroPlayerAndNegativePlayer()
    {
        /**
         * Previous version failed to add a game with results that contains
         * player with 0 scores and player with negative scores
         * https://pantheon.myjetbrains.com/youtrack/issue/PNTN-235
         */
        $gameContent = file_get_contents(__DIR__ . '/testdata/negative_scores.xml');

        $this->playersRegistration(['player1', 'player2', 'player3', 'player4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $result = $session->addGame($this->_event->getId(), $this->_gameLink, $gameContent);
        $this->assertIsObject($result);
    }

    public function testAddOnlineGameWithChips()
    {
        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setIsOnline(1)
            ->setLobbyId('1111')
            ->setAllowPlayerAppend(1)
            ->setRuleset(\Common\Ruleset::instance('tenhounet'))
            ->setRulesetChanges([
                'oka' => 0,
                'startRating' => 0,
                'startPoints' => 30000,
                'uma' => [1 => 15000, 5000, -5000, -15000],
                'chipsValue' => 2000,
                'withWinningDealerHonbaSkipped' => true,
            ]);
        $this->_event->save();

        $this->playersRegistration(['player1', 'player2', 'player3', 'player4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $result = $session->addGame($this->_event->getId(), $this->_gameLink, $this->_chipsGameContent);
        $this->assertIsObject($result);

        $statModel = new PlayerStatModel($this->_ds, $this->_config, $this->_meta);
        $stats = $statModel->getStats([$this->_event->getId()], '1');
        $this->assertEquals(1 + 1, count($stats['rating_history'])); // initial + 1 game
        $this->assertEquals(1, count($stats['score_history']));
        $this->assertGreaterThan(1, count($stats['players_info']));
        $this->assertEquals(1, array_sum($stats['places_summary']));

        $gameResults = $stats['score_history'][1];
        // scores with included chips 2000 bonus
        $this->assertEquals(3, $gameResults[0]['place']);
        $this->assertEquals(23800, $gameResults[0]['score']);
        $this->assertEquals(-3, $gameResults[0]['chips']);
        $this->assertEquals(-11200 - 6000, $gameResults[0]['rating_delta']);

        $this->assertEquals(1, $gameResults[1]['place']);
        $this->assertEquals(43200, $gameResults[1]['score']);
        $this->assertEquals(2, $gameResults[1]['chips']);
        $this->assertEquals(28200 + 4000, $gameResults[1]['rating_delta']);

        $this->assertEquals(2, $gameResults[2]['place']);
        $this->assertEquals(39200, $gameResults[2]['score']);
        $this->assertEquals(5, $gameResults[2]['chips']);
        $this->assertEquals(14200 + 10000, $gameResults[2]['rating_delta']);

        $this->assertEquals(4, $gameResults[3]['place']);
        $this->assertEquals(13800, $gameResults[3]['score']);
        $this->assertEquals(-4, $gameResults[3]['chips']);
        $this->assertEquals(-31200 - 8000, $gameResults[3]['rating_delta']);

        $eventModel = new EventRatingTableModel($this->_ds, $this->_config, $this->_meta);
        $ratings = $eventModel->getRatingTable([$this->_event], 'avg_place', 'asc');
        $this->assertNotEmpty($ratings);
        $this->assertEquals(1, $ratings[0]['games_played']);
        $this->assertEquals(2, $ratings[0]['chips']);
        $this->assertEquals(5, $ratings[1]['chips']);
        $this->assertEquals(-3, $ratings[2]['chips']);
        $this->assertEquals(-4, $ratings[3]['chips']);
    }

    // Negative tests

    public function testAddGameWithNoNamePlayer()
    {
        $this->expectExceptionMessage("\"NoName\" players are not allowed in replays");
        $this->expectException(\Mimir\ParseException::class);
        $this->_gameContent = file_get_contents(__DIR__ . '/testdata/hanchan_with_noname.xml');
        $this->playersRegistration(['player2', 'player3', 'player4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    public function testAddGameWithNotRegisteredInSystemPlayers()
    {
        $this->expectException(\Mimir\ParseException::class);
        $this->expectExceptionMessage("Not all tenhou nicknames were registered in the system: tenhou1, tenhou2");
        $this->playersRegistration(['player3', 'player4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $content = str_replace(
            'player1',
            'tenhou1',
            str_replace('player2', 'tenhou2', $this->_gameContent)
        );
        $session->addGame($this->_event->getId(), $this->_gameLink, $content);
    }

    public function testAddGameFromDifferentLobby()
    {
        $this->expectException(\Mimir\ParseException::class);
        $this->expectExceptionMessage("Provided replay doesn't belong to the event lobby 2222");
        $this->playersRegistration(['player1', 'player2', 'player3', 'player4']);

        $this->_event->setLobbyId('2222');
        $this->_event->save();

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    public function testAddExpiredGame()
    {
        $this->expectExceptionMessage("Replay is older than");
        $this->expectException(\Mimir\ParseException::class);
        $this->_gameId = date("YmdH", strtotime("-11 years")) . 'gm-00a9-0000-40a46a1c';
        $this->_gameLink = base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=' . $this->_gameId;

        $this->playersRegistration(['player1', 'player2', 'player3', 'player4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    public function testAddAlreadyAddedGame()
    {
        $this->expectExceptionMessage("This game is already added to the system");
        $this->expectException(\Mimir\InvalidParametersException::class);
        $this->playersRegistration(['player1', 'player2', 'player3', 'player4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $result = $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
        $this->assertIsObject($result);

        $session->addGame($this->_event->getId(), $this->_gameLink, $this->_gameContent);
    }

    public function testGameLinkValidation()
    {
        $this->expectExceptionMessage("Invalid replay link");
        $this->expectException(\Mimir\DownloadException::class);
        $downloader = new Downloader();

        $validDomain = base64_decode('aHR0cDovL3RlbmhvdS5uZXQv') . '0/?log=1';
        $this->assertTrue($downloader->validateUrl($validDomain));

        $invalidDomain = 'http://localhost/0/?log=1';
        $this->assertFalse($downloader->validateUrl($invalidDomain));
    }

    public function testAddGameWithNotRegisteredToEventPlayers()
    {
        $this->expectExceptionMessage("Player id #33 is not registered for this event");
        $this->expectException(\Mimir\MalformedPayloadException::class);
        $this->playersRegistration(['player2', 'player3', 'player4']);

        $this->_event->setAllowPlayerAppend(0);
        $this->_event->save();

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $content = str_replace('player1', 'player33', $this->_gameContent);
        $session->addGame($this->_event->getId(), $this->_gameLink, $content);
    }
}
