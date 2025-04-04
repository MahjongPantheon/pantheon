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

use Common\RoundOutcome;

require_once __DIR__ . '/PointsCalc.php';

/**
 * Class SessionState
 *
 * Low-level model helper
 * @package Mimir
 */
class SessionState
{
    /**
     * @var \Common\Ruleset
     */
    protected $_rules;
    /**
     * @var int[] { player_id => score }
     */
    protected $_scores = [];
    /**
     * @var int[] { player_id => chip }
     */
    protected $_chips = [];
    /**
     * @var float[] { player_id => chombo_amount }
     */
    protected $_chombo = [];
    /**
     * @var int
     */
    protected $_round = 1; // 1e-4s
    /**
     * @var int
     */
    protected $_honba = 0;
    /**
     * Count of riichi bets on table from previous rounds
     * @var int
     */
    protected $_riichiBets = 0;
    /**
     * True if game has been finished prematurely (e.g. by timeout)
     * @var boolean
     */
    protected $_prematurelyFinished = false;
    /**
     * True if round has just changed useful to determine if current 4e or
     * 4s is first one, no matter what honba count is.
     * (Possible situation: draw in 3s or 3e, so first 4e or 4s has honba).
     * @var boolean
     */
    protected $_roundJustChanged = true;
    /**
     * True if ending policy is "oneMoreHand" AND this last hand was started.
     * @var boolean
     */
    protected $_lastHandStarted = false;
    /**
     * Outcome of previously recorded round. Useful to determine if certain rules
     * should be applied in current case, e.g., agariyame should not be applied on
     * chombo or abortive draw.
     * @var string|null
     */
    protected $_lastOutcome = null;
    /**
     * If player has yakitori indicator
     * @var array
     */
    protected $_yakitori = [];
    /**
     * Saved current replacements for proper recalculations
     * @var array
     */
    protected $_replacements = [];

    /**
     * SessionState constructor.
     * @param \Common\Ruleset $rules
     * @param int[] $playersIds
     * @throws InvalidParametersException
     */
    public function __construct(\Common\Ruleset $rules, array $playersIds)
    {
        $this->_rules = $rules;
        if (count($playersIds) != 4) {
            throw new InvalidParametersException('Players count is not 4: ' . json_encode($playersIds));
        }
        $sc = array_combine(
            $playersIds,
            array_fill(0, 4, $rules->rules()->getStartPoints())
        );
        $this->_scores = $sc;
    }

    /**
     * @throws InvalidParametersException
     * @return string|false
     */
    public function toJson()
    {
        return json_encode($this->toArray());
    }

    /**
     * @throws InvalidParametersException
     * @return array
     */
    public function toArray()
    {
        $arr = [];
        $withChips = $this->_rules->rules()->getChipsValue() > 0;
        foreach ($this as $key => $value) { // @phpstan-ignore-line
            if ($key === '_rules') {
                continue;
            }
            if ($key === '_chips' && !$withChips) {
                continue;
            }
            if (!is_scalar($value) && !is_array($value) && !is_null($value)) {
                throw new InvalidParametersException('No objects/functions allowed in session state');
            }
            $arr[$key] = $value;
        }
        $arr['_isFinished'] = $this->isFinished();
        return $arr;
    }

    /**
     * @param \Common\Ruleset $rules
     * @param int[] $playersIds
     * @param string $json
     *
     * @return SessionState
     * @throws InvalidParametersException
     *
     */
    public static function fromJson(\Common\Ruleset $rules, array $playersIds, string $json)
    {
        if (empty($json)) {
            $ret = [];
        } else {
            $ret = json_decode($json, true);
            if (json_last_error() !== 0) {
                throw new InvalidParametersException(json_last_error_msg());
            }
        }
        $instance = new self($rules, $playersIds);

        foreach ($ret as $key => $value) {
            if ($key === '_isFinished') { // deprecated field, left for compatibility
                continue;
            }
            $instance->$key = $value;
        }

        return $instance;
    }

    /**
     * @return bool
     */
    protected function _buttobi()
    {
        $scores = array_values($this->getScores());
        return $scores[0] < 0 || $scores[1] < 0 || $scores[2] < 0 || $scores[3] < 0;
    }

    /**
     * @return bool
     */
    protected function _dealerIsLeaderOnOorasu()
    {
        if ($this->_lastOutcome == 'chombo' || $this->_lastOutcome == 'abort') {
            return false; // chombo or abortive draw should not finish game
        }

        if ($this->_roundJustChanged) {
            return false; // should play last round at least once!
        }

        if ($this->getRound() !== ($this->_rules->rules()->getTonpuusen() ? 4 : 8)) {
            return false; // not oorasu
        }

        $scores = array_values($this->getScores());
        $dealerScores = end($scores);
        return ($dealerScores === max($scores) && $dealerScores >= $this->_rules->rules()->getGoalPoints());
    }

    /**
     * @return bool
     */
    protected function _lastPossibleRoundWasPlayed()
    {
        $roundsCount = $this->_rules->rules()->getTonpuusen() ? 4 : 8;

        if ($this->getRound() <= $roundsCount) {
            return false;
        }

        if ($this->_lastOutcome == 'chombo') {
            return false; // chombo should not finish game
        }

        $additionalRounds = $this->_rules->rules()->getPlayAdditionalRounds() ? 4 : 0;
        $maxPossibleRound = $roundsCount + $additionalRounds;
        if ($this->getRound() > $maxPossibleRound) {
            return true;
        }

        $scores = array_values($this->getScores());
        return max($scores) >= $this->_rules->rules()->getGoalPoints();
    }

    /**
     * End game prematurely
     *
     * @return self
     */
    public function forceFinish(): self
    {
        $this->_prematurelyFinished = true;
        return $this;
    }

    /**
     * @return bool
     */
    public function isFinished()
    {
        return $this->_lastPossibleRoundWasPlayed()
            || $this->_prematurelyFinished
            || ($this->_rules->rules()->getWithButtobi() && $this->_buttobi())
            || ($this->_rules->rules()->getWithLeadingDealerGameOver() && $this->_dealerIsLeaderOnOorasu())
            ;
    }

    /**
     * @return SessionState
     */
    protected function _addHonba()
    {
        $this->_honba++;
        return $this;
    }

    /**
     * @return SessionState
     */
    protected function _resetHonba()
    {
        $this->_honba = 0;
        return $this;
    }

    /**
     * @return int
     */
    public function getHonba()
    {
        return $this->_honba;
    }

    /**
     * @param int $riichiBets
     * @return SessionState
     */
    protected function _addRiichiBets($riichiBets)
    {
        $this->_riichiBets += $riichiBets;
        return $this;
    }

    /**
     * @return SessionState
     */
    protected function _resetRiichiBets()
    {
        $this->_riichiBets = 0;
        return $this;
    }

    /**
     * @return int
     */
    public function getRiichiBets()
    {
        return $this->_riichiBets;
    }

    /**
     * @return SessionState
     */
    protected function _nextRound()
    {
        $this->_round++;
        return $this;
    }

    /**
     * @return int
     */
    public function getRound()
    {
        return $this->_round;
    }

    /**
     * @return int[]
     */
    public function getScores()
    {
        return $this->_scores;
    }

    /**
     * @param array $scores
     * @return SessionState
     */
    public function setScores(array $scores)
    {
        $this->_scores = $scores;
        return $this;
    }

    /**
     * @return array
     */
    public function getReplacements()
    {
        return $this->_replacements;
    }

    /**
     * @param array $replacements
     * @return SessionState
     */
    public function setReplacements(array $replacements)
    {
        $this->_replacements = $replacements;
        return $this;
    }

    /**
     * @return bool[]
     */
    public function getYakitori()
    {
        return $this->_yakitori;
    }

    /**
     * @param array $yakitori
     * @return SessionState
     */
    public function setYakitori(array $yakitori)
    {
        $this->_yakitori = $yakitori;
        return $this;
    }

    /**
     * @return int[]
     */
    public function getChips()
    {
        return $this->_chips;
    }

    /**
     * @param int[] $chips
     * @return SessionState
     */
    public function setChips($chips)
    {
        $this->_chips = $chips;
        return $this;
    }

    /**
     * @return float[]
     */
    public function getChombo()
    {
        return $this->_chombo;
    }

    /**
     * Return id of current dealer
     * @return int
     */
    public function getCurrentDealer()
    {
        $players = array_keys($this->_scores);
        return intval($players[($this->_round - 1) % 4]);
    }

    /**
     * Register new round in current session
     * @param RoundPrimitive|MultiRoundPrimitive $round
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array
     */
    public function update(RoundPrimitive $round)
    {
        $lastRoundIndex = $this->getRound();
        switch ($round->getOutcome()) {
            case 'ron':
                $payments = $this->_updateAfterRon($round);
                break;
            case 'multiron':
                /** @var MultiRoundPrimitive $mround */
                $mround = $round;
                $payments = $this->_updateAfterMultiRon($mround);
                break;
            case 'tsumo':
                $payments = $this->_updateAfterTsumo($round);
                break;
            case 'draw':
                $payments = $this->_updateAfterDraw($round);
                break;
            case 'abort':
                $payments = $this->_updateAfterAbort($round);
                break;
            case 'chombo':
                $payments = $this->_updateAfterChombo($round);
                break;
            case 'nagashi':
                $payments = $this->_updateAfterNagashi($round);
                break;
            default:
                throw new InvalidParametersException('wrong outcome passed');
        }

        $this->_updateYakitori($round);
        $this->_roundJustChanged = ($lastRoundIndex != $this->getRound());
        $this->_lastOutcome = $round->getOutcome();
        return $payments; // for dry run
    }

    /**
     * @param int|null $id
     * @param int $betAmount - total points amount gathered as riichi bets. May be fractional (of 1000)!
     *
     * @return void
     */
    public function giveRiichiBetsToPlayer($id, int $betAmount): void
    {
        $this->_scores[$id] += $betAmount;
    }

    /**
     * @param RoundPrimitive $round
     * @throws \Exception
     * @return array
     */
    protected function _updateAfterRon(RoundPrimitive $round)
    {
        $isDealer = $this->getCurrentDealer() == $round->getWinnerId();

        $this->_scores = PointsCalc::ron(
            $this->_rules,
            $isDealer,
            $this->getScores(),
            $round->getWinnerId(),
            $round->getLoserId(),
            $round->getHan(),
            $round->getFu(),
            $round->getRiichiIds(),
            $this->getHonba(),
            $this->getRiichiBets(),
            $round->getPaoPlayerId()
        );

        if ($isDealer && !$this->_rules->rules()->getWithWinningDealerHonbaSkipped()) {
            $this->_addHonba();
        } else {
            $this->_resetHonba()
                ->_nextRound();
        }

        $this->_resetRiichiBets();
        return PointsCalc::lastPaymentsInfo();
    }

    /**
     * @param MultiRoundPrimitive $round
     * @throws InvalidParametersException
     * @return array
     */
    protected function _updateAfterMultiRon(MultiRoundPrimitive $round)
    {
        $riichiWinners = PointsCalc::assignRiichiBets(
            $round->rounds(),
            $round->getLoserId(),
            $this->getRiichiBets(),
            $this->getHonba(),
            $round->getSession()
        );

        $totalRiichiInRound = 0;
        foreach ($riichiWinners as $x) {
            $totalRiichiInRound += count($x['from_players']);
        }

        $dealerWon = false;
        PointsCalc::resetPaymentsInfo();
        $payments = PointsCalc::lastPaymentsInfo();
        foreach ($round->rounds() as $roundItem) {
            $dealerWon = $dealerWon || $this->getCurrentDealer() == $roundItem->getWinnerId();
            $this->_scores = PointsCalc::ron(
                $this->_rules,
                $this->getCurrentDealer() == $roundItem->getWinnerId(),
                $this->getScores(),
                $roundItem->getWinnerId(),
                $roundItem->getLoserId(),
                $roundItem->getHan(),
                $roundItem->getFu(),
                $riichiWinners[$roundItem->getWinnerId()]['from_players'],
                $riichiWinners[$roundItem->getWinnerId()]['honba'],
                $riichiWinners[$roundItem->getWinnerId()]['from_table'],
                $roundItem->getPaoPlayerId(),
                $riichiWinners[$roundItem->getWinnerId()]['closest_winner'],
                $totalRiichiInRound
            );
            $payments = array_merge_recursive($payments, PointsCalc::lastPaymentsInfo());
        }

        if ($dealerWon && !$this->_rules->rules()->getWithWinningDealerHonbaSkipped()) {
            $this->_addHonba();
        } else {
            $this->_resetHonba()
                ->_nextRound();
        }

        $this->_resetRiichiBets();
        return $payments;
    }

    /**
     * @param RoundPrimitive $round
     * @throws \Exception
     * @return array
     */
    protected function _updateAfterTsumo(RoundPrimitive $round)
    {
        $this->_scores = PointsCalc::tsumo(
            $this->_rules,
            $this->getCurrentDealer(),
            $this->getScores(),
            $round->getWinnerId(),
            $round->getHan(),
            $round->getFu(),
            $round->getRiichiIds(),
            $this->getHonba(),
            $this->getRiichiBets(),
            $round->getPaoPlayerId()
        );

        if ($this->getCurrentDealer() == $round->getWinnerId() && !$this->_rules->rules()->getWithWinningDealerHonbaSkipped()) {
            $this->_addHonba();
        } else {
            $this->_resetHonba()
                ->_nextRound();
        }

        $this->_resetRiichiBets();
        return PointsCalc::lastPaymentsInfo();
    }

    /**
     * @param RoundPrimitive $round
     * @throws \Exception
     * @return array
     */
    protected function _updateAfterDraw(RoundPrimitive $round)
    {
        $this->_scores = PointsCalc::draw(
            $this->getScores(),
            $round->getTempaiIds(),
            $round->getRiichiIds()
        );

        $this->_addHonba()
            ->_addRiichiBets(count($round->getRiichiIds()));

        if (!in_array($this->getCurrentDealer(), $round->getTempaiIds()) || $this->_rules->rules()->getWithWinningDealerHonbaSkipped()) {
            $this->_nextRound();
        }

        return PointsCalc::lastPaymentsInfo();
    }

    /**
     * @param RoundPrimitive $round
     * @throws InvalidParametersException
     * @return array
     */
    protected function _updateAfterAbort(RoundPrimitive $round)
    {
        if (!$this->_rules->rules()->getWithAbortives()) {
            throw new InvalidParametersException('Current game rules do not allow abortive draws');
        }

        $this->_scores = PointsCalc::abort(
            $this->getScores(),
            $round->getRiichiIds()
        );

        $this->_addHonba()
            ->_addRiichiBets(count($round->getRiichiIds()));
        return PointsCalc::lastPaymentsInfo();
    }

    /**
     * @param RoundPrimitive $round
     * @throws \Exception
     * @return array
     */
    protected function _updateAfterChombo(RoundPrimitive $round)
    {
        $this->_scores = PointsCalc::chombo(
            $this->_rules,
            $this->getCurrentDealer(),
            $round->getLoserId(),
            $this->getScores()
        );

        if (empty($this->_chombo[$round->getLoserId()])) {
            $this->_chombo[$round->getLoserId()] = 0;
        }
        $this->_chombo[$round->getLoserId()] -= $this->_rules->rules()->getChomboAmount();
        return PointsCalc::lastPaymentsInfo();
    }

    /**
     * @param RoundPrimitive $round
     * @throws \Exception
     * @return array
     */
    protected function _updateAfterNagashi(RoundPrimitive $round)
    {
        $this->_scores = PointsCalc::nagashi(
            $this->getScores(),
            $this->getCurrentDealer(),
            $round->getRiichiIds(),
            $round->getNagashiIds()
        );

        $this->_addHonba()
            ->_addRiichiBets(count($round->getRiichiIds()));

        if (!in_array($this->getCurrentDealer(), $round->getTempaiIds())) {
            $this->_nextRound();
        }
        return PointsCalc::lastPaymentsInfo();
    }

    /**
     * @param RoundPrimitive $round
     * @return void
     */
    protected function _updateYakitori(RoundPrimitive $round)
    {
        if ($this->_rules->rules()->getWithYakitori()) {
            if ($round instanceof MultiRoundPrimitive) {
                foreach ($round->rounds() as $r) {
                    if ($r->getWinnerId()) {
                        $this->_yakitori[$r->getWinnerId()] = false;
                    }
                }
            } else {
                if ($round->getWinnerId()) {
                    $this->_yakitori[$round->getWinnerId()] = false;
                }
            }
        }
    }

    /**
     * @return boolean
     */
    public function lastHandStarted()
    {
        return $this->_lastHandStarted;
    }

    /**
     * @param bool $state
     * @return $this
     */
    public function setLastHandStarted($state = true)
    {
        $this->_lastHandStarted = $state;
        return $this;
    }

    /**
     * @return string|null
     */
    public function getLastOutcome()
    {
        return $this->_lastOutcome;
    }
}
