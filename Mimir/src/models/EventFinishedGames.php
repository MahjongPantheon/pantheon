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
require_once __DIR__ . '/../primitives/PlayerEnrollment.php';
require_once __DIR__ . '/../primitives/PlayerHistory.php';
require_once __DIR__ . '/../primitives/Achievements.php';
require_once __DIR__ . '/../primitives/Round.php';
require_once __DIR__ . '/../exceptions/InvalidParameters.php';

class EventFinishedGamesModel extends Model
{
    /**
     * @param EventPrimitive[] $eventList
     * @param integer $limit
     * @param integer $offset
     * @param string $orderBy
     * @param string $order
     * @throws \Exception
     * @return array
     */
    public function getLastFinishedGames($eventList, $limit, $offset, $orderBy, $order)
    {
        $eventIdList = array_map(function (EventPrimitive $el) {
            return $el->getId();
        }, $eventList);

        $games = SessionPrimitive::findByEventListAndStatus(
            $this->_db,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED,
            $offset,
            $limit,
            $orderBy,
            $order
        );

        $gamesCount = SessionPrimitive::getGamesCount(
            $this->_db,
            $eventIdList,
            SessionPrimitive::STATUS_FINISHED
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
            'players' => EventModel::getPlayersOfGames($this->_db, $games),
            'total_games' => $gamesCount
        ];

        foreach ($games as $session) {
            $result['games'][] = $this->_formatGameResults($session, $sessionResults, $rounds);
        }

        return $result;
    }

    /**
     * @param SessionPrimitive $session
     * @return array
     * @throws \Exception
     */
    public function getFinishedGame(SessionPrimitive $session)
    {
        /** @var SessionResultsPrimitive[][] $sessionResults */
        $sessionResults = $this->_getSessionResults([$session->getId()]);

        /** @var RoundPrimitive[][] $rounds */
        $rounds = $this->_getRounds([$session->getId()]);

        return [
            'games' => [$this->_formatGameResults($session, $sessionResults, $rounds)],
            'players' => EventModel::getPlayersOfGames($this->_db, [$session])
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
     * @param $sessionIds
     * @return SessionResultsPrimitive[][]
     * @throws \Exception
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
     * @param RoundPrimitive $round
     * @return array
     * @throws DatabaseException
     */
    protected function _formatRound(RoundPrimitive $round)
    {
        switch ($round->getOutcome()) {
            case 'ron':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'outcome'       => $round->getOutcome(),
                    'winner_id'     => (int) $round->getWinnerId(),
                    'loser_id'      => (int) $round->getLoserId(),
                    'pao_player_id' => (int) $round->getPaoPlayerId(),
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
                            'pao_player_id' => (int) $round->getPaoPlayerId(),
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
                    'pao_player_id' => (int) $round->getPaoPlayerId(),
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
}
