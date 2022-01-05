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
    'chomboPenalty'         => 20000,
    'doubleronHonbaAtamahane' => false,
    'doubleronRiichiAtamahane' => false,
    'equalizeUma'           => true,
    'extraChomboPayments'   => false,
    'gameExpirationTime'    => false,
    'goalPoints'            => 0,
    'maxPenalty'            => 20000,
    'minPenalty'            => 100,
    'oka'                   => 0,
    'penaltyStep'           => 100,
    'playAdditionalRounds'  => false,
    'redZone'               => 300, // 5min
    'replacementPlayerFixedPoints' => -15000,
    'replacementPlayerOverrideUma' => -15000,
    'riichiGoesToWinner'    => false,
    'startPoints'           => 30000,
    'startRating'           => 0,
    'subtractStartPoints'   => true,
    'timerPolicy'           => 'redZone',
    'tonpuusen'             => false,
    'uma'                   => [1 => 15000, 5000, -5000, -15000],
    'withAbortives'         => false,
    'withAtamahane'         => true,
    'withButtobi'           => false,
    'withKazoe'             => false,
    'withKiriageMangan'     => true,
    'withKuitan'            => true,
    'withLeadingDealerGameOver' => false,
    'withMultiYakumans'     => false,
    'withNagashiMangan'     => false,
    'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII],
    'yellowZone'            => 0,

    '_invalidCustomFields' => [
        'chipsValue',
        'withWinningDealerHonbaSkipped', 'timerPolicy', 'redZone',
        'startRating', 'subtractStartPoints', 'complexUma',
    ],
];
