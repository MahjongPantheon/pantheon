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
require_once __DIR__ . '/../helpers/Formatters.php';
require_once __DIR__ . '/../primitives/Event.php';
require_once __DIR__ . '/../primitives/Session.php';
require_once __DIR__ . '/../primitives/SessionResults.php';
require_once __DIR__ . '/../primitives/Player.php';
require_once __DIR__ . '/../primitives/PlayerRegistration.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventFinishedGamesModel extends Model
{
    /**
     * @param EventPrimitive[] $eventList
     * @param int $limit
     * @param int $offset
     * @param string $orderBy
     * @param string $order
     * @throws \Exception
     * @return array
     */
    public function getLastFinishedGames($eventList, int $limit, int $offset, string $orderBy, string $order)
    {
        $eventIdList = array_map(function (EventPrimitive $el) {
            return $el->getId();
        }, $eventList);

        $games = SessionPrimitive::findByEventListAndStatus(
            $this->_ds,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED,
            $offset,
            $limit,
            $orderBy,
            $order
        );

        $gamesCount = SessionPrimitive::getGamesCount(
            $this->_ds,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED
        );

        /** @var array $sessionIds */
        $sessionIds = array_map(function (SessionPrimitive $el) {
            return $el->getId();
        }, $games);

        $sessionResults = $this->_getSessionResults($sessionIds); // 1st level: session id, 2nd level: player id
        $rounds = $this->_getRounds($sessionIds); // 1st level: session id, 2nd level: numeric index with no meaning
        $penalties = $this->_getPenalties($sessionIds); // 1st level: session id

        $result = [
            'games' => [],
            'players' => EventModel::getPlayersOfGames($this->_ds, $games, $eventIdList[0]), // TODO: support multiple events
            'total_games' => $gamesCount
        ];

        foreach ($games as $session) {
            $result['games'][] = Formatters::formatGameResults($session, $sessionResults, $penalties[$session->getId()], $rounds);
        }

        return $result;
    }

    /**
     * @param SessionPrimitive $session
     * @param bool $substituteReplacementPlayers
     * @return array
     * @throws \Exception
     */
    public function getFinishedGame(SessionPrimitive $session, $substituteReplacementPlayers = false)
    {
        $sId = $session->getId();
        if (empty($sId)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }

        $sessionResults = $this->_getSessionResults([$sId]);
        $rounds = $this->_getRounds([$sId]);

        $replacements = [];
        if ($substituteReplacementPlayers) {
            $regs = PlayerRegistrationPrimitive::findByEventId($this->_ds, $session->getEventId());
            foreach ($regs as $reg) {
                $replacements[$reg->getPlayerId()] = $reg->getReplacementPlayerId();
            }
        }

        $penalties = array_map(function(PenaltyPrimitive $pp) {
            if (empty($pp->getId())) {
                throw new InvalidParametersException('Attempted to use deidented primitive');
            }
            return [
                'who' => $pp->getPlayerId(),
                'amount' => $pp->getAmount(),
                'reason' => $pp->getReason(),
            ];
        }, PenaltyPrimitive::findBySessionId($this->_ds, [$session->getId()]));

        return [
            'games' => [Formatters::formatGameResults($session, $sessionResults, $penalties, $rounds, $replacements)],
            'players' => EventModel::getPlayersOfGames($this->_ds, [$session], $session->getEventId(), $replacements)
        ];
    }

    /**
     * @param int[] $sessionIds
     *
     * @return RoundPrimitive[][]
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

    /**
     * @param int[] $sessionIds
     * @return array
     * @throws InvalidParametersException
     */
    protected function _getPenalties(array $sessionIds)
    {
        return array_reduce(PenaltyPrimitive::findBySessionId($this->_ds, $sessionIds), function ($acc, $item) {
            if (empty($item->getId())) {
                throw new InvalidParametersException('Attempted to use deidented primitive');
            }

            if (empty($acc[$item->getSessionId()])) {
                $acc[$item->getSessionId()] = [];
            }

            $acc[$item->getSessionId()] []= [
                'who' => $item->getPlayerId(),
                'amount' => $item->getAmount(),
                'reason' => $item->getReason()
            ];
            return $acc;
        }, []);
    }

    /**
     * @param int[] $sessionIds
     *
     *
     * @return SessionResultsPrimitive[][]
     * @throws \Exception
     */
    protected function _getSessionResults(array $sessionIds)
    {
        $results = SessionResultsPrimitive::findBySessionId($this->_ds, $sessionIds);

        $result = [];
        foreach ($results as $item) {
            if (empty($result[$item->getSessionId()])) {
                $result[$item->getSessionId()] = [];
            }
            $result[$item->getSessionId()][$item->getPlayerId()] = $item;
        }

        return $result;
    }
}
