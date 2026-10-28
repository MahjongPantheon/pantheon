const config = vi.hoisted(() => ({ parsed: undefined as Record<string, string> | undefined }));
vi.mock('dotenv', () => ({ default: { config: vi.fn(() => ({ parsed: config.parsed })) } }));
vi.mock('./avatars', () => ({ getGullveigUrl: () => 'https://avatars.test' }));

beforeEach(() => {
  vi.resetModules();
  for (const key of [
    'PORT',
    'DB_FREY_HOST',
    'DB_FREY_NAME',
    'DB_FREY_USER',
    'DB_FREY_PASSWORD',
    'MIMIR_URL_INTERNAL',
    'HUGIN_URL_INTERNAL',
    'FORSETI_URL',
    'INTERNAL_QUERY_SECRET',
    'E2E_TEST_MODE',
  ])
    vi.stubEnv(key, undefined);
  vi.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

it('uses development defaults when no environment file exists', async () => {
  config.parsed = undefined;
  const { env } = await import('./env');
  expect(env).toMatchObject({
    development: true,
    e2eTestMode: false,
    port: 4004,
    db: {
      host: 'db.pantheon.internal',
      username: 'frey2',
      password: 'pgpass',
      dbname: 'frey2',
      port: 5432,
    },
    redis: {
      host: 'redis.pantheon.internal',
      port: 6379,
      username: 'redis',
      password: 'redispass',
    },
    mailer: { remoteUrl: 'hermod.pantheon.internal', mailerAddr: 'noreply@pantheon.local' },
    userinfoHook: null,
    userinfoHookApiKey: '',
    internalQuerySecret: '',
  });
});

it('loads configured values and production mode', async () => {
  vi.stubEnv('NODE_ENV', 'production');
  config.parsed = {
    PORT: '9000',
    TZ: 'UTC',
    DB_FREY_HOST: 'file-db',
    DB_FREY_NAME: 'file-name',
    DB_FREY_USER: 'file-user',
    DB_FREY_PASSWORD: 'file-password',
    DB_FREY_PORT: '5433',
    DB_FREY_REDIS_HOST: 'file-redis',
    DB_FREY_REDIS_PORT: '6380',
    DB_FREY_REDIS_USER: 'redis-user',
    DB_FREY_REDIS_PASSWORD: 'redis-password',
    HERMOD_URL_INTERNAL: 'https://mail.test',
    MAIL_ACTION_KEY: 'key',
    ALLOWED_SENDER_DOMAINS: 'mail.test',
    FORSETI_URL: 'https://profile.test',
    COOKIE_DOMAIN: 'test',
    MIMIR_URL_INTERNAL: 'https://game.test',
    HUGIN_URL_INTERNAL: 'https://metrics.test',
    USERINFO_HOOK: 'https://hook.test',
    USERINFO_HOOK_API_KEY: 'hook-key',
    INTERNAL_QUERY_SECRET: 'file-secret',
  };
  const { env } = await import('./env');
  expect(env).toMatchObject({
    development: false,
    port: 9000,
    db: {
      host: 'file-db',
      username: 'file-user',
      password: 'file-password',
      dbname: 'file-name',
      port: 5433,
    },
    redis: { host: 'file-redis', port: 6380, username: 'redis-user', password: 'redis-password' },
    mailer: {
      remoteUrl: 'https://mail.test',
      mailerAddr: 'noreply@mail.test',
      guiUrl: 'https://profile.test',
      remoteActionKey: 'key',
    },
    cookieDomain: 'test',
    mimirUrl: 'https://game.test',
    huginUrl: 'https://metrics.test',
    userinfoHook: 'https://hook.test',
    userinfoHookApiKey: 'hook-key',
    internalQuerySecret: 'file-secret',
  });
});

it('gives process overrides precedence over the environment file', async () => {
  config.parsed = { PORT: '9000', DB_FREY_HOST: 'file-db' };
  const overrides = {
    PORT: '9001',
    DB_FREY_HOST: 'process-db',
    DB_FREY_NAME: 'process-name',
    DB_FREY_USER: 'process-user',
    DB_FREY_PASSWORD: 'process-password',
    MIMIR_URL_INTERNAL: 'process-game',
    HUGIN_URL_INTERNAL: 'process-metrics',
    FORSETI_URL: 'process-profile',
    INTERNAL_QUERY_SECRET: 'process-secret',
    E2E_TEST_MODE: '1',
  };
  for (const [key, value] of Object.entries(overrides)) vi.stubEnv(key, value);
  const { env } = await import('./env');
  expect(env).toMatchObject({
    e2eTestMode: true,
    port: 9001,
    db: {
      host: 'process-db',
      dbname: 'process-name',
      username: 'process-user',
      password: 'process-password',
    },
    mimirUrl: 'process-game',
    huginUrl: 'process-metrics',
    forsetiUrl: 'process-profile',
    internalQuerySecret: 'process-secret',
  });
});
