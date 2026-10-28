import { TwirpError, type Middleware } from 'twirpscript';
import { authenticateCaller } from '../helpers/authentication.js';
import { Context } from '../context.js';
import { IncomingMessage } from 'http';
import { Repository } from '../services/Repository.js';
import { MikroORM } from '@mikro-orm/postgresql';

export function injectRepository(orm: MikroORM): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    ctx.repository = Repository.instance(req.headers, orm);
    if (process.env.TEST) {
      ctx.repository.mockCache();
      ctx.repository.mockFrey();
      ctx.repository.mockSkirnir();
    }
    // Authenticate any claimed identity before models can use it, including player-only actions.
    if (
      (ctx.repository.meta.personId || ctx.repository.meta.authToken) &&
      !(await authenticateCaller(ctx.repository))
    ) {
      throw new TwirpError({ code: 'unauthenticated', msg: 'Authentication required' });
    }
    await ctx.repository.cache.connect();
    return next();
  };
}
