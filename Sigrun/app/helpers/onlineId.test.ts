import { describe, expect, it } from 'vitest';
import { EventType, PlatformType } from 'tsclients/proto/atoms.pb';
import { getOnlineIdGetter } from './onlineId';

const player = { tenhouId: 'tenhou-player', roninId: 'ronin-player' };

describe('online player id', () => {
  it.each([
    [PlatformType.PLATFORM_TYPE_TENHOUNET, 'tenhou-player'],
    [PlatformType.PLATFORM_TYPE_MAHJONGSOUL, 'tenhou-player'],
    [PlatformType.PLATFORM_TYPE_RONIN, 'ronin-player'],
  ])('shows the %s id of an online event player', (platformId, expected) => {
    const onlineId = getOnlineIdGetter({ type: EventType.EVENT_TYPE_ONLINE, platformId });
    expect(onlineId?.(player)).toBe(expected);
  });

  it('shows no id for offline events', () => {
    expect(
      getOnlineIdGetter({
        type: EventType.EVENT_TYPE_LOCAL,
        platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      })
    ).toBeNull();
  });
});
