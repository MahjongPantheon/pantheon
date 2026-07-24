import { Repository } from '../../services/Repository';
import { EventEntity } from '../../entities/Event.entity';
import { getRoundsOfSessions } from './helpers/getRoundsOfSessions';
import { getGamesOfEvent } from './helpers/getGamesOfEvent';
import { RoundOutcome } from 'tsclients/proto/atoms.pb';

export async function getBestDealer(event: EventEntity, repo: Repository) {
  const sessions = await getGamesOfEvent(event.id, repo);
  const rounds = await getRoundsOfSessions(
    sessions.map((s) => s.id),
    repo
  );

  const bestDealerWonMapCount = new Map();

  for (const session of sessions) {
    const dealerWonMapCount = new Map();
    const sessionPlayersOrdered = session.players.sort((p1, p2) => p1.order - p2.order);

    for (const round of rounds[session.id]) {
      const currentDealerId = sessionPlayersOrdered[(round.round - 1) % 4].playerId;

      const dealerWon =
        (round.outcome === RoundOutcome.ROUND_OUTCOME_RON ||
          round.outcome === RoundOutcome.ROUND_OUTCOME_TSUMO ||
          round.outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON) &&
        round.hands.map((h) => h.winnerId).includes(currentDealerId);

      if (dealerWon) {
        dealerWonMapCount.set(currentDealerId, (dealerWonMapCount.get(currentDealerId) ?? 0) + 1);
      }
    }

    for (const [playerId, count] of dealerWonMapCount.entries()) {
      if (!bestDealerWonMapCount.has(playerId) || count > bestDealerWonMapCount.get(playerId)!) {
        bestDealerWonMapCount.set(playerId, count);
      }
    }
  }

  const bestDealerWonMapCountSorted = [...bestDealerWonMapCount.entries()].sort(
    (a, b) => b[1] - a[1]
  );
  const bestDealerWonCount = bestDealerWonMapCountSorted[0][1];
  const playerIds = [];
  for (const [playerId, count] of bestDealerWonMapCountSorted) {
    if (count === bestDealerWonCount) {
      playerIds.push(playerId);
    } else {
      break;
    }
  }

  return { bestWinCount: bestDealerWonCount, playerIds };
}
