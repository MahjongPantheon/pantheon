import { GetOwnedEventIds, GetSuperadminFlag } from 'tsclients/proto/frey.pb';
import { RiichiApiTwirpService } from './riichiApiTwirp';

vi.mock('tsclients/proto/mimir.pb', () => ({}));
vi.mock('../helpers/env', () => ({ env: { urls: {} } }));
vi.mock('tsclients/proto/frey.pb', () => ({
  GetOwnedEventIds: vi.fn(),
  GetSuperadminFlag: vi.fn(),
}));

describe('admin panel eligibility', () => {
  beforeEach(() => vi.resetAllMocks());

  it.each([
    [true, [], true, 'superadmin without events'],
    [false, [17], true, 'selected event administrator or referee'],
    [false, [18], false, 'administrator of another event'],
    [false, [], false, 'ordinary player'],
  ])(
    'checks Frey permissions for a %s / %j account (%s, %s)',
    async (isAdmin: boolean, eventIds: number[], expected: boolean) => {
      vi.mocked(GetSuperadminFlag).mockResolvedValue({ isAdmin });
      vi.mocked(GetOwnedEventIds).mockResolvedValue({ eventIds });
      expect(await new RiichiApiTwirpService().canAccessAdminPanel(42, 17)).toBe(expected);
      expect(GetSuperadminFlag).toHaveBeenCalledWith({ personId: 42 }, expect.any(Object));
      expect(GetOwnedEventIds).toHaveBeenCalledWith({ personId: 42 }, expect.any(Object));
    }
  );

  it.each(['superadmin', 'events'])('rejects a failed %s lookup', async (failed: string) => {
    vi.mocked(GetSuperadminFlag).mockResolvedValue({ isAdmin: true });
    vi.mocked(GetOwnedEventIds).mockResolvedValue({ eventIds: [17] });
    const failure = new Error('Permission lookup failed');
    if (failed === 'superadmin') {
      vi.mocked(GetSuperadminFlag).mockRejectedValue(failure);
    } else {
      vi.mocked(GetOwnedEventIds).mockRejectedValue(failure);
    }
    await expect(new RiichiApiTwirpService().canAccessAdminPanel(42, 17)).rejects.toBe(failure);
  });
});
