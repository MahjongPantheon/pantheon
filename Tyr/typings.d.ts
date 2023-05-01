interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  __cfg: {
    RHEDA_URL: string;
    FORSETI_URL: string;
    MIMIR_URL: string;
    FREY_URL: string;
    TYR_URL: string;
    COOKIE_DOMAIN: string;
    STAT_HOST: string;
    ROOT_HOST: string;
    STAT_SITE_ID: string;
    ADMIN_EMAIL: string;
  };
}

declare module '*.svg?svgr' {
  import React from 'react';

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  // eslint-disable-next-line import/no-default-export
  export default SVG;
}
