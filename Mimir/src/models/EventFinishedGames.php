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

        $result = [
            'games' => [],
            'players' => EventModel::getPlayersOfGames($this->_ds, $games),
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
        $sId = $session->getId();
        if (empty($sId)) {
            throw new InvalidParametersException('Attempted to use deidented primitive');
        }

        $sessionResults = $this->_getSessionResults([$sId]);
        $rounds = $this->_getRounds([$sId]);

        return [
            'games' => [$this->_formatGameResults($session, $sessionResults, $rounds)],
            'players' => EventModel::getPlayersOfGames($this->_ds, [$session])
        ];
    }

    /**
     * @param SessionPrimitive $session
     * @param SessionResultsPrimitive[][] $sessionResults
     * @param RoundPrimitive[][] $rounds
     *
     * @return array
     * @throws \Exception
     *
     */
    protected function _formatGameResults(SessionPrimitive $session, array $sessionResults, array $rounds)
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
            case 'nagashi':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'outcome'       => $round->getOutcome(),
                    'riichi_bets'   => implode(',', $round->getRiichiIds()),
                    'tempai'        => implode(',', $round->getTempaiIds()),
                    'nagashi'       => implode(',', $round->getNagashiIds())
                ];
            default:
                throw new DatabaseException('Wrong outcome detected! This should not happen - DB corrupted?');
        }
    }

    /**
     * @param callable $cb
     * @param array $array
     * @return array|false
     */
    protected function _arrayMapPreserveKeys(callable $cb, array $array)
    {
        return array_combine(array_keys($array), array_map($cb, array_values($array)));
    }
}
