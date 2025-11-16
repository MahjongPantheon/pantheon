import { Middleware } from 'twirpscript';
import { Context } from '../context.js';
import { IncomingMessage } from 'http';
import { Repository } from '../services/Repository.js';
import { MikroORM } from '@mikro-orm/postgresql';

export function injectRepository(orm: MikroORM): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    ctx.repository = Repository.instance(req.headers, orm);
    await ctx.repository.cache.connect();
    return next();
  };
}
