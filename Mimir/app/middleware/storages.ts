import { Middleware } from 'twirpscript';
import { Context } from '../context';
import { IncomingMessage } from 'http';
import { Database } from '../database/db';
import { IRedisClient } from '../helpers/cache/RedisClient';

export function storages(db: Database, redis: IRedisClient): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    ctx.db = db;
    ctx.redisClient = redis;
    return next();
  };
}
