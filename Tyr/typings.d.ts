interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}

declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.VFC<React.SVGProps<SVGSVGElement>>;
  // eslint-disable-next-line import/no-default-export
  export { ReactComponent };
}

interface CustomMatchers<R = unknown> {
  toBeFoo(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
