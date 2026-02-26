function proxyAppend(url: string) {
  const forsetiHost = (import.meta.env.VITE_FORSETI_URL ?? '').replace('https://', '');
  const proxyPrefix = window.location.host.replace(forsetiHost, '');
  if (proxyPrefix) {
    return url.replace('https://', 'https://' + proxyPrefix);
  }
  return url;
}

export const env = {
  cookieDomain: (import.meta.env.VITE_COOKIE_DOMAIN as string) || null,
  rootHost: import.meta.env.VITE_ROOT_HOST as string,
  adminEmail: import.meta.env.VITE_ADMIN_EMAIL as string,
  urls: {
    gullveig: proxyAppend(import.meta.env.VITE_GULLVEIG_URL),
    meili: proxyAppend(import.meta.env.VITE_MEILI_URL),
    sigrun: proxyAppend(import.meta.env.VITE_SIGRUN_URL),
    hugin: proxyAppend(import.meta.env.VITE_HUGIN_URL),
    mimir: proxyAppend(import.meta.env.VITE_MIMIR_URL),
    frey: proxyAppend(import.meta.env.VITE_FREY_URL),
    tyr: proxyAppend(import.meta.env.VITE_TYR_URL),
  },
};
