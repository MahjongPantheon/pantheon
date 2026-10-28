import { EventModel } from '../EventModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { Model } from '../Model.js';
import type { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { EventData, TournamentGamesStatus } from 'tsclients/proto/atoms.pb.js';

function fixture(personId: number | null = 7, allowed = false) {
  const event = Object.assign(new EventEntity(), {
    id: 42,
    useTimer: 1,
    gameDuration: 75,
    lastTimer: 0,
    finished: 0,
    gamesStatus: TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY,
    ruleset: RulesetEntity.createRuleset('ema'),
  });
  const em = {
    transactional: vi.fn((work: () => Promise<unknown>) => work()),
    findOne: vi.fn().mockResolvedValue(event),
    findOneOrFail: vi.fn().mockResolvedValue(event),
    find: vi.fn().mockResolvedValue([event]),
    persist: vi.fn(),
  };
  const repo = { em, meta: { personId } } as unknown as Repository;
  const model = Model.getModel(repo, EventModel);
  const player = Model.getModel(repo, PlayerModel);
  vi.spyOn(player, 'isEventAdmin').mockResolvedValue(allowed);
  vi.spyOn(player, 'isEventReferee').mockResolvedValue(false);
  vi.spyOn(model, 'findById').mockResolvedValue([event]);
  return { model, player, event, em };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
const mutations = [
  ['finishEvent', { eventId: 42 }],
  ['toggleListed', { eventId: 42 }],
  ['toggleHideResults', { eventId: 42 }],
  ['toggleHideAchievements', { eventId: 42 }],
  ['recalcAchievements', 42],
  ['recalcPlayerStats', 42],
  ['updatePrescriptedConfig', { eventId: 42, prescript: '', nextSessionIndex: 1 }],
  ['startTimer', 42],
] as const;

it.each(mutations)(
  '%s rejects missing events and callers without permissions',
  async (method, payload) => {
    const missing = fixture();
    missing.em.findOne.mockResolvedValueOnce(null);
    await expect(Reflect.apply(missing.model[method], missing.model, [payload])).rejects.toThrow(
      /not found/
    );
    for (const id of [null, 7]) {
      const denied = fixture(id);
      await expect(Reflect.apply(denied.model[method], denied.model, [payload])).rejects.toThrow(
        /permissions/
      );
      expect(denied.em.persist).not.toHaveBeenCalled();
    }
  }
);

it.each([
  ['toggleListed', 'isListed'],
  ['toggleHideResults', 'hideResults'],
  ['toggleHideAchievements', 'hideAchievements'],
] as const)('%s toggles both directions for an event administrator', async (method, field) => {
  const f = fixture(7, true);
  f.event[field] = 0;
  expect(await f.model[method]({ eventId: 42 })).toEqual({ success: true });
  expect(f.event[field]).toBe(1);
  await f.model[method]({ eventId: 42 });
  expect(f.event[field]).toBe(0);
  expect(f.em.persist).toHaveBeenCalledWith(f.event);
});

it('validates event creation and update before persistence', async () => {
  const f = fixture(null);
  const event = EventData.initialize({});
  await expect(
    f.model.createEvent({ ...event, rulesetConfig: undefined } as unknown as EventData)
  ).rejects.toThrow('Ruleset configuration');
  await expect(f.model.createEvent(event)).rejects.toThrow('permissions');
  await expect(
    f.model.updateEvent({
      id: 42,
      event: { ...event, rulesetConfig: undefined } as unknown as EventData,
    })
  ).rejects.toThrow('Ruleset configuration');
  await expect(f.model.updateEvent({ id: 42, event })).rejects.toThrow('permissions');
  const missing = fixture();
  missing.em.findOneOrFail.mockResolvedValue(null);
  await expect(missing.model.updateEvent({ id: 42, event })).rejects.toThrow('not found');
});

it('reports timer states before start, during play, after expiry and after event completion', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(1000000);
  const f = fixture();
  const session = Object.assign(new SessionEntity(), {
    representationalHash: 'hash',
    extraTime: 30,
  });
  expect(await f.model.getTimerState(42)).toMatchObject({ started: false, waitingForTimer: true });
  expect((await f.model.getTimerStateForSessions(42, [session])).hash).toMatchObject({
    started: false,
    waitingForTimer: true,
  });
  f.event.lastTimer = 900;
  f.event.gameDuration = 5;
  expect(await f.model.getTimerState(42)).toMatchObject({ started: true, timeRemaining: 200 });
  expect((await f.model.getTimerStateForSessions(42, [session])).hash.timeRemaining).toBe(230);
  f.event.lastTimer = 100;
  expect((await f.model.getTimerStateForSessions(42, [session])).hash.started).toBe(false);
  expect((await f.model.getTimerState(42)).started).toBe(false);
  f.event.finished = 1;
  expect((await f.model.getTimerStateForSessions(42, [session])).hash).toMatchObject({
    finished: true,
    timeRemaining: 0,
  });
  f.event.useTimer = 0;
  expect(await f.model.getTimerStateForSessions(42, [session])).toEqual({});
  expect(await f.model.getTimerState(42)).toMatchObject({
    started: false,
    waitingForTimer: false,
    hideSeatingAfter: 0,
  });
  vi.mocked(f.model.findById).mockResolvedValue([]);
  await expect(f.model.getTimerState(42)).rejects.toThrow('Event not found');
  await expect(f.model.getTimerStateForSessions(42, [session])).rejects.toThrow('Event not found');
});
