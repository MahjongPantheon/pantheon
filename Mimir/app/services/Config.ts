import dotenv from 'dotenv';

type EnvVars = {
  INTERNAL_QUERY_SECRET: string;
  VERBOSE: string;
  HERMOD_URL_INTERNAL: string;
  MAIL_ACTION_KEY: string;
  ALLOWED_SENDER_DOMAINS: string;
  FORSETI_URL: string;
  COOKIE_DOMAIN: string;
  GULLVEIG_URL_INTERNAL: string;
  FREY_URL_INTERNAL: string;
  HUGIN_URL_INTERNAL: string;
  USERINFO_HOOK: string;
  USERINFO_HOOK_API_KEY: string;
  DB_MIMIR_HOST: string;
  DB_MIMIR_NAME: string;
  DB_MIMIR_USER: string;
  DB_MIMIR_PASSWORD: string;
  DB_MIMIR_PORT: string;
  DB_MIMIR_REDIS_HOST: string;
  DB_MIMIR_REDIS_PORT: string;
  DB_MIMIR_REDIS_USER: string;
  DB_MIMIR_REDIS_PASSWORD: string;
  LOG_FACILITY: string; // 'stdout' (default) or full path to log file
  TZ: string;
  TEST: string;
};

export class ConfigService {
  protected _development: boolean;
  protected _test: boolean;
  protected _envData: Partial<EnvVars>;
  constructor() {
    this._development = process.env.NODE_ENV !== 'production';
    this._envData =
      dotenv.config({
        path: this._development ? '.env.development' : '.env.production',
      })?.parsed ?? {};
    process.env.TZ = this._envData.TZ ?? 'UTC';
    this._test = Boolean(process.env.TEST) || Boolean(this._envData.TEST);
    console.log('[Mimir] Running with env (defaults not listed):', this._envData);
  }

  get development(): boolean {
    return this._development;
  }

  // For unit testing, should not be true in any other cases
  get test(): boolean {
    return this._test;
  }

  get db() {
    return {
      host: this.dbHost,
      username: process.env.DB_MIMIR_USER ?? this._envData.DB_MIMIR_USER ?? 'mimir',
      password: process.env.DB_MIMIR_PASSWORD ?? this._envData.DB_MIMIR_PASSWORD ?? 'pgpass',
      dbname: process.env.DB_MIMIR_NAME ?? this._envData.DB_MIMIR_NAME ?? 'mimir2',
      port: parseInt(this._envData.DB_MIMIR_PORT ?? '5432'),
    };
  }

  get redis() {
    return {
      host: this.redisHost,
      port: parseInt(this._envData.DB_MIMIR_REDIS_PORT ?? '6379'),
      username: this._envData.DB_MIMIR_REDIS_USER ?? 'redis',
      password: this._envData.DB_MIMIR_REDIS_PASSWORD ?? 'redispass',
    };
  }

  get mailer() {
    return {
      remoteUrl: this.hermodHost,
      remoteActionKey: this._envData.MAIL_ACTION_KEY ?? '',
      mailerAddr: 'noreply@' + (this._envData.ALLOWED_SENDER_DOMAINS ?? 'pantheon.local'),
      guiUrl: this.forsetiUrl,
    };
  }

  get cookieDomain() {
    return this._envData.COOKIE_DOMAIN ?? 'pantheon.internal';
  }

  get gullveigUrl() {
    return this._envData.GULLVEIG_URL_INTERNAL ?? 'http://gullveig.pantheon.internal';
  }

  get freyUrl() {
    return (
      process.env.FREY_URL_INTERNAL ??
      this._envData.FREY_URL_INTERNAL ??
      'http://frey.pantheon.internal'
    );
  }

  get huginUrl() {
    return (
      process.env.HUGIN_URL_INTERNAL ??
      this._envData.HUGIN_URL_INTERNAL ??
      'hugin.pantheon.internal'
    );
  }

  get forsetiUrl() {
    return (
      process.env.FORSETI_URL ?? this._envData.FORSETI_URL ?? 'http://forseti.pantheon.internal'
    );
  }

  get hermodHost() {
    return (
      process.env.HERMOD_URL_INTERNAL ??
      this._envData.HERMOD_URL_INTERNAL ??
      'hermod.pantheon.internal'
    );
  }

  get dbHost() {
    return process.env.DB_MIMIR_HOST ?? this._envData.DB_MIMIR_HOST ?? 'db.pantheon.internal';
  }

  get redisHost() {
    return (
      process.env.DB_MIMIR_REDIS_HOST ??
      this._envData.DB_MIMIR_REDIS_HOST ??
      'redis.pantheon.internal'
    );
  }

  get userinfoHook() {
    return this._envData.USERINFO_HOOK ?? null;
  }

  get userinfoHookApiKey() {
    return this._envData.USERINFO_HOOK_API_KEY ?? '';
  }

  get internalQuerySecret() {
    return process.env.INTERNAL_QUERY_SECRET ?? this._envData.INTERNAL_QUERY_SECRET ?? '';
  }

  get logFacility() {
    return process.env.LOG_FACILITY ?? this._envData.LOG_FACILITY ?? 'stdout';
  }
}
