import * as mimir from 'tsclients/proto/mimir.pb';
import * as frey from 'tsclients/proto/frey.pb';
import { SessionStatus } from 'tsclients/proto/atoms.pb';
import { RiichiApiTwirpService } from './riichiApiTwirp';
import { formatRoundToTwirp } from './formatters';
import { initialState } from '../store/state';
import type { ClientConfiguration } from 'twirpscript';

vi.mock('tsclients/proto/mimir.pb', () => ({
  AddRound: vi.fn(),
  CallReferee: vi.fn(),
  GetAllRegisteredPlayers: vi.fn(),
  GetAllRounds: vi.fn(),
  GetCurrentStateForPlayer: vi.fn(),
  GetGameConfig: vi.fn(),
  GetLastResults: vi.fn(),
  GetLastRound: vi.fn(),
  GetLastRoundByHash: vi.fn(),
  GetMyEvents: vi.fn(),
  GetSessionOverview: vi.fn(),
  GetTablesState: vi.fn(),
  ListMyPenalties: vi.fn(),
  PreviewRound: vi.fn(),
  StartGame: vi.fn(),
}));
vi.mock('tsclients/proto/frey.pb', () => ({
  Authorize: vi.fn(),
  GetOwnedEventIds: vi.fn(),
  GetPersonalInfo: vi.fn(),
  GetSuperadminFlag: vi.fn(),
  QuickAuthorize: vi.fn(),
}));
vi.mock('./formatters', () => ({ formatRoundToTwirp: vi.fn() }));
vi.mock('./releaseTags', () => ({ handleReleaseTag: (r: Response) => r }));
const rpcs = { ...mimir, ...frey } as unknown as Record<string, ReturnType<typeof vi.fn>>;
let api: RiichiApiTwirpService;
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  api = new RiichiApiTwirpService();
  api.setCredentials(7, 'token');
});
afterEach(() => vi.unstubAllGlobals());

type Case = [keyof RiichiApiTwirpService, unknown[], string, unknown, unknown, unknown];
const cases: Case[] = [
  ['getMyEvents', [], 'GetMyEvents', {}, { events: [42] }, [42]],
  [
    'getGameConfig',
    [42],
    'GetGameConfig',
    { eventId: 42 },
    { title: 'Example' },
    { title: 'Example' },
  ],
  [
    'getLastResults',
    [7, 42],
    'GetLastResults',
    { playerId: 7, eventId: 42 },
    { results: [1] },
    [1],
  ],
  ['getAllPlayers', [42], 'GetAllRegisteredPlayers', { eventIds: [42] }, { players: [7] }, [7]],
  [
    'getGameOverview',
    ['hash'],
    'GetSessionOverview',
    { sessionHash: 'hash' },
    { tableIndex: 2 },
    { tableIndex: 2 },
  ],
  [
    'getCurrentState',
    [7, 42],
    'GetCurrentStateForPlayer',
    { playerId: 7, eventId: 42 },
    { sessions: [] },
    { sessions: [] },
  ],
  ['getUserInfo', [[7]], 'GetPersonalInfo', { ids: [7] }, { people: [7] }, [7]],
  [
    'getLastRoundByHash',
    ['hash'],
    'GetLastRoundByHash',
    { sessionHash: 'hash' },
    { round: { draw: {} } },
    { draw: {} },
  ],
  [
    'getLastRound',
    [7, 42],
    'GetLastRound',
    { playerId: 7, eventId: 42 },
    { round: { draw: {} } },
    { draw: {} },
  ],
  ['getAllRounds', ['hash'], 'GetAllRounds', { sessionHash: 'hash' }, { rounds: [1] }, [1]],
  [
    'quickAuthorize',
    [],
    'QuickAuthorize',
    { personId: 7, authToken: 'token' },
    { authSuccess: true },
    true,
  ],
  [
    'authorize',
    ['email', 'password'],
    'Authorize',
    { email: 'email', password: 'password' },
    { personId: 7 },
    { personId: 7 },
  ],
  ['callReferee', [42, 2], 'CallReferee', { eventId: 42, tableIndex: 2 }, { success: true }, true],
  ['getPenalties', [42], 'ListMyPenalties', { eventId: 42 }, { penalties: [1] }, [1]],
];
it.each(cases)(
  '%s sends its request and projects the response',
  async (
    method: keyof RiichiApiTwirpService,
    args: unknown[],
    rpc: string,
    payload: unknown,
    response: unknown,
    expected: unknown
  ) => {
    rpcs[rpc].mockResolvedValueOnce(response);
    await expect(Reflect.apply(api[method], api, args)).resolves.toEqual(expected);
    expect(rpcs[rpc]).toHaveBeenCalledWith(payload, expect.objectContaining({ prefix: '/v2' }));
  }
);

it.each([
  [false, [], false],
  [true, [], true],
  [false, [42], true],
  [false, [43], false],
] as const)(
  'checks superadmin=%s and owned events=%s',
  async (isAdmin: boolean, eventIds: readonly number[], expected: boolean) => {
    vi.mocked(frey.GetSuperadminFlag).mockResolvedValueOnce({ isAdmin });
    vi.mocked(frey.GetOwnedEventIds).mockResolvedValueOnce({ eventIds: [...eventIds] });
    expect(await api.canAccessAdminPanel(7, 42)).toBe(expected);
  }
);

it('starts sessions using a retry identifier and filters inactive tables', async () => {
  vi.mocked(mimir.StartGame).mockResolvedValueOnce({ sessionHash: 'hash' });
  expect(await api.startGame(42, [1, 2, 3, 4])).toBe('hash');
  expect(mimir.StartGame).toHaveBeenCalledWith(
    { eventId: 42, players: [1, 2, 3, 4], requestId: expect.any(String) },
    expect.anything()
  );
  const active = { status: SessionStatus.SESSION_STATUS_INPROGRESS, tableIndex: 1 };
  vi.mocked(mimir.GetTablesState).mockResolvedValueOnce({
    tables: [active, { status: SessionStatus.SESSION_STATUS_FINISHED }],
  });
  expect(await api.getTablesState(42)).toEqual([active]);
  expect(await api.confirmRegistration('pin')).toBe('pin');
});

it('requires credentials for quick authorization', async () => {
  await expect(new RiichiApiTwirpService().quickAuthorize()).rejects.toBeUndefined();
  api.setCredentials(0, '');
  await expect(api.quickAuthorize()).rejects.toBeUndefined();
});

it('requires a session, outcome and round token before submitting mutations', async () => {
  vi.mocked(formatRoundToTwirp).mockReturnValue(undefined);
  await expect(api.addRound(initialState)).rejects.toBeUndefined();
  await expect(api.getChangesOverview(initialState)).rejects.toBeUndefined();
  vi.mocked(formatRoundToTwirp).mockReturnValue({ draw: {} });
  await expect(api.addRound(initialState)).rejects.toBeUndefined();
  const state = { ...initialState, currentSessionHash: 'hash' };
  await expect(api.addRound(state)).rejects.toThrow('Session overview must be refreshed');
  vi.mocked(mimir.PreviewRound).mockResolvedValueOnce({ state: { roundIndex: 2 } });
  expect(await api.getChangesOverview(state)).toEqual({ roundIndex: 2 });
  vi.mocked(mimir.AddRound).mockResolvedValueOnce({ isFinished: false });
  expect(await api.addRound({ ...state, nextRoundToken: 'fresh' })).toEqual({ isFinished: false });
  expect(mimir.AddRound).toHaveBeenCalledWith(
    { sessionHash: 'hash', roundData: { draw: {} }, roundToken: 'fresh' },
    expect.anything()
  );
});

it.each([200, 400, 500])(
  'preserves request credentials for HTTP %s and reports internal failures',
  async (status: number) => {
    vi.mocked(mimir.GetMyEvents).mockResolvedValueOnce({ events: [] });
    await api.getMyEvents();
    const config = vi.mocked(mimir.GetMyEvents).mock.calls[0][1] as ClientConfiguration;
    const response = new Response(
      JSON.stringify(
        status === 500
          ? { code: 'internal', meta: { cause: 'Server failure' } }
          : { code: 'invalid_argument' }
      ),
      { status }
    );
    const fetch = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetch);
    const pending = config.rpcTransport!('https://api.test', {
      method: 'POST',
      body: '{}',
      headers: { 'Content-Type': 'application/json' },
    });
    if (status === 500) await expect(pending).rejects.toThrow('Server failure');
    else expect(await pending).toBe(response);
    const headers = fetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('X-Auth-Token')).toBe('token');
    expect(headers.get('X-Current-Person-Id')).toBe('7');
    expect(headers.get('X-Twirp')).toBe('true');
    if (status === 500) expect(fetch).toHaveBeenCalledTimes(2);
  }
);
