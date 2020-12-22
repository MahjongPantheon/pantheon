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
 * Class RulesetTenhounet
 * Describes most popular row3-column2 rules
 * @package Mimir
 */
class RulesetDamaten extends Ruleset
{
    protected static $_title = 'gentleman';
    protected static $_ruleset = [
        'tenboDivider'          => 1000,
        'ratingDivider'         => 1,
        'startRating'           => 1500,
        'oka'                   => 0,
        'startPoints'           => 25000,
        'goalPoints'            => 30000,
        'playAdditionalRounds'  => false,
        'subtractStartPoints'   => true,
        'riichiGoesToWinner'    => true,
        'doubleronRiichiAtamahane' => true,
        'doubleronHonbaAtamahane'  => true,
        'extraChomboPayments'   => true,
        'chomboPenalty'         => 0,
        'withAtamahane'         => false,
        'withAbortives'         => true,
        'withKuitan'            => true,
        'withKazoe'             => true,
        'withButtobi'           => true,
        'withMultiYakumans'     => true,
        'withNagashiMangan'     => true,
        'withKiriageMangan'     => true,
        'tonpuusen'             => false,
        'gameExpirationTime'    => false,
        'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU],
        'withLeadingDealerGameOver' => false,
        'timerPolicy'           => 'none',
        'yellowZone'            => 0,
        'redZone'               => 0,
        'penaltyStep'           => 0,
        'maxPenalty'            => 0,
        'minPenalty'            => 0,
        'uma' => [
            1 => 15000,
            2 => 5000,
            3 => -5000,
            4 => -15000
        ],
        'replacementPlayerFixedPoints' => false,
        'replacementPlayerOverrideUma' => false
    ];

    public function allowedYaku()
    {
        return YakuMap::listExcept([
            Y_OPENRIICHI
        ]);
    }

    public function uma($scores = [])
    {
       return $this->_equalizeUma($scores, [1 => 15000, 5000, -5000, -15000]);
    }
}

