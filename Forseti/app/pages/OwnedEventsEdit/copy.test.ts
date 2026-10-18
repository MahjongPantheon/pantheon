// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';
import { EventData, EventType, RulesetConfig, WindShuffleMode } from 'tsclients/proto/atoms.pb';
import { loadEventCopy } from './copy';

function fixture(type: EventType = EventType.EVENT_TYPE_TOURNAMENT) {
  const event = EventData.initialize({
    type,
    title: 'Original event',
    description: 'Custom description',
    timezone: 'Europe/Moscow',
    duration: 90,
    lobbyId: 12345,
    seriesLength: 8,
    minGames: 4,
    isTeam: true,
    isPrescripted: true,
    windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_PRESCRIPTED,
    isListed: false,
    isRatingShown: true,
    achievementsShown: false,
    allowViewOtherTables: true,
    allowManualAddReplay: false,
    rulesetConfig: RulesetConfig.initialize({
      startPoints: 35000,
      goalPoints: 40000,
      allowedYaku: [1, 2, 3],
      yakuWithPao: [37],
      doubleYakuman: [41],
    }),
  });
  const api = {
    getSuperadminFlag: vi.fn().mockResolvedValue(false),
    getIsEventAdmin: vi.fn().mockResolvedValue(true),
    getEventForEdit: vi.fn().mockResolvedValue({ id: 42, event, finished: true }),
    createEvent: vi.fn(),
    updateEvent: vi.fn(),
  };
  return { event, api };
}

describe('loading an event copy', () => {
  it.each([
    EventType.EVENT_TYPE_LOCAL,
    EventType.EVENT_TYPE_ONLINE,
    EventType.EVENT_TYPE_TOURNAMENT,
  ])('preserves all editable settings for %s without saving', async (type) => {
    const { event, api } = fixture(type);
    const copy = await loadEventCopy(api, 7, 42);

    expect(copy).toEqual({ ...event, title: 'Original event [copy]' });
    expect(copy).not.toHaveProperty('id');
    expect(copy).not.toHaveProperty('finished');
    expect(event.title).toBe('Original event');
    expect(api.getIsEventAdmin).toHaveBeenCalledWith(7, 42);
    expect(api.getEventForEdit).toHaveBeenCalledWith(42);
    expect(api.createEvent).not.toHaveBeenCalled();
    expect(api.updateEvent).not.toHaveBeenCalled();
  });

  it('denies referees, participants and administrators of other events', async () => {
    const { api } = fixture();
    api.getIsEventAdmin.mockResolvedValue(false);

    expect(await loadEventCopy(api, 7, 42)).toBeNull();
    expect(api.getEventForEdit).not.toHaveBeenCalled();
  });

  it('allows a global administrator', async () => {
    const { api } = fixture();
    api.getSuperadminFlag.mockResolvedValue(true);
    api.getIsEventAdmin.mockResolvedValue(false);

    expect(await loadEventCopy(api, 7, 42)).toMatchObject({ title: 'Original event [copy]' });
  });

  it('does not load settings if the permission check fails', async () => {
    const { api } = fixture();
    api.getIsEventAdmin.mockRejectedValue(new Error('Network failure'));

    await expect(loadEventCopy(api, 7, 42)).rejects.toThrow('Network failure');
    expect(api.getEventForEdit).not.toHaveBeenCalled();
  });
});
