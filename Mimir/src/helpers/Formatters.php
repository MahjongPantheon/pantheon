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

class Formatters
{
    /**
     * @param SessionPrimitive $session
     * @param SessionResultsPrimitive[][] $sessionResults
     * @param RoundPrimitive[][] $rounds
     *
     * @return array
     * @throws \Exception
     *
     */
    public static function formatGameResults(SessionPrimitive $session, array $sessionResults, array $rounds)
    {
        return [
            'hash' => $session->getRepresentationalHash(),
            'date' => $session->getEndDate(),
            'replay_link' => $session->getReplayLink(),
            'players' => array_map('intval', $session->getPlayersIds()),
            'final_results' => self::_arrayMapPreserveKeys(function (SessionResultsPrimitive $el) {
                return [
                    'player_id'     => (int) $el->getPlayerId(),
                    'score'         => (int) $el->getScore(),
                    'rating_delta'  => (float) $el->getRatingDelta(),
                    'place'         => (int) $el->getPlace()
                ];
            }, $sessionResults[$session->getId()]),
            'penalties' => $session->getCurrentState()->getPenaltiesLog(),
            // @phpstan-ignore-next-line
            'rounds' => array_map('self::formatRound', $rounds[$session->getId()]),
        ];
    }

    /**
     * @param RoundPrimitive $round
     * @return array
     * @throws DatabaseException
     */
    public static function formatRound(RoundPrimitive $round)
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
                    'riichi_bets'   => implode(',', array_filter(array_map(function (RoundPrimitive $r) {
                        return implode(',', $r->getRiichiIds());
                    }, $rounds))),
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
    protected static function _arrayMapPreserveKeys(callable $cb, array $array): bool|array
    {
        return array_combine(array_keys($array), array_map($cb, array_values($array)));
    }
}
