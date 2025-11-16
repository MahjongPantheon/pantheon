import { Middleware } from 'twirpscript';
import { Context } from '../context.js';
import { IncomingMessage } from 'http';

export function metrics(): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    const time = performance.now();
    try {
      const result = await next();
      const duration = performance.now() - time;
      await fetch(ctx.repository.config.huginUrl + '/addMetric', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([
          {
            m: 'method_exec_duration_' + req.url?.replace('/v2/common.Mimir/', ''),
            v: duration,
            s: 'frey',
          },
        ]),
      });
      return result;
    } catch (e: any) {
      ctx.repository.log.error(
        'Request errored',
        req.url?.replace('/v2/common.Mimir/', '') ?? 'Unknown',
        e
      );
      throw e;
    }
  };
}
