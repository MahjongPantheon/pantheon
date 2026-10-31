import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

function environmentKeys(directory) {
  const keys = new Set();
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filename = join(directory, entry.name);
    if (entry.isDirectory()) {
      for (const key of environmentKeys(filename)) keys.add(key);
    } else if (/\.[jt]sx?$/.test(entry.name)) {
      for (const match of readFileSync(filename, 'utf8').matchAll(
        /import\.meta\.env\.(VITE_\w+)/g
      )) {
        keys.add(match[1]);
      }
    }
  }
  return keys;
}

// Ordinary development and local production/e2e builds keep Vite's normal env handling.
export function runtimeEnvironment() {
  return {
    name: 'pantheon-runtime-environment',
    apply: 'build',
    config() {
      if (process.env.PANTHEON_IMAGE_BUILD !== '1') return;
      return {
        define: Object.fromEntries(
          [...environmentKeys('app')].map((key) => [
            `import.meta.env.${key}`,
            `globalThis.__PANTHEON_ENV__.${key}`,
          ])
        ),
      };
    },
    transformIndexHtml() {
      if (process.env.PANTHEON_IMAGE_BUILD !== '1') return;
      return [{ tag: 'script', attrs: { src: '/runtime-env.js' }, injectTo: 'head-prepend' }];
    },
  };
}
