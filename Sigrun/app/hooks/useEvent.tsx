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

import { useContext, useEffect } from 'react';
import { globalsCtx } from './globals';
import { useIsomorphicState } from './useIsomorphicState';
import { useApi } from './api';
import { PlatformType } from 'tsclients/proto/atoms.pb';

export const useEvent = (eventIdListStr: string | null) => {
  const globals = useContext(globalsCtx);
  const api = useApi();
  const eventsId = eventIdListStr?.split('.').map((id) => parseInt(id, 10));
  const [events] = useIsomorphicState(
    null,
    'EventInfo_event_' + (eventIdListStr ?? 'null'),
    () => {
      if (eventsId && eventsId.length === 1) {
        api.setEventId(eventsId[0]);
      }
      return eventsId ? api.getEventsById(eventsId) : Promise.resolve(null);
    },
    [eventIdListStr]
  );
  useEffect(() => {
    if (eventsId) {
      globals.setData({ eventId: eventsId });
    }
  }, [eventIdListStr]);

  useEffect(() => {
    if (!eventIdListStr) {
      // we don't need event data
      globals.setData({
        eventId: null,
        type: null,
        isPrescripted: false,
        isTeam: false,
        ratingHidden: false,
        achievementsHidden: false,
        hasSeries: false,
        withChips: false,
        loading: false,
        minGamesCount: 0,
        platformType: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      });
    } else {
      if (events) {
        // we have the data; use first event to fill global data, other events should follow the first rules
        globals.setData({
          isTeam: events[0]?.isTeam,
          isPrescripted: events[0]?.isPrescripted,
          type: events[0]?.type,
          hasSeries: events[0]?.hasSeries,
          ratingHidden: !events[0]?.isRatingShown,
          achievementsHidden: !events[0]?.achievementsShown,
          withChips: events[0]?.withChips,
          loading: false,
          minGamesCount: events[0]?.minGamesCount,
          platformType: events[0]?.platformId,
        });
      } else {
        // data is requested but still loading
        globals.setData({
          type: null,
          isPrescripted: false,
          isTeam: false,
          ratingHidden: false,
          achievementsHidden: false,
          hasSeries: false,
          withChips: false,
          loading: true,
          minGamesCount: 0,
          platformType: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
        });
      }
    }
  }, [eventIdListStr, events]);

  return events ?? null;
};
