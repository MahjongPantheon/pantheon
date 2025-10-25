import { ConfigService } from './Config';
import { MetaService } from './Meta';

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
