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
namespace models;

use Mimir\Config;
use Mimir\DataSource;
use Mimir\EventPrimitive;
use Mimir\EventRatingTableModel;
use Mimir\InvalidParametersException;
use Mimir\Meta;
use Mimir\OnlineSessionModel;
use Mimir\PlatformTypeId;
use Mimir\PlayerPrimitive;
use Mimir\PlayerRegistrationPrimitive;
use Mimir\PlayerStatModel;
use Mimir\ReplayContentType;
use Mimir\RoundPrimitive;
use Mimir\SessionPrimitive;

require_once __DIR__ . '/../../src/Ruleset.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';
require_once __DIR__ . '/../../src/models/OnlineSession.php';
require_once __DIR__ . '/../../src/models/PlayerStat.php';
require_once __DIR__ . '/../../src/models/Event.php';
require_once __DIR__ . '/../../src/models/EventRatingTable.php';
require_once __DIR__ . '/../../src/models/PlatformTypeId.php';
require_once __DIR__ . '/../../src/models/ReplayContentType.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/helpers/onlineLog/Downloader.php';

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 *
 * Class MajsoulOnlineSessionModelTest: integration test suite
 * @package Mimir
 */
class MajsoulOnlineSessionModelTest extends \PHPUnit\Framework\TestCase
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

        $mockPlayerNameMap = [];
        $mockPlayerNameMap[1] = 'TPlayer1';
        $mockPlayerNameMap[2] = 'プレーヤー2';
        $mockPlayerNameMap[3] = 'プレーヤー3';
        $mockPlayerNameMap[4] = 'プレーヤー4';
        $this->_ds = DataSource::__getCleanTestingInstance($mockPlayerNameMap);
        $this->_meta = new Meta($this->_ds->remote(), new \Common\Storage('localhost'), $this->_config, $_SERVER);
        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setIsOnline(1)
            ->setDescription('desc')
            ->setLobbyId('1111')
            ->setAllowPlayerAppend(1)
            ->setRulesetConfig(\Common\Ruleset::instance('tenhounet'));
        $this->_event->save();
        $this->_gameContent = file_get_contents(__DIR__ . '/testdata/format6/tensoul_usual.json');
        $this->_gameId = '231014-84c11a6f-b3f7-4363-966e-25f37886cfbf';
        $this->_gameLink = base64_decode('aHR0cHM6Ly9tYWhqb25nc291bC5nYW1lLnlvLXN0YXIuY29t') . '/?paipu=' . $this->_gameId;
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

    public function testAddTypedOnlineGame()
    {
        $this->playersRegistration(['TPlayer1', 'プレーヤー2', 'プレーヤー3', 'プレーヤー4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $result = $session->addTypedGame(
            $this->_event->getId(),
            $this->_gameId,
            1697303093,
            $this->_gameContent,
            PlatformTypeId::Majsoul->value,
            ReplayContentType::Json->value
        );
        $this->assertIsObject($result);

        $statModel = new PlayerStatModel($this->_ds, $this->_config, $this->_meta);
        $stats = $statModel->getStats([$this->_event->getId()], '1');
        $this->assertEquals(1 + 1, count($stats['rating_history'])); // initial + 1 game
        $this->assertEquals(1, count($stats['score_history']));
        $this->assertGreaterThan(1, count($stats['players_info']));
        $this->assertEquals(1, array_sum($stats['places_summary']));

        $eventModel = new EventRatingTableModel($this->_ds, $this->_config, $this->_meta);
        $ratings = $eventModel->getRatingTable([$this->_event], [], 'avg_place', 'asc');
        $this->assertNotEmpty($ratings);
        $this->assertEquals(1, $ratings[0]['games_played']);
        $this->assertEquals(1, $ratings[0]['id']);
        $this->assertEquals(4, $ratings[3]['id']);

        $sessionPrimitive = SessionPrimitive::findByEventAndStatus($this->_ds, $this->_event->getId(), SessionPrimitive::STATUS_FINISHED);
        $this->assertEquals(1, count($sessionPrimitive));
        $session = $sessionPrimitive[0];
        $this->assertEquals($this->_event->getId(), $session->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_FINISHED, $session->getStatus());
        $this->assertEquals($this->_gameId, $session->getReplayHash());
        $this->assertEquals($this->_gameLink, $session->getReplayLink(PlatformTypeId::Majsoul->value));

        $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$session->getId()]);
        $this->assertEquals(8, count($rounds));

        $registered = PlayerRegistrationPrimitive::findRegisteredPlayersByEvent($this->_ds, $this->_event->getId());
        $this->assertEquals(4, count($registered));
    }

    public function testAddExpiredGame()
    {
        $this->expectExceptionMessage("Replay is older than");
        $this->expectException(\Mimir\ParseException::class);
        $this->_gameId = '231014-84c11a6f-b3f7-4363-966e-25f37886cfbf';

        $this->playersRegistration(['TPlayer1', 'プレーヤー2', 'プレーヤー3', 'プレーヤー4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->addTypedGame(
            $this->_event->getId(),
            $this->_gameId,
            strtotime("-11 years"),
            $this->_gameContent,
            PlatformTypeId::Majsoul->value,
            ReplayContentType::Json->value
        );
    }

    public function testAddTensoulGameWithoutMapping()
    {
        $this->expectExceptionMessage("Tensoul replay format not allowed without player mappings");
        $this->expectException(\Mimir\ParseException::class);
        $this->_gameContent = file_get_contents(__DIR__ . '/testdata/format6/tensoul_without_mapping.json');
        $this->_gameId = '231014-84c11a6f-b3f7-4363-966e-25f37886cfbf';

        $this->playersRegistration(['TPlayer1', 'プレーヤー2', 'プレーヤー3', 'プレーヤー4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->addTypedGame(
            $this->_event->getId(),
            $this->_gameId,
            1697303093,
            $this->_gameContent,
            PlatformTypeId::Majsoul->value,
            ReplayContentType::Json->value
        );
    }

    public function testAddTensoulGameWithInvalidHash()
    {
        $this->expectExceptionMessage("Replay hash not equals with session hash");
        $this->expectException(\Mimir\ParseException::class);
        $this->_gameContent = file_get_contents(__DIR__ . '/testdata/format6/tensoul_usual.json');
        $this->_gameId = '966e-25f37886cfbf';

        $this->playersRegistration(['TPlayer1', 'プレーヤー2', 'プレーヤー3', 'プレーヤー4']);

        $session = new OnlineSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->addTypedGame(
            $this->_event->getId(),
            $this->_gameId,
            1697303093,
            $this->_gameContent,
            PlatformTypeId::Majsoul->value,
            ReplayContentType::Json->value
        );
    }
}
