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

class PointsCalc
{
    private static $_lastPaymentsInfo = [];

    public static function resetPaymentsInfo(): void
    {
        self::$_lastPaymentsInfo = [
            'direct' => [],
            'riichi' => [],
            'honba' => []
        ];
    }

    public static function lastPaymentsInfo()
    {
        return self::$_lastPaymentsInfo;
    }

    /**
     * @param Ruleset $rules
     * @param bool $isDealer
     * @param int[] $currentScores
     * @param int $winnerId
     * @param int $loserId
     * @param int $han
     * @param int|null $fu
     * @param int[] $riichiIds
     * @param int $honba
     * @param int $riichiBetsCount
     * @param int|null $paoPlayerId
     * @param int|null $closestWinner
     * @param int $totalRiichiInRound
     *
     *
     * @return int[]
     * @throws InvalidParametersException
     */
    public static function ron(
        Ruleset $rules,
        bool $isDealer,
        array $currentScores,
        int $winnerId,
        int $loserId,
        int $han,
        ?int $fu,
        array $riichiIds,
        int $honba,
        int $riichiBetsCount,
        ?int $paoPlayerId,
        ?int $closestWinner = null,
        int $totalRiichiInRound = 0
    ) {
        self::resetPaymentsInfo();
        $pointsDiff = self::_calcPoints($rules, $han, $fu, false, $isDealer);

        if (empty($winnerId) || empty($loserId)) {
            throw new InvalidParametersException('Ron must have winner and loser');
        }

        if (!empty($paoPlayerId) && $paoPlayerId != $loserId) {
            $currentScores[$winnerId] += $pointsDiff['winner'];
            $currentScores[$loserId] += $pointsDiff['loser'] / 2;
            $currentScores[$paoPlayerId] += $pointsDiff['loser'] / 2;
            self::$_lastPaymentsInfo['direct'][$winnerId . '<-' . $loserId] = $pointsDiff['winner'] / 2;
            self::$_lastPaymentsInfo['direct'][$winnerId . '<-' . $paoPlayerId] = $pointsDiff['winner'] / 2;
        } else {
            $currentScores[$winnerId] += $pointsDiff['winner'];
            $currentScores[$loserId] += $pointsDiff['loser'];
            self::$_lastPaymentsInfo['direct'][$winnerId . '<-' . $loserId] = $pointsDiff['winner'];
        }

        if (empty($riichiIds)) {
            $riichiIds = [];
        }

        foreach ($riichiIds as $playerId) {
            $currentScores[$playerId] -= 1000;
            self::$_lastPaymentsInfo['riichi'][$winnerId . '<-' . $playerId] = 1000;
        }

        // this condition we are checking only for double ron
        if ($rules->doubleronRiichiAtamahane() && $closestWinner) {
            // on tenhou we had to give all riichi bets to closest winner only
            if ($closestWinner == $winnerId) {
                $currentScores[$winnerId] += 1000 * $totalRiichiInRound;
                $currentScores[$winnerId] += 1000 * $riichiBetsCount;
                self::$_lastPaymentsInfo['riichi'][$winnerId . '<-'] = 1000 * $riichiBetsCount;
            }
        } else {
            $currentScores[$winnerId] += 1000 * count($riichiIds);
            $currentScores[$winnerId] += 1000 * $riichiBetsCount;
            self::$_lastPaymentsInfo['riichi'][$winnerId . '<-'] = 1000 * $riichiBetsCount;
        }

        // this condition we are checking only for double ron
        if ($rules->doubleronHonbaAtamahane() && $closestWinner) {
            // on tenhou we had to give all honba sticks to closest winner only
            if ($winnerId == $closestWinner) {
                $currentScores[$winnerId] += 300 * $honba;
                $currentScores[$loserId] -= 300 * $honba;
                self::$_lastPaymentsInfo['honba'][$winnerId . '<-' . $loserId] = 300 * $honba;
            }
        } else {
            $currentScores[$winnerId] += 300 * $honba;
            $currentScores[$loserId] -= 300 * $honba;
            self::$_lastPaymentsInfo['honba'][$winnerId . '<-' . $loserId] = 300 * $honba;
        }

        return $currentScores;
    }

    /**
     * @param Ruleset $rules
     * @param int $currentDealer
     * @param int[] $currentScores
     * @param int $winnerId
     * @param int $han
     * @param int|null $fu
     * @param int[] $riichiIds
     * @param int $honba
     * @param int $riichiBetsCount
     * @param int|null $paoPlayerId
     *
     * @return int[]
     * @throws InvalidParametersException
     */
    public static function tsumo(
        Ruleset $rules,
        int $currentDealer,
        array $currentScores,
        int $winnerId,
        int $han,
        ?int $fu,
        array $riichiIds,
        int $honba,
        int $riichiBetsCount,
        ?int $paoPlayerId
    ) {
        self::resetPaymentsInfo();

        if (empty($winnerId)) {
            throw new InvalidParametersException('Tsumo must have winner');
        }

        if (!empty($paoPlayerId)) { // tsumo pao should be treated as ron
            return self::ron(
                $rules,
                $currentDealer == $winnerId,
                $currentScores,
                $winnerId,
                $paoPlayerId,
                $han,
                $fu,
                $riichiIds,
                $honba,
                $riichiBetsCount,
                null
            );
        }

        $pointsDiff = self::_calcPoints($rules, $han, $fu, true, $currentDealer == $winnerId);
        $currentScores[$winnerId] += $pointsDiff['winner'];

        if ($currentDealer == $winnerId) { // dealer tsumo
            foreach ($currentScores as $playerId => $value) {
                if ($playerId == $winnerId) {
                    continue;
                }
                $currentScores[$playerId] += $pointsDiff['dealer'];
                self::$_lastPaymentsInfo['direct'][$winnerId . '<-' . $playerId] = -$pointsDiff['dealer'];
            }
        } else {
            foreach ($currentScores as $playerId => $value) {
                if ($playerId == $winnerId) {
                    continue;
                }
                if ($playerId == $currentDealer) {
                    $currentScores[$playerId] += $pointsDiff['dealer'];
                    self::$_lastPaymentsInfo['direct'][$winnerId . '<-' . $playerId] = -$pointsDiff['dealer'];
                } else {
                    $currentScores[$playerId] += $pointsDiff['player'];
                    self::$_lastPaymentsInfo['direct'][$winnerId . '<-' . $playerId] = -$pointsDiff['player'];
                }
            }
        }

        if (empty($riichiIds)) {
            $riichiIds = [];
        }

        foreach ($riichiIds as $playerId) {
            $currentScores[$playerId] -= 1000;
            self::$_lastPaymentsInfo['riichi'][$winnerId . '<-' . $playerId] = 1000;
        }

        $currentScores[$winnerId] += 1000 * count($riichiIds);
        $currentScores[$winnerId] += 1000 * $riichiBetsCount;
        self::$_lastPaymentsInfo['riichi'][$winnerId . '<-'] = 1000 * $riichiBetsCount;
        $currentScores[$winnerId] += 300 * $honba;

        foreach ($currentScores as $playerId => $value) {
            if ($playerId == $winnerId) {
                continue;
            }
            $currentScores[$playerId] -= 100 * $honba;
            self::$_lastPaymentsInfo['honba'][$winnerId . '<-' . $playerId] = 100 * $honba;
        }

        return $currentScores;
    }

    /**
     * @param int[] $currentScores
     * @param int[] $tempaiIds
     * @param int[] $riichiIds
     *
     * @return int[]
     * @throws InvalidParametersException
     */
    public static function draw(
        array $currentScores,
        array $tempaiIds,
        array $riichiIds
    ) {
        self::resetPaymentsInfo();
        if (empty($riichiIds)) {
            $riichiIds = [];
        }

        foreach ($riichiIds as $playerId) {
            $currentScores[$playerId] -= 1000;
            self::$_lastPaymentsInfo['riichi']['<-' . $playerId] = 1000;
        }

        if (count($tempaiIds) === 0 || count($tempaiIds) === 4) {
            return $currentScores;
        }

        if (count($tempaiIds) === 1) {
            foreach ($currentScores as $playerId => $value) {
                if ($playerId == $tempaiIds[0]) {
                    $currentScores[$playerId] += 3000;
                } else {
                    $currentScores[$playerId] -= 1000;
                    self::$_lastPaymentsInfo['direct'][$tempaiIds[0] . '<-' . $playerId] = 1000;
                }
            }
            return $currentScores;
        }

        if (count($tempaiIds) === 2) {
            $i = 0;
            foreach ($currentScores as $playerId => $value) {
                if (in_array($playerId, $tempaiIds)) {
                    $currentScores[$playerId] += 1500;
                } else {
                    $currentScores[$playerId] -= 1500;
                    self::$_lastPaymentsInfo['direct'][$tempaiIds[$i++] . '<-' . $playerId] = 1500;
                }
            }
            return $currentScores;
        }

        if (count($tempaiIds) === 3) {
            foreach ($currentScores as $playerId => $value) {
                if (in_array($playerId, $tempaiIds)) {
                    $currentScores[$playerId] += 1000;
                } else {
                    $currentScores[$playerId] -= 3000;
                    self::$_lastPaymentsInfo['direct'][$tempaiIds[0] . '<-' . $playerId] = 1000;
                    self::$_lastPaymentsInfo['direct'][$tempaiIds[1] . '<-' . $playerId] = 1000;
                    self::$_lastPaymentsInfo['direct'][$tempaiIds[2] . '<-' . $playerId] = 1000;
                }
            }
            return $currentScores;
        }

        throw new InvalidParametersException('More than 4 players tempai? o_0');
    }

    /**
     * @param int[] $currentScores
     * @param int[] $riichiIds
     *
     * @return int[]
     */
    public static function abort(
        array $currentScores,
        array $riichiIds
    ) {
        self::resetPaymentsInfo();
        if (empty($riichiIds)) {
            $riichiIds = [];
        }

        foreach ($riichiIds as $playerId) {
            $currentScores[$playerId] -= 1000;
            self::$_lastPaymentsInfo['riichi']['<-' . $playerId] = 1000;
        }

        return $currentScores;
    }

    /**
     * @param Ruleset $rules
     * @param int $currentDealer
     * @param int $loserId
     * @param int[] $currentScores
     *
     * @return int[]
     * @throws InvalidParametersException
     */
    public static function chombo(
        Ruleset $rules,
        int $currentDealer,
        int $loserId,
        array $currentScores
    ) {
        self::$_lastPaymentsInfo = [];
        if (empty($loserId)) {
            throw new InvalidParametersException('Chombo must have loser');
        }

        if ($rules->extraChomboPayments()) {
            if ($currentDealer == $loserId) {
                foreach ($currentScores as $playerId => $value) {
                    if ($playerId == $loserId) {
                        $currentScores[$playerId] -= 12000;
                    } else {
                        $currentScores[$playerId] += 4000;
                    }
                }
            } else {
                foreach ($currentScores as $playerId => $value) {
                    if ($playerId == $loserId) {
                        $currentScores[$playerId] -= 8000;
                    } else if ($playerId == $currentDealer) {
                        $currentScores[$playerId] += 4000;
                    } else {
                        $currentScores[$playerId] += 2000;
                    }
                }
            }
        }

        return $currentScores;
    }

    /**
     * @param int[] $currentScores
     * @param int|string $currentDealer
     * @param int[] $riichiIds
     * @param int[] $nagashiIds
     *
     * @return int[]
     * @throws InvalidParametersException
     */
    public static function nagashi(
        array $currentScores,
        $currentDealer,
        array $riichiIds,
        array $nagashiIds
    ) {
        self::resetPaymentsInfo();
        if (empty($riichiIds)) {
            $riichiIds = [];
        }

        foreach ($riichiIds as $playerId) {
            $currentScores[$playerId] -= 1000;
            self::$_lastPaymentsInfo['riichi']['<-' . $playerId] = 1000;
        }

        if (count($nagashiIds) > 3) {
            throw new InvalidParametersException('More than 3 players have nagashi');
        }

        foreach ($nagashiIds as $nagashiOwnerId) {
            foreach ($currentScores as $playerId => $value) {
                if ($playerId == $nagashiOwnerId) {
                    if ($currentDealer == $playerId) {
                        $currentScores[$playerId] += 12000;
                    } else {
                        $currentScores[$playerId] += 8000;
                    }
                } else {
                    if ($currentDealer == $nagashiOwnerId || $currentDealer == $playerId) {
                        $currentScores[$playerId] -= 4000;
                        self::$_lastPaymentsInfo['direct'][$nagashiOwnerId . '<-' . $playerId] = 4000;
                    } else {
                        $currentScores[$playerId] -= 2000;
                        self::$_lastPaymentsInfo['direct'][$nagashiOwnerId . '<-' . $playerId] = 2000;
                    }
                }
            }
        }

        return $currentScores;
    }

    /**
     * @param Ruleset $rules
     * @param int $han
     * @param int|null $fu
     * @param bool $tsumo
     * @param bool $dealer
     * @return int[]
     *
     * @psalm-return array{winner: int, dealer?: int, player?: int, loser?: int}
     */
    protected static function _calcPoints(Ruleset $rules, int $han, ?int $fu, bool $tsumo, bool $dealer): array
    {
        if ($han > 0 && $han < 5) {
            $basePoints = $fu * pow(2, 2 + $han);
            $rounded = ceil($basePoints / 100.) * 100;
            $doubleRounded = ceil(2 * $basePoints / 100.) * 100;
            $timesFourRounded = ceil(4 * $basePoints / 100.) * 100;
            $timesSixRounded = ceil(6 * $basePoints / 100.) * 100;

            $isKiriage = $rules->withKiriageMangan() && (
                ($han == 4 && $fu == 30) ||
                ($han == 3 && $fu == 60)
            );

            // mangan
            if ($basePoints >= 2000 || $isKiriage) {
                $rounded = 2000;
                $doubleRounded = $rounded * 2;
                $timesFourRounded = $doubleRounded * 2;
                $timesSixRounded = $doubleRounded * 3;
            }
        } else { // limits
            if ($han < 0) { // natural yakuman
                $rounded = abs($han * 8000);
            } else if ($rules->withKazoe() && $han >= 13) { // kazoe yakuman
                $rounded = 8000;
            } else if ($han >= 11) { // sanbaiman
                $rounded = 6000;
            } else if ($han >= 8) { // baiman
                $rounded = 4000;
            } else if ($han >= 6) { // haneman
                $rounded = 3000;
            } else {
                $rounded = 2000;
            }
            $doubleRounded = $rounded * 2;
            $timesFourRounded = $doubleRounded * 2;
            $timesSixRounded = $doubleRounded * 3;
        }

        if ($tsumo) {
            return [
                'winner' => $dealer
                    ? (int)(3 * $doubleRounded)
                    : (int)($doubleRounded + (2 * $rounded)),
                'dealer' => (int)-$doubleRounded,
                'player' => (int)-$rounded
            ];
        } else {
            return [
                'winner' => $dealer ? (int)$timesSixRounded : (int)$timesFourRounded,
                'loser' => $dealer ? (int)-$timesSixRounded : (int)-$timesFourRounded
            ];
        }
    }


    /**
     * @param RoundPrimitive[] $rounds
     * @param int $loserId
     * @param int $riichiBets
     * @param int $honba
     * @param SessionPrimitive $session
     *
     * @return array
     * @throws InvalidParametersException
     */
    public static function assignRiichiBets(array $rounds, int $loserId, int $riichiBets, int $honba, SessionPrimitive $session)
    {
        $bets = [];
        $winners = [];

        foreach ($rounds as $round) {
            $winners[$round->getWinnerId()] = [];
            $bets = array_merge($bets, $round->getRiichiIds());
            foreach ($bets as $k => $player) {
                if (isset($winners[$player])) {
                    $winners[$player] []= $round->getWinnerId(); // winner always gets back his bet
                    unset($bets[$k]);
                }
            }
        }

        // Find player who gets non-winning riichi bets
        // First we double the array to form a ring to simplify traversal
        // Then we find winner closest to current loser - he'll get all riichi (like with atamahane rule).
        $playersRing = array_merge($session->getPlayersIds(), $session->getPlayersIds());
        $closestWinner = null;
        for ($i = 0; $i < count($playersRing); $i++) {
            if ($loserId == $playersRing[$i]) {
                for ($j = $i + 1; $j < count($playersRing); $j++) {
                    if (isset($winners[$playersRing[$j]])) {
                        $closestWinner = $playersRing[$j];
                        break 2;
                    }
                }
            }
        }

        if (!$closestWinner) {
            throw new InvalidParametersException('No closest winner was found when calculation riichi bets assignment', 119);
        }

        $winners[$closestWinner] = array_merge($winners[$closestWinner], $bets);

        // assign riichi counts, add riichi on table for first (closest) winner
        foreach ($winners as $id => $bets) {
            $winners[$id] = [
                'from_table'    => ($id == $closestWinner ? $riichiBets : 0),
                'from_players'  => $winners[$id],
                'honba'         => $honba,
                'closest_winner' => $closestWinner,
            ];
        }

        return $winners;
    }
}
