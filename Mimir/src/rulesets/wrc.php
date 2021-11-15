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
require_once __DIR__ . '/../../src/helpers/YakuMap.php';

return [
    'tenboDivider'          => 100,
    'ratingDivider'         => 10,
    'startRating'           => 0,
    'oka'                   => 0,
    'uma'                   => [1 => 150, 50, -50, -150],
    'equalizeUma'           => true,
    'startPoints'           => 30000,
    'goalPoints'            => 0,
    'playAdditionalRounds'  => false,
    'subtractStartPoints'   => true,
    'riichiGoesToWinner'    => false,
    'extraChomboPayments'   => false,
    'chomboPenalty'         => 200,
    'withAtamahane'         => true,
    'withAbortives'         => false,
    'withKuitan'            => true,
    'withKazoe'             => false,
    'withButtobi'           => false,
    'withMultiYakumans'     => false,
    'withNagashiMangan'     => false,
    'withKiriageMangan'     => true,
    'tonpuusen'             => false,
    'gameExpirationTime'    => false,
    'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII],
    'minPenalty'            => 10,
    'maxPenalty'            => 200,
    'penaltyStep'           => 10,
    'timerPolicy'           => 'redZone',
    'yellowZone'            => 0,
    'redZone'               => 300, // 5min
    'withLeadingDealerGameOver' => false,
    'replacementPlayerFixedPoints' => -15000,
    'replacementPlayerOverrideUma' => -15000,
    'allowedYaku' => YakuMap::listExcept([
        Y_OPENRIICHI
    ])
];
