import { EnvConfig } from '#/envConfig/interface';

export const environment: EnvConfig = {
  production: true,
  apiUrl: 'https://gameapi.riichimahjong.org',
  uaUrl: 'https://userapi.riichimahjong.org',
  guiUrl: 'https://rating.riichimahjong.org',
  rootUrl: 'riichimahjong.org',
  adminEmail: 'me@ctizen.dev',
  cookieDomain: '.riichimahjong.org',
  statDomain: 'pl.riichimahjong.org',
  siteId: 'f5c85252-2f96-470a-8d24-c42a85f8a6aa',
  guiFix: (src: string) => src,
};
