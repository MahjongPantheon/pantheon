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

use Common\EndingPolicy;
use Common\Uma;
use Common\UmaType;

require_once __DIR__ . '/../../src/Ruleset.php';
require_once __DIR__ . '/../../src/primitives/SessionResults.php';
require_once __DIR__ . '/../../src/primitives/Event.php';
require_once __DIR__ . '/../../src/primitives/Round.php';
require_once __DIR__ . '/../../src/primitives/Session.php';
require_once __DIR__ . '/../../src/primitives/Player.php';
require_once __DIR__ . '/../../src/Db.php';

class SessionResultsPrimitiveTest extends \PHPUnit\Framework\TestCase
{
    /**
     * @var DataSource
     */
    protected $_ds;
    /**
     * @var EventPrimitive
     */
    protected $_event;
    /**
     * @var PlayerPrimitive[]
     */
    protected $_players;
    /**
     * @var PlayerRegistrationPrimitive[]
     */
    protected $_regs;
    /**
     * @var SessionPrimitive
     */
    protected $_session;
    /**
     * @var \Common\Ruleset
     */
    protected $_ruleset;

    protected function setUp(): void
    {
        $this->_ds = DataSource::__getCleanTestingInstance();

        $this->_ruleset = \Common\Ruleset::instance('ema');
        $this->_ruleset->rules()
            ->setWithButtobi(false)
            ->setStartRating(0)
            ->setRiichiGoesToWinner(false)
            ->setTonpuusen(false)
            ->setEndingPolicy(EndingPolicy::ENDING_POLICY_EP_UNSPECIFIED)
            ->setWithLeadingDealerGameOver(true)
            ->setStartPoints(30000)
            ->setUmaType(UmaType::UMA_TYPE_UMA_SIMPLE)
            ->setUma((new Uma())
                ->setPlace1(15000)
                ->setPlace2(5000)
                ->setPlace3(-5000)
                ->setPlace4(-15000))
            ->setOka(0)
            ->setHonbaValue(300)
            ->setChomboAmount(20000)
            ->setEqualizeUma(false)
            ->setReplacementPlayerOverrideUma(0)
            ->setReplacementPlayerFixedPoints(-30000);

        $this->_event = (new EventPrimitive($this->_ds))
            ->setTitle('title')
            ->setDescription('desc')
            ->setTimezone('UTC')
            ->setRulesetConfig($this->_ruleset);
        $this->_event->save();

        $this->_players = PlayerPrimitive::findById($this->_ds, [1, 2, 3, 4]);
        foreach ($this->_players as $p) {
            $this->_regs[$p->getId()] = (new PlayerRegistrationPrimitive($this->_ds))
                ->setReg($p, $this->_event);
            $this->_regs[$p->getId()]->save();
        }

        $this->_session = (new SessionPrimitive($this->_ds))
            ->setEvent($this->_event)
            ->setPlayers($this->_players)
            ->setStatus(SessionPrimitive::STATUS_INPROGRESS);
        $this->_session->save();
    }

    public function testSinglePlayerResults()
    {
        $result = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[1])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result->save();

        $this->assertEquals(30000, $result->getScore());
    }

    public function testReplacementPlayerRatingDelta()
    {
        $player = $this->_players[0];
        $this->_regs[$player->getId()]->setReplacementPlayerId(true);
        $this->_regs[$player->getId()]->save();
        $this->_session->getCurrentState()->setReplacements([$player->getId() => true]);
        $this->_session->save();

        $result = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($player)
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result->save();

        $this->assertEquals(-30000, $result->getRatingDelta());

        // cleanup for following tests
        $this->_session->getCurrentState()->setReplacements([]);
        $this->_session->save();
    }

    public function testUmaRule()
    {
        $result = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[1])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result->save();

        $this->assertEquals(5000, $result->getRatingDelta());
    }

    public function testOkaRule()
    {
        $this->_ruleset->rules()->setStartPoints(25000);
        $this->_ruleset->rules()->setOka(20000);

        $result = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[0])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result->save();

        $this->assertEquals(30000, $result->getRatingDelta());

        $result = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[1])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result->save();

        // oka = 20, means everybody pay 5 points, so final score of 2nd player will be
        // ((25000 - 25000) / 1000) + 5 (for 2nd place) - 5 (for oka) = 0
        $this->assertEquals(0, $result->getRatingDelta());
    }

    public function testFourEqualScore()
    {
        $round = (new RoundPrimitive($this->_ds))
            ->setOutcome('draw')
            ->setSession($this->_session)
            ->setRoundIndex(1)
            ->setTempaiUsers([$this->_players[0], $this->_players[1], $this->_players[2], $this->_players[3]])
            ->setRiichiUsers([]);
        $round->save();
        $this->_session->updateCurrentState($round);

        $result1 = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[0])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result1->save();

        $result2 = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[1])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result2->save();

        $result3 = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[2])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result3->save();

        $result4 = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[3])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result4->save();

        $this->assertEquals(count(array_unique([
            $result1->getScore(),
            $result2->getScore(),
            $result3->getScore(),
            $result4->getScore()
        ])), 1);

        $this->assertEquals(15000, $result1->getRatingDelta()); // 1st place
        $this->assertEquals(5000, $result2->getRatingDelta()); // 2nd place
        $this->assertEquals(-5000, $result3->getRatingDelta()); // 3nd place
        $this->assertEquals(-15000, $result4->getRatingDelta()); // 4th place
    }

    public function testTwoEqualScoreWithEqualityRule()
    {
        $this->_ruleset = \Common\Ruleset::instance('ema');
        $this->_event->setRulesetConfig($this->_ruleset)->save();

        $round = (new RoundPrimitive($this->_ds))
            ->setOutcome('draw')
            ->setSession($this->_session)
            ->setRoundIndex(1)
            ->setTempaiUsers([$this->_players[1], $this->_players[2]])
            ->setRiichiUsers([]);
        $round->save();
        $this->_session->updateCurrentState($round);

        $result1 = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[1])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result1->save();

        $result2 = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[2])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result2->save();

        $this->assertEquals($result1->getScore(), $result2->getScore());
        $this->assertEquals($result1->getRatingDelta(), $result2->getRatingDelta());
        $this->assertEquals(31500, $result1->getScore());
        $this->assertEquals(11500, $result2->getRatingDelta());
    }

    public function testChombo()
    {
        $this->_ruleset->rules()->setExtraChomboPayments(false);
        $round = (new RoundPrimitive($this->_ds))
            ->setOutcome('chombo')
            ->setSession($this->_session)
            ->setLoser($this->_players[1])
            ->setRoundIndex(1);
        $round->save();
        $this->_session->updateCurrentState($round);

        $result1 = (new SessionResultsPrimitive($this->_ds))
            ->setPlayer($this->_players[1])
            ->setSession($this->_session)
            ->calc(
                $this->_session->getEvent()->getRulesetConfig(),
                $this->_session->getCurrentState(),
                $this->_session->getPlayersIds()
            );
        $result1->save();

        $this->assertEquals(30000, $result1->getScore());
        $this->assertEquals(-15000, $result1->getRatingDelta()); // 2nd place = uma +5 + chombo -20
    }
}
