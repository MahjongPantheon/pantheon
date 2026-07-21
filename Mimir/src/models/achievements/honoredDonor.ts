import { Repository } from 'src/services/Repository';
import { calcRiichiStat } from './helpers/getRiichiStat';
import { EventEntity } from 'src/entities/Event.entity';

export async function getHonoredDonor(event: EventEntity, repo: Repository) {
  try {
    const riichiStat = await calcRiichiStat(repo, event);
    const sortedDesc = [...riichiStat.data.values()].sort((s1, s2) => s2.lost - s1.lost);
    return sortedDesc.slice(0, 5).map((s) => ({ playerId: s.playerId, count: s.lost }));
  } catch {
    return [];
  }
}
