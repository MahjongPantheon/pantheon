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
 * Kirov tournament rules. Temporary.
 * @package Mimir
 */
class RulesetJpmlK2 extends Ruleset
{
    protected static $_title = 'jpmlK2';
    protected static $_ruleset = [
        'tenboDivider'          => 100,
        'ratingDivider'         => 10,
        'startRating'           => 1500,
        'oka'                   => 0,
        'startPoints'           => 25000,
        'goalPoints'            => 0,
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
        'withButtobi'           => false,
        'withMultiYakumans'     => true,
        'withNagashiMangan'     => true,
        'withKiriageMangan'     => false,
        'tonpuusen'             => false,
        'gameExpirationTime'    => 27, // hours, to cover JST difference
        'yakuWithPao'           => [Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU],
        'withLeadingDealerGameOver' => true,
	'minPenalty'            => 10,
	'maxPenalty'            => 200,
	'penaltyStep'           => 10,
	'timerPolicy'           => 'redZone',
	'yellowZone'            => 0,
	'redZone'               => 600, // 10min
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
        return $this->_equalizeUma($scores, [1 => 100, 50, -50, -100]);
    }
}
