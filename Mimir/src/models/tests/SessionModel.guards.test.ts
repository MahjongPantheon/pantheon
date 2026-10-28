import { SessionModel } from '../SessionModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { EventModel } from '../EventModel.js';
import { Model } from '../Model.js';
import type { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { EndingPolicy, RoundOutcome, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import type { Context } from '../../context.js';

function fixture(personId: number | null = 7) {
  const event = Object.assign(new EventEntity(), {
    id: 42,
    ruleset: RulesetEntity.createRuleset('ema'),
    syncEnd: 0,
    timezone: 'UTC',
    finished: 0,
  });
  const session: SessionEntity = Object.assign(new SessionEntity(), {
    id: 1,
    event,
    status: SessionStatus.SESSION_STATUS_INPROGRESS,
    extraTime: 0,
    nextRoundToken: 'old',
  });
  const em = {
    transactional: vi.fn((work: () => Promise<unknown>) => work()),
    find: vi.fn().mockResolvedValue([session]),
    persist: vi.fn(),
  };
  const repo = { em, meta: { personId } } as unknown as Repository;
  const model = Model.getModel(repo, SessionModel);
  const player = Model.getModel(repo, PlayerModel);
  const events = Model.getModel(repo, EventModel);
  vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
  vi.spyOn(player, 'isEventAdmin').mockResolvedValue(false);
  vi.spyOn(player, 'isEventReferee').mockResolvedValue(false);
  vi.spyOn(events, 'findById').mockResolvedValue([event]);
  return { model, player, events, event, session, em };
}
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

it.each(['cancelGame', 'dropLastRound', 'definalizeGame', 'forceFinishGame'] as const)(
  '%s rejects missing sessions and unauthorized callers',
  async (method) => {
    const args =
      method === 'cancelGame'
        ? [{ sessionHash: 'hash' }]
        : method === 'dropLastRound'
          ? [{ sessionHash: 'hash', intermediateResults: [] }]
          : ['hash'];
    const missing = fixture();
    vi.mocked(missing.model.findByRepresentationalHash).mockResolvedValue([]);
    await expect(Reflect.apply(missing.model[method], missing.model, args)).rejects.toThrow(
      'Session not found'
    );
    for (const personId of [null, 7]) {
      const f = fixture(personId);
      await expect(Reflect.apply(f.model[method], f.model, args)).rejects.toThrow('permissions');
      expect(f.em.persist).not.toHaveBeenCalled();
    }
  }
);

it('permits a referee to cancel an active game and invalidates the round token', async () => {
  const f = fixture();
  vi.mocked(f.player.isEventReferee).mockResolvedValue(true);
  expect(await f.model.cancelGame({ sessionHash: 'hash' })).toEqual({ success: true });
  expect(f.session.status).toBe(SessionStatus.SESSION_STATUS_CANCELLED);
  expect(f.session.nextRoundToken).not.toBe('old');
  await expect(f.model.cancelGame({ sessionHash: 'hash' })).rejects.toThrow('not in progress');
});

it('requires extra-time requests to use one event and an authorized caller', async () => {
  const f = fixture();
  f.em.find.mockResolvedValueOnce([f.session, { ...f.session, event: { id: 43 } }]);
  await expect(
    f.model.addExtraTime({ sessionHashList: ['one', 'two'], extraTime: 30 })
  ).rejects.toThrow('same event');
  await expect(f.model.addExtraTime({ sessionHashList: ['one'], extraTime: 30 })).rejects.toThrow(
    'permissions'
  );
  vi.mocked(f.player.isEventReferee).mockResolvedValue(true);
  expect(await f.model.addExtraTime({ sessionHashList: ['one'], extraTime: 30 })).toEqual({
    success: true,
  });
  expect(f.session.extraTime).toBe(30);
  expect(f.session.nextRoundToken).not.toBe('old');
});

it('restricts definalization to recent, finished, last sessions outside synchronized events', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-28T12:00:00Z'));
  const f = fixture();
  expect(await f.model.mayDefinalize(f.session)).toBe(false);
  f.session.status = SessionStatus.SESSION_STATUS_FINISHED;
  f.event.syncEnd = 1;
  expect(await f.model.mayDefinalize(f.session)).toBe(false);
  f.event.syncEnd = 0;
  expect(await f.model.mayDefinalize(f.session)).toBe(false);
  f.session.endDate = '2026-10-28 11:00:00';
  vi.spyOn(f.model, 'isLastForPlayers').mockResolvedValue(false);
  expect(await f.model.mayDefinalize(f.session)).toBe(false);
  vi.mocked(f.model.isLastForPlayers).mockResolvedValue(true);
  expect(await f.model.mayDefinalize(f.session)).toBe(true);
  f.session.endDate = '2026-10-28 08:59:00';
  expect(await f.model.mayDefinalize(f.session)).toBe(false);
  f.session.endDate = '2026-10-27 11:00:00';
  expect(await f.model.mayDefinalize(f.session)).toBe(false);
});

it('rejects starts for missing, finished events or missing player accounts', async () => {
  const f = fixture();
  const payload = { eventId: 42, players: [1, 2, 3, 4] };
  vi.mocked(f.events.findById).mockResolvedValueOnce([]);
  await expect(f.model.startGame(payload, {} as Context)).rejects.toThrow('not found');
  f.event.finished = 1;
  await expect(f.model.startGame(payload, {} as Context)).rejects.toThrow('already finished');
  f.event.finished = 0;
  vi.spyOn(f.player, 'findById').mockResolvedValue([]);
  await expect(f.model.startGame(payload, {} as Context)).rejects.toThrow('do not exist');
});

it.each([false, true])(
  'applies the one-more-hand timer boundary without saving previews (%s)',
  async (preview) => {
    const f = fixture();
    f.event.ruleset.rules.endingPolicy = EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND;
    f.event.useTimer = 1;
    f.event.lastTimer = 1;
    f.event.gameDuration = 1;
    const state = new SessionState(f.event.ruleset, [1, 2, 3, 4]);
    const round = Object.assign(new RoundEntity(), {
      outcome: RoundOutcome.ROUND_OUTCOME_ABORT,
      riichi: [],
      hands: [],
    });
    vi.spyOn(state, 'update').mockReturnValue({ direct: {}, riichi: {}, honba: {} });
    vi.spyOn(state, 'isFinished').mockReturnValue(false);
    vi.spyOn(state, 'forceFinish');
    vi.spyOn(f.model, 'prefinish').mockResolvedValue();
    await f.model.updateSessionState(f.event, f.session, state, round, preview);
    expect(state.lastHandStarted()).toBe(true);
    expect(f.session.intermediateResults).toBe(preview ? undefined : state.state);
    await f.model.updateSessionState(f.event, f.session, state, round, preview);
    expect(state.forceFinish).toHaveBeenCalledOnce();
    vi.mocked(state.isFinished).mockReturnValue(true);
    await f.model.updateSessionState(f.event, f.session, state, round, preview);
    expect(f.model.prefinish).toHaveBeenCalledWith(f.event, f.session, state, preview);
  }
);

it.each([true, false])(
  'only allows timed chombo to end the game under its configured rule (%s)',
  async (chomboEndsGame) => {
    const f = fixture();
    f.event.ruleset.rules.endingPolicy = EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND;
    f.event.ruleset.rules.chomboEndsGame = chomboEndsGame;
    f.event.useTimer = 1;
    f.event.lastTimer = 1;
    f.event.gameDuration = 1;
    const state = new SessionState(f.event.ruleset, [1, 2, 3, 4]);
    const round = Object.assign(new RoundEntity(), {
      outcome: RoundOutcome.ROUND_OUTCOME_CHOMBO,
      riichi: [],
      hands: [],
    });
    vi.spyOn(state, 'update').mockReturnValue({ direct: {}, riichi: {}, honba: {} });
    vi.spyOn(state, 'forceFinish');
    vi.spyOn(state, 'isFinished').mockReturnValue(chomboEndsGame);
    vi.spyOn(f.model, 'prefinish').mockResolvedValue();
    await f.model.updateSessionState(f.event, f.session, state, round, true);
    expect(state.forceFinish).toHaveBeenCalledTimes(chomboEndsGame ? 1 : 0);
    expect(f.model.prefinish).toHaveBeenCalledTimes(chomboEndsGame ? 1 : 0);
  }
);
