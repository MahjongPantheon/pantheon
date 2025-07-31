import { Middleware } from 'twirpscript';
import { Context } from '../context';
import { IncomingMessage } from 'http';
import { env } from '../helpers/env';

export function metrics(): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    const time = performance.now();
    const result = await next();
    const duration = performance.now() - time;
    await fetch(env.huginUrl + '/addMetric', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([
        {
          m: 'method_exec_duration_' + req.url?.replace('/v2/common.Frey/', ''),
          v: duration,
          s: 'frey',
        },
      ]),
    });
    return result;
  };
}
