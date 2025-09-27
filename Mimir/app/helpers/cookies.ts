export function parseCookies(cookieString = '') {
  const list: Record<string, string> = {};
  if (!cookieString) return list;

  cookieString.split(`;`).forEach(function (cookie) {
    const [_name, ...rest] = cookie.split('=');
    const name = _name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    if (!value) return;
    list[name] = decodeURIComponent(value);
  });

  return list;
}
