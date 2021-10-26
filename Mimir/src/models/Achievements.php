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
     * Get list of all achievements codes
     * @throws AuthFailedException
     * @return array
     */
    public function getAchievementsList()
    {
        return [
            'bestHand',
            'bestTsumoist',
            'braveSapper',
            'dieHard',
            'dovakin',
            'yakuman',
            'shithander',
            'bestDealer',
            'bestFu',
            'impossibleWait',
            'honoredDonor',
            'justAsPlanned',
            'carefulPlanning',
            'doraLord',
            'catchEmAll',
            'favoriteAsapinApprentice',
            'andYourRiichiBet',
            'covetousKnight',
            'ninja',
        ];
    }

    /**
     * Get list of achievements results
     * @param int[] $eventIdList
     * @param array $achievementsList
     * @throws AuthFailedException
     * @throws \Exception
     * @return array
     */
    public function getAchievements(array $eventIdList, array $achievementsList)
    {
        $this->_games = $this->_getGames($eventIdList);
        $this->_players = $this->_getPlayers($this->_games);

        $sessionIds = array_map(function (SessionPrimitive $el) {
            return $el->getId();
        }, $this->_games);

        $this->_rounds = $this->_getRounds($sessionIds);

        $callbacks = [
            'bestHand' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getBestHandOfEvent($this->_ds, $eventIdList, $this->_players);
            },
            'bestTsumoist' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getBestTsumoistInSingleSession($this->_ds, $eventIdList, $this->_players);
            },
            'braveSapper' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getBraveSappers($this->_ds, $eventIdList, $this->_players);
            },
            'dieHard' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getDieHardData($this->_ds, $eventIdList, $this->_players);
            },
            'dovakins' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getDovakins($this->_ds, $eventIdList, $this->_players);
            },
            'yakumans' => /**
             * @return array|string
             */
            function () use ($eventIdList) {
                return AchievementsPrimitive::getYakumans($this->_ds, $eventIdList, $this->_players);
            },
            'shithander' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getBestShithander($this->_ds, $eventIdList, $this->_players);
            },
            'bestDealer' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getBestDealer($this->_ds, $eventIdList, $this->_players);
            },
            'bestFu' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getMaxFuHand($this->_ds, $eventIdList, $this->_players);
            },
            'impossibleWait' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getImpossibleWait($this->_ds, $eventIdList, $this->_players);
            },
            'honoredDonor' => function (): array {
                return $this->_getHonoredDonor($this->_games, $this->_players, $this->_rounds);
            },
            'justAsPlanned' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getJustAsPlanned($this->_ds, $eventIdList, $this->_players);
            },
            'carefulPlanning' => function (): array {
                return $this->_getMinFeedsScore($this->_games, $this->_players, $this->_rounds);
            },
            'doraLord' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getMaxAverageDoraCount($this->_ds, $eventIdList, $this->_players);
            },
            'catchEmAll' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getMaxDifferentYakuCount($this->_ds, $eventIdList, $this->_players);
            },
            'favoriteAsapinApprentice' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getFavoriteAsapinApprentice($this->_ds, $eventIdList, $this->_players);
            },
            'andYourRiichiBet' => function (): array {
                return $this->_getMaxStolenRiichiBetsCount($this->_games, $this->_players, $this->_rounds);
            },
            'covetousKnight' => function (): array {
                return $this->_getMinLostRiichiBetsCount($this->_games, $this->_players, $this->_rounds);
            },
            'ninja' => function () use ($eventIdList): array {
                return AchievementsPrimitive::getNinja($this->_ds, $eventIdList, $this->_players);
            }
        ];

        return array_reduce($achievementsList, function ($acc, $el) use ($callbacks) {
            $acc[$el] = $callbacks[$el]();
            return $acc;
        }, []);
    }

    /**
     * Get players who lost largest number of points as riichi bets
     *
     * @param SessionPrimitive[] $games
     * @param array $players
     * @param RoundPrimitive[][] $rounds
     *
     *
     * @return array[]
     * @throws \Exception
     */
    protected function _getHonoredDonor(array $games, array $players, array $rounds)
    {
        $riichiStat = $this->_calcRiichiStat($games, $players, $rounds);

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
     * @param SessionPrimitive[] $games
     * @param array $players
     * @param RoundPrimitive[][] $rounds
     * @return array
     * @throws \Exception
     */
    protected function _getMinFeedsScore(array $games, array $players, array $rounds)
    {
        $payments = [];
        foreach ($games as $session) {
            $lastRound = null;
            foreach ($rounds[$session->getId()] as $round) {
                if ($lastRound === null) {
                    $lastRound = $round;
                    continue;
                }

                $lastSessionState = $round->getLastSessionState();
                $payments = $this->_addLoserPayment($lastRound, $lastSessionState, $payments);
                $lastRound = $round;
            }

            if (!empty($lastRound)) {
                $payments = $this->_addLoserPayment($lastRound, $session->getCurrentState(), $payments);
            }
        }

        $feedsScores = [];
        foreach ($payments as $key => $value) {
            $feedsScores[$key] = $value['sum'] / $value['count'];
        }

        asort($feedsScores);

        return array_map(
            function ($playerId, $feedsScore) use ($players) {
                return [
                    'name'  => $players[$playerId]['title'],
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
     * @param SessionPrimitive[] $games
     * @param array $players
     * @param RoundPrimitive[][] $rounds
     * @return array[]
     * @throws \Exception
     */
    protected function _getMaxStolenRiichiBetsCount(array $games, array $players, array $rounds)
    {
        $riichiStat = $this->_calcRiichiStat($games, $players, $rounds);

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
     * @param SessionPrimitive[] $games
     * @param array $players
     * @param RoundPrimitive[][] $rounds
     * @return array[]
     * @throws \Exception
     */
    protected function _getMinLostRiichiBetsCount(array $games, array $players, array $rounds)
    {
        $riichiStat = $this->_calcRiichiStat($games, $players, $rounds);

        uasort($riichiStat, function ($a, $b) {
            return $a['lost'] > $b['lost'] ? 1 : -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name'  => $item['name'],
                    'count'  => (string)$item['lost'],
                ];
            },
            array_slice($riichiStat, 0, 5)
        );
    }

    /**
     * @param SessionPrimitive[] $games
     * @param array $players
     * @param RoundPrimitive[][] $rounds
     * @return array
     * @throws \Exception
     */
    protected function _calcRiichiStat(array $games, array $players, array $rounds)
    {
        if (!empty($this->_riichiStat)) {
            return $this->_riichiStat;
        }

        $riichiStat = [];
        foreach ($players as $playerId => $player) {
            $riichiStat[$playerId] = [
                'name'  => $player['title'],
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
                    /** @var MultiRoundPrimitive $round */
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

        $this->_riichiStat = $riichiStat;
        return $riichiStat;
    }

    /**
     * @param RoundPrimitive $round
     * @param SessionState $sessionState
     * @param array $payments
     * @return array
     * @throws \Exception
     */
    protected function _addLoserPayment(RoundPrimitive $round, SessionState $sessionState, array $payments)
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
     * @param int[] $eventIdList
     * @return SessionPrimitive[]
     * @throws \Exception
     */
    protected function _getGames(array $eventIdList)
    {
        return SessionPrimitive::findByEventListAndStatus(
            $this->_ds,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED
        );
    }

    /**
     * @param SessionPrimitive[] $games
     * @return array
     * @throws \Exception
     */
    protected function _getPlayers(array $games)
    {
        return EventModel::getPlayersOfGames($this->_ds, $games);
    }

    /**
     * @param int[] $sessionIds
     * @return array
     * @throws \Exception
     */
    protected function _getRounds(array $sessionIds)
    {
        $rounds = RoundPrimitive::findBySessionIds($this->_ds, $sessionIds);

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
