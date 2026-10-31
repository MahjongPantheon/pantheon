import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function publicEnvironment(environment) {
  return Object.fromEntries(Object.entries(environment).filter(([key]) => key.startsWith('VITE_')));
}

export function configure(service, root = '/var/www/html', environment = process.env) {
  const client = ['Tyr', 'Forseti'].includes(service)
    ? join(root, `${service}-dist`)
    : join(root, `${service}-dist/dist/client`);
  if (existsSync(join(client, 'index.html'))) {
    writeFileSync(
      join(client, 'runtime-env.js'),
      `globalThis.__PANTHEON_ENV__ = ${JSON.stringify(publicEnvironment(environment)).replaceAll('<', '\\u003c')};\n`
    );
  }
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  configure(process.argv[2]);
}
