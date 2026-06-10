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

class Constants
{
    /**
     * Sentinel player id for the "ghost" 4th seat used to model 3-player (sanma)
     * sessions on top of the 4-player data structures. The ghost always sits North,
     * never deals, never pays or receives points, and is excluded from placements,
     * uma/oka, ratings and statistics.
     *
     * Must NOT be 0: proto3 int32 defaults to 0 and PointsCalc uses empty() guards
     * on winner/loser ids, so 0 would be indistinguishable from "unset".
     */
    const GHOST_PLAYER_ID = -1;
}
