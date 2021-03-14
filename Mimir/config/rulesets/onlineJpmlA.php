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

require_once __DIR__ . '/../../src/Ruleset.php';

/**
 * Class RulesetOnlineJpmlA
 * JPML A like rules
 * @package Mimir
 */
class RulesetOnlineJpmlA extends Ruleset
{
    protected static $_title = 'onlineJpmlA';
    protected static $_ruleset = [
        'tenboDivider'          => 100,
        'ratingDivider'         => 10,
        'startRating'           => 0,
        'oka'                   => 0,
        'startPoints'           => 30000,
        'goalPoints'            => 0,
        'playAdditionalRounds'  => false,
        'subtractStartPoints'   => true,
        'riichiGoesToWinner'    => false,
        'doubleronRiichiAtamahane' => true,
        'doubleronHonbaAtamahane'  => true,
        'extraChomboPayments'   => false,
        'chomboPenalty'         => 0,
        'withAtamahane'         => true,
        'withAbortives'         => true,
        'withKuitan'            => true,
        'withKazoe'             => false,
        'withButtobi'           => false,
        'withMultiYakumans'     => true,
        'withNagashiMangan'     => false,
        'withKiriageMangan'     => false,
        'tonpuusen'             => false,
        'gameExpirationTime'    => 24, // hours, to cover JST difference
        'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU],
        'withLeadingDealerGameOver' => false,
        'timerPolicy'           => 'none',
        'yellowZone'            => 0,
        'redZone'               => 0,
        'penaltyStep'           => 0,
        'maxPenalty'            => 0,
        'minPenalty'            => 0,
        'replacementPlayerFixedPoints' => -30000,
        'replacementPlayerOverrideUma' => 0
    ];

    public function allowedYaku()
    {
        return YakuMap::listExcept([
            Y_IPPATSU,
            Y_OPENRIICHI
        ]);
    }

    /**
     * JPML A uses complex uma bonus
     *
     * @param array $scores
     * @return array
     */
    public function uma($scores = [])
    {
        rsort($scores);
        $minusedPlayers = array_reduce($scores, function($acc, $score) {
            return $acc + ($score < $this->startPoints() ? 1 : 0);
        }, 0);

        switch($minusedPlayers) {
            case 3:
                $uma = [1 => 120, -10, -30, -80];
                break;
            case 1:
                $uma = [1 => 80, 30, 10, -120];
                break;
            default:
                $uma = [1 => 80, 40, -40, -80];
        }

        return $this->_equalizeUma($scores, $uma);
    }
}
