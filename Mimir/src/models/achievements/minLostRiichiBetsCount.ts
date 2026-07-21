import { Repository } from 'src/services/Repository';
import { EventEntity } from 'src/entities/Event.entity';
import { calcRiichiStat } from './helpers/getRiichiStat';

export async function getMinLostRiichiBetsCount(event: EventEntity, repo: Repository) {
  try {
    const riichiStat = [...(await calcRiichiStat(repo, event)).data.values()];
    riichiStat.sort((i1, i2) => i1.lost - i2.lost);
    return riichiStat.slice(0, 5).map((i) => ({
      playerId: i.playerId,
      count: i.lost,
    }));
  } catch {
    return [];
  }
}
