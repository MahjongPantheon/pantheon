import type { MikroORM } from '@mikro-orm/core';
import { Repository } from '../services/Repository.js';

export async function createWorkerRepository(orm: MikroORM) {
  const repo = Repository.instance({}, orm);
  // Cron routes bypass injectRepository; use the same test doubles as Twirp requests.
  repo.mockCache();
  repo.mockFrey();
  repo.mockSkirnir();
  await repo.cache.connect();
  return repo;
}
