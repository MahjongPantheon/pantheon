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

class Formatters
{
    /**
     * @param SessionPrimitive $session
     * @param SessionResultsPrimitive[][] $sessionResults
     * @param RoundPrimitive[][] $rounds
     * @param array $replacements mapping of replacement players ids [id => replacement_id, ...]
     *
     * @return array
     * @throws \Exception
     *
     */
    public static function formatGameResults(SessionPrimitive $session, array $sessionResults, array $penalties, array $rounds, $replacements = [])
    {
        $currentPlatformId = $session->getEvent()->getPlatformId();
        if ($currentPlatformId === -1 || $currentPlatformId === 0) {
            $currentPlatformId = PlatformType::PLATFORM_TYPE_TENHOUNET;
        }
        return [
            'hash' => $session->getRepresentationalHash(),
            'date' => $session->getEndDate(),
            'replay_link' => $session->getReplayLink($currentPlatformId),
            'players' => self::_replaceMany(array_map('intval', $session->getPlayersIds()), $replacements),
            'final_results' => self::_arrayMapPreserveKeys(function (SessionResultsPrimitive $el) use ($replacements) {
                return [
                    'player_id'     => self::_replaceOne((int) $el->getPlayerId(), $replacements),
                    'score'         => (int) $el->getScore(),
                    'rating_delta'  => (float) $el->getRatingDelta(),
                    'place'         => (int) $el->getPlace()
                ];
            }, $sessionResults[$session->getId()]),
            'penalties' => $penalties,
            'rounds' => array_map(function ($round) use ($session, $replacements) {
                return self::formatRound($round, $session, $replacements);
            }, $rounds[$session->getId()]),
        ];
    }

    /**
     * @param int $playerId
     * @param array $replacements
     * @return int
     */
    private static function _replaceOne(int $playerId, $replacements = [])
    {
        if (!empty($replacements[$playerId])) {
            return (int)$replacements[$playerId];
        }
        return $playerId;
    }

    /**
     * @param array $playerIds
     * @param array $replacements
     * @return int[]
     */
    private static function _replaceMany(array $playerIds, $replacements = [])
    {
        return array_map(function ($id) use ($replacements) {
            return self::_replaceOne($id, $replacements);
        }, $playerIds);
    }

    /**
     * @param RoundPrimitive $round
     * @param SessionPrimitive $session
     * @param array $replacements mapping of replacement players ids [id => replacement_id, ...]
     * @return array
     * @throws DatabaseException
     */
    public static function formatRound(RoundPrimitive $round, SessionPrimitive $session, $replacements = [])
    {
        switch ($round->getOutcome()) {
            case 'ron':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'honba'         => (int) $session->getCurrentState()->getHonba(),
                    'outcome'       => $round->getOutcome(),
                    'winner_id'     => self::_replaceOne((int) $round->getWinnerId(), $replacements),
                    'loser_id'      => self::_replaceOne((int) $round->getLoserId(), $replacements),
                    'pao_player_id' => self::_replaceOne((int) $round->getPaoPlayerId(), $replacements),
                    'han'           => (int) $round->getHan(),
                    'fu'            => (int) $round->getFu(),
                    'yaku'          => $round->getYaku(),
                    'riichi_bets'   => implode(',', self::_replaceMany($round->getRiichiIds(), $replacements)),
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
                    'honba'         => (int) $session->getCurrentState()->getHonba(),
                    'outcome'       => $mRound->getOutcome(),
                    'loser_id'      => self::_replaceOne((int) $mRound->getLoserId(), $replacements),
                    'multi_ron'     => (int) $rounds[0]->getMultiRon(),
                    'riichi_bets'   => implode(',', array_filter(array_map(function (RoundPrimitive $r) use ($replacements) {
                        return implode(',', self::_replaceMany($r->getRiichiIds(), $replacements));
                    }, $rounds))),
                    'wins'          => array_map(function (RoundPrimitive $round) use ($replacements) {
                        return [
                            'winner_id'     => self::_replaceOne((int) $round->getWinnerId(), $replacements),
                            'pao_player_id' => self::_replaceOne((int) $round->getPaoPlayerId(), $replacements),
                            'han'           => (int) $round->getHan(),
                            'fu'            => (int) $round->getFu(),
                            'yaku'          => $round->getYaku(),
                            'riichi_bets'   => implode(',', self::_replaceMany($round->getRiichiIds(), $replacements)),
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
                    'honba'         => (int) $session->getCurrentState()->getHonba(),
                    'outcome'       => $round->getOutcome(),
                    'winner_id'     => self::_replaceOne((int) $round->getWinnerId(), $replacements),
                    'pao_player_id' => self::_replaceOne((int) $round->getPaoPlayerId(), $replacements),
                    'han'           => (int) $round->getHan(),
                    'fu'            => (int) $round->getFu(),
                    'yaku'          => $round->getYaku(),
                    'riichi_bets'   => implode(',', self::_replaceMany($round->getRiichiIds(), $replacements)),
                    'dora'          => (int) $round->getDora(),
                    'uradora'       => (int) $round->getUradora(), // TODO: not sure if we really need these guys
                    'kandora'       => (int) $round->getKandora(),
                    'kanuradora'    => (int) $round->getKanuradora(),
                    'open_hand'     => $round->getOpenHand()
                ];
            case 'draw':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'honba'         => (int) $session->getCurrentState()->getHonba(),
                    'outcome'       => $round->getOutcome(),
                    'riichi_bets'   => implode(',', self::_replaceMany($round->getRiichiIds(), $replacements)),
                    'tempai'        => implode(',', self::_replaceMany($round->getTempaiIds(), $replacements))
                ];
            case 'abort':
                return [
                    'round_index'   => $round->getRoundIndex(),
                    'honba'         => (int) $session->getCurrentState()->getHonba(),
                    'outcome'       => $round->getOutcome(),
                    'riichi_bets'   => implode(',', self::_replaceMany($round->getRiichiIds(), $replacements))
                ];
            case 'chombo':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'honba'         => (int) $session->getCurrentState()->getHonba(),
                    'outcome'       => $round->getOutcome(),
                    'loser_id'      => self::_replaceOne((int) $round->getLoserId(), $replacements)
                ];
            case 'nagashi':
                return [
                    'round_index'   => (int) $round->getRoundIndex(),
                    'honba'         => (int) $session->getCurrentState()->getHonba(),
                    'outcome'       => $round->getOutcome(),
                    'riichi_bets'   => implode(',', self::_replaceMany($round->getRiichiIds(), $replacements)),
                    'tempai'        => implode(',', self::_replaceMany($round->getTempaiIds(), $replacements)),
                    'nagashi'       => implode(',', self::_replaceMany($round->getNagashiIds(), $replacements))
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
    protected static function _arrayMapPreserveKeys(callable $cb, array $array): bool|array
    {
        return array_combine(array_keys($array), array_map($cb, array_values($array)));
    }
}
