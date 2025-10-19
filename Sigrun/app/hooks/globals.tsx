/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
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

import { createContext } from 'react';
import { EventType, PlatformType } from 'tsclients/proto/atoms.pb';

export type Globals = {
  eventId: number[] | null;
  type: EventType | null;
  isTeam: boolean;
  isPrescripted: boolean;
  hasSeries: boolean;
  ratingHidden: boolean;
  achievementsHidden: boolean;
  loading: boolean;
  withChips: boolean;
  minGamesCount: number;
  platformType: PlatformType;
  allowManualAddReplay: boolean;
};
export const globals: { data: Globals; setData: (data: Partial<Globals>) => void } = {
  data: {
    eventId: null,
    type: null,
    isPrescripted: false,
    isTeam: false,
    hasSeries: false,
    ratingHidden: false,
    achievementsHidden: false,
    loading: false,
    withChips: false,
    minGamesCount: 0,
    platformType: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
    allowManualAddReplay: false,
  },
  setData: () => {},
};
export const globalsCtx = createContext(globals);
