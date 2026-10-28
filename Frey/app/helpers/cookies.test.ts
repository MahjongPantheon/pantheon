import type { IncomingMessage } from 'http';
import { parseCookies } from './cookies';

const request = (cookie?: string) => ({ headers: { cookie } }) as IncomingMessage;

it('returns no cookies when the header is absent or empty', () => {
  expect(parseCookies(request())).toEqual({});
  expect(parseCookies(request(''))).toEqual({});
});

it('decodes values, trims whitespace and preserves embedded equals signs', () => {
  expect(
    parseCookies(request(' token = a=b=c ; name = %E6%97%A5 ; empty=; =ignored; flag; token=last'))
  ).toEqual({
    token: 'last',
    name: '日',
  });
});

it('rejects malformed URI encoding', () => {
  expect(() => parseCookies(request('name=%zz'))).toThrow(URIError);
});
