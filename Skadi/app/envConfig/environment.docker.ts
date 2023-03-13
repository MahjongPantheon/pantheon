import { EnvConfig } from '#/envConfig/interface';

export const environment: EnvConfig = {
  production: false,
  apiUrl: 'http://localhost:4001',
  uaUrl: 'http://localhost:4004',
  guiUrl: 'http://localhost:4002',
  guiFix: (src: string) => src,
  cookieDomain: null, // when working on localhost this must be omitted!
  statDomain: 'analytics.local', // for testing
  siteId: '123456', // for testing

  // Do not change this unless you really know what are you doing
  apiVersion: [1, 0],
};
