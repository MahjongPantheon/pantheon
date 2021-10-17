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
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../exceptions/EntityNotFound.php';

class PlayerStatModel extends Model
{
    /**
     * Get stats for player in event
     * Now it costs 6 indexed queries to DB (should be fast),
     * but be careful about adding some other stats.
     *
     * @param int[] $eventIdList
     * @param int $playerId
     *
     * @return array
     * @throws EntityNotFoundException
     * @throws \Exception
     */
    public function getStats(array $eventIdList, int $playerId)
    {
        if (!is_array($eventIdList) || empty($eventIdList)) {
            throw new InvalidParametersException('Event id list is not array or array is empty');
        }

        $eventList = EventPrimitive::findById($this->_ds, $eventIdList);
        if (count($eventList) != count($eventIdList)) {
            throw new InvalidParametersException('Some of events for ids ' . implode(", ", $eventIdList) . ' were not found in DB');
        }

        $mainEvent = $eventList[0];

        $player = PlayerPrimitive::findById($this->_ds, [$playerId]);
        if (empty($player)) {
            throw new EntityNotFoundException('Player id#' . $playerId . ' not found in DB');
        }

        $games = [];
        foreach ($eventList as $event) {
            /* FIXME (PNTN-237): Need to refactor this to avoid accessing DB in a loop. */
            /* We want to keep keys here, so we use "+" instead of array_merge. */
            $games = $games + $this->_fetchGamesHistory($event, $player[0]);
        }

        ksort($games);

        $rounds = $this->_fetchRounds($games);

        $scoresAndPlayers = $this->_getScoreHistoryAndPlayers($mainEvent->getRuleset(), $games);
        return [
            'rating_history'        => $this->_getRatingHistorySequence($mainEvent, $playerId, $games),
            'score_history'         => $scoresAndPlayers['scores'],
            'players_info'          => $scoresAndPlayers['players'],
            'places_summary'        => $this->_getPlacesSummary($playerId, $games),
            'total_played_games'    => count($games),
            'total_played_rounds'   => count($rounds),
            'win_summary'           => $this->_getOutcomeSummary($playerId, $rounds),
            'hands_value_summary'   => $this->_getHanSummary($playerId, $rounds),
            'yaku_summary'          => $this->_getYakuSummary($playerId, $rounds),
            'riichi_summary'        => $this->_getRiichiSummary($mainEvent->getRuleset(), $playerId, $rounds),
            'dora_stat'             => $this->_getDoraStat($playerId, $rounds),
        ];
    }

    /**
     * @param EventPrimitive $event
     * @param int $playerId
     * @param array $games
     * @return array
     */
    protected function _getRatingHistorySequence(EventPrimitive $event, int $playerId, array $games)
    {
        $rating = $event->getRuleset()->startRating();
        $ratingHistory = array_filter(
            array_map(
                function ($game) use (&$rating, $playerId) {
                    /** @param SessionResultsPrimitive[] $results */
                    $results = $game['results'];
                    $rating += $results[$playerId]->getRatingDelta();
                    return $rating;
                },
                $games
            ),
            'is_numeric'
        );
        array_unshift($ratingHistory, $event->getRuleset()->startRating());
        return $ratingHistory;
    }

    /**
     * Scores and rating deltas of all players
     *
     * @param Ruleset $rules
     * @param array $games
     * @throws \Exception
     * @return array
     */
    protected function _getScoreHistoryAndPlayers($rules, array $games)
    {
        $withChips = $rules->chipsValue() > 0;
        $scoreHistory = array_map(function ($game) use ($withChips) {
            /** @var SessionResultsPrimitive[] $results */
            $results = $game['results'];
            /** @var SessionPrimitive $session */
            $session = $game['session'];

            return array_map(function ($playerId) use (&$results, &$session, $withChips) {
                $result = [
                    'session_hash'  => (string) $session->getRepresentationalHash(),
                    'event_id'      => (int) $session->getEventId(),
                    'player_id'     => (int) $playerId,
                    'score'         => (int) $results[$playerId]->getScore(),
                    'rating_delta'  => (float) $results[$playerId]->getRatingDelta(),
                    'place'         => (int) $results[$playerId]->getPlace()
                ];
                if ($withChips) {
                    $result['chips'] = (int) $results[$playerId]->getChips();
                }
                return $result;
            }, $session->getPlayersIds());
        }, $games);

        return [
            'scores'    => $scoreHistory,
            'players'   => $this->_fetchPlayersInfo($scoreHistory)
        ];
    }

    /**
     * Fetch players info needed to display score history.
     * 1) get all ids,
     * 2) get all rows by single query
     *
     * @param array $scoreHistory
     *
     * @return array[]
     * @throws \Exception
     *
     */
    protected function _fetchPlayersInfo(array $scoreHistory)
    {
        $playerIds = array_reduce($scoreHistory, function ($acc, $item) {
            return array_merge($acc, array_map(function ($playerInfo) {
                return $playerInfo['player_id'];
            }, $item));
        }, []);
        $players = array_map(function (PlayerPrimitive $p) {
            return [
                'id'            => (int)$p->getId(),
                'display_name'  => $p->getDisplayName(),
                'tenhou_id'     => $p->getTenhouId(),
            ];
        }, PlayerPrimitive::findById($this->_ds, $playerIds));

        return $players;
    }

    /**
     * Get places stats for player
     *
     * @param int $playerId
     * @param array $games
     * @return array
     */
    protected function _getPlacesSummary(int $playerId, array $games)
    {
        return array_reduce($games, function ($acc, $game) use ($playerId) {
            /** @var SessionResultsPrimitive[] $results */
            $results = $game['results'];

            $acc[$results[$playerId]->getPlace()] ++;
            return $acc;
        }, [
            1 => 0,
            2 => 0,
            3 => 0,
            4 => 0
        ]);
    }

    /**
     * @param int $playerId
     * @param RoundPrimitive[] $rounds
     * @return array
     */
    protected function _getOutcomeSummary(int $playerId, array $rounds)
    {
        return array_reduce($rounds, function ($acc, RoundPrimitive $r) use ($playerId) {
            switch ($r->getOutcome()) {
                case 'ron':
                    if ($r->getLoserId() == $playerId) {
                        $acc['feed'] ++;
                    } else if ($r->getWinnerId() == $playerId) {
                        $acc['ron'] ++;
                        if ($r->getOpenHand()) {
                            $acc['openhand'] ++;
                        }
                    }
                    break;
                case 'tsumo':
                    if ($r->getWinnerId() == $playerId) {
                        $acc['tsumo'] ++;
                        if ($r->getOpenHand()) {
                            $acc['openhand'] ++;
                        }
                    } else {
                        $acc['tsumofeed'] ++;
                    }
                    break;
                case 'chombo':
                    if ($r->getLoserId() == $playerId) {
                        $acc['chombo'] ++;
                    }
                    break;
                case 'multiron':
                    /** @var MultiRoundPrimitive $mr */
                    $mr = $r;
                    foreach ($mr->rounds() as $round) {
                        if ($round->getWinnerId() == $playerId) {
                            $acc['ron'] ++;
                            if ($mr->getOpenHand()) {
                                $acc['openhand'] ++;
                            }
                            break;
                        } else if ($mr->getLoserId() == $playerId) {
                            $acc['feed'] ++;
                        }
                    }
                    break;
                default:
                    ;
            }
            return $acc;
        }, [
            'ron'       => 0,
            'tsumo'     => 0,
            'chombo'    => 0,
            'feed'      => 0,
            'tsumofeed' => 0,
            'openhand'  => 0
        ]);
    }

    /**
     * Get yaku summary stats for player
     *
     * @param int $playerId
     * @param RoundPrimitive[] $rounds
     *
     * @return array
     */
    protected function _getYakuSummary(int $playerId, array $rounds)
    {
        $summary = array_reduce($rounds, function ($acc, RoundPrimitive $r) use ($playerId) {
            if (($r->getOutcome() === 'ron' || $r->getOutcome() === 'tsumo') && $r->getWinnerId() == $playerId) {
                $acc = array_reduce(explode(',', $r->getYaku()), function ($acc, $yaku) {
                    if (empty($acc[$yaku])) {
                        $acc[$yaku] = 0;
                    }
                    $acc[$yaku] ++;
                    return $acc;
                }, $acc);
            } else if ($r->getOutcome() === 'multiron') {
                /** @var MultiRoundPrimitive $mr */
                $mr = $r;
                foreach ($mr->rounds() as $round) {
                    if ($round->getWinnerId() == $playerId) {
                        $acc = array_reduce(explode(',', $round->getYaku()), function ($acc, $yaku) {
                            if (empty($acc[$yaku])) {
                                $acc[$yaku] = 0;
                            }
                            $acc[$yaku] ++;
                            return $acc;
                        }, $acc);
                        break;
                    }
                }
            }
            return $acc;
        }, []);

        asort($summary);
        return $summary;
    }

    /**
     * Get hand value summary stats for player
     *
     * @param int $playerId
     * @param RoundPrimitive[] $rounds
     *
     * @return array
     */
    protected function _getHanSummary(int $playerId, array $rounds)
    {
        $summary = array_reduce($rounds, function ($acc, RoundPrimitive $r) use ($playerId) {
            if (($r->getOutcome() === 'ron' || $r->getOutcome() === 'tsumo') && $r->getWinnerId() == $playerId) {
                $han = $r->getHan();
                if (empty($acc[$han])) {
                    $acc[$han] = 0;
                }
                $acc[$han] ++;
            } else if ($r->getOutcome() === 'multiron') {
                /** @var MultiRoundPrimitive $mr */
                $mr = $r;
                foreach ($mr->rounds() as $round) {
                    if ($round->getWinnerId() == $playerId) {
                        $han = $round->getHan();
                        if (empty($acc[$han])) {
                            $acc[$han] = 0;
                        }
                        $acc[$han] ++;
                        break;
                    }
                }
            }
            return $acc;
        }, []);

        ksort($summary);
        return $summary;
    }

    /**
     * Get riichi win/lose summary stats for player
     *
     * @param Ruleset $rules
     * @param int $playerId
     * @param RoundPrimitive[] $rounds
     * @return array
     * @throws \Exception
     */
    protected function _getRiichiSummary(Ruleset $rules, int $playerId, array $rounds)
    {
        $acc = [
            'riichi_won'        => 0,
            'riichi_lost'       => 0,
            'feed_under_riichi' => 0
        ];

        foreach ($rounds as $r) {
            if (($r->getOutcome() === 'ron' || $r->getOutcome() === 'tsumo')
                && $r->getWinnerId() == $playerId && in_array($playerId, $r->getRiichiIds())
            ) {
                $acc['riichi_won']++;
            }
            if (($r->getOutcome() === 'ron' || $r->getOutcome() === 'tsumo')
                && $r->getWinnerId() != $playerId && in_array($playerId, $r->getRiichiIds())
            ) {
                $acc['riichi_lost']++;
            }
            if (($r->getOutcome() === 'draw' || $r->getOutcome() === 'abort')
                && in_array($playerId, $r->getRiichiIds())
            ) {
                $acc['riichi_lost']++;
            }
            if (($r->getOutcome() === 'ron' || $r->getOutcome() === 'tsumo')
                && $r->getLoserId() == $playerId && in_array($playerId, $r->getRiichiIds())
            ) {
                $acc['feed_under_riichi']++;
            }

            if ($r->getOutcome() === 'multiron') {
                /** @var MultiRoundPrimitive $mr */
                $mr = $r;
                $roundRiichi = $mr->getRiichiIds();
                $roundWinners = $mr->getWinnerIds();

                if (in_array($playerId, $roundWinners) && in_array($playerId, $roundRiichi)) {
                    $lastSessionState = $mr->getLastSessionState();
                    $riichiWinners = PointsCalc::assignRiichiBets(
                        $mr->rounds(),
                        $mr->getLoserId(),
                        $lastSessionState->getRiichiBets(),
                        $lastSessionState->getHonba(),
                        $mr->getSession()
                    );

                    $closestWinner = $riichiWinners[$playerId]['closest_winner'];
                    if ($rules->doubleronRiichiAtamahane() && $closestWinner) {
                        if ($closestWinner == $playerId) {
                            $acc['riichi_won']++;
                        } else {
                            $acc['riichi_lost']++;
                        }
                    } else {
                        $acc['riichi_won']++;
                    }
                }

                if (!in_array($playerId, $roundWinners) && in_array($playerId, $roundRiichi)) {
                    $acc['riichi_lost']++;
                }

                if ($mr->getLoserId() == $playerId && in_array($playerId, $roundRiichi)) {
                    $acc['feed_under_riichi']++;
                }
            }
        }

        return $acc;
    }

    /**
     * Get average dora count for player
     *
     * @param int $playerId
     * @param RoundPrimitive[] $rounds
     *
     * @return array
     * @throws \Exception
     *
     * @psalm-return array{count: int|mixed, average: int|string}
     */
    protected function _getDoraStat(int $playerId, array $rounds): array
    {
        $doraCount = 0;
        $roundsCount = 0;
        foreach ($rounds as $r) {
            if (($r->getOutcome() === 'ron' || $r->getOutcome() === 'tsumo') && ($r->getWinnerId() == $playerId)) {
                $doraCount += $r->getDora();
                $roundsCount += 1;
            }

            if ($r->getOutcome() === 'multiron') {
                /** @var MultiRoundPrimitive $mr */
                $mr = $r;
                foreach ($mr->rounds() as $round) {
                    if ($round->getWinnerId() == $playerId) {
                        $doraCount += $round->getDora();
                        $roundsCount += 1;
                        break;
                    }
                }
            }
        }
        $average = $doraCount ? sprintf('%.2f', $doraCount / $roundsCount) : 0;
        return [
            'count' => $doraCount,
            'average' => $average,
        ];
    }

    /**
     * @param array $games
     * @throws \Exception
     * @return RoundPrimitive[]
     */
    protected function _fetchRounds(array $games)
    {
        $sessionIds = array_map(function ($item) {
            /** @var SessionPrimitive $session */
            $session = $item['session'];
            return $session->getId();
        }, $games);

        return RoundPrimitive::findBySessionIds($this->_ds, $sessionIds);
    }

    /**
     * @param EventPrimitive $event
     * @param PlayerPrimitive $player
     * @throws \Exception
     * @return array [ ['session' => SessionPrimitive, 'results' => SessionResultsPrimitive[] ] ... ]
     */
    protected function _fetchGamesHistory(EventPrimitive $event, PlayerPrimitive $player)
    {
        $pId = $player->getId();
        $eId = $event->getId();
        if (empty($pId) || empty($eId)) {
            throw new InvalidParametersException('Attempt to use deidented primitive');
        }
        $sessions = SessionPrimitive::findByPlayerAndEvent($this->_ds, $pId, $eId);

        $sessionIds = array_map(function (SessionPrimitive $s) {
            return $s->getId();
        }, $sessions);

        $sessionResults = SessionResultsPrimitive::findBySessionId($this->_ds, $sessionIds);
        $sessions = array_combine($sessionIds, $sessions);

        if (!$sessions) {
            throw new InvalidParametersException('Attempt to combine inequal arrays');
        }

        $fullResults = [];
        foreach ($sessionResults as $result) {
            if (empty($fullResults[$result->getSessionId()])) {
                $fullResults[$result->getSessionId()] = [
                    'session' => $sessions[$result->getSessionId()],
                    'results' => []
                ];
            }

            $fullResults[$result->getSessionId()]['results'][$result->getPlayerId()] = $result;
        }

        return $fullResults;
    }
}
