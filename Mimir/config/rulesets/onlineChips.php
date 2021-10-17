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
 * Class RulesetOnline
 * Describes most popular row3-column2 tenhou rules + different results scores.
 * @package Mimir
 */
class RulesetOnlineChips extends Ruleset
{
    protected static $_title = 'onlineChips';
    protected static $_ruleset = [
        'tenboDivider'          => 1,
        'ratingDivider'         => 1,
        'startRating'           => 0,
        'oka'                   => 0,
        'startPoints'           => 30000,
        'goalPoints'            => 0,
        'playAdditionalRounds'  => false,
        'subtractStartPoints'   => true,
        'riichiGoesToWinner'    => true,
        'doubleronRiichiAtamahane' => true,
        'doubleronHonbaAtamahane'  => true,
        'extraChomboPayments'   => false,
        'chomboPenalty'         => 0,
        'withAtamahane'         => false,
        'withAbortives'         => true,
        'withKuitan'            => true,
        'withKazoe'             => true,
        'withButtobi'           => false,
        'withMultiYakumans'     => true,
        'withNagashiMangan'     => true,
        'withKiriageMangan'     => false,
        'tonpuusen'             => true,
        'gameExpirationTime'    => 24, // hours, to cover JST difference
        'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU],
        'withLeadingDealerGameOver' => true,
        'withWinningDealerHonbaSkipped' => true,
        'timerPolicy'           => 'none',
        'yellowZone'            => 0,
        'redZone'               => 0,
        'penaltyStep'           => 0,
        'maxPenalty'            => 0,
        'minPenalty'            => 0,
        'replacementPlayerFixedPoints' => -30000,
        'replacementPlayerOverrideUma' => 0,
        'chipsValue' => 2000
    ];

    public function uma($scores = [])
    {
        return $this->_equalizeUma($scores, [1 => 15000, 5000, -5000, -15000]);
    }

    public function allowedYaku()
    {
        return YakuMap::listExcept([
            Y_OPENRIICHI
        ]);
    }
}
