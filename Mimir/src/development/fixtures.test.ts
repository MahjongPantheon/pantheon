import { RoundOutcome, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { vi } from 'vitest';
import { init } from '../tests/initOrm.js';
import { EventRegisteredPlayersEntity } from '../entities/EventRegisteredPlayers.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { SessionResultsEntity } from '../entities/SessionResults.entity.js';
import { PlayerHistoryEntity } from '../entities/PlayerHistory.entity.js';
import { assertDevelopment, createPlayers, populate, scenarios } from './fixtures.js';
import { SessionState } from '../helpers/SessionState.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { PointsCalc } from '../helpers/PointsCalc.js';
import { sampleHands, limitHands, yakumanHands } from './rounds.js';
import type { FreyService } from '../services/Frey.js';

describe('development seed fixtures', () => {
  it('rejects production and test databases', () => {
    expect(() => assertDevelopment(false, false)).toThrow('disabled');
    expect(() => assertDevelopment(true, true)).toThrow('disabled');
    expect(() => assertDevelopment(true, false)).not.toThrow();
  });

  it('uses returned Frey IDs in order across request batches', async () => {
    const CreateAccount = vi.fn(async ({ title }: { title: string }) => ({
      personId: 1000 + Number(title.split(' ').at(-1)) * 7,
    }));
    const ids = await createPlayers({ CreateAccount } as unknown as FreyService, 9);
    expect(ids).toEqual([1007, 1014, 1021, 1028, 1035, 1042, 1049, 1056, 1063]);
    expect(CreateAccount).toHaveBeenCalledTimes(9);
    const emails = CreateAccount.mock.calls.map(
      ([payload]) => (payload as { title: string; email: string }).email
    );
    expect(new Set(emails).size).toBe(9);
  });

  it('stops when Frey cannot create a player', async () => {
    const CreateAccount = vi
      .fn<FreyService['CreateAccount']>()
      .mockRejectedValue(new Error('Frey unavailable'));
    await expect(createPlayers({ CreateAccount } as unknown as FreyService, 8)).rejects.toThrow(
      'Frey unavailable'
    );
    expect(CreateAccount).toHaveBeenCalledTimes(4);
  });

  it('rejects invalid IDs before populating Mimir', async () => {
    const CreateAccount = vi.fn<FreyService['CreateAccount']>().mockResolvedValue({ personId: 0 });
    await expect(createPlayers({ CreateAccount } as unknown as FreyService, 1)).rejects.toThrow(
      'invalid player ID'
    );
  });

  it.each(['seed', 'seed_tournament', 'seed_bigevent'] as const)(
    'persists varied sessions and histories for %s',
    async (scenario) => {
      const settings = scenarios[scenario];
      const orm = await init();
      try {
        await orm.schema.createSchema();
        const em = orm.em.fork();
        const ids = Array.from({ length: settings.players }, (_, index) => 5000 + index * 11);
        const event = await populate(em, scenario, ids, 'http://sigrun.pantheon.local');
        em.clear();
        const registrations = await em.find(EventRegisteredPlayersEntity, { event: event.id });
        expect(registrations.map((r) => r.playerId).sort((a, b) => a - b)).toEqual(ids);
        const sessions = await em.find(
          SessionEntity,
          { event: event.id },
          { populate: ['players'] }
        );
        expect(sessions).toHaveLength((settings.series * settings.players) / 4);
        sessions.forEach((session) => {
          expect(session.players).toHaveLength(4);
          expect(session.status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
          expect(session.intermediateResults?.playerIds.every((id) => ids.includes(id))).toBe(true);
          expect(
            Object.values(session.intermediateResults!.scores).reduce((a, b) => a + b, 0)
          ).toBe(120000);
        });
        const rounds = await em.find(RoundEntity, { event: event.id }, { populate: ['hands'] });
        expect(rounds).toHaveLength(sessions.length * 10);
        rounds.forEach((round) => {
          // MikroORM loads this array-typed relation as a Collection.
          round.hands = Array.from(round.hands);
          round.hands.forEach((hand) => {
            if (hand.winnerId) expect(ids).toContain(hand.winnerId);
            if (hand.loserId) expect(ids).toContain(hand.loserId);
            (hand.tempai ?? []).forEach((id) => expect(ids).toContain(id));
            (hand.nagashi ?? []).forEach((id) => expect(ids).toContain(id));
          });
          expect(round.lastSessionState?.playerIds.every((id) => ids.includes(id))).toBe(true);
        });
        const winningHands = rounds.flatMap((round) => round.hands).filter((hand) => hand.han);
        expect(
          new Set(winningHands.filter((hand) => hand.han! > 4).map((hand) => hand.han))
        ).toEqual(new Set([5, 6, 8, 11, 13]));
        expect(winningHands.some((hand) => hand.han === -1)).toBe(true);
        expect(winningHands.every((hand) => hand.han! <= 13 && hand.han! >= -1)).toBe(true);
        expect(
          winningHands
            .filter((hand) => hand.han! > 4 || hand.han === -1)
            .every((hand) => hand.fu === 0)
        ).toBe(true);
        sessions.forEach((session) => {
          const sessionRounds = rounds
            .filter((round) => round.session.id === session.id)
            .sort((a, b) => a.id - b.id);
          expect(new Set(sessionRounds.map((round) => round.outcome))).toEqual(
            new Set([
              RoundOutcome.ROUND_OUTCOME_RON,
              RoundOutcome.ROUND_OUTCOME_TSUMO,
              RoundOutcome.ROUND_OUTCOME_DRAW,
              RoundOutcome.ROUND_OUTCOME_ABORT,
              RoundOutcome.ROUND_OUTCOME_CHOMBO,
              RoundOutcome.ROUND_OUTCOME_NAGASHI,
              RoundOutcome.ROUND_OUTCOME_MULTIRON,
            ])
          );
          const state = new SessionState(event.ruleset, session.intermediateResults!.playerIds);
          sessionRounds.forEach((round) => {
            expect(round.round).toBe(state.getRound());
            expect(round.honba).toBe(state.getHonba());
            expect(round.lastSessionState!.scores).toEqual(state.getScores());
            state.update(round);
            expect(
              Object.values(state.getScores()).reduce((a, b) => a + b, 0) +
                state.getRiichiBets() * 1000
            ).toBe(120000);
          });
          expect(state.isFinished()).toBe(true);
          expect(state.getScores()).toEqual(session.intermediateResults!.scores);
          expect(state.getRiichiBets()).toBe(0);
        });
        // Independent payment expectations for variation zero: mangan ron, 2-han
        // tsumo, noten/riichi, abort, dealer chombo, nagashi, and double ron.
        const firstSession = sessions.find(
          (session) => session.id === Math.min(...sessions.map((item) => item.id))
        )!;
        const firstRounds = rounds
          .filter((round) => round.session.id === firstSession.id)
          .sort((a, b) => a.id - b.id);
        const firstPlayers = firstSession.intermediateResults!.playerIds;
        const expected = [
          [30000, 30000, 30000, 30000],
          [22000, 38000, 30000, 30000],
          [21500, 37000, 32000, 29500],
          [20500, 36000, 31000, 31500],
          [20500, 36000, 31000, 31500],
          [24500, 40000, 35000, 19500],
          [32500, 38000, 33000, 15500],
          [21700, 47900, 34900, 15500],
        ];
        expected.forEach((scores, index) =>
          expect(firstPlayers.map((id) => firstRounds[index].lastSessionState!.scores[id])).toEqual(
            scores
          )
        );
        const results = await em.find(SessionResultsEntity, { event: event.id });
        expect(results).toHaveLength(sessions.length * 4);
        expect(new Set(results.map((r) => r.score)).size).toBeGreaterThan(1);
        const history = await em.find(PlayerHistoryEntity, { event: event.id });
        ids.forEach((id) => {
          const entries = history
            .filter((h) => h.playerId === id)
            .sort((a, b) => a.gamesPlayed - b.gamesPlayed);
          expect(entries.map((h) => h.gamesPlayed)).toEqual(
            Array.from({ length: settings.series }, (_, index) => index + 1)
          );
          expect(entries.at(-1)!.rating).toBe(
            results.filter((r) => r.playerId === id).reduce((total, r) => total + r.ratingDelta, 0)
          );
        });
      } finally {
        await orm.close(true);
      }
    },
    30000
  );

  it('calculates sample han and fu for open, closed, pinfu and seven-pairs hands', () => {
    expect(sampleHands.map(({ sourceId, han, fu }) => [sourceId, han, fu])).toEqual([
      [7604, 4, 40],
      [57028, 1, 30],
      [57029, 4, 40],
      [154623, 3, 25],
      [174736, 2, 30],
      [59976, 2, 30],
      [187226, 3, 25],
      [187230, 4, 25],
    ]);
  });

  it('scores limit hands and single yakuman independently of fu', () => {
    const ruleset = RulesetEntity.createRuleset('ema');
    ruleset.rules.withKazoe = true;
    const hands = [...limitHands, ...yakumanHands];
    expect(hands.map((hand) => hand.han)).toEqual([5, 6, 8, 11, 13, -1, -1]);
    const payments = [8000, 12000, 16000, 24000, 32000, 32000, 32000];
    hands.forEach((hand, index) => {
      [0, 25, 110].forEach((fu) => {
        const scores = new PointsCalc().ron(
          ruleset.rules,
          false,
          { 1: 30000, 2: 30000, 3: 30000, 4: 30000 },
          1,
          2,
          hand.han,
          fu,
          [],
          0,
          0
        );
        expect(scores).toEqual({
          1: 30000 + payments[index],
          2: 30000 - payments[index],
          3: 30000,
          4: 30000,
        });
      });
    });
  });

  it('defines complete four-player tables for all scenarios', () => {
    Object.values(scenarios).forEach(({ players }) => expect(players % 4).toBe(0));
    expect(scenarios.seed_bigevent.players).toBeGreaterThan(scenarios.seed_tournament.players);
  });
});
