import acceptLanguage from 'accept-language';
import { IncomingHttpHeaders } from 'http';
import { Storage } from '../../../Common/storage.js';
import { StorageStrategyServer } from '../../../Common/storageStrategyServer.js';
import { ConfigService } from './Config.js';

acceptLanguage.languages(['en-US', 'de-DE', 'ru-RU']);

export class MetaService {
  protected _storage: Storage;
  protected _strategy: StorageStrategyServer;

  constructor(
    protected headers: IncomingHttpHeaders,
    protected config: ConfigService
  ) {
    this._storage = new Storage();
    this._strategy = new StorageStrategyServer();
    this._strategy.fill(this.parseCookies(headers.cookie));
    this._storage.setStrategy(this._strategy);
  }

  get locale() {
    return (
      this._storage.getLang() ??
      acceptLanguage.get((this.headers['Accept-Language'.toLowerCase()] as string) ?? 'en-US') ??
      'en'
    );
  }

  get authToken() {
    return (
      this.headers['X-Auth-Token'.toLowerCase()]?.toString() ?? this._storage.getAuthToken() ?? null
    );
  }

  get personId() {
    return (
      (parseInt(this.headers['X-Current-Person-Id'.toLowerCase()]?.toString() ?? '') || null) ??
      this._storage.getPersonId() ??
      null
    );
  }

  get currentEventId() {
    return (
      (parseInt(this.headers['X-Current-Event-Id'.toLowerCase()]?.toString() ?? '') || null) ??
      this._storage.getEventId() ??
      null
    );
  }

  get isInternalQuery() {
    return (
      this.headers['X-Internal-Query-Secret'.toLowerCase()]?.toString() ===
      this.config.internalQuerySecret
    );
  }

  parseCookies(cookieString = '') {
    const list: Record<string, string> = {};
    if (!cookieString) return list;

    cookieString.split(`;`).forEach(function (cookie) {
      const [_name, ...rest] = cookie.split('=');
      const name = _name?.trim();
      if (!name) return;
      const value = rest.join('=').trim();
      if (!value) return;
      list[name] = decodeURIComponent(value);
    });

    return list;
  }
}
