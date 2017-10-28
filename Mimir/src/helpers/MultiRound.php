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

class MultiRoundHelper
{
    public static function findLastRound($rounds)
    {
        return array_reduce($rounds, function ($acc, RoundPrimitive $r) {
            /** @var $acc RoundPrimitive */

            if ($acc instanceof MultiRoundPrimitive) {
                $accId = array_reduce($acc->rounds(), function ($mAcc, RoundPrimitive $r) {
                    return ($r->getId() > $mAcc) ? $r->getId() : $mAcc;
                }, 0);
            } else if ($acc) {
                $accId = $acc->getId();
            } else {
                $accId = 0;
            }

            if ($r instanceof MultiRoundPrimitive) {
                $rId = array_reduce($r->rounds(), function ($mAcc, RoundPrimitive $r) {
                    return ($r->getId() > $mAcc) ? $r->getId() : $mAcc;
                }, 0);
            } else {
                $rId = $r->getId();
            }

            return $rId > $accId ? $r : $acc;
        });
    }
}
