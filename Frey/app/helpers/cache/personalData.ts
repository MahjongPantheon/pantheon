import { getPersonalInfoCacheKey } from './schema';
import { IRedisClient } from './RedisClient';
import { Database } from '../../database/db';
import { RowMajsoulPlatformAccount, RowPerson } from '../../database/schema';
import { Nullable } from '../types';

export type PersonalInfoData = Array<
  { id: number } & RowPerson & Nullable<RowMajsoulPlatformAccount>
>;

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
    .leftJoin('majsoul_platform_account', 'majsoul_platform_account.person_id', 'person.id')
    .where('person.id', '=', id)
    .selectAll('person')
    .select([
      'majsoul_platform_account.person_id',
      'majsoul_platform_account.account_id',
      'majsoul_platform_account.friend_id',
      'majsoul_platform_account.nickname',
    ])
    .execute();
  await redisClient.set<PersonalInfoData>(getPersonalInfoCacheKey(id), data);
  return data;
};
