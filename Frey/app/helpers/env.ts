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
  MIMIR_URL_INTERNAL: string;
  HUGIN_URL_INTERNAL: string;
  USERINFO_HOOK: string;
  USERINFO_HOOK_API_KEY: string;
  DB_FREY_HOST: string;
  DB_FREY_NAME: string;
  DB_FREY_USER: string;
  DB_FREY_PASSWORD: string;
  DB_FREY_PORT: string;
  DB_FREY_REDIS_HOST: string;
  DB_FREY_REDIS_PORT: string;
  DB_FREY_REDIS_USER: string;
  DB_FREY_REDIS_PASSWORD: string;
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
  port: parseInt(process.env.PORT ?? data.PORT ?? '4004'),
  db: {
    host: process.env.DB_FREY_HOST ?? data.DB_FREY_HOST ?? 'db.pantheon.internal',
    username: process.env.DB_FREY_USER ?? data.DB_FREY_USER ?? 'frey2',
    password: process.env.DB_FREY_PASSWORD ?? data.DB_FREY_PASSWORD ?? 'pgpass',
    dbname: process.env.DB_FREY_NAME ?? data.DB_FREY_NAME ?? 'frey2',
    port: parseInt(data.DB_FREY_PORT ?? '5432'),
  },
  redis: {
    host: data.DB_FREY_REDIS_HOST ?? 'redis.pantheon.internal',
    port: parseInt(data.DB_FREY_REDIS_PORT ?? '6379'),
    username: data.DB_FREY_REDIS_USER ?? 'redis',
    password: data.DB_FREY_REDIS_PASSWORD ?? 'redispass',
  },
  mailer: {
    remoteUrl: data.HERMOD_URL_INTERNAL,
    remoteActionKey: data.MAIL_ACTION_KEY,
    mailerAddr: 'noreply@' + (data.ALLOWED_SENDER_DOMAINS ?? 'pantheon.local'),
    guiUrl: data.FORSETI_URL,
  },
  cookieDomain: data.COOKIE_DOMAIN,
  gullveigUrl: data.GULLVEIG_URL_INTERNAL,
  mimirUrl: process.env.MIMIR_URL_INTERNAL ?? data.MIMIR_URL_INTERNAL,
  huginUrl: process.env.HUGIN_URL_INTERNAL ?? data.HUGIN_URL_INTERNAL,
  userinfoHook: data.USERINFO_HOOK ?? null,
  userinfoHookApiKey: data.USERINFO_HOOK_API_KEY ?? '',
  internalQuerySecret: process.env.INTERNAL_QUERY_SECRET ?? data.INTERNAL_QUERY_SECRET ?? '',
};

console.log('[Frey] Running with env', env);
