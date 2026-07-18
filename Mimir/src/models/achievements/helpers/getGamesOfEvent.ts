import { SessionEntity } from 'src/entities/Session.entity';
import { Model } from 'src/models/Model';
import { SessionModel } from 'src/models/SessionModel';
import { Repository } from 'src/services/Repository';
import { SessionStatus } from 'tsclients/proto/atoms.pb';

const gamesCache: Map<number, { lastCalc: Date; games: SessionEntity[] }> = new Map();

function cleanup() {
  const delEvents: number[] = [];
  gamesCache.forEach((stat, eventId) => {
    // 2 minutes cache to avoid repeated fetching during single run
    if (stat.lastCalc.getTime() < new Date().getTime() - 1000 * 60 * 2) {
      delEvents.push(eventId);
    }
  });

  delEvents.forEach((id) => {
    gamesCache.delete(id);
  });
}

export async function getGamesOfEvent(eventId: number, repo: Repository) {
  cleanup();
  if (gamesCache.has(eventId)) {
    return gamesCache.get(eventId)!.games;
  }
  const sessionModel = Model.getModel(repo, SessionModel);
  const games = await sessionModel.findByEventAndStatus(
    [eventId],
    [SessionStatus.SESSION_STATUS_FINISHED]
  );
  gamesCache.set(eventId, { lastCalc: new Date(), games });
  return games;
}
