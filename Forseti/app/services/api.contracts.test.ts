import { afterEach, beforeEach, expect, it, vi, type Mock } from 'vitest';
import * as mimir from 'tsclients/proto/mimir.pb';
import * as frey from 'tsclients/proto/frey.pb';
import * as hugin from 'tsclients/proto/hugin.pb';
import { ApiService } from './api';
import { Analytics } from './analytics';
import { EventData, WindShuffleMode } from 'tsclients/proto/atoms.pb';
import type { ClientConfiguration } from 'twirpscript';

vi.mock('tsclients/proto/mimir.pb', () => ({
  AddExtraTime: vi.fn(),
  AddPenalty: vi.fn(),
  CancelGame: vi.fn(),
  CancelPenalty: vi.fn(),
  CreateEvent: vi.fn(),
  DefinalizeGame: vi.fn(),
  DropLastRound: vi.fn(),
  FinalizeSession: vi.fn(),
  FinishEvent: vi.fn(),
  ForceFinishGame: vi.fn(),
  GetAllRegisteredPlayers: vi.fn(),
  GetEventForEdit: vi.fn(),
  GetEvents: vi.fn(),
  GetEventsById: vi.fn(),
  GetEventStates: vi.fn(),
  GetGameConfig: vi.fn(),
  GetPrescriptedEventConfig: vi.fn(),
  GetRulesets: vi.fn(),
  GetTablesState: vi.fn(),
  GetTimerState: vi.fn(),
  ListChombo: vi.fn(),
  ListPenalties: vi.fn(),
  MakeIntervalSeating: vi.fn(),
  MakePrescriptedSeating: vi.fn(),
  MakeShuffledSeating: vi.fn(),
  MakeSwissSeating: vi.fn(),
  NotifyPlayersSessionStartsSoon: vi.fn(),
  RebuildScoring: vi.fn(),
  RecalcAchievements: vi.fn(),
  RecalcPlayerStats: vi.fn(),
  RegisterPlayer: vi.fn(),
  ResetSeating: vi.fn(),
  StartTimer: vi.fn(),
  ToggleHideAchievements: vi.fn(),
  ToggleHideResults: vi.fn(),
  ToggleListed: vi.fn(),
  UnregisterPlayer: vi.fn(),
  UpdateEvent: vi.fn(),
  UpdatePlayerReplacement: vi.fn(),
  UpdatePlayerSeatingFlag: vi.fn(),
  UpdatePlayersLocalIds: vi.fn(),
  UpdatePlayersTeams: vi.fn(),
  UpdatePrescriptedEventConfig: vi.fn(),
}));
vi.mock('tsclients/proto/frey.pb', () => ({
  AddRuleForPerson: vi.fn(),
  ApproveRegistration: vi.fn(),
  ApproveResetPassword: vi.fn(),
  Authorize: vi.fn(),
  ChangePassword: vi.fn(),
  CreateAccount: vi.fn(),
  DeleteRuleForPerson: vi.fn(),
  DepersonalizeAccount: vi.fn(),
  FindByTitle: vi.fn(),
  GetEventAdmins: vi.fn(),
  GetOwnedEventIds: vi.fn(),
  GetPersonalInfo: vi.fn(),
  GetSuperadminFlag: vi.fn(),
  QuickAuthorize: vi.fn(),
  RequestRegistration: vi.fn(),
  RequestResetPassword: vi.fn(),
  UpdatePersonalInfo: vi.fn(),
  GetNotificationsSettings: vi.fn(),
  SetNotificationsSettings: vi.fn(),
  GetEventReferees: vi.fn(),
}));
vi.mock('tsclients/proto/hugin.pb', () => ({
  GetLastDay: vi.fn(),
  GetLastMonth: vi.fn(),
  GetLastYear: vi.fn(),
}));
vi.mock('./releaseTags', () => ({ handleReleaseTag: (r: Response) => r }));
const rpcs = { ...mimir, ...frey, ...hugin } as unknown as Record<string, Mock>;
let api: ApiService;
const analytics = { track: vi.fn() };
beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  api = new ApiService().setAnalytics(analytics as unknown as Analytics);
  api.setCredentials(7, 'token');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

type Case = [keyof ApiService, unknown[], string, unknown, unknown, unknown];
const cases: Case[] = [
  ['getAllPlayers', [42], 'GetAllRegisteredPlayers', { eventIds: [42] }, { players: [1] }, [1]],
  [
    'getTablesState',
    [42],
    'GetTablesState',
    { eventId: 42, omitLastRound: false },
    { tables: [1] },
    [1],
  ],
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
    ['a@b.test', 'password'],
    'Authorize',
    { email: 'a@b.test', password: 'password' },
    { personId: 7 },
    { personId: 7 },
  ],
  [
    'requestRegistration',
    ['a@b.test', 'Alice', 'password'],
    'RequestRegistration',
    { email: 'a@b.test', title: 'Alice', password: 'password' },
    { success: true },
    { success: true },
  ],
  [
    'confirmRegistration',
    ['code'],
    'ApproveRegistration',
    { approvalCode: 'code' },
    { success: true },
    { success: true },
  ],
  [
    'requestPasswordRecovery',
    ['a@b.test'],
    'RequestResetPassword',
    { email: 'a@b.test' },
    { success: true },
    { success: true },
  ],
  [
    'approvePasswordRecovery',
    ['a@b.test', 'reset'],
    'ApproveResetPassword',
    { email: 'a@b.test', resetToken: 'reset' },
    { success: true },
    { success: true },
  ],
  [
    'changePassword',
    ['a@b.test', 'old', 'new'],
    'ChangePassword',
    { email: 'a@b.test', password: 'old', newPassword: 'new' },
    { success: true },
    { success: true },
  ],
  ['getPersonalInfo', [7], 'GetPersonalInfo', { ids: [7] }, { people: [{ id: 7 }] }, { id: 7 }],
  ['depersonalizeAccount', [], 'DepersonalizeAccount', {}, { success: true }, { success: true }],
  [
    'updatePersonalInfo',
    [
      7,
      'Alice',
      'DE',
      'Berlin',
      'a@b.test',
      'phone',
      'tenhou',
      true,
      'image',
      'nickname',
      123,
      456,
    ],
    'UpdatePersonalInfo',
    {
      id: 7,
      title: 'Alice',
      country: 'DE',
      city: 'Berlin',
      email: 'a@b.test',
      phone: 'phone',
      tenhouId: 'tenhou',
      hasAvatar: true,
      avatarData: 'image',
      msNickname: 'nickname',
      msFriendId: 123,
      msAccountId: 456,
    },
    { success: true },
    true,
  ],
  ['getManagedEventIds', [7], 'GetOwnedEventIds', { personId: 7 }, { eventIds: [42] }, [42]],
  ['getSuperadminFlag', [7], 'GetSuperadminFlag', { personId: 7 }, { isAdmin: false }, false],
  [
    'getEvents',
    [10, 20, true],
    'GetEvents',
    { limit: 10, offset: 20, filter: '', filterUnlisted: true, onlyOngoing: false },
    { events: [42] },
    { events: [42] },
  ],
  [
    'getEvents',
    [10, 20, false, true],
    'GetEvents',
    { limit: 10, offset: 20, filter: '', filterUnlisted: false, onlyOngoing: true },
    { events: [] },
    { events: [] },
  ],
  ['getEventStates', [[42]], 'GetEventStates', { ids: [42] }, { events: [1] }, [1]],
  ['getEventsById', [[42]], 'GetEventsById', { ids: [42] }, { events: [1] }, [1]],
  ['getEventAdmins', [42], 'GetEventAdmins', { eventId: 42 }, { admins: [7] }, [7]],
  ['getEventReferees', [42], 'GetEventReferees', { eventId: 42 }, { referees: [7] }, [7]],
  [
    'getEventForEdit',
    [42],
    'GetEventForEdit',
    { id: 42 },
    { event: { title: 'Example' } },
    { event: { title: 'Example' } },
  ],
  [
    'updateEvent',
    [42, { title: 'Example' }],
    'UpdateEvent',
    { id: 42, event: { title: 'Example' } },
    { success: true },
    true,
  ],
  [
    'getGameConfig',
    [42],
    'GetGameConfig',
    { eventId: 42 },
    { title: 'Example' },
    { title: 'Example' },
  ],
  [
    'getTimerState',
    [42],
    'GetTimerState',
    { eventId: 42 },
    { secondsRemaining: 90 },
    { secondsRemaining: 90 },
  ],
  ['getPenalties', [42], 'ListPenalties', { eventId: 42 }, { penalties: [] }, { penalties: [] }],
  ['getChombo', [42], 'ListChombo', { eventId: 42 }, { chombo: [] }, { chombo: [] }],
  [
    'addPenalty',
    [42, 7, 500, 'reason'],
    'AddPenalty',
    { eventId: 42, playerId: 7, amount: 500, reason: 'reason' },
    { success: true },
    true,
  ],
  [
    'cancelPenalty',
    [99, 'reason'],
    'CancelPenalty',
    { penaltyId: 99, reason: 'reason' },
    { success: true },
    true,
  ],
  [
    'updateSeatingFlag',
    [7, 42, true],
    'UpdatePlayerSeatingFlag',
    { playerId: 7, eventId: 42, ignoreSeating: true },
    { success: true },
    true,
  ],
  [
    'registerPlayer',
    [7, 42],
    'RegisterPlayer',
    { playerId: 7, eventId: 42 },
    { success: true },
    true,
  ],
  [
    'unregisterPlayer',
    [7, 42],
    'UnregisterPlayer',
    { playerId: 7, eventId: 42 },
    { success: true },
    true,
  ],
  ['findByTitle', ['Alice'], 'FindByTitle', { query: 'Alice' }, { people: [7] }, [7]],
  [
    'addEventAdmin',
    [7, 42],
    'AddRuleForPerson',
    { personId: 7, eventId: 42, ruleName: 'ADMIN_EVENT', ruleValue: 1 },
    { ruleId: 99 },
    99,
  ],
  [
    'addEventReferee',
    [7, 42],
    'AddRuleForPerson',
    { personId: 7, eventId: 42, ruleName: 'REFEREE_FOR_EVENT', ruleValue: 1 },
    { ruleId: 99 },
    99,
  ],
  ['removeEventAdmin', [99], 'DeleteRuleForPerson', { ruleId: 99 }, { success: true }, true],
  ['removeEventReferee', [99], 'DeleteRuleForPerson', { ruleId: 99 }, { success: true }, true],
  [
    'updatePlayerReplacement',
    [7, 42, 8],
    'UpdatePlayerReplacement',
    { playerId: 7, eventId: 42, replacementId: 8 },
    { success: true },
    true,
  ],
  [
    'updateLocalIds',
    [42, { 7: 3 }],
    'UpdatePlayersLocalIds',
    { eventId: 42, idsToLocalIds: [{ playerId: 7, localId: 3 }] },
    { success: true },
    true,
  ],
  [
    'updateTeamNames',
    [42, { 7: 'Team' }],
    'UpdatePlayersTeams',
    { eventId: 42, idsToTeamNames: [{ playerId: 7, teamName: 'Team' }] },
    { success: true },
    true,
  ],
  [
    'cancelLastRound',
    ['hash', []],
    'DropLastRound',
    { sessionHash: 'hash', intermediateResults: [] },
    { success: true },
    true,
  ],
  ['cancelGame', ['hash'], 'CancelGame', { sessionHash: 'hash' }, { success: true }, true],
  ['definalizeGame', ['hash'], 'DefinalizeGame', { sessionHash: 'hash' }, { success: true }, true],
  [
    'addExtraTime',
    [['hash'], 60],
    'AddExtraTime',
    { sessionHashList: ['hash'], extraTime: 60 },
    { success: true },
    true,
  ],
  ['forceFinish', ['hash'], 'ForceFinishGame', { sessionHash: 'hash' }, { success: true }, true],
  [
    'getPrescriptedEventConfig',
    [42],
    'GetPrescriptedEventConfig',
    { eventId: 42 },
    { prescript: '1 2 3 4' },
    { prescript: '1 2 3 4' },
  ],
  [
    'updatePrescriptedEventConfig',
    [42, 2, 'script'],
    'UpdatePrescriptedEventConfig',
    { eventId: 42, nextSessionIndex: 2, prescript: 'script' },
    { success: true },
    true,
  ],
  [
    'createAccount',
    ['email', 'title', 'password', 'city', 'country', 'phone', 'tenhou'],
    'CreateAccount',
    {
      email: 'email',
      title: 'title',
      password: 'password',
      city: 'city',
      country: 'country',
      phone: 'phone',
      tenhouId: 'tenhou',
    },
    { personId: 7 },
    7,
  ],
  ['getLastDayStats', [], 'GetLastDay', {}, { data: [1] }, [1]],
  ['getLastMonthStats', [], 'GetLastMonth', {}, { data: [2] }, [2]],
  ['getLastYearStats', [], 'GetLastYear', {}, { data: [3] }, [3]],
];
for (const [method, rpc] of [
  ['rebuildScoring', 'RebuildScoring'],
  ['toggleHideResults', 'ToggleHideResults'],
  ['toggleListed', 'ToggleListed'],
  ['finishEvent', 'FinishEvent'],
  ['recalcAchievements', 'RecalcAchievements'],
  ['recalcPlayerStats', 'RecalcPlayerStats'],
  ['startTimer', 'StartTimer'],
  ['notifyPlayers', 'NotifyPlayersSessionStartsSoon'],
  ['toggleResults', 'ToggleHideResults'],
  ['toggleAchievements', 'ToggleHideAchievements'],
  ['approveResults', 'FinalizeSession'],
  ['resetSeating', 'ResetSeating'],
] as const)
  cases.push([method, [42], rpc, { eventId: 42 }, { success: true }, true]);

it.each(cases)(
  '%s sends its contract payload and projects the response',
  async (method, args, rpc, payload, response, expected) => {
    rpcs[rpc].mockResolvedValue(response);
    await expect(Reflect.apply(api[method], api, args)).resolves.toEqual(expected);
    expect(rpcs[rpc]).toHaveBeenCalledWith(payload, expect.objectContaining({ prefix: '/v2' }));
  }
);

it('rejects quick authorization before credentials are available', async () => {
  await expect(new ApiService().quickAuthorize()).rejects.toBeUndefined();
  const empty = new ApiService();
  empty.setCredentials(0, '');
  await expect(empty.quickAuthorize()).rejects.toBeUndefined();
});

it('zips ruleset identifiers, labels and rules without losing their order', async () => {
  vi.mocked(mimir.GetRulesets).mockResolvedValue({
    rulesetIds: ['a', 'b'],
    rulesetTitles: ['A', 'B'],
    rulesets: [{ title: 'first' }, { title: 'second' }],
  } as never);
  expect(await api.getRulesets()).toEqual([
    { id: 'a', title: 'A', rules: { title: 'first' } },
    { id: 'b', title: 'B', rules: { title: 'second' } },
  ]);
});

it.each([true, false])(
  'matches admin and referee rights to the requested player: %s',
  async (match) => {
    vi.mocked(frey.GetEventAdmins).mockResolvedValue({
      admins: [{ personId: match ? 7 : 8 }],
    } as never);
    vi.mocked(frey.GetEventReferees).mockResolvedValue({
      referees: [{ personId: match ? 7 : 8 }],
    } as never);
    expect(await api.getIsEventAdmin(7, 42)).toBe(match);
    expect(await api.getIsEventReferee(7, 42)).toBe(match);
  }
);

it.each(['{"enabled":true}', '{invalid'])(
  'decodes notification settings safely: %s',
  async (notifications) => {
    vi.mocked(frey.GetNotificationsSettings).mockResolvedValue({
      telegramId: 'telegram',
      notifications,
    });
    expect(await api.getNotificationsSettings(7)).toEqual({
      id: 'telegram',
      notifications: notifications.includes('invalid') ? {} : { enabled: true },
    });
  }
);
it('converts notification switches to backend integer flags', async () => {
  vi.mocked(frey.SetNotificationsSettings).mockResolvedValue({ success: true });
  expect(
    await api.setNotificationsSettings(7, 'telegram', { enabled: true, disabled: false, count: 2 })
  ).toBe(true);
  expect(frey.SetNotificationsSettings).toHaveBeenCalledWith(
    { personId: 7, telegramId: 'telegram', notifications: '{"enabled":1,"disabled":0,"count":2}' },
    expect.anything()
  );
});

it.each([
  'makeShuffledSeating',
  'makeIntervalSeating',
  'makeSwissSeating',
  'makePrescriptedSeating',
] as const)('%s handles both acknowledgement and proxy timeout', async (method) => {
  const rpcName = {
    makeShuffledSeating: 'MakeShuffledSeating',
    makeIntervalSeating: 'MakeIntervalSeating',
    makeSwissSeating: 'MakeSwissSeating',
    makePrescriptedSeating: 'MakePrescriptedSeating',
  }[method];
  const rpc = rpcs[rpcName];
  vi.spyOn(Math, 'random').mockReturnValue(0.5);
  const args =
    method === 'makeIntervalSeating'
      ? [42, 3, WindShuffleMode.WIND_SHUFFLE_MODE_UNSPECIFIED]
      : [42, WindShuffleMode.WIND_SHUFFLE_MODE_UNSPECIFIED];
  rpc.mockResolvedValueOnce({ success: true });
  await expect(Reflect.apply(api[method], api, args)).resolves.toBe(true);
  const payload = rpc.mock.calls[0][0];
  expect(payload.eventId).toBe(42);
  if (method === 'makeShuffledSeating')
    expect(payload).toMatchObject({ groupsCount: 1, seed: 500000 });
  if (method === 'makeIntervalSeating') expect(payload.step).toBe(3);
  vi.useFakeTimers();
  rpc.mockRejectedValueOnce(new Error('Gateway timeout'));
  const pending = Reflect.apply(api[method], api, args);
  await vi.advanceTimersByTimeAsync(3000);
  await expect(pending).resolves.toBe(true);
});

it('creates an event with a retry identifier', async () => {
  vi.mocked(mimir.CreateEvent).mockResolvedValue({ eventId: 42 });
  const event = EventData.initialize({ title: 'Example' });
  expect(await api.createEvent(event)).toBe(42);
  expect(mimir.CreateEvent).toHaveBeenCalledWith(
    expect.objectContaining({ ...event, requestId: expect.any(String) }),
    expect.anything()
  );
});

it.each([200, 400, 500])(
  'applies credentials and the current event to HTTP %s responses',
  async (status) => {
    vi.mocked(mimir.GetEvents).mockResolvedValue({ events: [] } as never);
    api.setEventId(42);
    await api.getEvents(10, 0, false);
    const config = vi.mocked(mimir.GetEvents).mock.calls[0][1] as ClientConfiguration;
    const response = new Response(
      JSON.stringify(
        status === 500
          ? { code: 'internal', meta: { cause: 'server failure' } }
          : { code: 'invalid_argument' }
      ),
      { status }
    );
    const fetch = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetch);
    const pending = config.rpcTransport!('https://api.test', {
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      method: 'POST',
    });
    if (status === 500) await expect(pending).rejects.toThrow('server failure');
    else expect(await pending).toBe(response);
    const headers = fetch.mock.calls[0][1].headers as Headers;
    expect(headers.get('X-Auth-Token')).toBe('token');
    expect(headers.get('X-Current-Person-Id')).toBe('7');
    expect(headers.get('X-Current-Event-Id')).toBe('42');
    expect(headers.get('Content-Type')).toBe('application/json');
    if (status === 500) expect(fetch).toHaveBeenCalledTimes(2);
  }
);
