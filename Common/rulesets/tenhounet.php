<?php
/*  Pantheon common files
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
require_once __DIR__ . '/../generated/Common/EndingPolicy.php';
require_once __DIR__ . '/../generated/Common/Uma.php';
require_once __DIR__ . '/../generated/Common/UmaType.php';
require_once __DIR__ . '/../generated/Common/RulesetConfig.php';

return (new RulesetConfig())
    ->setUma((new Uma())
        ->setPlace1(15000)
        ->setPlace2(5000)
        ->setPlace3(-5000)
        ->setPlace4(-15000)
    )
    ->setUmaType(UmaType::UMA_TYPE_UMA_SIMPLE)
    ->setEqualizeUma(false)
    ->setWithWinningDealerHonbaSkipped(false)
    ->setOka(20000)
    ->setReplacementPlayerFixedPoints(-15000)
    ->setReplacementPlayerOverrideUma(-15000)
    ->setAllowedYaku(YakuMap::listExcept([
        Y_OPENRIICHI
    ]))
    ->setChipsValue(0)
    ->setChomboPenalty(0)
    ->setDoubleronHonbaAtamahane(true)
    ->setDoubleronRiichiAtamahane(true)
    ->setEndingPolicy(EndingPolicy::ENDING_POLICY_EP_UNSPECIFIED)
    ->setExtraChomboPayments(true)
    ->setGameExpirationTime(87600) // hours, to cover JST difference
    ->setGoalPoints(30000)
    ->setMaxPenalty(20000)
    ->setMinPenalty(100)
    ->setPenaltyStep(100)
    ->setPlayAdditionalRounds(true)
    ->setRiichiGoesToWinner(true)
    ->setStartPoints(25000)
    ->setStartRating(0)
    ->setTonpuusen(false)
    ->setWithAbortives(true)
    ->setWithAtamahane(false)
    ->setWithButtobi(true)
    ->setWithKazoe(true)
    ->setWithKiriageMangan(false)
    ->setWithKuitan(true)
    ->setWithLeadingDealerGameOver(true)
    ->setWithMultiYakumans(true)
    ->setWithNagashiMangan(true)
    ->setYakuWithPao([Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU]);
