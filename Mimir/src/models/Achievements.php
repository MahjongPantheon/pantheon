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

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Achievements.php';
require_once __DIR__ . '/../primitives/Round.php';

class AchievementsModel extends Model
{
    /**
     * @var SessionPrimitive[]
     */
    protected $_games;

    /**
     * @var array
     */
    protected $_players;

    /**
     * Key: session id, value: RoundPrimitive[]
     * @var RoundPrimitive[][]
     */
    protected $_rounds;

    /**
     * Players statistics for won, lose and stolen riichi bets
     * @var array
     */
    protected $_riichiStat;

    /**
     * Get achievements list
     * @throws AuthFailedException
     * @throws \Exception
     * @param $eventIdList
     * @return array
     */
    public function getAchievements($eventIdList)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to view achievements');
        }

        $this->_games = $this->_getGames($eventIdList);
        $this->_players = $this->_getPlayers($this->_games);

        $sessionIds = array_map(function (SessionPrimitive $el) {
            return $el->getId();
        }, $this->_games);

        $this->_rounds = $this->_getRounds($sessionIds);
        $this->_riichiStat = $this->_calcRiichiStat($this->_games, $this->_players, $this->_rounds);

        return [
            'bestHand' => AchievementsPrimitive::getBestHandOfEvent($this->_db, $eventIdList),
            'bestTsumoist' => AchievementsPrimitive::getBestTsumoistInSingleSession($this->_db, $eventIdList),
            'braveSapper' => AchievementsPrimitive::getBraveSappers($this->_db, $eventIdList),
            'dieHard' => AchievementsPrimitive::getDieHardData($this->_db, $eventIdList),
            'dovakin' => AchievementsPrimitive::getDovakins($this->_db, $eventIdList),
            'yakuman' => AchievementsPrimitive::getYakumans($this->_db, $eventIdList),
            'shithander' => AchievementsPrimitive::getBestShithander($this->_db, $eventIdList),
            'bestDealer' => AchievementsPrimitive::getBestDealer($this->_db, $eventIdList),
            'bestFu' => AchievementsPrimitive::getMaxFuHand($this->_db, $eventIdList),
            'impossibleWait' => AchievementsPrimitive::getImpossibleWait($this->_db, $eventIdList),
            'honoredDonor' => $this->_getHonoredDonor(),
            'justAsPlanned' => AchievementsPrimitive::getJustAsPlanned($this->_db, $eventIdList),
            'carefulPlanning' => $this->_getMinFeedsScore(),
            'doraLord' => AchievementsPrimitive::getMaxAverageDoraCount($this->_db, $eventIdList),
            'catchEmAll' => AchievementsPrimitive::getMaxDifferentYakuCount($this->_db, $eventIdList),
            'favoriteAsapinApprentice' => AchievementsPrimitive::getFavoriteAsapinApprentice($this->_db, $eventIdList),
            'andYourRiichiBet' => $this->_getMaxStolenRiichiBetsCount(),
            'covetousKnight' => $this->_getMinLostRiichiBetsCount(),
            'ninja' => AchievementsPrimitive::getNinja($this->_db, $eventIdList)
        ];
    }

    /**
     * Get players who lost largest number of points as riichi bets
     *
     * @return array
     * @throws \Exception
     */
    protected function _getHonoredDonor()
    {
        $riichiStat = $this->_riichiStat;

        uasort($riichiStat, function ($a, $b) {
            return $a['lost'] < $b['lost'] ? 1 : -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name'  => $item['name'],
                    'count'  => $item['lost'],
                ];
            },
            array_slice($riichiStat, 0, 5)
        );
    }

    /**
     * Get players who has the smallest average cost of opponents hand that player has dealt
     *
     * @return array
     * @throws \Exception
     */
    protected function _getMinFeedsScore()
    {
        $payments = [];
        foreach ($this->_games as $session) {
            $lastRound = null;
            foreach ($this->_rounds[$session->getId()] as $round) {
                if ($lastRound === null) {
                    $lastRound = $round;
                    continue;
                }

                $lastSessionState = $round->getLastSessionState();
                $payments = $this->_addLoserPayment($lastRound, $lastSessionState, $payments);
                $lastRound = $round;
            }

            $payments = $this->_addLoserPayment($lastRound, $session->getCurrentState(), $payments);
        }

        $feedsScores = [];
        foreach ($payments as $key => $value) {
            $feedsScores[$key] = $value['sum'] / $value['count'];
        }

        asort($feedsScores);
        $players = $this->_players;

        return array_map(
            function ($playerId, $feedsScore) use ($players) {
                return [
                    'name'  => $players[$playerId]['display_name'],
                    'score' => round($feedsScore)
                ];
            },
            array_slice(array_keys($feedsScores), 0, 5),
            array_slice(array_values($feedsScores), 0, 5)
        );
    }

    /**
     * Get players who collected the largest amount of other players' riichi bets during the tournament
     *
     * @return array
     * @throws \Exception
     */
    protected function _getMaxStolenRiichiBetsCount()
    {
        $riichiStat = $this->_riichiStat;

        $filteredRiichiStat = array_filter($riichiStat, function ($item) {
            return $item['stole'] > 0;
        });

        uasort($filteredRiichiStat, function ($a, $b) {
            return $a['stole'] < $b['stole'] ? 1 : -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name'  => $item['name'],
                    'count' => $item['stole'],
                ];
            },
            array_slice($filteredRiichiStat, 0, 5)
        );
    }

    /**
     * Get players with losing the smallest riichi bets count
     *
     * @return array
     * @throws \Exception
     */
    protected function _getMinLostRiichiBetsCount()
    {
        $riichiStat = $this->_riichiStat;

        uasort($riichiStat, function ($a, $b) {
            return $a['lost'] > $b['lost'] ? 1 : -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name'  => $item['name'],
                    'count'  => $item['lost'],
                ];
            },
            array_slice($riichiStat, 0, 100)
        );
    }

    /**
     * @param SessionPrimitive[] $games
     * @param array $players
     * @param RoundPrimitive[][] $rounds
     * @return array
     * @throws \Exception
     */
    protected static function _calcRiichiStat($games, $players, $rounds)
    {
        $riichiStat = [];
        foreach ($players as $playerId => $player) {
            $riichiStat[$playerId] = [
                'name'  => $player['display_name'],
                'won'   => 0,
                'lost'  => 0,
                'stole' => 0
            ];
        }

        foreach ($games as $session) {
            $rules = $session->getEvent()->getRuleset();
            if ($rules->riichiGoesToWinner()) {
                $firstPlace = array_filter($session->getSessionResults(), function (SessionResultsPrimitive $result) {
                    return $result->getPlace() === 1;
                });

                $firstPlacePlayerId = array_values($firstPlace)[0]->getPlayerId();
                $riichiStat[$firstPlacePlayerId]['stole'] += $session->getCurrentState()->getRiichiBets();
            }

            foreach ($rounds[$session->getId()] as $round) {
                $riichiIds = $round->getRiichiIds();

                if (in_array($round->getOutcome(), ['ron', 'tsumo'])) {
                    $winnerId = $round->getWinnerId();

                    foreach ($riichiIds as $riichiPlayerId) {
                        if ($riichiPlayerId == $winnerId) {
                            $riichiStat[$riichiPlayerId]['won'] ++;
                        } else {
                            $riichiStat[$riichiPlayerId]['lost'] ++;
                            $riichiStat[$winnerId]['stole'] ++;
                        }
                    }

                    $riichiStat[$winnerId]['stole'] += $round->getLastSessionState()->getRiichiBets();
                }

                if (in_array($round->getOutcome(), ['draw', 'abort'])) {
                    foreach ($riichiIds as $riichiPlayerId) {
                        $riichiStat[$riichiPlayerId]['lost'] ++;
                    }
                }

                if ($round->getOutcome() == 'multiron') {
                    /** @var $round MultiRoundPrimitive */
                    $riichiIds = $round->getRiichiIds();
                    $winnerIds = $round->getWinnerIds();

                    foreach ($riichiIds as $playerId) {
                        if (!in_array($playerId, $winnerIds)) {
                            $riichiStat[$playerId]['lost'] ++;
                        }
                    }

                    $lastSessionState = $round->getLastSessionState();
                    $riichiWinners = PointsCalc::assignRiichiBets(
                        $round->rounds(),
                        $round->getLoserId(),
                        $lastSessionState->getRiichiBets(),
                        $lastSessionState->getHonba(),
                        $round->getSession()
                    );

                    foreach ($riichiWinners as $winnerId => $item) {
                        $closestWinner = $item['closest_winner'];

                        if ($rules->doubleronRiichiAtamahane() && $closestWinner) {
                            if ($closestWinner == $winnerId) {
                                if (in_array($winnerId, $riichiIds)) {
                                    $riichiStat[$winnerId]['won'] ++;
                                }

                                $fromOthers = array_filter($riichiIds, function ($playerId) use ($winnerId) {
                                    return $playerId != $winnerId;
                                });

                                $riichiStat[$winnerId]['stole'] += count($fromOthers);
                            } else {
                                $riichiStat[$winnerId]['lost'] ++;
                            }
                        } else {
                            if (in_array($winnerId, $riichiIds)) {
                                $riichiStat[$winnerId]['won'] ++;
                            }

                            $fromOthers = array_filter($item['from_players'], function ($playerId) use ($winnerId) {
                                return $playerId != $winnerId;
                            });

                            $riichiStat[$winnerId]['stole'] += count($fromOthers);
                        }

                        $riichiStat[$winnerId]['stole'] += $item['from_table'];
                    }
                }
            }
        }

        return $riichiStat;
    }

    /**
     * @param RoundPrimitive $round
     * @param SessionState $sessionState
     * @param [][] $payments
     * @return array
     * @throws \Exception
     */
    protected function _addLoserPayment($round, $sessionState, $payments)
    {
        if (!in_array($sessionState->getLastOutcome(), ['ron', 'multiron'])) {
            return $payments;
        }

        $lastSessionState = $round->getLastSessionState();
        $loserId = $round->getLoserId();
        $loserHasRiichi = in_array($loserId, $round->getRiichiIds());

        $lastScore = $lastSessionState->getScores()[$loserId];
        $currentScore = $sessionState->getScores()[$loserId];

        $payment = $lastScore - $currentScore;
        if ($loserHasRiichi) {
            $payment -= 1000;
        }

        if (empty($payments[$loserId])) {
            $payments[$loserId] = [
                'sum'   => 0,
                'count' => 0
            ];
        }

        $payments[$loserId]['sum'] += $payment;

        if ($sessionState->getLastOutcome() !== 'multiron') {
            $payments[$loserId]['count']++;
        } else {
            /** @var MultiRoundPrimitive $mRound */
            $mRound = $round;
            $rounds = $mRound->rounds();
            $multiRonCount = $rounds[0]->getMultiRon();
            $payments[$loserId]['count'] += $multiRonCount;
        }

        return $payments;
    }

    /**
     * @param $eventIdList
     * @return SessionPrimitive[]
     * @throws \Exception
     */
    protected function _getGames($eventIdList)
    {
        return SessionPrimitive::findByEventListAndStatus(
            $this->_db,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED
        );
    }

    /**
     * @param SessionPrimitive[] $games
     * @return array
     * @throws \Exception
     */
    protected function _getPlayers($games)
    {
        return EventModel::getPlayersOfGames($this->_db, $games);
    }

    /**
     * @param $sessionIds
     * @return RoundPrimitive[][]
     * @throws \Exception
     */
    protected function _getRounds($sessionIds)
    {
        $rounds = RoundPrimitive::findBySessionIds($this->_db, $sessionIds);

        $result = [];
        foreach ($rounds as $item) {
            if (empty($result[$item->getSessionId()])) {
                $result[$item->getSessionId()] = [];
            }
            $result[$item->getSessionId()] []= $item;
        }

        return $result;
    }
}
