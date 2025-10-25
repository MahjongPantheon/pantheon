import { Middleware } from 'twirpscript';
import { Context } from '../context';
import { IncomingMessage } from 'http';
import { Repository } from 'services/Repository';

export function injectRepository(): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    ctx.repository = Repository.instance(req.headers);
    await ctx.repository.cache.connect();
    return next();
  };
}
