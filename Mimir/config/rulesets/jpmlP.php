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

class RulesetJpmlP extends Ruleset
{
    public static $_title = 'jpmlP';
    protected static $_ruleset = [
        'tenboDivider'          => 1,
        'ratingDivider'         => 1,
        'startRating'           => 0,
        'oka'                   => 20,
        'startPoints'           => 25000,
        'goalPoints'            => 30000,
        'playAdditionalRounds'  => true,
        'subtractStartPoints'   => true,
        'riichiGoesToWinner'    => false,
        'extraChomboPayments'   => true,
        'chomboPenalty'         => 0,
        'withAtamahane'         => false,
        'withAbortives'         => true,
        'withKuitan'            => true,
        'withKazoe'             => true,
        'withButtobi'           => true,
        'withMultiYakumans'     => true,
        'withNagashiMangan'     => true,
        'withKiriageMangan'     => false,
        'tonpuusen'             => false,
        'autoRegisterUsers'     => false,
        'gameExpirationTime'    => false,
        'yakuWithPao'           => [],
        'minPenalty'            => 100,
        'maxPenalty'            => 20000,
        'penaltyStep'           => 100,
        'timerPolicy'           => 'redZone',
        'yellowZone'            => 0,
        'redZone'               => 600, // 10min
        'withLeadingDealerGameOver' => true,
        'replacementPlayerFixedPoints' => false,
        'replacementPlayerOverrideUma' => false
    ];

    public function allowedYaku()
    {
        return YakuMap::listExcept([
            Y_OPENRIICHI
        ]);
    }

    /**
     * @param array $scores
     * @return array
     */
    public function uma($scores = [])
    {
        return $this->_equalizeUma($scores, [1 => 20000, 10000, -10000, -20000]);
    }
}
