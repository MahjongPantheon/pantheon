import { useContext, useEffect } from 'react';
import { globalsCtx } from './globals';
import { useIsomorphicState } from './useIsomorphicState';
import { useApi } from './api';

export const useEvent = (eventId: string | null) => {
  const globals = useContext(globalsCtx);
  const api = useApi();
  const [events] = useIsomorphicState(
    [],
    'EventInfo_event_' + (eventId ?? 'null'),
    () => (eventId ? api.getEventsById([parseInt(eventId, 10)]) : Promise.resolve(null)),
    [eventId]
  );
  useEffect(() => {
    if (eventId) {
      globals.setData({ eventId: parseInt(eventId, 10) });
    }
  }, [eventId]);

  useEffect(() => {
    if (!events) {
      globals.setData({
        eventId: null,
        type: null,
        isPrescripted: false,
        isTeam: false,
        ratingHidden: false,
        hasSeries: false,
      });
    }
    if (eventId) {
      globals.setData({
        isTeam: events?.[0]?.isTeam,
        isPrescripted: events?.[0]?.isPrescripted,
        type: events?.[0]?.type,
        hasSeries: events?.[0]?.hasSeries,
        ratingHidden: !events?.[0]?.isRatingShown,
      });
    }
  }, [eventId, events]);

  return events?.[0] ?? null;
};
