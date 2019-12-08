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
require_once __DIR__ . '/../../src/helpers/YakuMap.php';

class RulesetEma extends Ruleset
{
    public static $_title = 'ema';
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
        'extraChomboPayments'   => false,
        'chomboPenalty'         => 20000,
        'withAtamahane'         => false,
        'withAbortives'         => false,
        'withKuitan'            => true,
        'withKazoe'             => false,
        'withButtobi'           => false,
        'withMultiYakumans'     => false,
        'withNagashiMangan'     => false,
        'withKiriageMangan'     => false,
        'tonpuusen'             => false,
        'gameExpirationTime'    => false,
        'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII],
        'minPenalty'            => 100,
        'maxPenalty'            => 20000,
        'penaltyStep'           => 100,
        'timerPolicy'           => 'yellowZone',
        'yellowZone'            => 900, // 15min
        'redZone'               => 0,
        'withLeadingDealerGameOver' => false,
        'replacementPlayerFixedPoints' => -15000,
        'replacementPlayerOverrideUma' => -15000
    ];

    public function allowedYaku()
    {
        return YakuMap::listExcept([
            Y_RENHOU,
            Y_OPENRIICHI
        ]);
    }

    /**
     * @param array $scores
     * @return array
     */
    public function uma($scores = [])
    {
        return $this->_equalizeUma($scores, [1 => 15000, 5000, -5000, -15000]);
    }
}
