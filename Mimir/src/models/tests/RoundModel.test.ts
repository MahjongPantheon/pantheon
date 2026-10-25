import { vi } from 'vitest';
import moment from 'moment';
import { Model } from '../Model.js';
import { RoundModel } from '../RoundModel.js';
import { Repository } from '../../services/Repository.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { roundFixtures } from '../../tests/roundFixtures.js';
import { init } from '../../tests/initOrm.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const model = Model.getModel(repo, RoundModel);
const ruleset = RulesetEntity.createRuleset('ema');
const players = [1, 2, 3, 4];
const state = new SessionState(ruleset, players).state;

describe('Round persistence', () => {
  afterAll(() => repo.destroy());
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });

  it.each(roundFixtures)(
    'saves %s with session, event and previous state',
    async (kind, message) => {
      const persist = vi.spyOn(repo.em, 'persist');
      const flush = vi.spyOn(repo.em, 'flush').mockResolvedValue();
      const endDate = moment.utc('2026-01-01T12:00:00Z');
      await model.saveRound(19, 21, players, players, ruleset, message, endDate, state);
      const round = persist.mock.calls
        .flatMap(([entity]) => (Array.isArray(entity) ? entity : [entity]))
        .find((entity) => entity instanceof RoundEntity) as RoundEntity;
      expect(round).toMatchObject({
        session: { id: 21 },
        event: { id: 19 },
        round: 2,
        honba: 1,
        endDate: endDate.toISOString(),
      });
      expect(round.lastSessionState).toBe(state);
      expect(round.hands).toHaveLength(kind === 'multiron' ? 2 : 1);
      expect(round.hands.every((hand) => hand.round === round)).toBe(true);
      expect(round.riichi).toEqual(kind === 'chombo' ? undefined : [2]);
      expect(flush).not.toHaveBeenCalled();
    }
  );

  it('rejects an unregistered player before persisting any data', async () => {
    const persist = vi.spyOn(repo.em, 'persist');
    await expect(
      model.saveRound(19, 21, players, [1, 2, 3], ruleset, roundFixtures[0][1], moment(), state)
    ).rejects.toThrow('not registered');
    expect(persist).not.toHaveBeenCalled();
  });

  it.each(roundFixtures.filter(([kind]) => kind !== 'multiron'))(
    'calculates payments for %s without changing saved scores',
    (kind, message) => {
      const event = Object.assign(new EventEntity(), { ruleset });
      const session = Object.assign(new SessionEntity(), { intermediateResults: state });
      const round = RoundEntity.fromMessage(session, event, message, state);
      const scores = { ...state.scores };
      const payments = model.getRoundPaymentsInfo(event, session, round);
      expect(payments).toEqual(
        expect.objectContaining({
          direct: expect.any(Object),
          riichi: expect.any(Object),
          honba: expect.any(Object),
        })
      );
      if (kind === 'ron')
        expect(payments).toEqual({
          direct: { '2<-3': 1000 },
          riichi: { '2<-2': 1000, '2<-': 0 },
          honba: { '2<-3': 300 },
        });
      if (kind === 'abort') expect(payments.direct).toEqual({});
      expect(state.scores).toEqual(scores);
    }
  );

  it('rejects an unrecognized round outcome', () => {
    const event = Object.assign(new EventEntity(), { ruleset });
    const session = Object.assign(new SessionEntity(), { intermediateResults: state });
    const round = Object.assign(new RoundEntity(), {
      outcome: RoundOutcome.ROUND_OUTCOME_UNSPECIFIED,
    });
    expect(() => model.getRoundPaymentsInfo(event, session, round)).toThrow(
      'Unrecognized round outcome'
    );
  });
});
