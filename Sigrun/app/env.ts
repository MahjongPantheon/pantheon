function proxyAppend(url: string) {
  if (typeof window !== 'undefined' && window.location.host.startsWith('proxy.')) {
    return url.replace('https://', 'https://proxy.');
  }
  return url;
}

export const env = {
  cookieDomain: (import.meta.env.VITE_COOKIE_DOMAIN as string) || null,
  urls: {
    gullveig: proxyAppend(import.meta.env.VITE_GULLVEIG_URL),
    forseti: proxyAppend(import.meta.env.VITE_FORSETI_URL),
    tyr: proxyAppend(import.meta.env.VITE_TYR_URL),
    sigrun: proxyAppend(import.meta.env.VITE_SIGRUN_URL),
    bragi: proxyAppend(import.meta.env.VITE_BRAGI_URL),
    hugin: proxyAppend(import.meta.env.VITE_HUGIN_URL),
    mimir: proxyAppend(import.meta.env.VITE_MIMIR_URL),
    frey: proxyAppend(import.meta.env.VITE_FREY_URL),
  },
};
