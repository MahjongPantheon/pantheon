import { Middleware } from 'twirpscript';
import { Context } from '../context';
import { IncomingMessage } from 'http';
import { Storage } from '../../../Common/storage';
import { StorageStrategyServer } from '../../../Common/storageStrategyServer';
import { parseCookies } from '../helpers/cookies';
import acceptLanguage from 'accept-language';
import { env } from '../helpers/env';
acceptLanguage.languages(['en-US', 'de-DE', 'ru-RU']);

export function fillRequestVars(): Middleware<Context, IncomingMessage> {
  return async (req, ctx, next) => {
    const storage = new Storage();
    const strategy = new StorageStrategyServer();
    strategy.fill(parseCookies(req));
    storage.setStrategy(strategy);

    ctx.locale =
      storage.getLang() ??
      acceptLanguage.get((req.headers['Accept-Language'.toLowerCase()] as string) ?? 'en-US') ??
      'en';

    ctx.authToken =
      req.headers['X-Auth-Token'.toLowerCase()]?.toString() ?? storage.getAuthToken() ?? null;
    ctx.personId =
      (parseInt(req.headers['X-Current-Person-Id'.toLowerCase()]?.toString() ?? '') || null) ??
      storage.getPersonId() ??
      null;
    ctx.currentEventId =
      (parseInt(req.headers['X-Current-Event-Id'.toLowerCase()]?.toString() ?? '') || null) ??
      storage.getEventId() ??
      null;

    ctx.isInternalQuery =
      req.headers['X-Internal-Query-Secret'.toLowerCase()]?.toString() === env.internalQuerySecret;

    return next();
  };
}
