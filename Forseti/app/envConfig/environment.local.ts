// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

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
};
