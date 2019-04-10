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
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../primitives/EventPrescript.php';
require_once __DIR__ . '/../primitives/PlayerEnrollment.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Achievements.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventModel extends Model
{
    /**
     * Get data of players' current seating
     *
     * @param $eventId
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array TODO: should it be here? Looks a bit too low-level :/
     */
    public function getCurrentSeating($eventId)
    {
        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }
        $startRating = $event[0]->getRuleset()->startRating();

        // get data from primitives, and some raw data
        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_db, $eventId);
        $historyItems = PlayerHistoryPrimitive::findLastByEvent($this->_db, $eventId);
        $seatings = $this->_db->table('session_player')
            ->join('session', 'session.id = session_player.session_id')
            ->join('player', 'player.id = session_player.player_id')
            ->select('session_player.order')
            ->select('session_player.player_id')
            ->select('session_player.session_id')
            ->select('player.display_name')
            ->select('session.table_index')
            ->where('session.event_id', $eventId)
            ->orderByDesc('session.id')
            ->orderByAsc('order')
            ->limit(count($reggedPlayers))
            ->findArray();

        // merge it all together
        $ratings = [];
        foreach ($reggedPlayers as $reg) {
            $ratings[$reg['id']] = $startRating;
        }
        foreach ($historyItems as $item) { // overwrite with real values
            if (!empty($item->getRating())) {
                $ratings[$item->getPlayerId()] = $item->getRating();
            }
        }

        return array_map(function ($seat) use (&$ratings) {
            $seat['rating'] = $ratings[$seat['player_id']];
            return $seat;
        }, $seatings);
    }

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

        return [
            'bestHand' => AchievementsPrimitive::getBestHandOfEvent($this->_db, $eventIdList),
            'bestTsumoist' => AchievementsPrimitive::getBestTsumoistInSingleSession($this->_db, $eventIdList),
            'braveSapper' => AchievementsPrimitive::getBraveSappers($this->_db, $eventIdList),
            'dieHard' => AchievementsPrimitive::getDieHardData($this->_db, $eventIdList),
            'chomboMaster' => AchievementsPrimitive::getChomboMasters($this->_db, $eventIdList),
            'dovakin' => AchievementsPrimitive::getDovakins($this->_db, $eventIdList),
            'yakuman' => AchievementsPrimitive::getYakumans($this->_db, $eventIdList),
            'shithander' => AchievementsPrimitive::getBestShithander($this->_db, $eventIdList),
            'bestDealer' => AchievementsPrimitive::getBestDealer($this->_db, $eventIdList),
            'bestFu' => AchievementsPrimitive::getMaxFuHand($this->_db, $eventIdList),
            'impossibleWait' => AchievementsPrimitive::getImpossibleWait($this->_db, $eventIdList),
            'honoredDonor' => $this->getHonoredDonor($eventIdList),
            'justAsPlanned' => AchievementsPrimitive::getJustAsPlanned($this->_db, $eventIdList),
            'carefulPlanning' => $this->getMinFeedsScore($eventIdList),
            'doraLord' => AchievementsPrimitive::getMaxAverageDoraCount($this->_db, $eventIdList),
            'catchEmAll' => AchievementsPrimitive::getMaxDifferentYakuCount($this->_db, $eventIdList),
            'favoriteAsapinApprentice' => AchievementsPrimitive::getFavoriteAsapinApprentice($this->_db, $eventIdList),
            'andYourRiichiBet' => $this->getMaxStolenRiichiBetsCount($eventIdList),
            'prudent' => $this->getMinLostRiichiBetsPercentage($eventIdList)
        ];
    }

    /**
     * Get players who lost largest number of points as riichi bets
     *
     * @param $eventIdList
     * @return array
     * @throws \Exception
     */
    protected function getHonoredDonor($eventIdList)
    {
        $riichiStat = $this->_getRiichiStat($eventIdList);

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
     * Get players who has smallest score (average number) of feeding into others' hands
     *
     * @param $eventIdList
     * @return array
     * @throws \Exception
     */
    protected function getMinFeedsScore($eventIdList)
    {
        $games = SessionPrimitive::findByEventListAndStatus(
            $this->_db,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED
        );

        $sessionIds = array_map(function (SessionPrimitive $el) {
            return $el->getId();
        }, $games);

        $rounds = $this->_getRounds($sessionIds); // 1st level: session id, 2nd level: numeric index with no meaning
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

            $payments = $this->_addLoserPayment($lastRound, $session->getCurrentState(), $payments);
        }

        $feedsScores = [];
        foreach ($payments as $key => $value) {
            $feedsScores[$key] = $value['sum'] / $value['count'];
        }

        asort($feedsScores);
        $players = EventModel::getPlayersOfGames($this->_db, $games);

        return array_map(
            function ($playerId, $feedsScore) use ($players) {
                return [
                    'name'  => $players[$playerId]['display_name'],
                    'score' => $feedsScore
                ];
            },
            array_slice(array_keys($feedsScores), 0, 5),
            array_slice(array_values($feedsScores), 0, 5)
        );
    }

    /**
     * Get players who collected the largest amount of other players' riichi bets during the tournament
     *
     * @param $eventIdList
     * @return array
     * @throws \Exception
     */
    protected function getMaxStolenRiichiBetsCount($eventIdList)
    {
        $games = SessionPrimitive::findByEventListAndStatus(
            $this->_db,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED
        );

        $sessionIds = array_map(function (SessionPrimitive $el) {
            return $el->getId();
        }, $games);

        $rounds = RoundPrimitive::findBySessionIds($this->_db, $sessionIds);
        $filteredRounds = array_filter($rounds, function (RoundPrimitive $round) {
            return in_array($round->getOutcome(), ['ron', 'multiron', 'tsumo']);
        });

        $riichiBets = [];
        foreach ($filteredRounds as $round) {
            $lastSessionState = $round->getLastSessionState();

            if ($round->getOutcome() !== 'multiron') {
                $riichiBets = $this->_addRiichiBets(
                    $round->getWinnerId(),
                    $lastSessionState->getRiichiBets(),
                    $round->getRiichiIds(),
                    $riichiBets
                );
            } else {
                /** @var MultiRoundPrimitive $mRound */
                $mRound = $round;
                $rounds = $mRound->rounds();

                $riichiWinners = PointsCalc::assignRiichiBets(
                    $rounds,
                    $mRound->getLoserId(),
                    $lastSessionState->getRiichiBets(),
                    $lastSessionState->getHonba(),
                    $mRound->getSession()
                );

                foreach ($riichiWinners as $winnerId => $winner) {
                    $riichiBets = $this->_addRiichiBets(
                        $winnerId,
                        $winner['from_table'],
                        $winner['from_players'],
                        $riichiBets
                    );
                }
            }
        }

        $filteredRiichiBets = array_filter($riichiBets, function ($count) {
            return $count > 0;
        });

        arsort($filteredRiichiBets);
        $players = EventModel::getPlayersOfGames($this->_db, $games);

        return array_map(
            function ($playerId, $count) use ($players) {
                return [
                    'name'  => $players[$playerId]['display_name'],
                    'count' => $count
                ];
            },
            array_slice(array_keys($filteredRiichiBets), 0, 5),
            array_slice(array_values($filteredRiichiBets), 0, 5)
        );
    }

    /**
     * Get players with losing the smallest percentage of riichi bets
     *
     * @param $eventIdList
     * @return array
     * @throws \Exception
     */
    protected function getMinLostRiichiBetsPercentage($eventIdList)
    {
        $riichiStat = $this->_getRiichiStat($eventIdList);

        array_walk($riichiStat, function (&$item) {
            $riichiBetsCount = $item['won'] +  $item['lost'];

            $score = $riichiBetsCount !== 0
                ? $item['lost'] / $riichiBetsCount * 100
                : -1;

            $item['score'] = $score;
            $item['total'] = $riichiBetsCount;
        });

        uasort($riichiStat, function ($a, $b) {
            return $a['score'] > $b['score'] ? 1 : -1;
        });

        $lostPercentages = array_filter($riichiStat, function ($item) {
            return $item['score'] !== -1;
        });

        return array_map(
            function ($item) {
                return [
                    'name'  => $item['name'],
                    'score' => sprintf('%.2f', $item['score']),
                    'lost'  => $item['lost'],
                    'total' => $item['total'],
                ];
            },
            array_slice($lostPercentages, 0, 5)
        );
    }

    /**
     * @param $eventIdList
     * @return array
     * @throws \Exception
     */
    protected function _getRiichiStat($eventIdList)
    {
        $games = SessionPrimitive::findByEventListAndStatus(
            $this->_db,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED
        );

        $sessionIds = array_map(function (SessionPrimitive $el) {
            return $el->getId();
        }, $games);

        $rounds = RoundPrimitive::findBySessionIds($this->_db, $sessionIds);
        $players = EventModel::getPlayersOfGames($this->_db, $games);

        $riichiStat = [];
        foreach ($players as $playerId => $player) {
            $riichiStat[$playerId] = [
                'name'  => $player['display_name'],
                'won'   => 0,
                'lost'  => 0,
            ];
        }

        foreach ($rounds as $round) {
            $riichiIds = $round->getRiichiIds();

            if (in_array($round->getOutcome(), ['ron', 'tsumo'])) {
                $winnerId = $round->getWinnerId();

                foreach ($riichiIds as $riichiPlayerId) {
                    if ($riichiPlayerId == $winnerId) {
                        $riichiStat[$riichiPlayerId]['won'] ++;
                    } else {
                        $riichiStat[$riichiPlayerId]['lost'] ++;
                    }
                }
            }

            if (in_array($round->getOutcome(), ['draw', 'abort'])) {
                foreach ($riichiIds as $riichiPlayerId) {
                    $riichiStat[$riichiPlayerId]['lost'] ++;
                }
            }

            if ($round->getOutcome() == 'multiron') {
                /** @var $round MultiRoundPrimitive */
                $roundWinners = $round->getWinnerIds();

                foreach ($riichiIds as $riichiPlayerId) {
                    if (in_array($riichiPlayerId, $roundWinners)) {
                        $riichiStat[$riichiPlayerId]['won'] ++;
                    } else {
                        $riichiStat[$riichiPlayerId]['lost'] ++;
                    }
                }
            }
        }

        return $riichiStat;
    }

    /**
     * @param string $winnerId
     * @param int $fromTable
     * @param [] $fromPlayers
     * @param [][] $riichiBets
     * @return array
     */
    protected function _addRiichiBets($winnerId, $fromTable, $fromPlayers, $riichiBets)
    {
        if (empty($riichiBets[$winnerId])) {
            $riichiBets[$winnerId] = 0;
        }

        $fromOthers = array_filter($fromPlayers, function ($playerId) use ($winnerId) {
            return $playerId != $winnerId;
        });

        $riichiBets[$winnerId] += $fromTable;
        $riichiBets[$winnerId] += count($fromOthers);

        return $riichiBets;
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

    /**
     * Find out currently playing tables state (for tournaments only)
     * @param integer $eventId
     * @param bool $includeAllRounds
     * @return array
     * @throws \Exception
     */
    public function getTablesState($eventId, $includeAllRounds = false)
    {
        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_db, $eventId);
        $tablesCount = count($reggedPlayers) / 4;

        $lastGames = SessionPrimitive::findByEventAndStatus($this->_db, $eventId, [
            SessionPrimitive::STATUS_FINISHED,
            SessionPrimitive::STATUS_INPROGRESS,
            SessionPrimitive::STATUS_PREFINISHED
        ], 0, $tablesCount);
        return $this->_formatTablesState($lastGames, $reggedPlayers, $includeAllRounds);
    }

    /**
     * Find all playing tables on global level
     * @return array
     * @throws \Exception
     */
    public function getGlobalTablesState()
    {
        $games = SessionPrimitive::findAllInProgress($this->_db);
        return $this->_formatTablesState($games, []);
    }

    /**
     * Get config, status and error list for current prescripted seating
     *
     * @param integer $eventId
     * @return array
     * @throws \Exception
     */
    public function getPrescriptedConfig($eventId)
    {
        $prescript = EventPrescriptPrimitive::findByEventId($this->_db, [$eventId]);
        if (empty($prescript)) {
            return [
                'event_id' => $eventId,
                'next_session_index' => 1,
                'prescript' => null,
                'check_errors' => [
                    'No predefined seating yet'
                ]
            ];
        }

        $regData = PlayerRegistrationPrimitive::findLocalIdsMapByEvent($this->_db, $eventId);

        return [
            'event_id' => $eventId,
            'next_session_index' => $prescript[0]->getNextGameIndex() + 1,
            'prescript' => $prescript[0]->getScriptAsString(),
            'check_errors' => $prescript[0]->getCheckErrors($regData)
        ];
    }

    /**
     * Update prescripted config and status. No errors are checked here.
     *
     * @param integer $eventId
     * @param integer $nextSessionIndex
     * @param string $prescriptText
     * @return bool
     * @throws \Exception
     */
    public function updatePrescriptedConfig($eventId, $nextSessionIndex, $prescriptText)
    {
        $prescript = EventPrescriptPrimitive::findByEventId($this->_db, [$eventId]);
        if (empty($prescript)) {
            $prescript = [
                (new EventPrescriptPrimitive($this->_db))
                    ->setEventId($eventId)
            ];
        }

        return $prescript[0]
            ->setNextGameIndex($nextSessionIndex)
            ->setScriptAsString($prescriptText)
            ->save();
    }

    /**
     * @param SessionPrimitive[] $lastGames
     * @param array $reggedPlayers
     * @param bool $includeAllRounds
     * @throws \Exception
     * @return array
     */
    protected function _formatTablesState($lastGames, $reggedPlayers, $includeAllRounds = false)
    {
        $output = [];
        $playerIdMap = [];
        foreach ($reggedPlayers as $reg) {
            $playerIdMap[$reg['id']] = $reg['local_id'];
        }

        foreach ($lastGames as $game) {
            $rounds = RoundPrimitive::findBySessionIds($this->_db, [$game->getId()]);
            /** @var MultiRoundPrimitive $lastRound */
            $lastRound = MultiRoundHelper::findLastRound($rounds);

            $output []= [
                'status' => $game->getStatus(),
                'hash' => $game->getRepresentationalHash(),
                'penalties' => $game->getCurrentState()->getPenaltiesLog(),
                'table_index' => $game->getTableIndex(),
                'last_round' => ($lastRound && !$includeAllRounds) ? $this->_formatLastRound($lastRound) : [],
                'rounds' => $includeAllRounds ? array_map([$this, '_formatLastRound'], $rounds) : [],
                'current_round' => $game->getCurrentState()->getRound(),
                'scores' => $game->getCurrentState()->getScores(),
                'players' => array_map(function (PlayerPrimitive $p) use (&$playerIdMap) {
                    return [
                        'id' => $p->getId(),
                        'local_id' => $playerIdMap[$p->getId()],
                        'display_name' => $p->getDisplayName()
                    ];
                }, $game->getPlayers())
            ];
        }

        return $output;
    }

    protected function _formatLastRound(RoundPrimitive $round)
    {
        if ($round instanceof MultiRoundPrimitive) {
            return [
                'outcome' => $round->getOutcome(),
                'loser'   => $round->getLoserId(),
                'riichi'  => $round->getRiichiIds(),
                'wins'    => array_map(function (RoundPrimitive $round) {
                    return [
                        'winner' => $round->getWinnerId(),
                        'han'    => $round->getHan(),
                        'fu'     => $round->getFu()
                    ];
                }, $round->rounds())
            ];
        }

        return [
            'outcome' => $round->getOutcome(),
            'winner'  => $round->getWinnerId(),
            'loser'   => $round->getLoserId(),
            'tempai'  => $round->getTempaiIds(),
            'riichi'  => $round->getRiichiIds(),
            'nagashi' => $round->getNagashiIds(),
            'han'     => $round->getHan(),
            'fu'      => $round->getFu()
        ];
    }

    /**
     * @param IDb $db
     * @param SessionPrimitive[] $games
     * @throws \Exception
     * @return array
     */
    public static function getPlayersOfGames(IDB $db, $games)
    {
        $players = PlayerPrimitive::findById($db, array_reduce($games, function ($acc, SessionPrimitive $el) {
            return array_merge($acc, $el->getPlayersIds());
        }, []));

        $result = [];
        foreach ($players as $player) {
            $result[$player->getId()] = [
                'id'            => (int) $player->getId(),
                'display_name'  => $player->getDisplayName(),
                'tenhou_id'     => $player->getTenhouId()
            ];
        }

        return $result;
    }
}
