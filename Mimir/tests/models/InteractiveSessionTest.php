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

use Common\IntermediateResultOfSession;

require_once __DIR__ . '/../../src/Ruleset.php';
require_once __DIR__ . '/../../src/models/InteractiveSession.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Penalty.php';
require_once __DIR__ . '/../../src/Db.php';
require_once __DIR__ . '/../../src/Meta.php';

/**
 * Class SessionTest: integration test suite
 * @package Mimir
 */
class InteractiveSessionTest extends \PHPUnit\Framework\TestCase
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
            ->setRulesetConfig(\Common\Ruleset::instance('jpmlA'));
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3, 4]);
        foreach ($this->_players as $p) {
            (new PlayerRegistrationPrimitive($this->_ds))
                ->setReg($p, $this->_event)
                ->save();
        }

        $this->_meta->__setPersonId(1);
        $this->_meta->__setEventId($this->_event->getId());
        $this->_meta->__setAuthToken('player1auth');
    }

    // Positive tests

    public function testNewGame()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertEquals(1, count($sessionPrimitive));
        $this->assertEquals($this->_event->getId(), $sessionPrimitive[0]->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_INPROGRESS, $sessionPrimitive[0]->getStatus());
    }

    public function testEndGame()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertEquals(1, count($sessionPrimitive));
        $this->assertEquals($this->_event->getId(), $sessionPrimitive[0]->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_FINISHED, $sessionPrimitive[0]->getStatus());
        $this->assertNotEquals('', $sessionPrimitive[0]->getEndDate());
    }

    public function testCancelGame()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertEquals(1, count($sessionPrimitive));
        $this->assertEquals($this->_event->getId(), $sessionPrimitive[0]->getEventId());
        $this->assertEquals(SessionPrimitive::STATUS_CANCELLED, $sessionPrimitive[0]->getStatus());
        $this->assertEquals('', $sessionPrimitive[0]->getEndDate());
    }

    public function testAddRoundRon()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData));
    }

    public function testAddRoundTsumo()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData));
    }

    public function testAddRoundDraw()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData));
    }

    public function testAddRoundAbortiveDraw()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData));
    }

    public function testAddRoundChombo()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData));
    }

    public function testAddRoundNagashi()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData));

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];

        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getHonba());
        $this->assertEquals(2, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertEquals(2, $sessionPrimitive->getCurrentState()->getCurrentDealer());
    }

    public function testAddRoundNagashiWhenDealerTempai()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData));

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];

        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getHonba());
        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getRiichiBets());
        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertEquals(1, $sessionPrimitive->getCurrentState()->getCurrentDealer());
    }

    public function testAddPenalty()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $playerId = $this->_players[0]->getId();

        $success = $session->addPenalty($this->_event->getId(), $playerId, 100, 'Just like that');
        $this->assertTrue($success);

        $penaltyPrimitives = PenaltyPrimitive::findByEventId($this->_ds, [$this->_event->getId()]);
        $this->assertEquals(1, count($penaltyPrimitives));
        $this->assertEquals(100, $penaltyPrimitives[0]->getAmount());
        $this->assertEquals($playerId, $penaltyPrimitives[0]->getPlayerId());

        $success = $session->addPenalty($this->_event->getId(), $playerId, 200, 'Just like that');
        $this->assertTrue($success);

        $penaltyPrimitivesCopy = PenaltyPrimitive::findByEventId($this->_ds, [$this->_event->getId()]);
        $this->assertEquals(2, count($penaltyPrimitivesCopy));
        $this->assertEquals(100, $penaltyPrimitivesCopy[0]->getAmount());
        $this->assertEquals(200, $penaltyPrimitivesCopy[1]->getAmount());
        $this->assertEquals($playerId, $penaltyPrimitivesCopy[0]->getPlayerId());
        $this->assertEquals($playerId, $penaltyPrimitivesCopy[1]->getPlayerId());
    }

    // Negative tests

    public function testAddPenaltyToEventWithEmptyPenaltyFlag()
    {
        $this->expectExceptionMessage("This event doesn't support adding penalties");
        $this->expectException(\Mimir\InvalidParametersException::class);
        $this->_event->setUsePenalty(0);
        $this->_event->save();

        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $session->addPenalty($this->_event->getId(), $this->_players[0]->getId(), 100, 'Just like that');
    }

    public function testNewGameBadUser()
    {
        $this->expectException(\Mimir\InvalidUserException::class);
        $playerIds = array_map(function (PlayerPrimitive $p) {
            return $p->getId();
        }, $this->_players);
        $playerIds[1] = 100400; // non-existing id

        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->startGame($this->_event->getId(), $playerIds);
    }

    public function testNewGameWrongUserCount()
    {
        $this->expectException(\Mimir\InvalidUserException::class);
        $playerIds = array_map(function (PlayerPrimitive $p) {
            return $p->getId();
        }, $this->_players);
        array_pop($playerIds); // 3 players instead of 4

        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->startGame($this->_event->getId(), $playerIds);
    }

    public function testEndGameWrongHash()
    {
        $this->expectException(\Mimir\InvalidParametersException::class);
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $session->endGame('inexisting_hash');
    }

    public function testEndGameButGameAlreadyFinished()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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

        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 1e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 2e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 3e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 4e
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 1s
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 2s
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 3s
        $roundData['round_index'] ++ && $roundData['honba'] ++;
        $this->assertNotEmpty($session->addRound($hash, $roundData)); // 4s, should auto-finish here

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
        $results = SessionResultsPrimitive::findByEventId($this->_ds, [$this->_event->getId()]);
        $this->assertEquals(4, count($results));
        // See jpmlA ruleset to find out why these numbers are ok
        $this->assertEquals(0, $results[0]->getRatingDelta());
        $this->assertEquals(0, $results[1]->getRatingDelta());
        $this->assertEquals(0, $results[2]->getRatingDelta());
        $this->assertEquals(0, $results[3]->getRatingDelta());

        // Check that user history items exist in db
        /** @var PlayerHistoryPrimitive[] $items */
        $items = array_map(function (PlayerPrimitive $player) {
            return PlayerHistoryPrimitive::findLastByEventAndPlayer(
                $this->_ds,
                $this->_event->getId(),
                $player->getId()
            )[0];
        }, $this->_players);

        $this->assertEquals(0, $items[0]->getRating());
        $this->assertEquals(0, $items[1]->getRating());
        $this->assertEquals(0, $items[2]->getRating());
        $this->assertEquals(0, $items[3]->getRating());
    }

    public function testRoundRollback()
    {
        $sessionMdl = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
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
        $this->assertNotEmpty($sessionMdl->addRound($hash, $round1Data)); // here it should be 28500/30500/28500/30500 with 2 riichi on bet

        // save current state for check
        /** @var SessionPrimitive $session */
        list($session) = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
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
        $this->assertNotEmpty($sessionMdl->addRound($hash, $round2Data));

        /** @var SessionPrimitive $session */
        list($session) = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertEquals(
            '{"_scores":{"1":29400,"2":32800,"3":29900,"4":27900},"_chombo":[],"_round":2,"_honba":0,"_riichiBets":0,"_prematurelyFinished":false,"_roundJustChanged":true,"_lastHandStarted":false,"_lastOutcome":"tsumo","_yakitori":[],"_isFinished":false}',
            $session->getCurrentState()->toJson()
        );

        $intermediateResults = array_combine($session->getPlayersIds(), $session->getCurrentState()->getScores());

        $this->assertNotEmpty($sessionMdl->dropLastRound($hash, array_map(function ($id) use ($intermediateResults) {
            return (new IntermediateResultOfSession())
                ->setPlayerId($id)
                ->setScore($intermediateResults[$id]);
        }, $session->getPlayersIds())));

        /** @var SessionPrimitive $session */
        list($session) = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash]);
        $this->assertEquals($stateBeforeTsumo, $session->getCurrentState()->toJson()); // restored!
    }

    public function testContinueGameAfterChomboOrAbortiveDrawOnOorasu()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);

        $this->_event
            ->setRulesetConfig(\Common\Ruleset::instance('tenhounet'));
        $this->_event->save();

        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundYakumanData = [
            'round_index' => 1,
            'honba'     => 0,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 4,
            'han'       => -1,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 0,
            'yaku'      => '32'
        ];

        $this->assertNotEmpty($session->addRound($hash, $roundYakumanData)); //1e -> 2e

        $roundIndex = 2;
        $drawCount = 6; // 2e -> 4s
        $this->_addDrawRounds($session, $hash, $roundIndex, $drawCount);
        $roundIndex += $drawCount;

        $this->_checkAbortAndChomboShouldNotEndGame($session, $hash, $roundIndex, $drawCount);
    }

    public function testContinueGameToWestRound()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);

        $this->_event
            ->setRulesetConfig(\Common\Ruleset::instance('tenhounet'));
        $this->_event->save();

        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundTsumoData = [
            'round_index' => 1,
            'honba'     => 0,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 4,
            'han'       => 1,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 0,
            'yaku'      => '36' //menzentsumo
        ];

        $this->assertNotEmpty($session->addRound($hash, $roundTsumoData)); // 1e -> 2e

        $roundIndex = 2;
        $drawCount = 7; // 2e -> 1w
        $this->_addDrawRounds($session, $hash, $roundIndex, $drawCount);
        $roundIndex += $drawCount;


        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];
        $this->assertEquals(9, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertFalse($sessionPrimitive->getCurrentState()->isFinished());

        $this->_checkAbortAndChomboShouldNotEndGame($session, $hash, $roundIndex, $drawCount);
    }

    public function testDoNotPlayNorthRound()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);

        $this->_event
            ->setRulesetConfig(\Common\Ruleset::instance('tenhounet'));
        $this->_event->save();

        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundIndex = 1;
        $drawCount = 11; // 1e -> 4w
        $this->_addDrawRounds($session, $hash, $roundIndex, $drawCount);
        $roundIndex += $drawCount;

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];
        $this->assertEquals(12, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertFalse($sessionPrimitive->getCurrentState()->isFinished());


        $this->_addDrawRounds($session, $hash, $roundIndex, 1, $drawCount);  // 4e -> 1n

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];
        $this->assertEquals(13, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertTrue($sessionPrimitive->getCurrentState()->isFinished());
    }

    public function testEndWestRound()
    {
        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);

        $this->_event
            ->setRulesetConfig(\Common\Ruleset::instance('tenhounet'));
        $this->_event->save();

        $hash = $session->startGame(
            $this->_event->getId(),
            array_map(function (PlayerPrimitive $p) {
                return $p->getId();
            }, $this->_players)
        );

        $roundIndex = 1;
        $drawCount = 9; // 1e -> 2w
        $this->_addDrawRounds($session, $hash, $roundIndex, $drawCount);
        $roundIndex += $drawCount;

        $roundYakumanData = [
            'round_index' => $roundIndex,
            'honba'     => $drawCount,
            'outcome'   => 'tsumo',
            'riichi'    => '',
            'winner_id' => 4,
            'han'       => -1,
            'fu'        => 30,
            'multi_ron' => null,
            'dora'      => 0,
            'uradora'   => 0,
            'kandora'   => 0,
            'kanuradora' => 0,
            'yaku'      => '32'
        ];

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];
        $this->assertEquals(10, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertFalse($sessionPrimitive->getCurrentState()->isFinished());

        $this->assertNotEmpty($session->addRound($hash, $roundYakumanData)); //2e -> 3e

        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];
        $this->assertEquals(11, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertTrue($sessionPrimitive->getCurrentState()->isFinished());
    }

    protected function _addDrawRounds($session, $hash, $roundIndex, $drawCount, $honba = 0)
    {
        $roundDrawData = [
            'round_index' => $roundIndex,
            'honba'     => $honba,
            'outcome'   => 'draw',
            'riichi'    => '',
            'tempai'    => ''
        ];

        for ($i = 0; $i < $drawCount; $i++) {
            $this->assertNotEmpty($session->addRound($hash, $roundDrawData));
            $roundDrawData['round_index'] ++ && $roundDrawData['honba'] ++;
        }
    }

    protected function _checkAbortAndChomboShouldNotEndGame($session, $hash, $roundIndex, $honba)
    {
        $roundAbortData = [
            'round_index' => $roundIndex,
            'honba' => $honba,
            'outcome'   => 'abort',
            'riichi'    => ''
        ];

        $roundChomboData = [
            'round_index' => $roundIndex,
            'honba' => $honba + 1,
            'outcome'   => 'chombo',
            'loser_id'  => 1,
        ];

        $this->assertNotEmpty($session->addRound($hash, $roundAbortData));
        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];

        $this->assertEquals($roundIndex, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertFalse($sessionPrimitive->getCurrentState()->isFinished());

        $this->assertNotEmpty($session->addRound($hash, $roundChomboData));
        $sessionPrimitive = SessionPrimitive::findByRepresentationalHash($this->_ds, [$hash])[0];

        $this->assertEquals($roundIndex, $sessionPrimitive->getCurrentState()->getRound());
        $this->assertTrue($sessionPrimitive->getCurrentState()->getScores()[4] > 30000);
        $this->assertFalse($sessionPrimitive->getCurrentState()->isFinished());
    }

    public function testRiichiSplitForThreePlayers()
    {
        $this->_event
            ->setRulesetConfig(\Common\Ruleset::instance('ema'));
        $this->_event->save();

        $session = new InteractiveSessionModel($this->_ds, $this->_config, $this->_meta);
        $playerIds = array_map(function (PlayerPrimitive $p) {
            return $p->getId();
        }, $this->_players);
        $hash = $session->startGame($this->_event->getId(), $playerIds);

        $roundIndex = 1;
        $drawCount = 4; // 1e -> 1s
        $this->_addDrawRounds($session, $hash, $roundIndex, $drawCount);
        $roundIndex += $drawCount;

        // One renchan round
        $this->assertNotEmpty($session->addRound($hash, [
            'round_index' => $roundIndex,
            'honba' => 4,
            'outcome'   => 'draw',
            'riichi'    => '' . $playerIds[1],
            'tempai'    => implode(',', $playerIds)
        ])); // 1s again after all tempai with one riichi

        $drawCount = 4; // 1s -> 1w (end game)
        $this->_addDrawRounds($session, $hash, $roundIndex, $drawCount, 5);

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
        $results = SessionResultsPrimitive::findByEventId($this->_ds, [$this->_event->getId()]);
        $this->assertEquals(4, count($results));

        $this->assertEquals(5300, $results[0]->getRatingDelta());
        $this->assertEquals(-16000, $results[1]->getRatingDelta()); // the guy who did riichi
        $this->assertEquals(5300, $results[2]->getRatingDelta());
        $this->assertEquals(5300, $results[3]->getRatingDelta());
    }
}
