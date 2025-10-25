import { IncomingHttpHeaders } from 'http';
import { CacheService } from './Cache';
import { ConfigService } from './Config';
import { DatabaseService } from './Database';
import { FreyService } from './Frey';
import { LogService } from './Log';
import { MetaService } from './Meta';

export class Repository {
  protected constructor(protected _meta: MetaService) {} // request/response, cookies, etc
  // Not a singleton: headers should be new on each request
  public static instance(headers: IncomingHttpHeaders) {
    return new Repository(new MetaService(headers, Repository.config));
  }

  // objects shared between different forks to save a little memory
  protected static _config?: ConfigService; // mimir service configuration
  protected static _db?: DatabaseService;
  protected static _cache?: CacheService;
  protected static _frey?: FreyService;
  protected static _log?: LogService;

  protected static get config(): ConfigService {
    Repository._config ??= new ConfigService();
    return Repository._config;
  }

  protected static get log(): LogService {
    Repository._log ??= new LogService(Repository.config);
    return Repository._log;
  }

  get config(): ConfigService {
    return Repository.config;
  }

  get log(): LogService {
    return Repository.log;
  }

  get db(): DatabaseService {
    Repository._db ??= new DatabaseService(Repository.config, Repository.log);
    return Repository._db;
  }

  get cache(): CacheService {
    Repository._cache ??= new CacheService(Repository.config);
    return Repository._cache;
  }

  get frey(): FreyService {
    Repository._frey ??= new FreyService(Repository.config, this.meta);
    return Repository._frey;
  }

  get meta(): MetaService {
    return this._meta;
  }
}
