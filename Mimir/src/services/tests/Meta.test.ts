import { ConfigService } from '../Config.js';
import { MetaService } from '../Meta.js';

describe('Cookies parser', () => {
  const meta = new MetaService({}, new ConfigService());

  it('should parse proper cookie header', () => {
    const cookie = 'test=123;foo=bar';
    expect(meta.parseCookies(cookie)).toEqual({ test: '123', foo: 'bar' });
  });

  it('should parse proper cookie header omitting empty values', () => {
    const cookie = 'test=123;key=;foo=bar;key2=';
    expect(meta.parseCookies(cookie)).toEqual({ test: '123', foo: 'bar' });
  });

  it('should parse proper cookie header omitting empty keys', () => {
    const cookie = 'test=123;;foo=bar;';
    expect(meta.parseCookies(cookie)).toEqual({ test: '123', foo: 'bar' });
  });

  it('should parse proper cookie header with urlencoded string', () => {
    const cookie = 'test=%7B%22kek%22%3A%20%22lol%22%7D;foo=bar';
    expect(meta.parseCookies(cookie)).toEqual({ test: '{"kek": "lol"}', foo: 'bar' });
  });

  it('should parse malformed cookie header at least somehow', () => {
    const cookie = 'test=123=foo=bar;';
    expect(meta.parseCookies(cookie)).toEqual({ test: '123=foo=bar' });
  });

  it('should parse empty cookie header', () => {
    expect(meta.parseCookies()).toEqual({});
  });
});

describe('Request metadata', () => {
  const config = new ConfigService();

  it('uses explicit request headers before cookie values', () => {
    const meta = new MetaService(
      {
        cookie: 'auth=cookie-token;pid=1;eid=2;lng=ru',
        'x-auth-token': 'header-token',
        'x-current-person-id': '3',
        'x-current-event-id': '4',
        'accept-language': 'de-DE',
      },
      config
    );
    expect(meta.authToken).toBe('header-token');
    expect(meta.personId).toBe(3);
    expect(meta.currentEventId).toBe(4);
    expect(meta.locale).toBe('ru');
  });

  it('falls back to cookies when numeric headers cannot be parsed', () => {
    const meta = new MetaService(
      {
        cookie: 'auth=token;pid=12;eid=19',
        'x-current-person-id': 'invalid',
        'x-current-event-id': '0',
      },
      config
    );
    expect(meta.authToken).toBe('token');
    expect(meta.personId).toBe(12);
    expect(meta.currentEventId).toBe(19);
  });

  it('has anonymous defaults and negotiates the accepted language', () => {
    const meta = new MetaService({}, config);
    expect(meta.authToken).toBeNull();
    expect(meta.personId).toBeNull();
    expect(meta.currentEventId).toBeNull();
    expect(meta.locale).toBe('en-US');
    expect(new MetaService({ 'accept-language': 'de-DE,en-US;q=0.5' }, config).locale).toBe(
      'de-DE'
    );
  });

  it('accepts only the configured internal query secret', () => {
    expect(
      new MetaService({ 'x-internal-query-secret': config.internalQuerySecret }, config)
        .isInternalQuery
    ).toBe(true);
    expect(
      new MetaService({ 'x-internal-query-secret': `${config.internalQuerySecret}-wrong` }, config)
        .isInternalQuery
    ).toBe(false);
    expect(new MetaService({}, config).isInternalQuery).toBe(false);
  });
});

it('does not trust an empty internal secret when the service is unconfigured', () => {
  const config = new ConfigService();
  const secret = vi.spyOn(config, 'internalQuerySecret', 'get').mockReturnValue('');
  try {
    expect(new MetaService({ 'x-internal-query-secret': '' }, config).isInternalQuery).toBe(false);
  } finally {
    secret.mockRestore();
  }
});
