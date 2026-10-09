import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import { ConfigService } from '../Config.js';

describe('Service configuration', () => {
  const environment = { ...process.env };
  beforeEach(() => {
    process.env = {};
    jest.spyOn(dotenv, 'config').mockReturnValue({ parsed: {} });
  });
  afterEach(() => {
    process.env = { ...environment };
    jest.restoreAllMocks();
  });

  it('provides development defaults without an environment file', () => {
    const config = new ConfigService();
    expect(config.development).toBe(true);
    expect(config.test).toBe(false);
    expect(process.env.TZ).toBe('UTC');
    expect(config.db).toEqual({
      host: 'db.pantheon.internal',
      username: 'mimir2',
      password: 'pgpass',
      dbname: 'mimir2',
      port: 5432,
    });
    expect(config.redis).toEqual({
      host: 'redis.pantheon.internal',
      username: 'redis',
      password: 'redispass',
      port: 6379,
    });
    expect(config.mailer).toEqual({
      remoteUrl: 'hermod.pantheon.internal',
      remoteActionKey: '',
      mailerAddr: 'noreply@pantheon.local',
      guiUrl: 'http://forseti.pantheon.internal',
    });
    expect(config.cookieDomain).toBe('pantheon.internal');
    expect(config.gullveigUrl).toBe('http://gullveig.pantheon.internal');
    expect(config.freyUrl).toBe('http://frey.pantheon.internal');
    expect(config.huginUrl).toBe('hugin.pantheon.internal');
    expect(config.skirnirUrl).toBe('skirnir.pantheon.internal');
    expect(config.sigrunUrl).toBe('http://sigrun.pantheon.internal');
    expect(config.userinfoHook).toBeNull();
    expect(config.userinfoHookApiKey).toBe('');
    expect(config.internalQuerySecret).toBe('');
    expect(config.logFacility).toBe('stdout');
  });

  it('selects production configuration and prioritizes process overrides', () => {
    process.env.NODE_ENV = 'production';
    process.env.FREY_URL_INTERNAL = 'http://override-frey';
    process.env.INTERNAL_QUERY_SECRET = 'override-secret';
    process.env.DB_MIMIR_NAME = 'override-db';
    jest.mocked(dotenv.config).mockReturnValue({
      parsed: {
        FREY_URL_INTERNAL: 'http://file-frey',
        INTERNAL_QUERY_SECRET: 'file-secret',
        DB_MIMIR_NAME: 'file-db',
        DB_MIMIR_PORT: '5433',
        DB_MIMIR_REDIS_PORT: '6380',
        TEST: 'true',
        TZ: 'Asia/Tokyo',
        COOKIE_DOMAIN: 'example.com',
        USERINFO_HOOK: 'http://hook',
        USERINFO_HOOK_API_KEY: 'hook-key',
        MAIL_ACTION_KEY: 'mail-key',
        ALLOWED_SENDER_DOMAINS: 'example.com',
      },
    });
    const config = new ConfigService();
    expect(dotenv.config).toHaveBeenCalledWith({ path: '.env.production' });
    expect(config.development).toBe(false);
    expect(config.test).toBe(true);
    expect(process.env.TZ).toBe('Asia/Tokyo');
    expect(config.freyUrl).toBe('http://override-frey');
    expect(config.internalQuerySecret).toBe('override-secret');
    expect(config.db.dbname).toBe('override-db');
    expect(config.db.port).toBe(5433);
    expect(config.redis.port).toBe(6380);
    expect(config.cookieDomain).toBe('example.com');
    expect(config.userinfoHook).toBe('http://hook');
    expect(config.userinfoHookApiKey).toBe('hook-key');
    expect(config.mailer.remoteActionKey).toBe('mail-key');
    expect(config.mailer.mailerAddr).toBe('noreply@example.com');
  });
});
