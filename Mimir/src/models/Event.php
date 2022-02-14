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
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Achievements.php';
require_once __DIR__ . '/../primitives/Round.php';
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
        $startRating = $event[0]->getRuleset()->startRating();

        // get data from primitives, and some raw data
        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_ds, $eventId);
        $historyItems = PlayerHistoryPrimitive::findLastByEvent($this->_ds, $eventId);
        $seatings = $this->_ds->table('session_player')
            ->join('session', 'session.id = session_player.session_id')
            ->select('session_player.order')
            ->select('session_player.player_id')
            ->select('session_player.session_id')
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

        return array_map(function ($seat) use (&$ratings, &$players) {
            $seat['rating'] = $ratings[$seat['player_id']];
            $seat['title'] = $players[$seat['player_id']]['title'];
            return $seat;
        }, $seatings);
    }

    /**
     * Find out currently playing tables state (for tournaments only)
     * @param integer $eventId
     * @return array
     * @throws \Exception
     */
    public function getTablesState($eventId)
    {
        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_ds, $eventId);
        $reggedPlayers = array_values(array_filter($reggedPlayers, function ($el) {
            return !$el['ignore_seating'];
        }));

        $event = EventPrimitive::findById($this->_ds, [$eventId])[0];
        if ($event->getIsFinished()) {
            throw new \Exception('Event is already finished');
        }
        if ($event->getAllowPlayerAppend()) { // club game mode
            $tablesCount = 10;
        } else {
            $tablesCount = count($reggedPlayers) / 4;
        }

        $lastGames = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, [
            SessionPrimitive::STATUS_FINISHED,
            SessionPrimitive::STATUS_INPROGRESS,
            SessionPrimitive::STATUS_PREFINISHED
        ], 0, intval($tablesCount));
        return $this->_formatTablesState($lastGames, $reggedPlayers);
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
                'prescript' => null,
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
     * @throws \Exception
     * @return array
     */
    protected function _formatTablesState($lastGames, $reggedPlayers)
    {
        $output = [];
        $playerIdMap = [];
        foreach ($reggedPlayers as $reg) {
            $playerIdMap[$reg['id']] = $reg['local_id'];
        }

        if (count($lastGames) > 0) {
            // Assume that we don't use _formatTablesState for multiple events
            list($ev) = EventPrimitive::findById($this->_ds, [$lastGames[0]->getEventId()]);
            foreach ($lastGames as $game) {
                $game->setEvent($ev); // Preload event into session to prevent multiple fetches inside DateHelper::mayDefinalizeGame
                $gId = $game->getId();
                if (empty($gId)) {
                    throw new InvalidParametersException('Attempted to use deidented primitive');
                }
                $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$gId]);
                $lastRound = MultiRoundHelper::findLastRound($rounds);

                $output [] = [
                    'status' => $game->getStatus(),
                    'may_definalize' => DateHelper::mayDefinalizeGame($game),
                    'hash' => $game->getRepresentationalHash(),
                    'penalties' => $game->getCurrentState()->getPenaltiesLog(),
                    'table_index' => $game->getTableIndex(),
                    'last_round' => $lastRound ? $this->_formatLastRound($lastRound) : [],
                    'current_round' => $game->getCurrentState()->getRound(),
                    'scores' => $game->getCurrentState()->getScores(),
                    'players' => array_map(function (PlayerPrimitive $p) use (&$playerIdMap) {
                        $pId = $p->getId();
                        if (empty($pId)) {
                            throw new InvalidParametersException('Attempted to use deidented primitive');
                        }
                        return [
                            'id' => $pId,
                            // may be empty for excluded players in non-prescripted event, so it's fine.
                            'local_id' => empty($playerIdMap[$pId]) ? 0 : $playerIdMap[$pId],
                            'title' => $p->getDisplayName(),
                            'titleEn' => $p->getDisplayNameEn(),
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
    protected function _formatLastRound(RoundPrimitive $round): array
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
     * @param DataSource $ds
     * @param SessionPrimitive[] $games
     * @throws \Exception
     * @return array
     */
    public static function getPlayersOfGames(DataSource $ds, $games)
    {
        $players = PlayerPrimitive::findById($ds, array_reduce($games, function ($acc, SessionPrimitive $el) {
            return array_merge($acc, $el->getPlayersIds());
        }, []));

        $result = [];
        foreach ($players as $player) {
            $result[$player->getId()] = [
                'id'            => (int) $player->getId(),
                'title'         => $player->getDisplayName(),
                'titleEn'       => $player->getDisplayNameEn(),
                'tenhou_id'     => $player->getTenhouId()
            ];
        }

        return $result;
    }

    /**
     * Get all events (paginated)
     *
     * @param int $limit
     * @param int $offset
     * @param bool $filterFinished
     * @throws \Exception
     * @return array
     */
    public function getAllEvents(int $limit, int $offset, bool $filterFinished)
    {
        if ($limit > 100) {
            $limit = 100;
        }

        $count = $this->_ds->table('event')->count();

        $data = $this->_ds->table('event')
            ->select('id')
            ->select('title')
            ->select('description')
            ->select('is_online')
            ->select('finished')
            ->select('sync_start')
            ->orderByDesc('id');
        if ($filterFinished) {
            $data = $data->where('finished', 0);
        }
        $data = $data
            ->limit($limit)
            ->offset($offset)
            ->findMany();

        return [
            'total' => $count,
            'events' => array_map(function ($event) {
                return [
                    'id' => $event['id'],
                    'title' => $event['title'],
                    'description' => $event['description'],
                    'finished' => !!$event['finished'],
                    'type' => $event['is_online']
                        ? 'online'
                        : ($event['sync_start'] ? 'tournament' : 'local')
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
            ->selectExpr('count(session.id)', 'sessioncnt')
            ->leftOuterJoin('session', 'session.event_id = event.id')
            ->whereIn('event.id', $idList)
            ->groupBy('event.id')
            ->findMany();

        return array_map(function ($event) {
            $type = $event['is_online']
                ? 'online'
                : ($event['sync_start'] ? 'tournament' : 'local');
            return [
                'id' => $event['id'],
                'title' => $event['title'],
                'description' => $event['description'],
                'finished' => !!$event['finished'],
                'tournamentStarted' => $type === 'tournament' && $event['sessioncnt'] > 0,
                'type' => $type
            ];
        }, $data);
    }
}
