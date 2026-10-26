import { vi } from 'vitest';
import { setImmediate } from 'node:timers/promises';
import { EndingPolicy, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { Model } from '../Model.js';
import { IdempotencyModel } from '../IdempotencyModel.js';
import { SessionModel } from '../SessionModel.js';
import { CronModel } from '../CronModel.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { RoundModel } from '../RoundModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { AchievementsModel } from '../AchievementsModel.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { roundFixtures } from '../../tests/roundFixtures.js';
import { init } from '../../tests/initOrm.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const model = Model.getModel(repo, SessionModel);
const players = [1, 2, 3, 4];
const policies = [
  EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED,
  EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND,
  EndingPolicy.ENDING_POLICY_EP_END_AFTER_HAND,
];

function makeSession(endingPolicy: EndingPolicy, syncEnd = false, round = 2) {
  const ruleset = RulesetEntity.createRuleset('ema');
  ruleset.rules.endingPolicy = endingPolicy;
  ruleset.rules.withAbortives = true;
  const event = Object.assign(new EventEntity(), {
    id: 19,
    ruleset,
    syncEnd: syncEnd ? 1 : 0,
    isOnline: 0,
    useTimer: 0,
  });
  const saved = new SessionState(ruleset, players).state;
  saved.round = round;
  saved.honba = 1;
  saved.chips = {};
  saved.chombo = { 1: 0, 2: 0, 3: 0, 4: 0 };
  saved.yakitori = {};
  saved.replacements = {};
  const session = Object.assign(new SessionEntity(), {
    id: 21,
    event,
    status: SessionStatus.SESSION_STATUS_INPROGRESS,
    intermediateResults: saved,
    representationalHash: 'preview-regression',
  });
  return { event, session, saved };
}

afterAll(() => repo.destroy());

describe('Session previews and finalization', () => {
  beforeEach(() => {
    // Persistence is mocked here; transaction behavior has its own database-backed tests.
    vi.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });

  it.each(policies)(
    'rejects unaffordable riichi in previews and new rounds (policy=%s)',
    async (policy) => {
      const { event, session, saved } = makeSession(policy);
      event.ruleset.rules.withTobi = true;
      saved.scores[1] = 900;
      const before = saved.clone();
      vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
      const roundData = {
        draw: { roundIndex: saved.round, honba: saved.honba, riichiBets: [1], tempai: [1, 2] },
      };
      await expect(model.previewRound(session.representationalHash, roundData)).rejects.toThrow(
        'needs at least 1000 points'
      );
      const state = new SessionState(event.ruleset, players, saved);
      await expect(
        model.updateSessionState(
          event,
          session,
          state,
          RoundEntity.fromMessage(session, event, roundData, saved)
        )
      ).rejects.toThrow('needs at least 1000 points');
      expect(state.state).toEqual(before);
      expect(session.intermediateResults).toEqual(before);
    }
  );

  const previewCases = policies.flatMap((policy) =>
    [false, true].flatMap((syncEnd) =>
      [false, true].map((finishing) => ({ policy, syncEnd, finishing }))
    )
  );

  it.each(previewCases)(
    'previews without saving (policy=$policy, syncEnd=$syncEnd, finishing=$finishing)',
    async ({ policy, syncEnd, finishing }) => {
      const { event, session, saved } = makeSession(policy, syncEnd, finishing ? 8 : 2);
      const snapshot = saved.clone();
      const status = session.status;
      const endDate = session.endDate;
      vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
      vi.spyOn(
        Model.getModel(repo, EventRegistrationModel),
        'findByPlayerAndEvent'
      ).mockResolvedValue([]);
      const recalc = vi
        .spyOn(Model.getModel(repo, CronModel), 'scheduleRecalcStats')
        .mockResolvedValue();
      const history = vi
        .spyOn(Model.getModel(repo, PlayerHistoryModel), 'makeNewHistoryItem')
        .mockResolvedValue();
      const persist = vi.spyOn(repo.em, 'persist');
      const flush = vi.spyOn(repo.em, 'flush').mockResolvedValue();
      const roundData = {
        draw: { roundIndex: saved.round, honba: saved.honba, riichiBets: [2], tempai: [1, 2] },
      };

      const first = await model.previewRound(session.representationalHash, roundData);
      const second = await model.previewRound(session.representationalHash, roundData);

      expect(second).toEqual(first);
      expect(first.state?.scores).toEqual([
        { playerId: 1, score: 31500, chomboCount: 0 },
        { playerId: 2, score: 30500, chomboCount: 0 },
        { playerId: 3, score: 28500, chomboCount: 0 },
        { playerId: 4, score: 28500, chomboCount: 0 },
      ]);
      expect(session.intermediateResults).toBe(saved);
      expect(saved).toEqual(snapshot);
      expect(session.status).toBe(status);
      expect(session.endDate).toBe(endDate);
      expect(recalc).not.toHaveBeenCalled();
      expect(history).not.toHaveBeenCalled();
      expect(persist).not.toHaveBeenCalled();
      expect(flush).not.toHaveBeenCalled();

      // Recording the same round must still apply it exactly once after a preview.
      const state = new SessionState(event.ruleset, players, saved);
      await model.updateSessionState(
        event,
        session,
        state,
        RoundEntity.fromMessage(session, event, roundData, saved)
      );
      expect(session.intermediateResults).toBe(state.state);
      expect(state.getScores()).toEqual({
        // Finalizing a club game awards the remaining riichi bet to the leader.
        1: finishing && !syncEnd ? 32500 : 31500,
        2: 30500,
        3: 28500,
        4: 28500,
      });
      if (finishing) {
        expect(state.isFinished()).toBe(true);
        expect(recalc).toHaveBeenCalledTimes(syncEnd ? 0 : 1);
        expect(session.status).toBe(
          syncEnd ? SessionStatus.SESSION_STATUS_PREFINISHED : SessionStatus.SESSION_STATUS_FINISHED
        );
        expect(session.endDate).toEqual(expect.any(String));
        expect(history).toHaveBeenCalledTimes(syncEnd ? 0 : 4);
        expect(flush).not.toHaveBeenCalled();
      } else {
        expect(state.isFinished()).toBe(false);
        expect(session.status).toBe(SessionStatus.SESSION_STATUS_INPROGRESS);
        expect(recalc).not.toHaveBeenCalled();
        expect(history).not.toHaveBeenCalled();
        expect(flush).not.toHaveBeenCalled();
      }
    }
  );

  it('queues statistics after synchronous finalization, and only once', async () => {
    const { event, session, saved } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED, true);
    const state = new SessionState(event.ruleset, players, saved);
    vi.spyOn(
      Model.getModel(repo, EventRegistrationModel),
      'findByPlayerAndEvent'
    ).mockResolvedValue([]);
    const history = vi
      .spyOn(Model.getModel(repo, PlayerHistoryModel), 'makeNewHistoryItem')
      .mockResolvedValue();
    const recalc = vi
      .spyOn(Model.getModel(repo, CronModel), 'scheduleRecalcStats')
      .mockImplementation(async () => {
        expect(session.status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
        expect(history).toHaveBeenCalledTimes(4);
      });

    await model.prefinish(event, session, state);
    expect(recalc).not.toHaveBeenCalled();
    await model.finish(event, session, state);
    await model.finish(event, session, state);
    expect(recalc).toHaveBeenCalledTimes(1);
    expect(recalc).toHaveBeenCalledWith(event.id, players);
  });

  it.each(roundFixtures)(
    'keeps saved state unchanged when previewing %s',
    async (_kind, roundData) => {
      const { session, saved } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED);
      const snapshot = saved.clone();
      const roundSnapshot = structuredClone(roundData);
      vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
      const first = await model.previewRound(session.representationalHash, roundData);
      expect(await model.previewRound(session.representationalHash, roundData)).toEqual(first);
      expect(session.intermediateResults).toBe(saved);
      expect(saved).toEqual(snapshot);
      expect(roundData).toEqual(roundSnapshot);
    }
  );

  it.each(roundFixtures.filter(([kind]) => ['ron', 'tsumo', 'multiron'].includes(kind)))(
    'rejects a %s without yaku when previewing or recording',
    async (_kind, roundData) => {
      const { session, saved } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED);
      const snapshot = saved.clone();
      const invalidRound = structuredClone(roundData);
      if (invalidRound.ron) {
        invalidRound.ron.yaku = [];
      } else if (invalidRound.tsumo) {
        invalidRound.tsumo.yaku = [];
      } else if (invalidRound.multiron) {
        invalidRound.multiron.wins[1].yaku = [];
      }
      vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
      const persist = vi.spyOn(repo.em, 'persist');
      const flush = vi.spyOn(repo.em, 'flush').mockResolvedValue();

      await expect(model.previewRound(session.representationalHash, invalidRound)).rejects.toThrow(
        "Can't record hand without yaku"
      );
      vi.spyOn(Model.getModel(repo, IdempotencyModel), 'execute').mockImplementation(
        async (_scope, _method, _key, _request, action) => action()
      );
      await expect(
        model.addRound(session.representationalHash, invalidRound, session.nextRoundToken)
      ).rejects.toThrow("Can't record hand without yaku");
      expect(session.intermediateResults).toBe(saved);
      expect(saved).toEqual(snapshot);
      expect(persist).not.toHaveBeenCalled();
      expect(flush).not.toHaveBeenCalled();
    }
  );

  it('saves replacements by original player ID when finalizing', async () => {
    const { event, session, saved } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED);
    const state = new SessionState(event.ruleset, players, saved);
    vi.spyOn(
      Model.getModel(repo, EventRegistrationModel),
      'findByPlayerAndEvent'
    ).mockResolvedValue([
      Object.assign(new EventRegisteredPlayersEntity(), {
        id: 901,
        playerId: 1,
        replacementId: 101,
      }),
    ]);
    const history = vi
      .spyOn(Model.getModel(repo, PlayerHistoryModel), 'makeNewHistoryItem')
      .mockResolvedValue();

    await model.finalizeGame(event, session, state);

    expect(session.intermediateResults?.replacements).toEqual({ 1: 101 });
    expect(session.intermediateResults?.playerIds).toEqual(players);
    expect(history).toHaveBeenCalledWith(event.ruleset, 1, event.id, session.id, -30000, 1, 0);
  });

  it('waits for every player history before finalization completes', async () => {
    const { event, session, saved } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED);
    const state = new SessionState(event.ruleset, players, saved);
    state.forceFinish();
    const results = model.getSessionResults(event, session, state);
    const releases: Array<() => void> = [];
    const completed: number[] = [];
    const history = vi
      .spyOn(Model.getModel(repo, PlayerHistoryModel), 'makeNewHistoryItem')
      .mockImplementation(async (_ruleset, playerId) => {
        await new Promise<void>((resolve) => {
          releases.push(resolve);
        });
        completed.push(playerId);
      });
    const persist = vi.spyOn(repo.em, 'persist');
    const flush = vi.spyOn(repo.em, 'flush').mockResolvedValue();
    let finished = false;
    const finalization = model.finalizeGame(event, session, state, true).then(() => {
      finished = true;
    });

    await setImmediate();
    expect(history).toHaveBeenCalledTimes(4);
    for (const result of results) {
      expect(persist).toHaveBeenCalledWith(result);
      expect(history).toHaveBeenCalledWith(
        event.ruleset,
        result.playerId,
        event.id,
        session.id,
        result.ratingDelta,
        result.place,
        result.chips
      );
    }
    expect(finished).toBe(false);
    expect(flush).not.toHaveBeenCalled();
    expect(session.intermediateResults).toBe(saved);

    releases.slice(0, 3).forEach((release) => release());
    await setImmediate();
    expect(flush).not.toHaveBeenCalled();
    expect(finished).toBe(false);

    releases[3]();
    await finalization;
    expect(completed.sort((a, b) => a - b)).toEqual([...players]);
    expect(session.intermediateResults).toBe(state.state);
    expect(flush).not.toHaveBeenCalled();
    expect(finished).toBe(true);
  });

  it('waits for session-end notification queries before force finishing returns', async () => {
    const { session } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED);
    vi.spyOn(repo.meta, 'personId', 'get').mockReturnValue(1);
    vi.spyOn(Model.getModel(repo, PlayerModel), 'isEventAdmin').mockResolvedValue(true);
    vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
    vi.spyOn(model, 'finalizeGame').mockResolvedValue();
    const recalc = vi
      .spyOn(Model.getModel(repo, CronModel), 'scheduleRecalcStats')
      .mockResolvedValue();
    vi.spyOn(
      Model.getModel(repo, AchievementsModel),
      'scheduleRebuildAchievements'
    ).mockResolvedValue();
    vi.spyOn(
      Model.getModel(repo, EventRegistrationModel),
      'getSubstitutionPlayers'
    ).mockResolvedValue({});
    let release!: () => void;
    const notify = vi.spyOn(repo.skirnir, 'messageClubSessionEnd').mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );
    let finished = false;
    const completion = model.forceFinishGame(session.representationalHash).then(() => {
      finished = true;
    });

    await setImmediate();
    expect(notify).toHaveBeenCalledTimes(1);
    expect(finished).toBe(false);
    release();
    await completion;
    expect(finished).toBe(true);
    expect(recalc).toHaveBeenCalledWith(session.event.id, players);
  });
});

describe('Event role cancellation permissions', () => {
  beforeEach(() => {
    vi.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
    vi.spyOn(repo.em, 'persist').mockReturnValue(repo.em);
    vi.spyOn(repo.em, 'remove').mockReturnValue(repo.em);
    vi.spyOn(repo.frey, 'GetSuperadminFlag').mockResolvedValue({ isAdmin: false });
    vi.spyOn(repo.frey, 'GetEventAdmins').mockResolvedValue({ admins: [] });
    vi.spyOn(repo.frey, 'GetEventReferees').mockResolvedValue({ referees: [] });
    vi.spyOn(repo.meta, 'personId', 'get').mockReturnValue(101);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });

  const role = {
    personId: 101,
    ruleId: 901,
    personName: 'New administrator',
    hasAvatar: false,
    lastUpdate: '2026-10-26T00:00:00.000Z',
  };

  it.each(['administrator', 'referee', 'superadmin'])(
    'allows an event %s to cancel games and the last round',
    async (actor) => {
      const { event, session, saved } = makeSession(policies[0]);
      if (actor === 'administrator') {
        vi.mocked(repo.frey.GetEventAdmins).mockImplementation(async ({ eventId }) => ({
          admins: eventId === event.id ? [role] : [],
        }));
      } else if (actor === 'referee') {
        vi.mocked(repo.frey.GetEventReferees).mockImplementation(async ({ eventId }) => ({
          referees: eventId === event.id ? [role] : [],
        }));
      } else {
        vi.mocked(repo.frey.GetSuperadminFlag).mockResolvedValue({ isAdmin: true });
      }
      vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
      const round = Object.assign(new RoundEntity(), {
        id: 999,
        hands: [],
        lastSessionState: { ...saved, round: 1 },
      });
      vi.spyOn(Model.getModel(repo, RoundModel), 'findBySessionIds').mockResolvedValue([round]);

      await expect(
        model.cancelGame({ sessionHash: session.representationalHash })
      ).resolves.toEqual({
        success: true,
      });
      expect(session.status).toBe(SessionStatus.SESSION_STATUS_CANCELLED);
      session.status = SessionStatus.SESSION_STATUS_INPROGRESS;
      await expect(
        model.dropLastRound({ sessionHash: session.representationalHash, intermediateResults: [] })
      ).resolves.toEqual({ success: true });
      expect(session.intermediateResults).toBe(round.lastSessionState);
      expect(repo.em.remove).toHaveBeenCalledWith(round);
      expect(repo.frey.GetSuperadminFlag).toHaveBeenCalledWith({ personId: 101 });
      if (actor === 'administrator') {
        expect(repo.frey.GetEventAdmins).toHaveBeenCalledWith({ eventId: event.id });
        expect(repo.frey.GetEventReferees).not.toHaveBeenCalled();
      }
    }
  );

  it.each([
    'unrelated user',
    'administrator of another event',
    'referee of another event',
    'guest',
  ])('denies cancellation by an %s', async (actor) => {
    const { event, session, saved } = makeSession(policies[0]);
    vi.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
    vi.mocked(repo.frey.GetEventAdmins).mockImplementation(async ({ eventId }) => ({
      admins: actor === 'administrator of another event' && eventId === event.id + 1 ? [role] : [],
    }));
    vi.mocked(repo.frey.GetEventReferees).mockImplementation(async ({ eventId }) => ({
      referees: actor === 'referee of another event' && eventId === event.id + 1 ? [role] : [],
    }));
    if (actor === 'guest') {
      vi.spyOn(repo.meta, 'personId', 'get').mockReturnValue(null);
    }

    await expect(model.cancelGame({ sessionHash: session.representationalHash })).rejects.toThrow(
      "You don't have the necessary permissions to cancel game"
    );
    await expect(
      model.dropLastRound({ sessionHash: session.representationalHash, intermediateResults: [] })
    ).rejects.toThrow("You don't have the necessary permissions to drop last round");
    expect(session.status).toBe(SessionStatus.SESSION_STATUS_INPROGRESS);
    expect(session.intermediateResults).toBe(saved);
    expect(repo.em.persist).not.toHaveBeenCalled();
    expect(repo.em.remove).not.toHaveBeenCalled();
  });
});
