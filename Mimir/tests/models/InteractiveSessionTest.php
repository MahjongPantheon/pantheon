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

/**
 * Class SessionTest: integration test suite
 * @package Mimir
 */
class SessionModelTest extends \PHPUnit_Framework_TestCase
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
            ->setUsePenalty(1)
            ->setType('online')
            ->setRuleset(Ruleset::instance('jpmlA'));
        $this->_event->save();

        $this->_players = array_map(function ($i) {
            $p = (new PlayerPrimitive($this->_db))
                ->setDisplayName('player' . $i)
                ->setIdent('oauth' . $i)
                ->setTenhouId('tenhou' . $i);
            $p->save();
            (new PlayerRegistrationPrimitive($this->_db))
                ->setReg($p, $this->_event)
                ->save();
            return $p;
        }, [1, 2, 3, 4]);
    }

    // Positive tests

    public function testNewGame()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash]);
        $this->assertEquals(1, count($sessionPrimitive));
        $this->assertEquals($this->_event->getId(), $sessionPrimitive[0]->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_INPROGRESS, $sessionPrimitive[0]->getStatus());
    }

    public function testEndGame()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $session->addRound($hash, [
            'round_index' => 1,
            'honba' => 0,
            'outcome' => 'draw',
            'tempai' => '',
            'riichi' => ''
        ]);

        $session->endGame($hash);

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash]);
        $this->assertEquals(1, count($sessionPrimitive));
        $this->assertEquals($this->_event->getId(), $sessionPrimitive[0]->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_FINISHED, $sessionPrimitive[0]->getStatus());
        $this->assertNotEquals('', $sessionPrimitive[0]->getEndDate());
    }

    public function testCancelGame()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $session->addRound($hash, [
            'round_index' => 1,
            'honba' => 0,
            'outcome' => 'draw',
            'tempai' => '',
            'riichi' => ''
        ]);

        $session->cancelGame($hash);

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash]);
        $this->assertEquals(1, count($sessionPrimitive));
        $this->assertEquals($this->_event->getId(), $sessionPrimitive[0]->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_CANCELLED, $sessionPrimitive[0]->getStatus());
        $this->assertEquals('', $sessionPrimitive[0]->getEndDate());
    }

    public function testAddRoundRon()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'ron',
            'riichi'    => '',
            'winner_id' => $this->_players[1]->getId(),
            'loser_id'  => $this->_players[2]->getId(),
            'han'       => 2,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 1,
            'yaku'      => '2'
        ];

        $this->assertTrue($session->addRound($hash, $roundData));
    }

    public function testAddRoundTsumo()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 2,
            'han'       => 2,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 1,
            'yaku'      => '3'
        ];

        $this->assertTrue($session->addRound($hash, $roundData));
    }

    public function testAddRoundDraw()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'draw',
            'riichi'    => '',
            'tempai'    => ''
        ];

        $this->assertTrue($session->addRound($hash, $roundData));
    }

    public function testAddRoundAbortiveDraw()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'abort',
            'riichi'    => ''
        ];

        $this->assertTrue($session->addRound($hash, $roundData));
    }

    public function testAddRoundChombo()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                    return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'chombo',
            'loser_id'  => 2,
        ];

        $this->assertTrue($session->addRound($hash, $roundData));
    }

    public function testAddRoundNagashi()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'nagashi',
            'riichi'    => '',
            'tempai'    => '',
            'nagashi'   => '1'
        ];

        $this->assertTrue($session->addRound($hash, $roundData));

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash])[0];

        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getHonba());
        $this->assertEquals(2, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertEquals(2, $sessionPrimitive->getCurrentState()->getCurrentDealer());
    }

    public function testAddRoundNagashiWhenDealerTempai()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'nagashi',
            'riichi'    => '1',
            'tempai'    => '1',
            'nagashi'   => '2'
        ];

        $this->assertTrue($session->addRound($hash, $roundData));

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash])[0];

        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getHonba());
        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getRiichiBets());
        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getCurrentDealer());
    }

    public function testAddPenalty()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $playerId = $this->_players[0]->getId();

        $success = $session->addPenalty($this->_event->getId(), $playerId, 100, 'Just like that');
        $this->assertTrue($success);

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash])[0];
        $this->assertEquals([$playerId => -100], $sessionPrimitive->getCurrentState()->getPenalties());

        $success = $session->addPenalty($this->_event->getId(), $playerId, 200, 'Just like that');
        $this->assertTrue($success);

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash])[0];
        $this->assertEquals([$playerId => -300], $sessionPrimitive->getCurrentState()->getPenalties());
    }

    // Negative tests

    /**
     * @expectedException \Mimir\InvalidParametersException
     * @expectedExceptionMessage This event doesn't support adding penalties
     */
    public function testAddPenaltyToEventWithEmptyPenaltyFlag()
    {
        $this->_event->setUsePenalty(0);
        $this->_event->save();

        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $session->addPenalty($this->_event->getId(), $this->_players[0]->getId(), 100, 'Just like that');
    }

    /**
     * @expectedException \Mimir\InvalidUserException
     */
    public function testNewGameBadUser()
    {
        $playerIds = array_map(function (PlayerPrimitive $p) {
            return $p->getId();
        }, $this->_players);
        $playerIds[1] = 100400; // non-existing id

        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $session->startGame($this->_event->getId(), $playerIds);
    }

    /**
     * @expectedException \Mimir\InvalidUserException
     */
    public function testNewGameWrongUserCount()
    {
        $playerIds = array_map(function (PlayerPrimitive $p) {
            return $p->getId();
        }, $this->_players);
        array_pop($playerIds); // 3 players instead of 4

        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $session->startGame($this->_event->getId(), $playerIds);
    }

    /**
         * @expectedException \Mimir\InvalidParametersException
     */
    public function testEndGameWrongHash()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $session->endGame('inexisting_hash');
    }

    public function testEndGameButGameAlreadyFinished()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $session->endGame($hash); // Finish ok

        $caught = false;
        try {
            $session->endGame($hash); // Try to finish again
        } catch (BadActionException $e) {
            // We do try/catch here to avoid catching same exception from
            // upper clauses, as it might give some false positives in that case.
            $caught = true;
        }

        $this->assertTrue($caught, "Finished game throws exception");
    }

    public function testAutoEndGameWhenHanchanFinishes()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'draw',
            'riichi'    => '',
            'tempai'    => ''
        ];

        $this->assertTrue($session->addRound($hash, $roundData)); // 1e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundData)); // 2e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundData)); // 3e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundData)); // 4e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundData)); // 1s
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundData)); // 2s
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundData)); // 3s
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundData)); // 4s, should auto-finish here

        $caught = false;
        try {
            $session->endGame($hash); // Try to finish again
        } catch (BadActionException $e) {
            // We do try/catch here to avoid catching same exception from
            // upper clauses, as it might give some false positives in that case.
            $caught = true;
        }

        $this->assertTrue($caught, "Game should be already finished");

        // Check that results exist in db
        $results = SessionResultsPrimitive::findByEventId($this->_db, [$this->_event->getId()]);
        $this->assertEquals(4, count($results));
        // See jpmlA ruleset to find out why these numbers are ok
        $this->assertEquals(0, $results[0]->getRatingDelta());
        $this->assertEquals(0, $results[1]->getRatingDelta());
        $this->assertEquals(0, $results[2]->getRatingDelta());
        $this->assertEquals(0, $results[3]->getRatingDelta());

        // Check that user history items exist in db
        /** @var PlayerHistoryPrimitive[] $items */
        $items = array_map(function (PlayerPrimitive $player) {
            return PlayerHistoryPrimitive::findLastByEvent(
                $this->_db,
                $this->_event->getId(),
                $player->getId()
            );
        }, $this->_players);

        $this->assertEquals(0, $items[0]->getRating());
        $this->assertEquals(0, $items[1]->getRating());
        $this->assertEquals(0, $items[2]->getRating());
        $this->assertEquals(0, $items[3]->getRating());
    }

    public function testRoundRollback()
    {
        $sessionMdl = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);
        $hash = $sessionMdl->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $round1Data = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'draw',
            'riichi'    => '1,3',
            'tempai'    => '1,3'
        ];
        $this->assertTrue($sessionMdl->addRound($hash, $round1Data)); // here it should be 28500/30500/28500/30500 with 2 riichi on bet

        // save current state for check
        /** @var SessionPrimitive $session */
        list($session) = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash]);
        $stateBeforeTsumo = $session->getCurrentState()->toJson();

        $round2Data = [ // anything...
            'round_index' => 1,
            'honba' => 1,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 2,
            'han'       => 2,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 1,
            'yaku'      => '3'
        ];
        $this->assertTrue($sessionMdl->addRound($hash, $round2Data));

        /** @var SessionPrimitive $session */
        list($session) = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash]);
        $this->assertEquals(
            '{"_scores":{"1":29400,"2":32800,"3":29900,"4":27900},"_penalties":[],"_extraPenaltyLog":[],"_round":2,"_honba":0,"_riichiBets":0,"_prematurelyFinished":false,"_roundJustChanged":true,"_yellowZoneAlreadyPlayed":false}',
            $session->getCurrentState()->toJson()
        );

        $this->assertTrue($sessionMdl->dropLastRound($hash));

        /** @var SessionPrimitive $session */
        list($session) = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash]);
        $this->assertEquals($stateBeforeTsumo, $session->getCurrentState()->toJson()); // restored!
    }

    public function testContinueGameAfterChomboOrAbortiveDrawOnOorasu()
    {
        $session = new InteractiveSessionModel($this->_db, $this->_config, $this->_meta);

        $this->_event
            ->setRuleset(Ruleset::instance('tenhounet'))
            ->setType('offline');
        $this->_event->save();

        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundDrawData = [
            'round_index' => 1,
            'honba' => 0,
            'outcome'   => 'draw',
            'riichi'    => '',
            'tempai'    => ''
        ];

        $roundTsumoData = [
            'round_index' => 7,
            'honba' => 6,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 4,
            'han'       => -1,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 1,
            'yaku'      => '32'
        ];

        $roundChomboData = [
            'round_index' => 8,
            'honba' => 0,
            'outcome'   => 'chombo',
            'loser_id'  => 2,
        ];

        $roundAbortData = [
            'round_index' => 8,
            'honba' => 0,
            'outcome'   => 'abort',
            'riichi'    => ''
        ];

        $this->assertTrue($session->addRound($hash, $roundDrawData)); // 1e
        $roundDrawData['round_index'] ++ && $roundDrawData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundDrawData)); // 2e
        $roundDrawData['round_index'] ++ && $roundDrawData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundDrawData)); // 3e
        $roundDrawData['round_index'] ++ && $roundDrawData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundDrawData)); // 4e
        $roundDrawData['round_index'] ++ && $roundDrawData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundDrawData)); // 1s
        $roundDrawData['round_index'] ++ && $roundDrawData['honba'] ++;
        $this->assertTrue($session->addRound($hash, $roundDrawData)); // 2s
        $this->assertTrue($session->addRound($hash, $roundTsumoData)); // 3s, the last dealer is leader with 30k+ points

        $this->assertTrue($session->addRound($hash, $roundChomboData)); //chombo on oorasu

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash])[0];
        $this->assertEquals(8, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertFalse($sessionPrimitive->getCurrentState()->isFinished());

        $this->assertTrue($session->addRound($hash, $roundAbortData)); //abortive draw on oorasu

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_db, [$hash])[0];
        $this->assertEquals(8, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertFalse($sessionPrimitive->getCurrentState()->isFinished());
    }
}
