function proxyAppend(url: string) {
  const tyrHost = (import.meta.env.VITE_TYR_URL ?? '').replace('https://', '');
  const proxyPrefix = window.location.host.replace(tyrHost, '');
  if (proxyPrefix) {
    return url.replace('https://', 'https://' + proxyPrefix);
  }
  return url;
}

export const env = {
  cookieDomain: (import.meta.env.VITE_COOKIE_DOMAIN as string) || null,
  urls: {
    gullveig: proxyAppend(import.meta.env.VITE_GULLVEIG_URL),
    forseti: proxyAppend(import.meta.env.VITE_FORSETI_URL),
    hugin: proxyAppend(import.meta.env.VITE_HUGIN_URL),
    mimir: proxyAppend(import.meta.env.VITE_MIMIR_URL),
    frey: proxyAppend(import.meta.env.VITE_FREY_URL),
  },
};
