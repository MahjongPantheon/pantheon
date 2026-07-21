import { Repository } from 'src/services/Repository';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';
import { RoundEntity } from 'src/entities/Round.entity';
import { SessionState } from 'src/helpers/SessionState';
import { EventEntity } from 'src/entities/Event.entity';
import { addLoserPayment } from './helpers/addLoserPayment';

export async function getMinFeedScore(event: EventEntity, repo: Repository) {
  let payments: Map<number, { sum: number; count: number }> = new Map();
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  for (const session of sessions) {
    let lastRound: null | RoundEntity = null;
    for (const round of rounds[session.id]) {
      if (lastRound === null) {
        lastRound = round;
      } else {
        const currentSessionState = new SessionState(
          event.ruleset,
          session.players.sort((p1, p2) => p1.order - p2.order).map((p) => p.id),
          round.lastSessionState
        );

        const lastSessionState = new SessionState(
          event.ruleset,
          session.players.sort((p1, p2) => p1.order - p2.order).map((p) => p.id),
          lastRound.lastSessionState
        );

        payments = addLoserPayment(round, lastSessionState, currentSessionState, payments);
        lastRound = round;
      }
    }

    if (lastRound) {
      const currentSessionState = new SessionState(
        event.ruleset,
        session.players.sort((p1, p2) => p1.order - p2.order).map((p) => p.id),
        lastRound.lastSessionState
      );

      const lastSessionState = new SessionState(
        event.ruleset,
        session.players.sort((p1, p2) => p1.order - p2.order).map((p) => p.id),
        session.intermediateResults
      );

      payments = addLoserPayment(lastRound, lastSessionState, currentSessionState, payments);
    }
  }

  const feedScores: Array<{ playerId: number; score: number }> = [];
  payments.forEach((item, playerId) => {
    feedScores.push({ playerId, score: item.sum / item.count });
  });
  const result = feedScores.sort((s1, s2) => s1.score - s2.score).slice(0, 5);
  return result;
}
