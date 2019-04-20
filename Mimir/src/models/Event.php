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
     * Find out currently playing tables state (for tournaments only)
     * @param integer $eventId
     * @param bool $includeAllRounds
     * @return array
     * @throws \Exception
     */
    public function getTablesState($eventId, $includeAllRounds = false)
    {
        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_ds, $eventId);
        $reggedPlayers = array_values(array_filter($reggedPlayers, function ($el) {
            return !$el['ignore_seating'];
        }));

        $event = EventPrimitive::findById($this->_db, [$eventId])[0];
        if ($event->getAllowPlayerAppend()) { // club game mode
            $tablesCount = 10;
        } else {
            $tablesCount = count($reggedPlayers) / 4;
        }

        $lastGames = SessionPrimitive::findByEventAndStatus($this->_ds, $eventId, [
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
            $rounds = RoundPrimitive::findBySessionIds($this->_ds, [$game->getId()]);
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
                        // may be empty for excluded players in non-prescripted event, so it's fine.
                        'local_id' => empty($playerIdMap[$p->getId()]) ? 0 : $playerIdMap[$p->getId()],
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
                'display_name'  => $player->getDisplayName(),
                'tenhou_id'     => $player->getTenhouId()
            ];
        }

        return $result;
    }

    /**
     * Get all events (paginated)
     *
     * @param $limit
     * @param $offset
     * @throws \Exception
     * @return array
     */
    public function getAllEvents($limit, $offset)
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
            ->select('sync_start')
            ->orderByDesc('id')
            ->limit($limit)
            ->offset($offset)
            ->findMany();

        return [
            'total' => $count,
            'events' => array_map(function($event) {
                return [
                    'id' => $event['id'],
                    'title' => $event['title'],
                    'description' => $event['description'],
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
     * @param $idList
     * @throws \Exception
     * @return array
     */
    public function getEventsById($idList)
    {
        $data = $this->_ds->table('event')
            ->select('id')
            ->select('title')
            ->select('description')
            ->select('is_online')
            ->select('sync_start')
            ->whereIdIn($idList)
            ->findMany();

        return array_map(function($event) {
            return [
                'id' => $event['id'],
                'title' => $event['title'],
                'description' => $event['description'],
                'type' => $event['is_online']
                    ? 'online'
                    : ($event['sync_start'] ? 'tournament' : 'local')
            ];
        }, $data);
    }
}
