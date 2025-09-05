import { ClientConfiguration, Middleware } from 'twirpscript';
import { Context } from '../context';
import { IncomingMessage } from 'http';
import { env } from '../helpers/env';

export function clients(freyConf: ClientConfiguration): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    const headers = new Headers();
    headers.append('X-Auth-Token', ctx.authToken ?? '');
    headers.append('X-Current-Person-Id', ctx.personId?.toString() ?? '');

    freyConf.rpcTransport = (url, opts) => {
      Object.keys(opts.headers ?? {}).forEach((key) => headers.set(key, opts.headers[key]));
      headers.set('X-Current-Event-Id', ctx.currentEventId?.toString() ?? '');
      return fetch(url, {
        ...opts,
        headers,
      }).then((resp) => {
        if (!resp.ok) {
          return resp.json().then((err) => {
            // Twirp server error handling
            if (err.code && err.code === 'internal' && err.meta && err.meta.cause) {
              fetch(env.huginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  source: 'Mimir [twirp]',
                  error: `To: ${url} | Details: ${err.meta.cause}`,
                }),
              });
              throw new Error(err.meta.cause);
            }
            return resp;
          });
        }
        return resp;
      });
    };

    ctx.freyConfig = freyConf;
    return next();
  };
}
