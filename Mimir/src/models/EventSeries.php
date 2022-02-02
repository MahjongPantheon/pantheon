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
require_once __DIR__ . '/Event.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Achievements.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventSeriesModel extends Model
{
    /**
     * @param EventPrimitive $event
     * @return array
     * @throws \Exception
     * @throws InvalidParametersException
     */
    public function getGamesSeries(EventPrimitive $event)
    {
        if ($event->getSeriesLength() == 0) {
            throw new InvalidParametersException('This event doesn\'t support series');
        }

        $eId = $event->getId();
        if (empty($eId)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }

        $gamesRaw = SessionPrimitive::findByEventAndStatus($this->_ds, $eId, SessionPrimitive::STATUS_FINISHED);

        $games = [];
        foreach ($gamesRaw as $game) {
            $gId = $game->getId();
            if (!empty($gId)) {
                $games[$gId] = $game;
            }
        }

        // load and group by player all session results
        $results = SessionResultsPrimitive::findByEventId($this->_ds, [$eId]);
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
                /** @var int $places */
                $places = array_reduce($slicedGames, function ($i, $item) {
                    $i += $item['place'];
                    return $i;
                }, 0);
                /** @var float $scores */
                $scores = array_reduce($slicedGames, function ($i, $item) {
                    $i += $item['score'];
                    return $i;
                }, 0);

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
                $i += $item['score'];
                return $i;
            }, 0);

            $bestSeries['playerId'] = $playerId;
            $bestSeries['currentSeries'] = $currentSeriesSessionIds;
            $bestSeries['currentSeriesScores'] = $currentSeriesScores;
            $seriesResults[] = $bestSeries;
        }

        uasort($seriesResults, function ($a, $b) {
            $diff = $a['placesSum'] - $b['placesSum'];
            if ($diff) {
                return $diff > 0 ? 1 : -1;
            }
            $scoreDiff = $b['scoresSum'] - $a['scoresSum'];
            if (abs($scoreDiff) < 0.00001) {
                return 0;
            } else if ($scoreDiff > 0) {
                return 1;
            } else {
                return -1;
            }
        });

        $players = EventModel::getPlayersOfGames($this->_ds, $games);
        $formattedResults = [];
        foreach ($seriesResults as $item) {
            $playerId = $item['playerId'];
            $formattedResults[] = [
                'player' => $players[$item['playerId']],
                'best_series_scores' => $item['scoresSum'] ?? 0,
                'best_series' => $this->_formatSeries($playerId, $item['sessionIds'] ?? [], $games, $sessionResults),
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
     * @param SessionResultsPrimitive[][] $sessionResults
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
}
