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
    ->setEqualizeUma(true)
    ->setWithWinningDealerHonbaSkipped(false)
    ->setOka(0)
    ->setHonbaValue(300)
    ->setReplacementPlayerFixedPoints(-15000)
    ->setReplacementPlayerOverrideUma(-15000)
    ->setAllowedYaku(YakuMap::listExcept([
        Y_OPENRIICHI
    ]))
    ->setChipsValue(0)
    ->setChomboAmount(20000)
    ->setDoubleronHonbaAtamahane(false)
    ->setDoubleronRiichiAtamahane(false)
    ->setEndingPolicy(EndingPolicy::ENDING_POLICY_EP_END_AFTER_HAND)
    ->setExtraChomboPayments(false)
    ->setGameExpirationTime(0)
    ->setGoalPoints(0)
    ->setMaxPenalty(20000)
    ->setMinPenalty(100)
    ->setPenaltyStep(100)
    ->setPlayAdditionalRounds(false)
    ->setRiichiGoesToWinner(true)
    ->setStartPoints(30000)
    ->setStartRating(0)
    ->setTonpuusen(false)
    ->setWithAbortives(false)
    ->setWithAtamahane(true)
    ->setWithButtobi(false)
    ->setWithKazoe(false)
    ->setWithKiriageMangan(true)
    ->setWithKuitan(true)
    ->setWithLeadingDealerGameOver(false)
    ->setWithMultiYakumans(false)
    ->setWithNagashiMangan(false)
    ->setChomboEndsGame(true)
    ->setYakuWithPao([Y_DAISANGEN, Y_DAISUUSHII]);
