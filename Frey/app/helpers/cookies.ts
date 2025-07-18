import { IncomingMessage } from 'http';

export function parseCookies(request: IncomingMessage) {
  const list: Record<string, string> = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) return list;

  cookieHeader.split(`;`).forEach(function(cookie) {
    const [ _name, ...rest] = cookie.split(`=`);
    const name = _name?.trim();
    if (!name) return;
    const value = rest.join(`=`).trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}
