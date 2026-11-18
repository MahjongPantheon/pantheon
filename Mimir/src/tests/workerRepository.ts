import type { MikroORM } from '@mikro-orm/core';
import { Repository } from '../services/Repository.js';
import type { IncomingHttpHeaders } from 'node:http';

export async function createWorkerRepository(orm: MikroORM, headers: IncomingHttpHeaders = {}) {
  const repo = Repository.instance(headers, orm);
  // Cron routes bypass injectRepository; use the same test doubles as Twirp requests.
  repo.mockCache();
  repo.mockFrey();
  repo.mockSkirnir();
  await repo.cache.connect();
  return repo;
}
