/// <reference types="vite-plugin-svgr/client" />

interface Window {
  __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: any;
}

interface CustomMatchers<R = unknown> {
  toBeFoo(): R;
}

declare module 'vitest' {
  interface Assertion<T = any> extends CustomMatchers<T> {}
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}
