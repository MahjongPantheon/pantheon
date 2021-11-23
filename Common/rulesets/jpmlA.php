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
        Y_IPPATSU,
        Y_OPENRIICHI
    ]),
    'chomboPenalty'         => 200,
    'complexUma' => true,
    'doubleronHonbaAtamahane' => false,
    'doubleronRiichiAtamahane' => false,
    'equalizeUma' => true,
    'extraChomboPayments'   => false,
    'gameExpirationTime'    => false,
    'goalPoints'            => 0,
    'maxPenalty'            => 200,
    'minPenalty'            => 10,
    'oka'                   => 0,
    'penaltyStep'           => 10,
    'playAdditionalRounds'  => false,
    'ratingDivider'         => 10,
    'redZone'               => 300, // 5min
    'replacementPlayerFixedPoints' => false,
    'replacementPlayerOverrideUma' => false,
    'riichiGoesToWinner'    => false,
    'startPoints'           => 30000,
    'startRating'           => 0,
    'subtractStartPoints'   => true,
    'tenboDivider'          => 100,
    'timerPolicy'           => 'yellowZone',
    'tonpuusen'             => false,
    'withAbortives'         => true,
    'withAtamahane'         => true,
    'withButtobi'           => false,
    'withKazoe'             => false,
    'withKiriageMangan'     => false,
    'withKuitan'            => true,
    'withLeadingDealerGameOver' => false,
    'withMultiYakumans'     => false,
    'withNagashiMangan'     => false,
    'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU],
    'yellowZone'            => 0,

    '_invalidCustomFields' => [
        'uma', 'chipsValue',
        'withWinningDealerHonbaSkipped', 'timerPolicy', 'redZone',
        'startRating', 'subtractStartPoints', 'complexUma', 'tenboDivider', 'ratingDivider',
    ],
];
