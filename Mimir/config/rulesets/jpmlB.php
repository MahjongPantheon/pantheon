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

class RulesetJpmlB extends Ruleset
{
    public static $_title = 'jpmlB';
    protected static $_ruleset = [
        'tenboDivider'          => 100,
        'ratingDivider'         => 10,
        'startRating'           => 1500,
        'oka'                   => 0,
        'startPoints'           => 30000,
        'goalPoints'            => 0,
        'subtractStartPoints'   => true,
        'riichiGoesToWinner'    => false,
        'extraChomboPayments'   => false,
        'chomboPenalty'         => 200,
        'withAtamahane'         => true,
        'withAbortives'         => true,
        'withKuitan'            => true,
        'withKazoe'             => false,
        'withButtobi'           => true,
        'withMultiYakumans'     => false,
        'withNagashiMangan'     => false,
        'withKiriageMangan'     => true,
        'tonpuusen'             => false,
        'gameExpirationTime'    => false,
        'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU],
        'minPenalty'            => 10,
        'maxPenalty'            => 200,
        'penaltyStep'           => 10,
        'timerPolicy'           => 'redZone',
        'yellowZone'            => 0,
        'redZone'               => 300, // 5min
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
     * JPML B uses simple uma bonus.
     * In case of equal scores, player who sits closer to dealer gets higher place.
     *
     * @param array $scores
     * @return array
     */
    public function uma($scores = [])
    {
        return [1 => 150, 50, -50, -150];
    }
}
