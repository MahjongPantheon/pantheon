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
  PORT: string;
  TZ: string;
};

const development = process.env.NODE_ENV !== 'production';
const data: Partial<EnvVars> =
  dotenv.config({
    path: development ? '.env.development' : '.env.production',
  })?.parsed ?? {};

process.env.TZ = data.TZ ?? 'UTC';

export const env = {
  development,
  port: parseInt(process.env.PORT ?? data.PORT ?? '4001'),
  db: {
    host: process.env.DB_MIMIR_HOST ?? data.DB_MIMIR_HOST ?? 'db.pantheon.internal',
    username: process.env.DB_MIMIR_USER ?? data.DB_MIMIR_USER ?? 'mimir',
    password: process.env.DB_MIMIR_PASSWORD ?? data.DB_MIMIR_PASSWORD ?? 'pgpass',
    dbname: process.env.DB_MIMIR_NAME ?? data.DB_MIMIR_NAME ?? 'mimir2',
    port: parseInt(data.DB_MIMIR_PORT ?? '5432'),
  },
  redis: {
    host: data.DB_MIMIR_REDIS_HOST ?? 'redis.pantheon.internal',
    port: parseInt(data.DB_MIMIR_REDIS_PORT ?? '6379'),
    username: data.DB_MIMIR_REDIS_USER ?? 'redis',
    password: data.DB_MIMIR_REDIS_PASSWORD ?? 'redispass',
  },
  mailer: {
    remoteUrl: data.HERMOD_URL_INTERNAL ?? 'hermod.pantheon.internal',
    remoteActionKey: data.MAIL_ACTION_KEY,
    mailerAddr: 'noreply@' + (data.ALLOWED_SENDER_DOMAINS ?? 'pantheon.local'),
    guiUrl: data.FORSETI_URL,
  },
  cookieDomain: data.COOKIE_DOMAIN,
  gullveigUrl: data.GULLVEIG_URL_INTERNAL,
  freyUrl: process.env.FREY_URL_INTERNAL ?? data.FREY_URL_INTERNAL,
  huginUrl: process.env.HUGIN_URL_INTERNAL ?? data.HUGIN_URL_INTERNAL ?? 'hugin.pantheon.internal',
  forsetiUrl: process.env.FORSETI_URL ?? data.FORSETI_URL,
  userinfoHook: data.USERINFO_HOOK ?? null,
  userinfoHookApiKey: data.USERINFO_HOOK_API_KEY ?? '',
  internalQuerySecret: process.env.INTERNAL_QUERY_SECRET ?? data.INTERNAL_QUERY_SECRET ?? '',
};

console.log('[Mimir] Running with env', env);
