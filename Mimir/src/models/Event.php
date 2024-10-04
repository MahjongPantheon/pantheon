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

use Common\PlatformType;
use Common\Ruleset;
use Common\RulesetConfig;

require_once __DIR__ . '/../Model.php';
require_once __DIR__ . '/../helpers/MultiRound.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../primitives/EventPrescript.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../primitives/Penalty.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventModel extends Model
{
    /**
     * Get data of players' current seating
     *
     * @param int $eventId
     * @param array $players
     * @throws InvalidParametersException
     * @throws \Exception
     * @return array TODO: should it be here? Looks a bit too low-level :/
     */
    public function getCurrentSeating(int $eventId, array $players)
    {
        $event = EventPrimitive::findById($this->_ds, [$eventId]);
        if (empty($event)) {
            throw new InvalidParametersException('Event id#' . $eventId . ' not found in DB');
        }
        $startRating = $event[0]->getRulesetConfig()->rules()->getStartRating();

        // get data from primitives, and some raw data
        $historyItems = PlayerHistoryPrimitive::findLastByEvent($this->_ds, [$eventId]);
        $seatings = $this->_ds->table('session_player')
            ->join('session', 'session.id = session_player.session_id')
            ->select('session_player.order')
            ->select('session_player.player_id')
            ->select('session_player.session_id')
            ->select('session.table_index')
            ->where('session.event_id', $eventId)
            ->orderByDesc('session.id')
            ->orderByAsc('order')
            ->limit(count($players))
            ->findArray();

        // merge it all together
        $ratings = [];
        foreach ($players as $reg) {
            $ratings[$reg['id']] = $startRating;
        }
        foreach ($historyItems as $item) { // overwrite with real values
            if (!empty($item->getRating())) {
                $ratings[$item->getPlayerId()] = $item->getRating();
            }
        }

        $users = array_map(function ($seat) use (&$ratings, &$players) {
            if (!empty($ratings[$seat['player_id']])) {
                $seat['rating'] = $ratings[$seat['player_id']];
            } else {
                $seat['rating'] = 0;
            }
            if (!empty($players[$seat['player_id']])) {
                $seat['title'] = $players[$seat['player_id']]['title'];
                $seat['has_avatar'] = $players[$seat['player_id']]['has_avatar'];
                $seat['last_update'] = $players[$seat['player_id']]['last_update'];
            } else {
                $seat['has_avatar'] = false;
            }
            return $seat;
        }, $seatings);

        return array_filter($users, function ($user) {
            return $user['table_index'] !== null;
        });
    }

    /**
     * Find out currently playing tables state
     * @param integer $eventId
     * @param bool $omitLastRound
     * @return array
     * @throws \Exception
     */
    public function getTablesState($eventId, $omitLastRound = false)
    {
        $event = EventPrimitive::findById($this->_ds, [$eventId])[0];
        if ($event->getIsFinished()) {
            throw new \Exception('Event is already finished');
        }

        $personId = $this->_meta->getCurrentPersonId();
        $currentlyPlayedSession = $personId
            ? SessionPrimitive::findByPlayerAndEvent($this->_ds, $personId, $eventId, SessionPrimitive::STATUS_INPROGRESS)
            : [];
        $canViewOtherTables = $event->getAllowViewOtherTables() ||
            count($currentlyPlayedSession) === 0 ||
            $this->_meta->isEventAdminById($eventId) ||
            $this->_meta->isEventRefereeById($eventId);

        if (!$canViewOtherTables) {
            throw new BadActionException('This is not allowed for this event');
        }

        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_ds, $eventId);
        $reggedPlayers = array_values(array_filter($reggedPlayers, function ($player) use ($event) {
            $includePlayer = true;
            if ($player['ignore_seating']) {
                $includePlayer = false;
            }
            if ($event->getIsPrescripted() && empty($player['local_id'])) {
                $includePlayer = false;
            }
            return $includePlayer;
        }));

        if ($event->getAllowPlayerAppend()) { // club game mode
            $tablesCount = 10;
        } else {
            $tablesCount = count($reggedPlayers) / 4;
        }

        $lastGames = SessionPrimitive::findByEventAndStatus($this->_ds, [$eventId], [
            SessionPrimitive::STATUS_FINISHED,
            SessionPrimitive::STATUS_INPROGRESS,
            SessionPrimitive::STATUS_PREFINISHED
        ], 0, intval($tablesCount));
        return $this->_formatTablesState($lastGames, $reggedPlayers, $omitLastRound);
    }

    /**
     * Find all playing tables on global level
     * @return array
     * @throws \Exception
     */
    public function getGlobalTablesState()
    {
        $games = SessionPrimitive::findAllInProgress($this->_ds);
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
        $prescript = EventPrescriptPrimitive::findByEventId($this->_ds, [$eventId]);
        if (empty($prescript)) {
            return [
                'event_id' => $eventId,
                'next_session_index' => 1,
                'prescript' => '',
                'check_errors' => [
                    'No predefined seating yet'
                ]
            ];
        }

        $regData = PlayerRegistrationPrimitive::findLocalIdsMapByEvent($this->_ds, $eventId);

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
        $prescript = EventPrescriptPrimitive::findByEventId($this->_ds, [$eventId]);
        if (empty($prescript)) {
            $prescript = [
                (new EventPrescriptPrimitive($this->_ds))
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
     * @param bool $omitLastRound
     * @throws \Exception
     * @return array
     */
    protected function _formatTablesState($lastGames, $reggedPlayers, $omitLastRound = false)
    {
        $output = [];
        $playerIdMap = [];
        foreach ($reggedPlayers as $reg) {
            $playerIdMap[$reg['id']] = $reg['local_id'];
        }

        if (count($lastGames) > 0) {
            // Assume that we don't use _formatTablesState for multiple events
            list($ev) = EventPrimitive::findById($this->_ds, [$lastGames[0]->getEventId()]);
            $teamNames = [];
            if ($ev->getIsTeam()) {
                $teamNames = PlayerRegistrationPrimitive::findTeamNameMapByEvent($this->_ds, $lastGames[0]->getEventId());
            }
            // Players who should ignore seating
            $ignoredPlayers = PlayerRegistrationPrimitive::findIgnoredPlayersIdsByEvent($this->_ds, [$lastGames[0]->getEventId()]);

            foreach ($lastGames as $game) {
                $game->setEvent($ev); // Preload event into session to prevent multiple fetches inside DateHelper::mayDefinalizeGame
                $gId = $game->getId();
                if (empty($gId)) {
                    throw new InvalidParametersException('Attempted to use deidented primitive');
                }

                $lastRound = null;
                if (!$omitLastRound) {
                    $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$gId]);
                    $lastRound = MultiRoundHelper::findLastRound($rounds);
                }

                $output [] = [
                    'status' => $game->getStatus(),
                    'may_definalize' => DateHelper::mayDefinalizeGame($game),
                    'hash' => $game->getRepresentationalHash(),
                    'penalties' => array_map(function (PenaltyPrimitive $pp) {
                        if (empty($pp->getId())) {
                            throw new InvalidParametersException('Attempted to use deidented primitive');
                        }
                        return [
                            'who' => $pp->getPlayerId(),
                            'amount' => $pp->getAmount(),
                            'reason' => $pp->getReason(),
                        ];
                    }, PenaltyPrimitive::findBySessionId($this->_ds, [$game->getId() ?? 0])),
                    'table_index' => $game->getTableIndex(),
                    'last_round_detailed' => $lastRound ? Formatters::formatRound($lastRound, $game) : null,
                    'last_round' => $lastRound ? $this->_formatLastRound($lastRound, $game) : [],
                    'current_round' => $game->getCurrentState()->getRound(),
                    'scores' => $game->getCurrentState()->getScores(),
                    'players' => array_map(function (PlayerPrimitive $p) use (&$playerIdMap, &$teamNames, &$ignoredPlayers) {
                        $pId = $p->getId();
                        if (empty($pId)) {
                            throw new InvalidParametersException('Attempted to use deidented primitive');
                        }
                        return [
                            'id'            => $pId,
                            'title'         => $p->getDisplayName(),
                            'local_id'      => empty($playerIdMap[$p->getId()]) ? null : $playerIdMap[$p->getId()],
                            'team_name'     => empty($teamNames[$p->getId()]) ? null : $teamNames[$p->getId()],
                            'tenhou_id'     => $p->getTenhouId(),
                            'has_avatar'    => $p->getHasAvatar(),
                            'last_update'    => $p->getLastUpdate(),
                            'ignore_seating' => in_array($p->getId(), $ignoredPlayers),
                            'replaced_by'   => null // NOTE: always null here, replacement data is not fetched!
                        ];
                    }, $game->getPlayers())
                ];
            }
        }

        return $output;
    }

    /**
     * @param RoundPrimitive $round
     * @return array
     */
    protected function _formatLastRound(RoundPrimitive $round, SessionPrimitive $session): array
    {
        $currentScores = $session->getCurrentState()->getScores();
        $previousScores = $round->getLastSessionState()->getScores();
        $scoresBefore = [];
        $scoresDelta = [];
        for ($i = 0; $i < count($session->getPlayersIds()); $i++) {
            $id = $session->getPlayersIds()[$i];
            $scoresBefore[$id] = $previousScores[$id];
            $scoresDelta[$id] = $currentScores[$id] - $previousScores[$id];
        }
        if ($round instanceof MultiRoundPrimitive) {
            return [
                'outcome' => $round->getOutcome(),
                'loser'   => $round->getLoserId(),
                'riichi'  => $round->getRiichiIds(),
                // Twirp compat
                'session_hash' => $session->getRepresentationalHash(),
                'scores_before'  => $scoresBefore,
                'scores_delta'   => $scoresDelta,
                'pao_player_id'  => $round->getPaoPlayerId(),
                'round_index' => $round->getRoundIndex(),
                'loser_id'     => $round->getLoserId(),
                'open_hand'   => $round->getOpenHand(),
                'tempai'     => ($round->getOutcome() === 'draw' || $round->getOutcome() === 'nagashi')
                    ? $round->getTempaiIds()
                    : null,
                'nagashi'    => $round->getOutcome() === 'nagashi' ? $round->getNagashiIds() : null,
                'multi_ron'     => $round->getMultiRon(),
                'riichi_bets'   => implode(',', array_filter(array_map(function (RoundPrimitive $r) {
                    return implode(',', $r->getRiichiIds());
                }, $round->rounds()))),
                // /Twirp compat
                'wins'    => array_map(function (RoundPrimitive $round) {
                    return [
                        'winner' => $round->getWinnerId(),
                        'han'    => $round->getHan(),
                        'fu'     => $round->getFu(),
                        'winner_id' => $round->getWinnerId(),
                        'pao_player_id' => $round->getPaoPlayerId(),
                        'yaku' => $round->getYaku(),
                        'dora' => $round->getDora(),
                        'kandora' => $round->getKandora(),
                        'uradora' => $round->getUradora(),
                        'kanuradora' => $round->getKanuradora(),
                        'open_hand' => $round->getOpenHand()
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
            'fu'      => $round->getFu(),

            // Twirp compat
            'session_hash' => $session->getRepresentationalHash(),
            'scores_before'  => $scoresBefore,
            'scores_delta'   => $scoresDelta,
            'pao_player_id'  => $round->getPaoPlayerId(),
            'riichi_bets' => $round->getRiichiIds(),
            'round_index' => $round->getRoundIndex(),
            'loser_id'     => $round->getLoserId(),
            'open_hand'   => $round->getOpenHand(),
            // /Twirp compat
        ];
    }

    /**
     * @param DataSource $ds
     * @param SessionPrimitive[] $games
     * @param int|null $eventId
     * @param array $replacements mapping of replacement players ids [id => replacement_id, ...]
     * @return array
     *@throws \Exception
     */
    public static function getPlayersOfGames(DataSource $ds, $games, $eventId = null, $replacements = [])
    {
        $playerIds = array_reduce($games, function ($acc, SessionPrimitive $el) {
            return array_merge($acc, $el->getPlayersIds());
        }, []);

        if (!empty($replacements)) {
            $playerIds = array_map(function ($id) use ($replacements) {
                if (!empty($replacements[$id])) {
                    return $replacements[$id];
                }
                return $id;
            }, $playerIds);
        }

        $players = PlayerPrimitive::findById($ds, $playerIds);

        $soulNicknames = [];
        $useSoulNicknames = false;
        if ($eventId) {
            $event = EventPrimitive::findById($ds, [$eventId]);
            $useSoulNicknames = $event[0]->getPlatformId() === PlatformType::PLATFORM_TYPE_MAHJONGSOUL;
            if ($useSoulNicknames) {
                $soulNicknames = $ds->remote()->getMajsoulNicknames(array_map(function (PlayerPrimitive $el) {
                    return (int)$el->getId();
                }, $players));
            }
        }

        $result = [];
        foreach ($players as $player) {
            $result[$player->getId()] = [
                'id'            => (int) $player->getId(),
                'title'         => $player->getDisplayName(),
                'has_avatar'    => $player->getHasAvatar(),
                'last_update'    => $player->getLastUpdate(),
                'tenhou_id'     => $useSoulNicknames ? ($soulNicknames[(int)$player->getId()] ?? '') : $player->getTenhouId()
            ];
        }

        return $result;
    }

    /**
     * Get all events (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @param string $filter
     * @param bool $filterUnlisted
     * @return array
     * @throws \Exception
     */
    public function getAllEvents(int $limit, int $offset, string $filter, bool $filterUnlisted)
    {
        if ($limit > 100) {
            $limit = 100;
        }

        $count = $this->_ds->table('event');

        $data = $this->_ds->table('event')
            ->select('event.id', 'id')
            ->select('event.title', 'title')
            ->select('event.description', 'description')
            ->select('event.is_online', 'is_online')
            ->select('event.sync_start', 'sync_start')
            ->select('event.finished', 'finished')
            ->select('event.is_prescripted', 'prescripted')
            ->select('event.is_team', 'is_team')
            ->select('event.is_listed', 'is_listed')
            ->select('event.hide_results', 'hide_results')
            ->select('event.hide_achievements', 'hide_achievements')
            ->select('event.min_games_count', 'min_games_count')
            ->select('event.series_length', 'series_length')
            ->select('event.ruleset_config', 'ruleset_config')
            ->select('event.platform_id', 'platform_id')
            ->selectExpr('count(session.id)', 'sessioncnt')
            ->leftOuterJoin('session', 'session.event_id = event.id')
            ->groupBy('event.id')
            ->orderByDesc('event.id');

        if (!empty($filter)) {
            $filter = rawurldecode($filter);
            $data = $data->whereRaw('event.title ILIKE ?', ['%' . $filter . '%']);
            $count = $count->whereRaw('event.title ILIKE ?', ['%' . $filter . '%']);
        }

        if ($filterUnlisted) {
            $data = $data->where('event.is_listed', 1);
            $count = $count->where('is_listed', 1);
        }

        $count = $count->count();
        $data = $data
            ->limit($limit)
            ->offset($offset)
            ->findMany();

        return [
            'total' => $count,
            'events' => array_map(function ($event) {
                $ruleset = json_decode($event['ruleset_config'], true);
                $type = $event['is_online']
                    ? 'online'
                    : ($event['sync_start'] ? 'tournament' : 'local');
                return [
                    'id' => $event['id'],
                    'title' => $event['title'],
                    'description' => $event['description'],
                    'finished' => !!$event['finished'],
                    'prescripted' => !!$event['prescripted'],
                    'isListed' => !!$event['is_listed'],
                    'isTeam' => !!$event['is_team'],
                    'minGamesCount' => $event['min_games_count'],
                    'hasSeries' => $event['series_length'] > 0,
                    'isRatingShown' => !$event['hide_results'],
                    'achievementsShown' => !$event['hide_achievements'],
                    'withChips' => !empty($ruleset) && !empty($ruleset['chipsValue']) && $ruleset['chipsValue'] > 0,
                    'withYakitori' => !empty($ruleset) && !empty($ruleset['withYakitori']),
                    'tournamentStarted' => $type === 'tournament' && $event['sessioncnt'] > 0,
                    'type' => $type,
                    'platformId' => $event['platform_id']
                ];
            }, $data)
        ];
    }

    /**
     * Get events by id list
     *
     * @param array $idList
     * @throws \Exception
     * @return array
     */
    public function getEventsById(array $idList)
    {
        $data = $this->_ds->table('event')
            ->select('event.id', 'id')
            ->select('event.title', 'title')
            ->select('event.description', 'description')
            ->select('event.is_online', 'is_online')
            ->select('event.sync_start', 'sync_start')
            ->select('event.finished', 'finished')
            ->select('event.is_prescripted', 'prescripted')
            ->select('event.is_listed', 'is_listed')
            ->select('event.is_team', 'is_team')
            ->select('event.min_games_count', 'min_games_count')
            ->select('event.hide_results', 'hide_results')
            ->select('event.hide_achievements', 'hide_achievements')
            ->select('event.ruleset_config', 'ruleset_config')
            ->select('event.series_length', 'series_length')
            ->select('event.platform_id', 'platform_id')
            ->selectExpr('count(session.id)', 'sessioncnt')
            ->leftOuterJoin('session', 'session.event_id = event.id')
            ->whereIn('event.id', $idList)
            ->groupBy('event.id')
            ->findMany();

        return array_map(function ($event) {
            $ruleset = json_decode($event['ruleset_config'], true);
            $type = $event['is_online']
                ? 'online'
                : ($event['sync_start'] ? 'tournament' : 'local');
            return [
                'id' => $event['id'],
                'title' => $event['title'],
                'description' => $event['description'],
                'finished' => !!$event['finished'],
                'prescripted' => !!$event['prescripted'],
                'isListed' => !!$event['is_listed'],
                'minGamesCount' => $event['min_games_count'],
                'isTeam' => !!$event['is_team'],
                'isRatingShown' => !$event['hide_results'],
                'achievementsShown' => !$event['hide_achievements'],
                'hasSeries' => $event['series_length'] > 0,
                'withChips' => !empty($ruleset) && !empty($ruleset['chipsValue']) && $ruleset['chipsValue'] > 0,
                'withYakitori' => !empty($ruleset) && !empty($ruleset['withYakitori']),
                'tournamentStarted' => $type === 'tournament' && $event['sessioncnt'] > 0,
                'type' => $type,
                'platformId' => $event['platform_id']
            ];
        }, $data);
    }
}
