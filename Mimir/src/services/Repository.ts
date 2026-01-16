import { IncomingHttpHeaders } from 'http';
import { CacheService } from './Cache.js';
import { ConfigService } from './Config.js';
import { FreyService } from './Frey.js';
import { LogService } from './Log.js';
import { MetaService } from './Meta.js';
import { MikroORM } from '@mikro-orm/core';
import { SkirnirService } from './Skirnir.js';
import { FreyServiceMock } from './FreyMock.js';

export class Repository {
  protected _db: MikroORM;
  protected constructor(
    protected _meta: MetaService,
    protected _orm: MikroORM
  ) {
    this._db = _orm;
  } // request/response, cookies, etc
  // Not a singleton: headers should be new on each request
  public static instance(headers: IncomingHttpHeaders, orm: MikroORM) {
    return new Repository(new MetaService(headers, Repository.config), orm);
  }

  // objects shared between different forks to save a little memory
  protected static _config?: ConfigService; // mimir service configuration
  protected static _cache?: CacheService;
  protected static _frey?: FreyService;
  protected static _log?: LogService;
  protected static _skirnir?: SkirnirService;

  protected static get config(): ConfigService {
    Repository._config ??= new ConfigService(true);
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

  get db(): MikroORM {
    return this._db;
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

  get skirnir(): SkirnirService {
    Repository._skirnir ??= new SkirnirService(Repository.config.skirnirUrl, this);
    return Repository._skirnir;
  }

  // For testing purposes
  mockFrey() {
    Repository._frey = new FreyServiceMock(Repository.config, this.meta);
  }

  mockCache() {
    Repository._cache ??= new CacheService(Repository.config);
  }
}
