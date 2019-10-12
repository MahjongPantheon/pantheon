<?php
/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  player1 and others
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

require_once __DIR__ . '/../../../src/helpers/textLog/Parser.php';
require_once __DIR__ . '/../../../src/primitives/PlayerRegistration.php';

/**
 * Log parser integration test suite
 *
 * Class TextlogParserTest
 * @package Mimir
 */
class TextlogParserTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var Db
     */
    protected $_db;
    /**
     * @var PlayerPrimitive[]
     */
    protected $_players;
    /**
     * @var EventPrimitive
     */
    protected $_event;
    /**
     * @var SessionPrimitive
     */
    protected $_session;

    public function setUp()
    {
        $this->_db = Db::__getCleanTestingInstance();

        $this->_event = (new EventPrimitive($this->_db))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setType('online')
            ->setRuleset(Ruleset::instance('ema'));
        $this->_event->save();

        $this->_players = array_map(function ($i) {
            $p = (new PlayerPrimitive($this->_db))
                ->setDisplayName('player' . $i)
                ->setAlias('player' . $i)
                ->setIdent('oauth' . $i)
                ->setTenhouId('tenhou' . $i);
            $p->save();
            (new PlayerRegistrationPrimitive($this->_db))
                ->setReg($p, $this->_event)
                ->save();
            return $p;
        }, [1, 2, 3, 4]);

        $this->_session = (new SessionPrimitive($this->_db))
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setReplayHash('');
        $this->_session->save();
    }

    public function testMultiRonWithRiichiInEveryRon()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player1:30000 player2:30000 player3:30000 player4:30000
                ron player1 from player2 1han 30fu (riichi) riichi player1 player4
                also player3 2han 30fu (riichi pinfu) riichi player3
            ');

        $this->assertEquals([
            1 => 30000 + 1500        - 1000 + 1000,
                 30000 - 1500                      - 2000, // loser
                 30000        + 1000 - 1000 + 1000 + 2000, // this player gets all non-winning riichis
                 30000        - 1000
        ], $this->_session->getCurrentState()->getScores());
    }

    public function testMultiRon()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player1:30000 player2:30000 player3:30000 player4:30000
                ron player1 from player2 1han 30fu (riichi) riichi player1 player4
                also player3 2han 30fu (riichi pinfu) riichi player2
            ');

        $this->assertEquals([
            1 => 30000 + 1500        - 1000 + 1000,
                 30000 - 1500 - 1000               - 2000, // loser
                 30000        + 1000 + 1000        + 2000, // this player gets all non-winning riichis
                 30000        - 1000
        ], $this->_session->getCurrentState()->getScores());
    }


    public function testTempaiParse()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player1:30000 player2:30000 player3:30000 player4:30000
                draw tempai player4 player3
            ');

        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals([
            1 => 30000 - 1500,
                 30000 - 1500,
                 30000 + 1500,
                 30000 + 1500,
        ], $this->_session->getCurrentState()->getScores());
    }

    public function testEmptyLog()
    {
        list($actual/*, $debug*/) = (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player1:23200 player2:23300 player3:43000 player4:12000
            ');
        $expected = [
            1 => '23200',
                 '23300',
                 '43000',
                 '12000'
        ];
        $this->assertEquals($expected, $actual);

        $this->_session->save();
        $this->_session->finish();
        $this->assertEquals([
            1 => 30000, 30000, 30000, 30000 // no rounds provided, no score change occured TODO: maybe change this
        ], $this->_session->getCurrentState()->getScores());
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 100
     */
    public function testInvalidHeader()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, 'player1: 23200 player2:23300');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 101
     */
    public function testMistypedUserHeader()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, 'mistyped:23200 player2:23300 player3:43000 player4:12000');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 106
     */
    public function testInvalidOutcome()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                rodn player1 1han 30fu (pinfu) riichi player4 player3
            ');
    }

    public function testBasicRon()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:30000 player1:30000 player3:30000 player4:30000
                ron player1 from player2 1han 30fu (pinfu)
            ');

        $this->assertEquals([
            1 => 30000 + 1000,
                 30000 - 1000,
                 30000,
                 30000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testBasicDoubleRon()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:30000 player1:30000 player3:30000 player4:30000
                ron player1 from player2 1han 30fu (pinfu)
                also player3 2han 30fu (pinfu tanyao)
            ');

        $this->assertEquals([
            1 => 30000 + 1000,
                 30000 - 1000 - 2000,
                 30000        + 2000,
                 30000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testDealerRon()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player1:30000 player2:30000 player3:30000 player4:30000
                ron player1 from player2 1han 30fu (pinfu)
            ');

        $this->assertEquals([
            1 => 30000 + 1500,
                 30000 - 1500,
                 30000,
                 30000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(1, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testDealerDoubleRon()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player1:30000 player2:30000 player3:30000 player4:30000
                ron player3 from player2 1han 30fu (pinfu)
                also player1 2han 30fu (pinfu tanyao)
            ');

        $this->assertEquals([
            1 => 30000 + 2900,
                 30000 - 2900 - 1000,
                 30000        + 1000,
                 30000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(1, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testRonWithRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:30000 player1:30000 player3:30000 player4:30000
                ron player1 from player2 1han 30fu (pinfu) riichi player4 player3
            ');

        $this->assertEquals([
            1 => 30000 + 1000 + 1000 + 1000,
                 30000 - 1000,
                 30000        - 1000,
                 30000               - 1000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testRonWithDoras()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:30000 player1:30000 player3:30000 player4:30000
                ron player1 from player2 3han 30fu (pinfu dora 2)
            ');

        $this->assertEquals([
            1 => 30000 + 3900,
                 30000 - 3900,
                 30000,
                 30000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    /**
     * @expectedException \Mimir\TokenizerException
     * @expectedExceptionCode 108
     */
    public function testInvalidRonNoLoser()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                ron player1 1han 30fu riichi (pinfu) player4 player3
            ');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 104
     */
    public function testInvalidRonMistypedWinner()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                ron mistyped from player2 1han 30fu (pinfu) riichi player4 player3
            ');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 105
     */
    public function testInvalidRonMistypedLoser()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                ron player1 from mistyped 1han 30fu (pinfu) riichi player4 player3
            ');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 107
     */
    public function testInvalidRonMistypedRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                ron player1 from player2 1han 30fu (pinfu) riichi mistyped player3
            ');
    }

    /**
     * @expectedException \Mimir\TokenizerException
     * @expectedExceptionCode 108
     */
    public function testInvalidRonWrongRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                ron player1 from player2 1han 30fu (pinfu) reachi player4 player3
            ');
    }

    public function testBasicTsumo()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                tsumo player1 1han 30fu (pinfu)
            ');

        $this->assertEquals([
            1 => 30000 + 1100,
                 30000 - 500,
                 30000 - 300,
                 30000 - 300,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testDealerTsumo()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player1:23200 player2:23300 player3:43000 player4:12000
                tsumo player1 1han 30fu (pinfu)
            ');

        $this->assertEquals([
            1 => 30000 + 1500,
                 30000 - 500,
                 30000 - 500,
                 30000 - 500,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(1, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testTsumoWithRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                tsumo player1 1han 30fu (pinfu) riichi player3 player4
            ');

        $this->assertEquals([
            1 => 30000 + 1100 + 1000 + 1000,
                 30000 - 500,
                 30000 - 300  - 1000,
                 30000 - 300         - 1000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 104
     */
    public function testInvalidTsumoMistypedWinner()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                tsumo mistyped 1han 30fu (pinfu) riichi player4 player3
            ');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 107
     */
    public function testInvalidTsumoMistypedRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                tsumo player1 1han 30fu (pinfu) riichi mistyped player3
            ');
    }

    /**
     * @expectedException \Mimir\TokenizerException
     * @expectedExceptionCode 108
     */
    public function testInvalidTsumoWrongRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                tsumo player1 1han 30fu (pinfu) reachi player4 player3
            ');
    }

    public function testBasicDraw()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai player1 player3
            ');

        $this->assertEquals([
            1 => 30000 + 1500,
                 30000 - 1500,
                 30000 + 1500,
                 30000 - 1500,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testDealerTempaiDraw()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai player2
            ');

        $this->assertEquals([
            1 => 30000 - 1000,
                 30000 + 3000,
                 30000 - 1000,
                 30000 - 1000,
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(1, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('2', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testDrawTempaiAll()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai all
            ');

        $this->assertEquals([
            1 => 30000, 30000, 30000, 30000
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(1, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('2', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testDrawTempaiNone()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai nobody
            ');

        $this->assertEquals([
            1 => 30000, 30000, 30000, 30000
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
    }

    public function testDrawWithRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai all riichi player3 player4
            ');

        $this->assertEquals([
            1 => 30000,
                 30000,
                 30000 - 1000,
                 30000 - 1000
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(1, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(1, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('2', $this->_session->getCurrentState()->getCurrentDealer());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRiichiBets());
    }

    /**
     * @expectedException \Mimir\TokenizerException
     * @expectedExceptionCode 108
     */
    public function testInvalidDrawNoTempaiList()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw all riichi player1 player3
            ');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 117
     */
    public function testInvalidDrawMistypedTempai()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai mistyped player3
            ');
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 107
     */
    public function testInvalidDrawMistypedRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai all riichi mistyped player3
            ');
    }

    /**
     * @expectedException \Mimir\TokenizerException
     * @expectedExceptionCode 108
     */
    public function testInvalidDrawWrongRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai all reachi player4 player3
            ');
    }

    public function testWinAfterDrawWithRiichi()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                draw tempai all riichi player3 player4
                ron player4 from player3 1han 30fu (pinfu)
            ');

        $this->assertEquals([
            1 => 30000,
                 30000,
                 30000 - 1000 - 1000 - 300, // 300 for honba
                 30000 - 1000 + 1000 + 300 + 2000 // 2000 riichi from prev round
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(2, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('1', $this->_session->getCurrentState()->getCurrentDealer());
        $this->assertEquals(0, $this->_session->getCurrentState()->getRiichiBets());
    }

    public function testBasicChombo()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                chombo player1
            ');

        $this->assertEquals([
            1 => 30000, // no extra payments in ema rules
                 30000,
                 30000,
                 30000
        ], $this->_session->getCurrentState()->getScores());

        $this->assertEquals(0, $this->_session->getCurrentState()->getHonba());
        $this->assertEquals(1, $this->_session->getCurrentState()->getRound());
        $this->assertEquals('2', $this->_session->getCurrentState()->getCurrentDealer());
        $this->assertEquals(0, $this->_session->getCurrentState()->getRiichiBets());
        $this->assertEquals([1 => -20000], $this->_session->getCurrentState()->getPenalties());
    }

    /**
     * @expectedException \Mimir\ParseException
     * @expectedExceptionCode 104
     */
    public function testInvalidChomboMistyped()
    {
        (new TextlogParser($this->_db))
            ->parseToSession($this->_session, '
                player2:23200 player1:23300 player3:43000 player4:12000
                chombo mistyped
            ');
    }
}
