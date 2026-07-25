import { Repository } from "../../services/Repository";
import { EventEntity } from "../../entities/Event.entity";
import { SessionResultsEntity } from "../../entities/SessionResults.entity";

export async function getNeedMoreGold(event: EventEntity, repo: Repository) {
  const results = await repo.em.findAll(SessionResultsEntity, {
    where: { event },
    orderBy: { score: -1 },
    limit: 3,
  });
  return results.map((r) => ({ playerId: r.playerId, score: r.score }));
}
