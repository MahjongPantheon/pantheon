import { Repository } from 'src/services/Repository';
import { EventEntity } from 'src/entities/Event.entity';
import { calcRiichiStat } from './helpers/getRiichiStat';

export async function getMaxStolenRiichiBetsCount(event: EventEntity, repo: Repository) {
  try {
    const riichiStat = [
      ...(await calcRiichiStat(repo, event)).data.values().filter((i) => i.stole > 0),
    ];
    riichiStat.sort((i1, i2) => i2.stole - i1.stole);
    return riichiStat.slice(0, 5).map((i) => ({
      playerId: i.playerId,
      count: i.stole,
    }));
  } catch {
    return [];
  }
}
