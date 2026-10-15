import type { EntityManager } from '@mikro-orm/core';
import { randomBytes } from 'node:crypto';
import { SessionStatus, TournamentGamesStatus } from 'tsclients/proto/atoms.pb.js';
import { EventEntity } from '../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../entities/EventRegisteredPlayers.entity.js';
import { PlayerHistoryEntity } from '../entities/PlayerHistory.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { SessionPlayerEntity } from '../entities/SessionPlayer.entity.js';
import { SessionResultsEntity } from '../entities/SessionResults.entity.js';
import { SessionState } from '../helpers/SessionState.js';
import { sampleRound } from './rounds.js';
import type { FreyService } from '../services/Frey.js';

export const scenarios = {
  seed: { title: 'Development club rating', players: 12, series: 12, tournament: false },
  seed_tournament: { title: 'Development tournament', players: 16, series: 4, tournament: true },
  seed_bigevent: { title: 'Development big tournament', players: 128, series: 8, tournament: true },
};
export type Scenario = keyof typeof scenarios;

export function assertDevelopment(development: boolean, test: boolean): void {
  if (!development || test) {
    throw new Error('Development seeding is disabled in production and test environments.');
  }
}

export async function createPlayers(frey: FreyService, count: number): Promise<number[]> {
  const runId = randomBytes(6).toString('hex');
  // Frey's password hashing is expensive; limit concurrent requests to four.
  const groups = Array.from({ length: Math.ceil(count / 4) }, (_, group) => group);
  const ids: number[] = [];
  await groups.reduce(async (previous, group) => {
    await previous;
    const batch = await Promise.all(
      Array.from({ length: Math.min(4, count - group * 4) }, async (_, offset) => {
        const number = group * 4 + offset + 1;
        const { personId } = await frey.CreateAccount({
          email: `seed-${runId}-${number}@example.com`,
          password: '123456',
          title: `Development player ${number}`,
          city: 'Berlin',
          country: 'DE',
          phone: '',
          tenhouId: '',
        });
        if (!Number.isInteger(personId) || personId <= 0) {
          throw new Error('Frey returned an invalid player ID.');
        }
        return personId;
      })
    );
    ids.push(...batch);
  }, Promise.resolve());
  return ids;
}

// Like TestSeeder, create entities directly, but use Frey's actual IDs throughout.
export async function populate(
  em: EntityManager,
  scenario: Scenario,
  playerIds: number[],
  statHost: string
) {
  const settings = scenarios[scenario];
  if (playerIds.length !== settings.players || new Set(playerIds).size !== playerIds.length) {
    throw new Error('The scenario needs a complete set of distinct Frey players.');
  }
  const ruleset = RulesetEntity.createRuleset('ema');
  // TestSeeder's custom rules permit all sample outcomes and use reverse-mangan
  // chombo payments, rather than deducting an additional rating penalty.
  ruleset.baseRuleset = 'custom';
  ruleset.title = 'Development mixed-outcome rules';
  ruleset.rules.withAbortives = true;
  ruleset.rules.withNagashiMangan = true;
  ruleset.rules.extraChomboPayments = true;
  ruleset.rules.chomboAmount = 0;
  ruleset.rules.withKazoe = true;
  const event = em.create(EventEntity, {
    title: settings.title,
    description: 'Generated sample data for local development',
    startTime: new Date(Date.now() - settings.series * 86400000).toISOString(),
    isOnline: 0,
    isTeam: 0,
    syncStart: Number(settings.tournament),
    syncEnd: Number(settings.tournament),
    autoSeating: Number(settings.tournament),
    useTimer: Number(settings.tournament),
    usePenalty: Number(settings.tournament),
    gameDuration: settings.tournament ? 4500 : undefined,
    allowPlayerAppend: Number(!settings.tournament),
    statHost: `${statHost}/event/##ID##/info`,
    ruleset,
    timezone: 'Europe/Berlin',
    seriesLength: settings.tournament ? settings.series : 0,
    gamesStatus: settings.tournament
      ? TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED
      : undefined,
    hideResults: 0,
    hideAchievements: 0,
    isPrescripted: 0,
    minGamesCount: 0,
    finished: Number(settings.tournament),
    isListed: 1,
    allowViewOtherTables: 1,
    allowManualAddReplay: 1,
  });
  playerIds.forEach((playerId, index) => {
    em.create(EventRegisteredPlayersEntity, {
      event,
      playerId,
      localId: index + 1,
      ignoreSeating: 0,
    });
  });
  const history = new Map<number, { games: number; places: number; rating: number }>();
  // Flush each series in sequence; session IDs are needed by player_history.
  await Array.from({ length: settings.series }, (_, series) => series).reduce(
    async (previous, series) => {
      await previous;
      const sessions: { session: SessionEntity; state: SessionState; players: number[] }[] = [];
      const seating = playerIds.map((_, index) => playerIds[(index + series) % playerIds.length]);
      for (let table = 0; table < seating.length / 4; table++) {
        const players = seating.slice(table * 4, table * 4 + 4);
        const start = Date.now() - (settings.series - series) * 86400000 + table * 1000;
        const session = em.create(SessionEntity, {
          event,
          players: [],
          status: SessionStatus.SESSION_STATUS_FINISHED,
          tableIndex: table + 1,
          representationalHash: randomBytes(12).toString('hex'),
          startDate: new Date(start).toISOString(),
          endDate: new Date(start + 3600000).toISOString(),
          extraTime: 0,
        });
        players.forEach((playerId, index) =>
          em.create(SessionPlayerEntity, { session, playerId, order: index + 1 })
        );
        const state = new SessionState(ruleset, players);
        let lastRoundEnd = session.startDate;
        for (let index = 0; index < 7 || !state.isFinished(); index++) {
          const round = RoundEntity.fromMessage(
            session,
            event,
            sampleRound(state, index, series + table),
            state.state.clone()
          );
          round.endDate = new Date(start + (index + 1) * 300000).toISOString();
          lastRoundEnd = round.endDate;
          round.hands.forEach((hand) => {
            hand.round = round;
          });
          state.update(round);
          em.persist(round);
        }
        session.endDate = lastRoundEnd;
        session.intermediateResults = state.state.clone();
        sessions.push({ session, state, players });
      }
      await em.flush();
      sessions.forEach(({ session, state, players }) => {
        const scores = state.getScores();
        const ordered = [...players].sort((a, b) => scores[b] - scores[a] || a - b);
        const uma = ruleset.getUma(Object.values(scores));
        ordered.forEach((playerId, index) => {
          const ratingDelta =
            scores[playerId] - ruleset.rules.startPoints + uma[index] + ruleset.getOka(index + 1);
          em.create(SessionResultsEntity, {
            event,
            session,
            playerId,
            place: index + 1,
            score: scores[playerId],
            ratingDelta,
            chips: 0,
          });
          const stats = history.get(playerId) ?? {
            games: 0,
            places: 0,
            rating: ruleset.rules.startRating,
          };
          stats.games++;
          stats.places += index + 1;
          stats.rating += ratingDelta;
          history.set(playerId, stats);
          em.create(PlayerHistoryEntity, {
            event,
            sessionId: session.id,
            playerId,
            gamesPlayed: stats.games,
            avgPlace: stats.places / stats.games,
            rating: stats.rating,
            chips: 0,
          });
        });
      });
      await em.flush();
    },
    Promise.resolve()
  );
  return event;
}
