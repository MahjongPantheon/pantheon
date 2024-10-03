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
    ->setComplexUma(
        (new ComplexUma())->setNeg3(
            (new Uma())
                ->setPlace1(12000)
                ->setPlace2(-1000)
                ->setPlace3(-3000)
                ->setPlace4(-8000)
        )->setNeg1(
            (new Uma())
                ->setPlace1(8000)
                ->setPlace2(3000)
                ->setPlace3(1000)
                ->setPlace4(-12000)
        )->setOtherwise(
            (new Uma())
                ->setPlace1(8000)
                ->setPlace2(4000)
                ->setPlace3(-4000)
                ->setPlace4(-8000)
        )
    )
    ->setUmaType(UmaType::UMA_TYPE_UMA_COMPLEX)
    ->setEqualizeUma(true)
    ->setWithWinningDealerHonbaSkipped(false)
    ->setOka(0)
    ->setReplacementPlayerFixedPoints(-15000)
    ->setReplacementPlayerOverrideUma(-15000)
    ->setAllowedYaku(YakuMap::listExcept([
        Y_IPPATSU,
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
    ->setRiichiGoesToWinner(false)
    ->setStartPoints(30000)
    ->setStartRating(0)
    ->setTonpuusen(false)
    ->setWithAbortives(true)
    ->setWithAtamahane(true)
    ->setWithButtobi(false)
    ->setWithKazoe(false)
    ->setWithKiriageMangan(false)
    ->setWithKuitan(true)
    ->setWithLeadingDealerGameOver(false)
    ->setWithMultiYakumans(false)
    ->setWithNagashiMangan(false)
    ->setYakuWithPao([Y_DAISANGEN, Y_DAISUUSHII, Y_SUUKANTSU]);
