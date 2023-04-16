import { EnvConfig } from '#/envConfig/interface';

export const environment: EnvConfig = {
  production: false,
  apiUrl: 'http://localhost:4001',
  uaUrl: 'http://localhost:4004',
  guiUrl: 'http://localhost:4002',
  rootUrl: 'riichimahjong.org',
  adminEmail: 'me@ctizen.dev',
  guiFix: (src: string) => src,
  cookieDomain: null, // when working on localhost this must be omitted!
  statDomain: '',
  siteId: '123456', // for testing
};
