import { Event, EventType, PlatformType } from 'tsclients/proto/atoms.pb';

type OnlineIds = { tenhouId?: string | null; roninId?: string | null };

export type OnlineIdGetter = (player?: OnlineIds) => string;

export const getOnlineIdGetter = (
  event?: Pick<Event, 'type' | 'platformId'>
): OnlineIdGetter | null => {
  if (event?.type !== EventType.EVENT_TYPE_ONLINE) {
    return null;
  }
  if (event.platformId === PlatformType.PLATFORM_TYPE_RONIN) {
    return (player) => player?.roninId ?? '';
  }
  return (player) => player?.tenhouId ?? '';
};
