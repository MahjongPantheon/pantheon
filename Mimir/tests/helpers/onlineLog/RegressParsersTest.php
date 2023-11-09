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

namespace helpers\onlineLog;

use Mimir\DataSource;
use Mimir\EventPrimitive;
use Mimir\OnlineParser;
use Mimir\PlayerPrimitive;
use Mimir\PlayerRegistrationPrimitive;
use Mimir\RoundPrimitive;
use Mimir\SessionPrimitive;
use Mimir\Tenhou6OnlineParser;

require_once __DIR__ . '/../../../src/Db.php';
require_once __DIR__ . '/../../../src/helpers/onlineLog/Parser.php';
require_once __DIR__ . '/../../../src/helpers/onlineLog/Tenhou6OnlineParser.php';
require_once __DIR__ . '/../../../src/primitives/PlayerRegistration.php';
require_once __DIR__ . '/../../../src/primitives/PlayerStats.php';

/**
 * Replay regress parsers integration test suite
 *
 * @package Mimir
 * @Author Steven Vch. <unstatik@staremax.com>
 */
class RegressParsersTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
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

    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();

        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setTimezone('UTC')
            ->setDescription('desc')
            ->setLobbyId('0')
            ->setRulesetConfig(\Common\Ruleset::instance('tenhounet'));
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3, 4]);
        foreach ($this->_players as $p) {
            (new PlayerRegistrationPrimitive($this->_ds))
                ->setReg($p, $this->_event)
                ->save();
        }

        $this->_session = (new SessionPrimitive($this->_ds))
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS)
            ->setReplayHash('');
        $this->_session->save();
    }

    public function testRegress()
    {
        $contentXml = file_get_contents(__DIR__ . '/testdata/regress/hanchan.xml');
        list($successXmlParser, $resultsXmlParser, $roundsXmlParser) = (new OnlineParser($this->_ds))
            ->parseToSession($this->_session, $contentXml);

        $this->setUp();
        $contentJson = file_get_contents(__DIR__ . '/testdata/regress/hanchan.json');
        $this->_session->setReplayHash("2023100200gm-0029-0000-bbdb64ce");
        list($successJsonParser, $resultsJsonParser, $roundsJsonParser) = (new Tenhou6OnlineParser($this->_ds))
            ->parseToSession($this->_session, $contentJson);

        $this->assertEquals($successXmlParser, $successJsonParser);
        $this->assertEquals($resultsXmlParser, $resultsJsonParser);
        $this->assertEquals(count($roundsXmlParser), count($roundsJsonParser));
        for ($i = 0; $i < count($roundsXmlParser); $i++) {
            $this->checkRounds($roundsXmlParser[$i], $roundsJsonParser[$i]);
        }
    }

    protected function checkRounds(RoundPrimitive $expected, RoundPrimitive $actual): void
    {
        $this->assertEquals($expected->getId(), $actual->getId());
        $this->assertEquals($expected->getSessionId(), $actual->getSessionId());
        $this->assertEquals($expected->getEventId(), $actual->getEventId());
        $this->assertEquals($expected->getOutcome(), $actual->getOutcome());
        $this->assertEquals($expected->getWinnerId(), $actual->getWinnerId());
        $this->assertEquals($expected->getLoserId(), $actual->getLoserId());
        $this->assertEquals($expected->getPaoPlayerId(), $actual->getPaoPlayerId());
        $this->assertEquals($expected->getHan(), $actual->getHan());

        //avoid check fu for mangan, baiman, haneman, sanbaiman and yakuman
        if ($expected->getHan() < 5 && $expected->getHan() > 0) {
            $this->assertEquals($expected->getFu(), $actual->getFu());
        }

        $this->assertEquals($expected->getRoundIndex(), $actual->getRoundIndex());
        $this->assertEquals($expected->getTempaiIds(), $actual->getTempaiIds());
        $this->assertEquals($expected->getNagashiIds(), $actual->getNagashiIds());
        $this->assertEquals($expected->getYaku(), $actual->getYaku());
        $this->assertEquals($expected->getDora(), $actual->getDora());
        $this->assertEquals($expected->getUradora(), $actual->getUradora());
        $this->assertEquals($expected->getKandora(), $actual->getKandora());
        $this->assertEquals($expected->getKanuradora(), $actual->getKanuradora());
        $this->assertEquals(0, count(array_diff($expected->getRiichiIds(), $actual->getRiichiIds())));
        $this->assertEquals($expected->getOpenHand(), $actual->getOpenHand());
    }
}
