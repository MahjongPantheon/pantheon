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

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
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
            $ratings[$reg] = $startRating;
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
     * @param $eventId
     * @return array
     */
    public function getAchievements($eventId)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to view achievements');
        }

        return [
            'bestHand' => AchievementsPrimitive::getBestHandOfEvent($this->_db, $eventId),
            'bestTsumoist' => AchievementsPrimitive::getBestTsumoistInSingleSession($this->_db, $eventId),
            'braveSapper' => AchievementsPrimitive::getBraveSappers($this->_db, $eventId),
            'chomboMaster' => AchievementsPrimitive::getChomboMasters($this->_db, $eventId),
            'dovakin' => AchievementsPrimitive::getDovakins($this->_db, $eventId),
            'yakuman' => AchievementsPrimitive::getYakumans($this->_db, $eventId)
        ];
    }

    /**
     * @param EventPrimitive $event
     * @return array
     * @throws InvalidParametersException
     */
    public function getGamesSeries(EventPrimitive $event)
    {
        if ($event->getSeriesLength() == 0) {
            throw new InvalidParametersException('This event doesn\'t support series');
        }

        $gamesRaw = SessionPrimitive::findByEventAndStatus(
            $this->_db,
            $event->getId(),
            'finished'
        );

        $games = [];
        foreach ($gamesRaw as $game) {
            $games[$game->getId()] = $game;
        }

        // load and group by player all session results
        $results = SessionResultsPrimitive::findByEventId($this->_db, [$event->getId()]);
        $playersData = [];
        foreach ($results as $item) {
            if (empty($playersData[$item->getPlayerId()])) {
                $playersData[$item->getPlayerId()] = [];
            }

            $playersData[$item->getPlayerId()][] = [
                'sessionId' => $item->getSessionId(),
                'score' => $item->getScore(),
                'place' => $item->getPlace(),
            ];
        }

        $sessionResults = [];
        foreach ($results as $item) {
            if (empty($sessionResults[$item->getSessionId()])) {
                $sessionResults[$item->getSessionId()] = [];
            }
            $sessionResults[$item->getSessionId()][$item->getPlayerId()] = $item;
        }

        // we had to consider only players with enough games
        $filteredPlayersData = [];
        foreach ($playersData as $playerId => $playerGames) {
            if (count($playerGames) >= $event->getSeriesLength()) {
                $filteredPlayersData[$playerId] = $playerGames;
            }
        }

        // let's find a best series for the filtered players
        $seriesResults = [];
        foreach ($filteredPlayersData as $playerId => $playerGames) {
            $offset = 0;
            $limit = $event->getSeriesLength();
            $gamesCount = count($playerGames);

            // make sure that games were sorted (newest goes first)
            uasort($playerGames, function ($a, $b) {
                return $a['sessionId'] - $b['sessionId'];
            });

            $bestSeries = null;
            while (($offset + $limit) <= $gamesCount) {
                $slicedGames = array_slice($playerGames, $offset, $limit);
                $places = array_reduce($slicedGames, function ($i, $item) {
                    return $i += $item['place'];
                });
                $scores = array_reduce($slicedGames, function ($i, $item) {
                    return $i += $item['score'];
                });

                $sessionIds = array_map(function ($el) {
                    return $el['sessionId'];
                }, $slicedGames);

                if (!$bestSeries) {
                    // for the first iteration we should get the first series
                    $bestSeries = [
                        'placesSum'  => $places,
                        'scoresSum'  => $scores,
                        'sessionIds' => $sessionIds,
                    ];
                } else {
                    // the less places the better
                    if ($places <= $bestSeries['placesSum']) {
                        // we can have multiple series with same places sum
                        // let's get the one with better scores in that case
                        if ($places == $bestSeries['placesSum']) {
                            // the bigger scores the better
                            if ($scores > $bestSeries['scoresSum']) {
                                $bestSeries = [
                                    'placesSum'  => $places,
                                    'scoresSum'  => $scores,
                                    'sessionIds' => $sessionIds,
                                ];
                            }
                        } else {
                            $bestSeries = [
                                'placesSum'  => $places,
                                'scoresSum'  => $scores,
                                'sessionIds' => $sessionIds,
                            ];
                        }
                    }
                }

                $offset++;
            }

            // it is useful to know current player series
            $offset = $gamesCount - $event->getSeriesLength();
            $limit = $event->getSeriesLength();
            $currentSeries = array_slice($playerGames, $offset, $limit);
            $currentSeriesSessionIds = array_map(function ($el) {
                return $el['sessionId'];
            }, $currentSeries);
            $currentSeriesScores = array_reduce($currentSeries, function ($i, $item) {
                return $i += $item['score'];
            });

            $bestSeries['playerId'] = $playerId;
            $bestSeries['currentSeries'] = $currentSeriesSessionIds;
            $bestSeries['currentSeriesScores'] = $currentSeriesScores;

            $seriesResults[] = $bestSeries;
        }

        uasort($seriesResults, function ($a, $b) {
            $diff = $a['placesSum'] - $b['placesSum'];
            if ($diff) {
                return $diff;
            }
            return $b['scoresSum'] - $a['scoresSum'];
        });

        $players = $this->_getPlayersOfGames($games);
        $formattedResults = [];
        foreach ($seriesResults as $item) {
            $playerId = $item['playerId'];
            $formattedResults[] = [
                'player' => $players[$item['playerId']],
                'best_series_scores' => $item['scoresSum'],
                'best_series' => $this->_formatSeries($playerId, $item['sessionIds'], $games, $sessionResults),
                'current_series' => $this->_formatSeries($playerId, $item['currentSeries'], $games, $sessionResults),
                'current_series_scores' => $item['currentSeriesScores'],
            ];
        }

        return $formattedResults;
    }

    /**
     * @param int $playerId
     * @param int[] $seriesIds
     * @param SessionPrimitive[] $sessions
     * @param SessionResultsPrimitive[] $sessionResults
     * @return array
     */
    private function _formatSeries($playerId, $seriesIds, $sessions, $sessionResults)
    {
        $result = [];
        foreach ($seriesIds as $seriesId) {
            $result[] = [
                'hash' => $sessions[$seriesId]->getRepresentationalHash(),
                'place' => $sessionResults[$seriesId][$playerId]->getPlace()
            ];
        }
        return $result;
    }

    /**
     * Find out currently playing tables state (for tournaments only)
     * @param integer $eventId
     * @return array
     */
    public function getTablesState($eventId)
    {
        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_db, $eventId);
        $tablesCount = count($reggedPlayers) / 4;

        $lastGames = SessionPrimitive::findByEventAndStatus($this->_db, $eventId, ['finished', 'inprogress'], 0, $tablesCount);
        return $this->_formatTablesState($lastGames);
    }

    /**
     * Find all playing tables on global level
     * @return array
     */
    public function getGlobalTablesState()
    {
        $games = SessionPrimitive::findAllInProgress($this->_db);
        return $this->_formatTablesState($games);
    }

    /**
     * @param SessionPrimitive[] $lastGames
     * @return array
     */
    protected function _formatTablesState($lastGames)
    {
        $output = [];
        foreach ($lastGames as $game) {
            $rounds = RoundPrimitive::findBySessionIds($this->_db, [$game->getId()]);
            /** @var MultiRoundPrimitive $lastRound */
            $lastRound = MultiRoundHelper::findLastRound($rounds);

            $output []= [
                'status' => $game->getStatus(),
                'hash' => $game->getRepresentationalHash(),
                'penalties' => $game->getCurrentState()->getPenaltiesLog(),
                'table_index' => $game->getTableIndex(),
                'last_round' => $lastRound ? $this->_formatLastRound($lastRound) : [],
                'current_round' => $game->getCurrentState()->getRound(),
                'scores' => $game->getCurrentState()->getScores(),
                'players' => array_map(function (PlayerPrimitive $p) {
                    return [
                        'id' => $p->getId(),
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
            'han'     => $round->getHan(),
            'fu'      => $round->getFu()
        ];
    }

    // ------ Last games related -------

    /**
     * @param EventPrimitive $event
     * @param integer $limit
     * @param integer $offset
     * @param string $orderBy
     * @param string $order
     * @return array
     */
    public function getLastFinishedGames(EventPrimitive $event, $limit, $offset, $orderBy, $order)
    {
        $games = SessionPrimitive::findByEventAndStatus(
            $this->_db,
            $event->getId(),
            'finished',
            $offset,
            $limit,
            $orderBy,
            $order
        );

        $sessionIds = array_map(function (SessionPrimitive $el) {
            return $el->getId();
        }, $games);

        /** @var SessionResultsPrimitive[][] $sessionResults */
        $sessionResults = $this->_getSessionResults($sessionIds); // 1st level: session id, 2nd level: player id

        /** @var RoundPrimitive[][] $rounds */
        $rounds = $this->_getRounds($sessionIds); // 1st level: session id, 2nd level: numeric index with no meaning

        $result = [
            'games' => [],
            'players' => $this->_getPlayersOfGames($games),
            'total_games' => SessionPrimitive::gamesCount(
                $this->_db,
                $event->getId(),
                'finished'
            )
        ];

        foreach ($games as $session) {
            $result['games'][] = $this->_formatGameResults($session, $sessionResults, $rounds);
        }

        return $result;
    }

    /**
     * @param SessionPrimitive $session
     * @return array
     * @throws InvalidParametersException
     */
    public function getFinishedGame(SessionPrimitive $session)
    {
        /** @var SessionResultsPrimitive[][] $sessionResults */
        $sessionResults = $this->_getSessionResults([$session->getId()]);

        /** @var RoundPrimitive[][] $rounds */
        $rounds = $this->_getRounds([$session->getId()]);

        return [
            'games' => [$this->_formatGameResults($session, $sessionResults, $rounds)],
            'players' => $this->_getPlayersOfGames([$session])
        ];
    }

    /**
     * @param $session SessionPrimitive
     * @param $sessionResults SessionResultsPrimitive[][]
     * @param $rounds RoundPrimitive[][]
     * @return array
     */
    protected function _formatGameResults($session, $sessionResults, $rounds)
    {
        return [
            'hash' => $session->getRepresentationalHash(),
            'date' => $session->getEndDate(),
            'replay_link' => $session->getReplayLink(),
            'players' => array_map('intval', $session->getPlayersIds()),
            'final_results' => $this->_arrayMapPreserveKeys(function (SessionResultsPrimitive $el) {
                return [
                    'score'         => (int) $el->getScore(),
                    'rating_delta'  => (float) $el->getRatingDelta(),
                    'place'         => (int) $el->getPlace()
                ];
            }, $sessionResults[$session->getId()]),
            'penalties' => $session->getCurrentState()->getPenaltiesLog(),
            'rounds' => array_map([$this, '_formatRound'], $rounds[$session->getId()]),
        ];
    }

    /**
     * @param $sessionIds
     * @return RoundPrimitive[][]
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
     * @param $sessionIds
     * @return SessionResultsPrimitive[][]
     */
    protected function _getSessionResults($sessionIds)
    {
        $results = SessionResultsPrimitive::findBySessionId($this->_db, $sessionIds);

        $result = [];
        foreach ($results as $item) {
            if (empty($result[$item->getSessionId()])) {
                $result[$item->getSessionId()] = [];
            }
            $result[$item->getSessionId()][$item->getPlayerId()] = $item;
        }

        return $result;
    }

    /**
     * @param SessionPrimitive[] $games
     * @return array
     */
    protected function _getPlayersOfGames($games)
    {
        $players = PlayerPrimitive::findById($this->_db, array_reduce($games, function ($acc, SessionPrimitive $el) {
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

    protected function _formatRound(RoundPrimitive $round)
    {
        switch ($round->getOutcome()) {
            case 'ron':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'outcome'       => $round->getOutcome(),
                    'winner_id'     => (int) $round->getWinnerId(),
                    'loser_id'      => (int) $round->getLoserId(),
                    'han'           => (int) $round->getHan(),
                    'fu'            => (int) $round->getFu(),
                    'yaku'          => $round->getYaku(),
                    'riichi_bets'   => implode(',', $round->getRiichiIds()),
                    'dora'          => (int) $round->getDora(),
                    'uradora'       => (int) $round->getUradora(), // TODO: not sure if we really need these guys
                    'kandora'       => (int) $round->getKandora(),
                    'kanuradora'    => (int) $round->getKanuradora(),
                    'open_hand'     => $round->getOpenHand()
                ];
            case 'multiron':
                /** @var MultiRoundPrimitive $mRound */
                $mRound = $round;
                $rounds = $mRound->rounds();

                return [
                    'round_index'   => (int) $rounds[0]->getRoundIndex(),
                    'outcome'       => $mRound->getOutcome(),
                    'loser_id'      => (int) $mRound->getLoserId(),
                    'multi_ron'     => (int) $rounds[0]->getMultiRon(),
                    'wins'          => array_map(function (RoundPrimitive $round) {
                        return [
                            'winner_id'     => (int) $round->getWinnerId(),
                            'han'           => (int) $round->getHan(),
                            'fu'            => (int) $round->getFu(),
                            'yaku'          => $round->getYaku(),
                            'riichi_bets'   => implode(',', $round->getRiichiIds()),
                            'dora'          => (int) $round->getDora(),
                            'uradora'       => (int) $round->getUradora(), // TODO: not sure if we really need these guys
                            'kandora'       => (int) $round->getKandora(),
                            'kanuradora'    => (int) $round->getKanuradora(),
                            'open_hand'     => $round->getOpenHand()
                        ];
                    }, $rounds)
                ];
            case 'tsumo':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'outcome'       => $round->getOutcome(),
                    'winner_id'     => (int) $round->getWinnerId(),
                    'han'           => (int) $round->getHan(),
                    'fu'            => (int) $round->getFu(),
                    'yaku'          => $round->getYaku(),
                    'riichi_bets'   => implode(',', $round->getRiichiIds()),
                    'dora'          => (int) $round->getDora(),
                    'uradora'       => (int) $round->getUradora(), // TODO: not sure if we really need these guys
                    'kandora'       => (int) $round->getKandora(),
                    'kanuradora'    => (int) $round->getKanuradora(),
                    'open_hand'     => $round->getOpenHand()
                ];
            case 'draw':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'outcome'       => $round->getOutcome(),
                    'riichi_bets'   => implode(',', $round->getRiichiIds()),
                    'tempai'        => implode(',', $round->getTempaiIds())
                ];
            case 'abort':
                return [
                    'round_index'   => $round->getRoundIndex(),
                    'outcome'       => $round->getOutcome(),
                    'riichi_bets'   => implode(',', $round->getRiichiIds())
                ];
            case 'chombo':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'outcome'       => $round->getOutcome(),
                    'loser_id'      => (int) $round->getLoserId()
                ];
            default:
                throw new DatabaseException('Wrong outcome detected! This should not happen - DB corrupted?');
        }
    }

    protected function _arrayMapPreserveKeys(callable $cb, $array)
    {
        return array_combine(array_keys($array), array_map($cb, array_values($array)));
    }

    // ------ Rating table related -------

    public function getRatingTable(EventPrimitive $event, $orderBy, $order)
    {
        if (!in_array($order, ['asc', 'desc'])) {
            throw new InvalidParametersException("Parameter order should be either 'asc' or 'desc'");
        }

        $playersHistoryItems = PlayerHistoryPrimitive::findLastByEvent($this->_db, $event->getId());
        $playerItems = $this->_getPlayers($playersHistoryItems);
        $this->_sortItems($orderBy, $playerItems, $playersHistoryItems);

        if ($order === 'desc') {
            $playersHistoryItems = array_reverse($playersHistoryItems);
        }

        if ($event->getSortByGames()) {
            $this->_stableSort(
                $playersHistoryItems,
                function (PlayerHistoryPrimitive $el1, PlayerHistoryPrimitive $el2) {
                    if ($el1->getGamesPlayed() == $el2->getGamesPlayed()) {
                        return 0;
                    }

                    return $el1->getGamesPlayed() < $el2->getGamesPlayed() ? 1 : -1; // swap for desc sort
                }
            );
        }

        // TODO: среднеквадратичное отклонение

        return array_map(function (PlayerHistoryPrimitive $el) use (&$playerItems, $event) {
            return [
                'id'            => (int)$el->getPlayerId(),
                'display_name'  => $playerItems[$el->getPlayerId()]->getDisplayName(),
                'rating'        => (float)$el->getRating(),
                'winner_zone'   => (
                    $event->getRuleset()->subtractStartPoints()
                        ? $el->getRating() >= $event->getRuleset()->startRating()
                        : $el->getRating() >= (
                            ($event->getRuleset()->startPoints() * $el->getGamesPlayed())
                                /
                            ($event->getRuleset()->tenboDivider() * $event->getRuleset()->ratingDivider())
                        )
                ),
                'avg_place'     => round($el->getAvgPlace(), 4),
                'avg_score'     => round(($el->getRating() - $event->getRuleset()->startRating()) / $el->getGamesPlayed(), 4),
                'games_played'  => (int)$el->getGamesPlayed()
            ];
        }, $playersHistoryItems);
    }

    /**
     * @param PlayerHistoryPrimitive[] $playersHistoryItems
     * @return PlayerPrimitive[]
     */
    protected function _getPlayers($playersHistoryItems)
    {
        $ids = array_map(function (PlayerHistoryPrimitive $el) {
            return $el->getPlayerId();
        }, $playersHistoryItems);
        $players = PlayerPrimitive::findById($this->_db, $ids);

        $result = [];
        foreach ($players as $p) {
            $result[$p->getId()] = $p;
        }

        return $result;
    }

    /**
     * @param $orderBy
     * @param PlayerPrimitive[] $playerItems
     * @param PlayerHistoryPrimitive[] $playersHistoryItems
     * @throws InvalidParametersException
     */
    protected function _sortItems($orderBy, &$playerItems, &$playersHistoryItems)
    {
        switch ($orderBy) {
            case 'name':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) use (&$playerItems) {
                    return strcmp(
                        $playerItems[$el1->getPlayerId()]->getDisplayName(),
                        $playerItems[$el2->getPlayerId()]->getDisplayName()
                    );
                });
                break;
            case 'rating':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) {
                    if (abs($el1->getRating() - $el2->getRating()) < 0.0001) {
                        return $el2->getAvgPlace() - $el1->getAvgPlace(); // lower avg place is better, so invert
                    }
                    if ($el1->getRating() - $el2->getRating() < 0) { // higher rating is better
                        return -1;  // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            case 'avg_place':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) {
                    if (abs($el1->getAvgPlace() - $el2->getAvgPlace()) < 0.0001) { // floats need epsilon
                        return $el2->getRating() - $el1->getRating(); // lower rating is worse, so invert
                    }
                    if ($el1->getAvgPlace() - $el2->getAvgPlace() < 0) { // higher avg place is worse
                        return -1; // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            case 'avg_score':
                usort($playersHistoryItems, function (
                    PlayerHistoryPrimitive $el1,
                    PlayerHistoryPrimitive $el2
                ) {
                    if (abs(
                        ($el1->getRating() / $el1->getGamesPlayed()) -
                            ($el2->getRating() / $el2->getGamesPlayed())
                    ) < 0.0001) {
                        return $el2->getAvgPlace() - $el1->getAvgPlace(); // lower avg place is better, so invert
                    }
                    if (($el1->getRating() / $el1->getGamesPlayed()) -
                        ($el2->getRating() / $el2->getGamesPlayed()) < 0) { // higher rating is better
                        return -1;  // usort casts return result to int, so pass explicit int here.
                    } else {
                        return 1;
                    }
                });
                break;
            default:
                throw new InvalidParametersException("Parameter orderBy should be either 'name', 'rating' or 'avg_place'");
        }
    }

    protected function _stableSort(&$array, $comparer = 'strcmp')
    {
        // Arrays of size < 2 require no action.
        if (count($array) < 2) {
            return;
        }

        // Split the array in half
        $halfway = count($array) / 2;
        $array1 = array_slice($array, 0, $halfway);
        $array2 = array_slice($array, $halfway);

        // Recurse to sort the two halves
        $this->_stableSort($array1, $comparer);
        $this->_stableSort($array2, $comparer);
        // If all of $array1 is <= all of $array2, just append them.
        if (call_user_func($comparer, end($array1), $array2[0]) < 1) {
            $array = array_merge($array1, $array2);
            return;
        }

        // Merge the two sorted arrays into a single sorted array
        $array = array();
        $ptr1 = $ptr2 = 0;
        while ($ptr1 < count($array1) && $ptr2 < count($array2)) {
            if (call_user_func($comparer, $array1[$ptr1], $array2[$ptr2]) < 1) {
                $array[] = $array1[$ptr1++];
            } else {
                $array[] = $array2[$ptr2++];
            }
        }

        // Merge the remainder
        while ($ptr1 < count($array1)) {
            $array[] = $array1[$ptr1++];
        }
        while ($ptr2 < count($array2)) {
            $array[] = $array2[$ptr2++];
        }
    }

    // --------- Auth & reg related ------------

    /**
     * Enroll player to event
     *
     * @param $eventId
     * @param $playerId
     * @throws AuthFailedException
     * @throws BadActionException
     * @throws InvalidParametersException
     * @return string secret pin code
     */
    public function enrollPlayer($eventId, $playerId)
    {
        if (!$this->checkAdminToken()) {
            throw new AuthFailedException('Only administrators are allowed to enroll players to event');
        }

        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }
        $player = PlayerPrimitive::findById($this->_db, [$playerId]);
        if (empty($player)) {
            throw new InvalidParametersException('Player id#' . $playerId . ' not found in DB');
        }

        $regItem = (new PlayerEnrollmentPrimitive($this->_db))
            ->setReg($player[0], $event[0]);
        $success = $regItem->save();

        if (!$success) {
            throw new BadActionException('Something went wrong: enrollment failed while saving to db');
        }

        return $regItem->getPin();
    }

    /**
     * Register player to event
     *
     * @param $playerId
     * @param $eventId
     * @throws BadActionException
     * @throws InvalidParametersException
     * @return bool success?
     */
    public function registerPlayer($playerId, $eventId)
    {
        $player = PlayerPrimitive::findById($this->_db, [$playerId]);
        if (empty($player)) {
            throw new InvalidParametersException('Player id#' . $playerId . ' not found in DB');
        }
        $event = EventPrimitive::findById($this->_db, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }
        $regItem = (new PlayerRegistrationPrimitive($this->_db))->setReg($player[0], $event[0]);
        $success = $regItem->save();

        $eItem = PlayerEnrollmentPrimitive::findByPlayerAndEvent($this->_db, $playerId, $eventId);
        if ($success) {
            $eItem->drop();
        }
        return $success;
    }

    /**
     * Unregister player from event
     *
     * @param $playerId
     * @param $eventId
     * @throws BadActionException
     * @throws InvalidParametersException
     * @return void
     */
    public function unregisterPlayer($playerId, $eventId)
    {
        $regItem = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_db, $playerId, $eventId);
        if (empty($regItem)) {
            return;
        }

        $regItem->drop();
    }

    /**
     * Self-register player to event by pin
     *
     * @param $pin
     * @throws BadActionException
     * @return string auth token
     */
    public function registerPlayerPin($pin)
    {
        $success = false;
        $token = null;

        if ($pin === '0000000000') {
            // Special pin & token for universal watcher
            return '0000000000';
        }

        $eItem = PlayerEnrollmentPrimitive::findByPin($this->_db, $pin);
        if ($eItem) {
            $event = EventPrimitive::findById($this->_db, [$eItem->getEventId()]);

            if (!$event[0]->getAllowPlayerAppend()) {
                $reggedItems = PlayerRegistrationPrimitive::findByPlayerAndEvent($this->_db, $eItem->getPlayerId(), $event[0]->getId());
                // check that games are not started yet
                if ($event[0]->getLastTimer() && empty($reggedItems)) {
                    // do not allow new players to enter already tournament
                    // but allow to reenroll/reenter pin for already participating people
                    throw new BadActionException('Pin is expired: game sessions are already started.');
                }
            }

            $player = PlayerPrimitive::findById($this->_db, [$eItem->getPlayerId()]);
            $regItem = (new PlayerRegistrationPrimitive($this->_db))
                ->setReg($player[0], $event[0]);
            $success = $regItem->save();
            $token = $regItem->getToken();
        }
        if (!$success || empty($regItem)) {
            throw new BadActionException('Something went wrong: registration failed while saving to db');
        }

        $eItem->drop();
        return $token;
    }

    /**
     * Checks if token is ok.
     * Reads token value from X-Auth-Token request header
     *
     * Also should return true to admin-level token to allow everything
     *
     * @param $playerId
     * @param $eventId
     * @return bool
     */
    public function checkToken($playerId, $eventId)
    {
        if ($this->checkAdminToken()) {
            return true;
        }

        $regItem = $this->dataFromToken();
        return $regItem
            && $regItem->getEventId() == $eventId
            && $regItem->getPlayerId() == $playerId;
    }

    /**
     * Get player and event ids by auth token
     * @return null|PlayerRegistrationPrimitive
     */
    public function dataFromToken()
    {
        return PlayerRegistrationPrimitive::findEventAndPlayerByToken($this->_db, $this->_meta->getAuthToken());
    }

    /**
     * Check if token allows administrative operations
     * @return bool
     */
    public function checkAdminToken()
    {
        return $this->_meta->getAuthToken() === $this->_config->getValue('admin.god_token');
    }
}
