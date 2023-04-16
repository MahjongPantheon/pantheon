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
  siteId: '767986b1-bac1-4ece-9beb-c61e094ab0ef',
  guiFix: (src: string) => src,
};
