interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
  ym: (counterId: number, funcName: string, param1: any, param2?: any) => void;
}

declare module '*.svg?svgr' {
  import React from 'react';

  const SVG: React.VFC<React.SVGProps<SVGSVGElement>>;
  // eslint-disable-next-line import/no-default-export
  export default SVG;
}
