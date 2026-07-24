import { RoundEntity } from '../../../entities/Round.entity';
import { Model } from '../../../models/Model';
import { RoundModel } from '../../../models/RoundModel';
import { Repository } from '../../../services/Repository';

const roundsCache: Map<string, { lastCalc: Date; rounds: Record<number, RoundEntity[]> }> =
  new Map();

function cleanup() {
  const delKeys: string[] = [];
  roundsCache.forEach((stat, key) => {
    // 2 minutes cache to avoid repeated fetching during single run
    if (stat.lastCalc.getTime() < new Date().getTime() - 1000 * 60 * 2) {
      delKeys.push(key);
    }
  });

  delKeys.forEach((id) => {
    roundsCache.delete(id);
  });
}

export async function getRoundsOfSessions(sessionIds: number[], repo: Repository) {
  cleanup();
  const key = JSON.stringify(sessionIds);
  if (roundsCache.has(key)) {
    return roundsCache.get(key)!.rounds;
  }

  const roundModel = Model.getModel(repo, RoundModel);
  const rounds = (await roundModel.findBySessionIds(sessionIds)).reduce(
    (acc, res) => {
      acc[res.session.id] ??= [];
      acc[res.session.id].push(res);
      return acc;
    },
    {} as Record<number, RoundEntity[]>
  );

  roundsCache.set(key, { lastCalc: new Date(), rounds });
  return rounds;
}
