import { getPersonalInfoCacheKey } from './schema';
import { IRedisClient } from './RedisClient';
import { Database } from '../../database/db';
import { selectPersonProfile } from '../../database/profiles';
import type { InferResult } from 'kysely';

// Authentication and profiles share this cache and its existing invalidation paths.
const selectCachedPersonalData = (db: Database) =>
  selectPersonProfile(db).select(['person.auth_hash', 'person.is_superadmin', 'person.last_login']);

export type PersonalInfoData = InferResult<ReturnType<typeof selectCachedPersonalData>>;

export const getCachedPersonalData = async (
  db: Database,
  redisClient: IRedisClient,
  id: number
) => {
  const cached = await redisClient.get<PersonalInfoData | null>(getPersonalInfoCacheKey(id), null);
  if (cached !== null) {
    return cached;
  }
  const data = await selectCachedPersonalData(db).where('person.id', '=', id).execute();
  await redisClient.set<PersonalInfoData>(getPersonalInfoCacheKey(id), data);
  return data;
};
