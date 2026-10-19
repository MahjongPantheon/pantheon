import type { ApiService } from '../services/api';
import type { Event } from 'tsclients/proto/atoms.pb';

export async function loadOwnedEvents(
  api: Pick<ApiService, 'getManagedEventIds' | 'getEvents' | 'getEventStates' | 'getEventsById'>,
  personId: number,
  pageToLoad: number,
  onlyOngoing: boolean,
  pageSize: number
) {
  const ownedIds = await api.getManagedEventIds(personId);
  let pageEvents: Event[];
  let total: number;
  let loadedPage = pageToLoad;
  if (ownedIds.includes(-1)) {
    // -1 === global privileges
    let response = await api.getEvents(pageSize, (loadedPage - 1) * pageSize, false, onlyOngoing);
    total = response.total;
    loadedPage = Math.min(loadedPage, Math.max(1, Math.ceil(total / pageSize)));
    if (loadedPage !== pageToLoad) {
      response = await api.getEvents(pageSize, (loadedPage - 1) * pageSize, false, onlyOngoing);
    }
    pageEvents = response.events;
  } else {
    const states = await api.getEventStates(ownedIds);
    const eventIds = states
      .filter((event) => !onlyOngoing || !event.finished)
      .map((event) => event.id)
      .sort((a, b) => b - a);
    total = eventIds.length;
    loadedPage = Math.min(loadedPage, Math.max(1, Math.ceil(total / pageSize)));
    const pageOffset = (loadedPage - 1) * pageSize;
    const ids = eventIds.slice(pageOffset, pageOffset + pageSize);
    pageEvents = ids.length ? await api.getEventsById(ids) : [];
  }
  return { events: pageEvents, page: loadedPage, totalPages: Math.ceil(total / pageSize) };
}
