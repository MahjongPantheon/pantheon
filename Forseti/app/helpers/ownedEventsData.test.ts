// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { Event } from 'tsclients/proto/atoms.pb';
import { loadOwnedEvents } from './ownedEventsData';

function fixture() {
  const api = {
    getManagedEventIds: vi.fn().mockResolvedValue([1, 4, 2, 3]),
    getEventStates: vi.fn().mockResolvedValue([
      { id: 1, finished: false },
      { id: 4, finished: true },
      { id: 2, finished: false },
      { id: 3, finished: true },
    ]),
    getEventsById: vi
      .fn()
      .mockImplementation(async (ids: number[]) => ids.map((id) => Event.initialize({ id }))),
    getEvents: vi.fn().mockResolvedValue({ total: 3, events: [Event.initialize({ id: 7 })] }),
  };
  return api;
}

describe('owned events pagination', () => {
  it('loads states before fetching only the ongoing IDs on the requested page', async () => {
    const api = fixture();
    const result = await loadOwnedEvents(api, 42, 2, true, 1);
    expect(api.getManagedEventIds).toHaveBeenCalledWith(42);
    expect(api.getEventStates).toHaveBeenCalledWith([1, 4, 2, 3]);
    expect(api.getEventsById).toHaveBeenCalledWith([1]);
    expect(api.getEventsById.mock.invocationCallOrder[0]).toBeGreaterThan(
      api.getEventStates.mock.invocationCallOrder[0]
    );
    expect(result.totalPages).toBe(2);
    expect(result.events.map((event) => event.id)).toEqual([1]);
  });

  it('includes finished events in all mode and sorts IDs newest first', async () => {
    const api = fixture();
    const result = await loadOwnedEvents(api, 42, 1, false, 2);
    expect(api.getEventsById).toHaveBeenCalledWith([4, 3]);
    expect(result.totalPages).toBe(2);
  });

  it('shows an empty list when all owned events are finished', async () => {
    const api = fixture();
    api.getEventStates.mockResolvedValue([{ id: 1, finished: true }]);
    const result = await loadOwnedEvents(api, 42, 1, true, 30);
    expect(result).toEqual({ events: [], totalPages: 0, page: 1 });
    expect(api.getEventsById).not.toHaveBeenCalled();
  });

  it('clamps the page after the last event on a page finishes', async () => {
    const api = fixture();
    const result = await loadOwnedEvents(api, 42, 3, true, 1);
    expect(result.page).toBe(2);
    expect(api.getEventsById).toHaveBeenCalledWith([1]);
  });

  it.each([true, false])(
    'passes ongoing=%s to server pagination for global admins',
    async (ongoing) => {
      const api = fixture();
      api.getManagedEventIds.mockResolvedValue([-1]);
      const result = await loadOwnedEvents(api, 42, 2, ongoing, 1);
      expect(api.getEvents).toHaveBeenCalledWith(1, 1, false, ongoing);
      expect(api.getEventStates).not.toHaveBeenCalled();
      expect(result.totalPages).toBe(3);
    }
  );

  it('clamps global admin pages when the event count shrinks', async () => {
    const api = fixture();
    api.getManagedEventIds.mockResolvedValue([-1]);
    const result = await loadOwnedEvents(api, 42, 5, true, 1);
    expect(api.getEvents).toHaveBeenLastCalledWith(1, 2, false, true);
    expect(result.page).toBe(3);
  });
});
