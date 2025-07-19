import { getPersonalInfoCacheKey, PersonalInfoData } from './schema';
import { IRedisClient } from './RedisClient';
import { Database } from '../../database/db';

export const getCachedPersonalData = async (
  db: Database,
  redisClient: IRedisClient,
  id: number
) => {
  const cached = await redisClient.get<PersonalInfoData | null>(getPersonalInfoCacheKey(id), null);
  if (cached !== null) {
    return cached;
  }
  const data = await db
    .selectFrom('person')
    .leftJoin('majsoul_platform_accounts', 'majsoul_platform_accounts.person_id', 'person.id')
    .where('person.id', '=', id)
    .selectAll()
    .execute();
  await redisClient.set<PersonalInfoData>(getPersonalInfoCacheKey(id), data);
  return data;
};
