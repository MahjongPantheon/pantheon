import { describe, expect, it, vi } from 'vitest';
import { mimirServer } from '../../mimir.js';
import { Model } from '../Model.js';
import { PlayerModel } from '../PlayerModel.js';
import type { Repository } from '../../services/Repository.js';

function fixture(authToken: string | null, isSuperadmin = true) {
  const event = { id: 77, finished: 0 };
  const authorize = vi.fn(async () => {
    if (authToken !== 'valid') throw new Error('Invalid token');
    return { authSuccess: true };
  });
  const persist = vi.fn();
  const frey = {
    QuickAuthorize: authorize,
    GetSuperadminFlag: vi.fn(async () => ({ isAdmin: isSuperadmin })),
    GetEventAdmins: vi.fn(async () => ({ admins: [{ personId: 1 }] })),
    GetEventReferees: vi.fn(async () => ({ referees: [{ personId: 1 }] })),
  };
  const repo = {
    meta: { personId: 1, authToken, isInternalQuery: false },
    em: {
      transactional: async (action: () => unknown) => action(),
      findOne: async () => event,
      persist,
    },
    frey,
  } as unknown as Repository;
  return { repo, event, persist, frey };
}

describe('Authenticated event permissions', () => {
  it.each([null, '', 'wrong'])(
    'rejects a spoofed superadmin with token %s before finishing an event',
    async (token) => {
      const { repo, event, persist, frey } = fixture(token);
      await expect(
        mimirServer.FinishEvent({ eventId: 77 }, { repository: repo })
      ).rejects.toThrow();
      expect(event.finished).toBe(0);
      expect(persist).not.toHaveBeenCalled();
      expect(frey.GetSuperadminFlag).not.toHaveBeenCalled();
    }
  );

  it.each(['isEventAdmin', 'isEventReferee'] as const)(
    'checks credentials before accepting an event role in %s',
    async (method) => {
      const { repo, frey } = fixture('wrong', false);
      await expect(Model.getModel(repo, PlayerModel)[method](77)).rejects.toThrow('Invalid token');
      expect(frey.GetEventAdmins).not.toHaveBeenCalled();
      expect(frey.GetEventReferees).not.toHaveBeenCalled();
    }
  );

  it.each([true, false])(
    'allows an authenticated administrator, superadmin: %s',
    async (superadmin) => {
      const { repo, event, frey } = fixture('valid', superadmin);
      await expect(mimirServer.FinishEvent({ eventId: 77 }, { repository: repo })).resolves.toEqual(
        { success: true }
      );
      expect(event.finished).toBe(1);
      expect(frey.QuickAuthorize).toHaveBeenCalledWith({ personId: 1, authToken: 'valid' });
    }
  );

  it('allows an authenticated referee', async () => {
    const { repo } = fixture('valid', false);
    await expect(Model.getModel(repo, PlayerModel).isEventReferee(77)).resolves.toBe(true);
  });

  it('returns no privileged role for an anonymous reader', async () => {
    const { repo, frey } = fixture(null);
    const model = Model.getModel(repo, PlayerModel);
    await expect(model.isEventAdmin(77)).resolves.toBe(false);
    await expect(model.isEventReferee(77)).resolves.toBe(false);
    expect(frey.QuickAuthorize).not.toHaveBeenCalled();
  });
});
