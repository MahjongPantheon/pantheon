import { SkirnirService } from '../Skirnir.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import type { Repository } from '../Repository.js';
import { Round } from 'tsclients/proto/atoms.pb.js';

class Notifications extends SkirnirService {
  disabled = false;
  settings = [1, 2, 3, 4].map((id) => ({
    id,
    title: `Player ${id}`,
    telegramId: `tg${id}`,
    notifications: '{"h":1,"ha":1,"ce":1,"te":1}',
  }));
  protected async _fetchEventData(): Promise<[boolean, string, RulesetEntity]> {
    return [this.disabled, 'Club', RulesetEntity.createRuleset('ema')];
  }
  protected async _fetchNotificationSettings(ids: number[]) {
    return this.settings.filter((p) => ids.includes(p.id));
  }
  protected async _fetchReferees() {
    return [1, 2];
  }
  readable(han: number, fu: number, kiriage?: boolean, kazoe?: boolean) {
    return this._toReadableHanFu(han, fu, kiriage, kazoe);
  }
  send(to: string[], text: string) {
    return this._sendMessage(to, text);
  }
}
let service: Notifications;
let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  service = new Notifications('https://notifications.test', {} as Repository);
  fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
const message = () =>
  JSON.parse(fetchMock.mock.calls[0][1].body as string) as { to: string[]; message: string };

it.each([
  [1, 30, false, false, '1 han 30 fu'],
  [4, 30, true, false, 'Mangan'],
  [3, 60, true, false, 'Mangan'],
  [3, 30, true, false, '3 han 30 fu'],
  [5, 0, false, false, 'Mangan'],
  [6, 0, false, false, 'Haneman'],
  [7, 0, false, false, 'Haneman'],
  [8, 0, false, false, 'Baiman'],
  [10, 0, false, false, 'Baiman'],
  [11, 0, false, false, 'Sanbaiman'],
  [12, 0, false, false, 'Sanbaiman'],
  [13, 0, false, false, 'Sanbaiman'],
  [13, 0, false, true, 'Yakuman'],
  [-1, 0, false, false, 'Yakuman'],
  [0, 0, false, false, ''],
] as const)(
  'formats %s han %s fu with kiriage=%s kazoe=%s',
  (han, fu, kiriage, kazoe, expected) => {
    expect(service.readable(han, fu, kiriage, kazoe)).toBe(expected);
  }
);

it('keeps seat winds in the supplied player order and respects opt-outs', async () => {
  service.settings[0].notifications = '{"sr":0}';
  service.settings[1].telegramId = '';
  service.settings[2].notifications = '{invalid';
  await service.messageSeatingReady([4, 3, 2, 1], 2, 42);
  expect(message().to).toEqual(['tg3', 'tg4']);
  expect(message().message).toContain('東 Player 4\n南 Player 3\n西 Player 2\n北 Player 1');
});

it('sends starting, referee, tracker and penalty notices', async () => {
  const calls = [
    () => service.messageSessionStartingSoon([1], 42),
    () => service.messageCallReferee(42, 3),
    () => service.trackSession('session-hash'),
    () => service.messagePenaltyApplied(1, 42, 500, 'Late'),
    () => service.messagePenaltyCancelled(1, 42, 500, 'Corrected'),
  ];
  const expected = ['about to start', 'table # 3', 'session-hash', 'assigned', 'cancelled'];
  for (let i = 0; i < calls.length; i++) {
    fetchMock.mockClear();
    await calls[i]();
    expect(message().message).toContain(expected[i]);
    expect(fetchMock.mock.calls[0][0]).toBe('https://notifications.test');
  }
});

it.each(['club', 'tournament'] as const)('reports %s session results', async (kind) => {
  if (kind === 'club') await service.messageClubSessionEnd([1, 2], 42, { 1: 35000, 2: 15000 });
  else await service.messageTournamentSessionEnd([1, 2], 42, { 1: 35000, 2: 15000 });
  expect(message().message).toContain('<b>Player 1</b>: 35000');
  expect(message().to).toEqual(['tg1', 'tg2']);
});

it.each([
  [{ ron: { winnerId: 1, han: 3, fu: 40, yaku: [33] } }, 'Riichi'],
  [{ multiron: { wins: [{ winnerId: 1, han: 6, fu: 0, yaku: [8] }] } }, 'Haneman'],
  [{ tsumo: { winnerId: 2, han: 5, fu: 0, yaku: [36] } }, 'Mangan'],
  [{ draw: {} }, 'Exhaustive draw'],
  [{ abort: {} }, 'Abortive draw'],
  [{ chombo: { loserIds: [1] } }, 'Chombo (Player 1)'],
  [{}, 'No changes'],
])('describes the recorded round %j', async (round, text) => {
  await service.messageHandRecorded([1, 2], [1], 42, {}, round as Round);
  expect(message().message).toContain(text);
  expect(new Set(message().to).size).toBe(message().to.length);
});

it('shows positive and negative score changes but omits unchanged scores', async () => {
  await service.messageHandRecorded(
    [1, 2, 3],
    [],
    42,
    { 1: [25000, 26000], 2: [25000, 24000], 3: [25000, 25000] },
    {}
  );
  expect(message().message).toContain('(+1000)');
  expect(message().message).toContain('(-1000)');
  expect(message().message).not.toContain('Player 3');
});

it('suppresses every event notice for test events', async () => {
  service.disabled = true;
  await service.messageSeatingReady([1, 2, 3, 4], 1, 42);
  await service.messageSessionStartingSoon([1], 42);
  await service.messageCallReferee(42, 1);
  await service.messageHandRecorded([1], [], 42, {}, {});
  await service.messageClubSessionEnd([1], 42, {});
  await service.messageTournamentSessionEnd([1], 42, {});
  await service.messagePenaltyApplied(1, 42, 500, 'reason');
  await service.messagePenaltyCancelled(1, 42, 500, 'reason');
  expect(fetchMock).not.toHaveBeenCalled();
});

it('logs failed delivery without rejecting a business operation', async () => {
  const log = vi.spyOn(console, 'error').mockImplementation(() => {});
  fetchMock.mockResolvedValueOnce(new Response(null, { status: 503, statusText: 'Unavailable' }));
  await service.send(['tg1'], 'notice');
  expect(log).toHaveBeenCalledWith('Failed to send message: Unavailable');
  const error = new Error('Offline');
  fetchMock.mockRejectedValueOnce(error);
  await expect(service.send(['tg1'], 'notice')).resolves.toBeUndefined();
  expect(log).toHaveBeenCalledWith('Error sending message:', error);
});
