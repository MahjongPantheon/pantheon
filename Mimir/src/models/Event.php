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
            'dieHard' => AchievementsPrimitive::getDieHardData($this->_db, $eventId),
            'chomboMaster' => AchievementsPrimitive::getChomboMasters($this->_db, $eventId),
            'dovakin' => AchievementsPrimitive::getDovakins($this->_db, $eventId),
            'yakuman' => AchievementsPrimitive::getYakumans($this->_db, $eventId),
            'shithander' => AchievementsPrimitive::getBestShithander($this->_db, $eventId),
            'bestDealer' => AchievementsPrimitive::getBestDealer($this->_db, $eventId),
            'bestFu' => AchievementsPrimitive::getMaxFuHand($this->_db, $eventId)
        ];
    }

    /**
     * Find out currently playing tables state (for tournaments only)
     * @param integer $eventId
     * @return array
     * @throws \Exception
     */
    public function getTablesState($eventId)
    {
        $reggedPlayers = PlayerRegistrationPrimitive::findRegisteredPlayersIdsByEvent($this->_db, $eventId);
        $tablesCount = count($reggedPlayers) / 4;

        $lastGames = SessionPrimitive::findByEventAndStatus($this->_db, $eventId, [
            SessionPrimitive::STATUS_FINISHED,
            SessionPrimitive::STATUS_INPROGRESS,
            SessionPrimitive::STATUS_PREFINISHED
        ], 0, $tablesCount);
        return $this->_formatTablesState($lastGames);
    }

    /**
     * Find all playing tables on global level
     * @return array
     * @throws \Exception
     */
    public function getGlobalTablesState()
    {
        $games = SessionPrimitive::findAllInProgress($this->_db);
        return $this->_formatTablesState($games);
    }

    /**
     * @param SessionPrimitive[] $lastGames
     * @throws \Exception
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
