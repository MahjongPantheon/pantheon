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
namespace Riichi;

require_once __DIR__ . '/PointsCalc.php';

/**
 * Class SessionState
 *
 * Low-level model helper
 * @package Riichi
 */
class SessionState
{
    /**
     * @var Ruleset
     */
    protected $_rules;
    /**
     * @var int[] { player_id => score }
     */
    protected $_scores = [];
    /**
     * @var int[] { player_id => penalty_score }
     */
    protected $_penalties = [];
    /**
     * @var array
     */
    protected $_extraPenaltyLog = [];
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
     * True if round has just changed, useful to determine if
     * current 4e or 4s is first one, no matter what honba count is.
     * (Possible situation: draw in 3s or 3e, so first 4e or 4s has honba).
     * @var boolean
     */
    protected $_roundJustChanged = true;
    /**
     * True if timer policy refers to "yellow zone" rule AND first game in
     * yellow zone was already recorded. In fact, this is a "red zone" flag,
     * which means that hanchan will be finished when next round is recorded.
     * @var boolean
     */
    protected $_yellowZoneAlreadyPlayed = false;

    public function __construct(Ruleset $rules, $playersIds)
    {
        $this->_rules = $rules;
        if (count($playersIds) != 4) {
            throw new InvalidParametersException('Players count is not 4: ' . json_encode($playersIds));
        }
        $this->_scores = array_combine(
            $playersIds,
            array_fill(0, 4, $rules->startPoints())
        );
    }

    /**
     * @throws InvalidParametersException
     * @return string
     */
    public function toJson()
    {
        $arr = [];
        foreach ($this as $key => $value) {
            if ($key === '_rules') {
                continue;
            }
            if (!is_scalar($value) && !is_array($value)) {
                throw new InvalidParametersException('No objects/functions allowed in session state');
            }
            $arr[$key] = $value;
        }
        return json_encode($arr);
    }

    /**
     * @param Ruleset $rules
     * @param $playersIds
     * @param $json
     * @throws InvalidParametersException
     * @return SessionState
     */
    public static function fromJson(Ruleset $rules, $playersIds, $json)
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
        if ($this->_roundJustChanged) {
            return false; // should play last round at least once!
        }

        if ($this->getRound() !== ($this->_rules->tonpuusen() ? 4 : 8)) {
            return false; // not oorasu
        }

        $scores = array_values($this->getScores());
        return (end($scores) === max($scores));
    }

    /**
     * End game prematurely
     */
    public function forceFinish()
    {
        $this->_prematurelyFinished = true;
        return $this;
    }

    /**
     * @return bool
     */
    public function isFinished()
    {
        return $this->getRound() > ($this->_rules->tonpuusen() ? 4 : 8)
            || $this->_prematurelyFinished
            || ($this->_rules->withButtobi() && $this->_buttobi())
            || ($this->_rules->withLeadingDealerGameOver() && $this->_dealerIsLeaderOnOorasu())
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
     * @return \int[]
     */
    public function getScores()
    {
        return $this->_scores;
    }

    /**
     * @return \int[]
     */
    public function getPenalties()
    {
        return $this->_penalties;
    }

    /**
     * Return id of current dealer
     * @return int|string
     */
    public function getCurrentDealer()
    {
        $players = array_keys($this->_scores);
        return $players[($this->_round - 1) % 4];
    }

    /**
     * Register new round in current session
     * @param RoundPrimitive|MultiRoundPrimitive $round
     * @throws InvalidParametersException
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
                $payments = $this->_updateAfterMultiRon($round);
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
            default:
                ;
        }

        $this->_roundJustChanged = ($lastRoundIndex != $this->getRound());
        return $payments; // for dry run
    }

    public function giveRiichiBetsToPlayer($id)
    {
        $this->_scores[$id] += $this->getRiichiBets() * 1000;
    }

    /**
     * @param RoundPrimitive $round
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
            $this->getRiichiBets()
        );

        if ($isDealer) {
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
                $riichiWinners[$roundItem->getWinnerId()]['from_table']
            );
            $payments = array_merge_recursive($payments, PointsCalc::lastPaymentsInfo());
        }

        if ($dealerWon) {
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
            $this->getRiichiBets()
        );

        if ($this->getCurrentDealer() == $round->getWinnerId()) {
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

        if (!in_array($this->getCurrentDealer(), $round->getTempaiIds())) {
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
        if (!$this->_rules->withAbortives()) {
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

        if (empty($this->_penalties[$round->getLoserId()])) {
            $this->_penalties[$round->getLoserId()] = 0;
        }
        $this->_penalties[$round->getLoserId()] -= $this->_rules->chomboPenalty();
        return PointsCalc::lastPaymentsInfo();
    }

    /**
     * Add extra penalty points for player in current game
     * Used for penalties that are not related to main game process. Do not use this to apply chombo!
     *
     * @param $playerId
     * @param $amount
     * @param $reason
     */
    public function addPenalty($playerId, $amount, $reason)
    {
        if (empty($this->_penalties[$playerId])) {
            $this->_penalties[$playerId] = 0;
        }
        $this->_penalties[$playerId] -= $amount;
        $this->_extraPenaltyLog []= [
            'who' => $playerId,
            'amount' => $amount,
            'reason' => $reason
        ];
    }

    /**
     * @return array
     */
    public function getPenaltiesLog()
    {
        return $this->_extraPenaltyLog;
    }

    /**
     * @return boolean
     */
    public function yellowZoneAlreadyPlayed()
    {
        return $this->_yellowZoneAlreadyPlayed;
    }

    /**
     * @param bool $state
     * @return $this
     */
    public function setYellowZonePlayed($state = true)
    {
        $this->_yellowZoneAlreadyPlayed = $state;
        return $this;
    }
}
