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
namespace Common;

require_once __DIR__ . '/../YakuMap.php';

return [
    'allowedYaku' => YakuMap::listExcept([
        Y_OPENRIICHI
    ]),
    'chomboPenalty'         => 0,
    'doubleronHonbaAtamahane'  => true,
    'doubleronRiichiAtamahane' => true,
    'equalizeUma' => false,
    'extraChomboPayments'   => true,
    'gameExpirationTime'    => 87600, // hours, to cover JST difference
    'goalPoints'            => 30000,
    'maxPenalty'            => 0,
    'minPenalty'            => 0,
    'oka'                   => 20,
    'penaltyStep'           => 0,
    'playAdditionalRounds'  => true,
    'ratingDivider'         => 1,
    'redZone'               => 0,
    'replacementPlayerFixedPoints' => false,
    'replacementPlayerOverrideUma' => false,
    'riichiGoesToWinner'    => true,
    'startPoints'           => 25000,
    'startRating'           => 1500,
    'subtractStartPoints'   => true,
    'tenboDivider'          => 1000,
    'timerPolicy'           => 'none',
    'tonpuusen'             => false,
    'uma' => [1 => 15, 2 => 5, 3 => -5, 4 => -15],
    'withAbortives'         => true,
    'withAtamahane'         => false,
    'withButtobi'           => true,
    'withKazoe'             => true,
    'withKiriageMangan'     => false,
    'withKuitan'            => true,
    'withLeadingDealerGameOver' => true,
    'withMultiYakumans'     => true,
    'withNagashiMangan'     => true,
    'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU],
    'yellowZone'            => 0,

    '_invalidCustomFields' => [
        'withWinningDealerHonbaSkipped', 'timerPolicy', 'redZone',
        'startRating', 'subtractStartPoints', 'complexUma', 'tenboDivider', 'ratingDivider',
    ],
];
