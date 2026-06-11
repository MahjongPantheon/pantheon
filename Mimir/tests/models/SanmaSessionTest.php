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
require_once __DIR__ . '/../../src/models/InteractiveSession.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';
require_once __DIR__ . '/../../src/controllers/Games.php';

/**
 * Full 3-player (sanma) game flow: ghost seat auto-appended on game start,
 * 3 session results with 3-place uma on finish.
 */
class SanmaSessionTest extends \PHPUnit\Framework\TestCase
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

    protected function setUp(): void
    {
        $this->_config = new Config(getenv('OVERRIDE_CONFIG_PATH'));

        $this->_ds = DataSource::__getCleanTestingInstance();
        $this->_meta = new Meta($this->_ds->remote(), new \Common\Storage('localhost'), $this->_config, $_SERVER);
        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setUsePenalty(1)
            ->setRulesetConfig(\Common\Ruleset::instance('sanma'));
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3]);
        foreach ($this->_players as $p) {
            (new PlayerRegistrationPrimitive($this->_ds))
                ->setReg($p, $this->_event)
                ->save();
        }

        $this->_meta->__setPersonId(1);
        $this->_meta->__setEventId($this->_event->getId());
        $this->_meta->__setAuthToken('player1auth');
    }

    protected function _playerIds(): array
    {
        return array_map(function (PlayerPrimitive $p) {
            return $p->getId();
        }, $this->_players);
    }

    public function testNewSanmaGameAppendsGhost()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $hash = $session->startGame($this->_event->getId(), $this->_playerIds());

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertEquals(1, count($sessionPrimitive));
        $this->assertEquals(
            [1, 2, 3, \Common\Constants::GHOST_PLAYER_ID],
            $sessionPrimitive[0]->getPlayersIds()
        );
        $this->assertEquals([1, 2, 3], $sessionPrimitive[0]->getRealPlayersIds());
        // Ghost is not tracked in scores
        $this->assertEquals(
            [1 => 35000, 2 => 35000, 3 => 35000],
            $sessionPrimitive[0]->getCurrentState()->getScores()
        );
    }

    public function testSanmaGameRequiresExactlyThreePlayers()
    {
        $this->expectException(InvalidParametersException::class);
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->startGame($this->_event->getId(), [1, 2, 3, 4]);
    }

    public function testAddTsumoRound()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $hash = $session->startGame($this->_event->getId(), $this->_playerIds());

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 2,
            'han'       => 5,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 0,
            'yaku'      => '3'
        ];

        $this->assertNotEmpty($session->addRound($hash, $roundData));

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        // Child mangan tsumo with tsumo loss: +6000; dealer -4000, ko -2000
        $this->assertEquals(
            [1 => 31000, 2 => 41000, 3 => 33000],
            $sessionPrimitive[0]->getCurrentState()->getScores()
        );
    }

    public function testSessionResultsForThreePlayers()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $hash = $session->startGame($this->_event->getId(), $this->_playerIds());

        $session->addRound($hash, [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 2,
            'han'       => 5,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 0,
            'yaku'      => '3'
        ]);

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $results = $sessionPrimitive[0]->getSessionResults();

        $this->assertEquals(3, count($results));

        $byPlayer = [];
        $deltaSum = 0;
        foreach ($results as $result) {
            $byPlayer[$result->getPlayerId()] = $result;
            $deltaSum += $result->getRatingDelta();
        }

        $this->assertArrayNotHasKey(\Common\Constants::GHOST_PLAYER_ID, $byPlayer);
        // Scores 41000 / 33000 / 31000 -> places 2, 3, 1; uma +15000/0/-15000, oka 0
        $this->assertEquals(1, $byPlayer[2]->getPlace());
        $this->assertEquals(2, $byPlayer[3]->getPlace());
        $this->assertEquals(3, $byPlayer[1]->getPlace());
        $this->assertEquals(6000 + 15000, $byPlayer[2]->getRatingDelta());
        $this->assertEquals(-2000 + 0, $byPlayer[3]->getRatingDelta());
        $this->assertEquals(-4000 - 15000, $byPlayer[1]->getRatingDelta());
        $this->assertEquals(0, $deltaSum);
    }

    /**
     * Regression: getSessionOverview must include the ghost seat without crashing.
     * The ghost (-1) is not tracked in _scores, so its score lookup returns null;
     * the controller must coalesce it to a valid int (0), otherwise the protobuf
     * int field setter throws "Cannot convert '' to integer" and the whole
     * GetSessionOverview response 500s (which logs the player out of Tyr).
     */
    public function testSessionOverviewIncludesGhostWithValidScore()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $hash = $session->startGame($this->_event->getId(), $this->_playerIds());

        // @ suppresses the "headers already sent" warning from the base
        // Controller constructor's sendVersionHeader() under the CLI SAPI.
        $controller = @(new GamesController(
            $this->_ds,
            new \Monolog\Logger('test'),
            $this->_config,
            $this->_meta
        ));
        $overview = $controller->getSessionOverview($hash);

        $byPlayer = [];
        foreach ($overview['players'] as $player) {
            $byPlayer[$player['id']] = $player;
        }

        // Ghost seat is present (Tyr filters it client-side) ...
        $this->assertArrayHasKey(\Common\Constants::GHOST_PLAYER_ID, $byPlayer);
        // ... and its score must be a valid integer, never null.
        $this->assertSame(0, $byPlayer[\Common\Constants::GHOST_PLAYER_ID]['score']);
        // Real players keep their actual scores.
        $this->assertEquals(35000, $byPlayer[1]['score']);
        $this->assertEquals(35000, $byPlayer[2]['score']);
        $this->assertEquals(35000, $byPlayer[3]['score']);
    }

    public function testGameFinishesAfterSouth3()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $hash = $session->startGame($this->_event->getId(), $this->_playerIds());

        // 6 dealerships: E1-E3 + S1-S3; dealer is never tempai -> round advances
        for ($i = 1; $i <= 6; $i++) {
            $session->addRound($hash, [
                'round_index' => $i,
                'honba' => $i - 1,
                'outcome'   => 'draw',
                'riichi'    => '',
                'tempai'    => ''
            ]);
        }

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertTrue($sessionPrimitive[0]->getCurrentState()->isFinished());
    }
}
