import { jest } from '@jest/globals';
import { setImmediate } from 'node:timers/promises';
import { EndingPolicy, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { Model } from '../Model.js';
import { SessionModel } from '../SessionModel.js';
import { CronModel } from '../CronModel.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
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

describe('Session previews and finalization', () => {
  beforeEach(() => {
    // Persistence is mocked here; transaction behavior has its own database-backed tests.
    jest.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
  });
  afterAll(() => repo.destroy());
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });

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
      jest.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
      jest
        .spyOn(Model.getModel(repo, EventRegistrationModel), 'findByPlayerAndEvent')
        .mockResolvedValue([]);
      const recalc = jest
        .spyOn(Model.getModel(repo, CronModel), 'scheduleRecalcStats')
        .mockResolvedValue();
      const history = jest
        .spyOn(Model.getModel(repo, PlayerHistoryModel), 'makeNewHistoryItem')
        .mockResolvedValue();
      const persist = jest.spyOn(repo.em, 'persist');
      const flush = jest.spyOn(repo.em, 'flush').mockResolvedValue();
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
        expect(recalc).toHaveBeenCalledTimes(1);
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

  it.each(roundFixtures)(
    'keeps saved state unchanged when previewing %s',
    async (_kind, roundData) => {
      const { session, saved } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED);
      const snapshot = saved.clone();
      const roundSnapshot = structuredClone(roundData);
      jest.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
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
      jest.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
      const persist = jest.spyOn(repo.em, 'persist');
      const flush = jest.spyOn(repo.em, 'flush').mockResolvedValue();

      await expect(model.previewRound(session.representationalHash, invalidRound)).rejects.toThrow(
        "Can't record hand without yaku"
      );
      await expect(model.addRound(session.representationalHash, invalidRound)).rejects.toThrow(
        "Can't record hand without yaku"
      );
      expect(session.intermediateResults).toBe(saved);
      expect(saved).toEqual(snapshot);
      expect(persist).not.toHaveBeenCalled();
      expect(flush).not.toHaveBeenCalled();
    }
  );

  it('saves replacements by original player ID when finalizing', async () => {
    const { event, session, saved } = makeSession(EndingPolicy.ENDING_POLICY_EP_UNSPECIFIED);
    const state = new SessionState(event.ruleset, players, saved);
    jest
      .spyOn(Model.getModel(repo, EventRegistrationModel), 'findByPlayerAndEvent')
      .mockResolvedValue([
        Object.assign(new EventRegisteredPlayersEntity(), {
          id: 901,
          playerId: 1,
          replacementId: 101,
        }),
      ]);
    const history = jest
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
    const history = jest
      .spyOn(Model.getModel(repo, PlayerHistoryModel), 'makeNewHistoryItem')
      .mockImplementation(async (_ruleset, playerId) => {
        await new Promise<void>((resolve) => {
          releases.push(resolve);
        });
        completed.push(playerId);
      });
    const persist = jest.spyOn(repo.em, 'persist');
    const flush = jest.spyOn(repo.em, 'flush').mockResolvedValue();
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
    jest.spyOn(repo.meta, 'personId', 'get').mockReturnValue(1);
    jest.spyOn(Model.getModel(repo, PlayerModel), 'isEventAdmin').mockResolvedValue(true);
    jest.spyOn(model, 'findByRepresentationalHash').mockResolvedValue([session]);
    jest.spyOn(model, 'finish').mockResolvedValue();
    jest
      .spyOn(Model.getModel(repo, AchievementsModel), 'scheduleRebuildAchievements')
      .mockResolvedValue();
    jest
      .spyOn(Model.getModel(repo, EventRegistrationModel), 'getSubstitutionPlayers')
      .mockResolvedValue({});
    let release!: () => void;
    const notify = jest.spyOn(repo.skirnir, 'messageClubSessionEnd').mockImplementation(
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
  });
});
