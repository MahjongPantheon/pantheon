import type { ApiService } from '../../services/api';
import type { EventData } from 'tsclients/proto/atoms.pb';

type CopyApi = Pick<ApiService, 'getSuperadminFlag' | 'getIsEventAdmin' | 'getEventForEdit'>;

export async function loadEventCopy(
  api: CopyApi,
  personId: number,
  eventId: number
): Promise<EventData | null> {
  const isSuperadmin = await api.getSuperadminFlag(personId);
  if (!isSuperadmin && !(await api.getIsEventAdmin(personId, eventId))) {
    return null;
  }

  // The edit contract contains settings only, without participants, games or event identity.
  const { event } = await api.getEventForEdit(eventId);
  return { ...event, title: `${event.title} [copy]` };
}
