import assert from 'node:assert/strict';
import { execFile, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { test } from 'node:test';

const runFile = promisify(execFile);
const execute = (file, args, options = {}) => runFile(file, args, { timeout: 10000, ...options });
const helper = fileURLToPath(new URL('refresh-development-client.mjs', import.meta.url));
const installer = readFileSync(new URL('install-development.sh', import.meta.url), 'utf8');
const hasPnpm = spawnSync('pnpm', ['--version']).status === 0;

for (const layout of ['virtual-store', 'source-link', 'hoisted']) {
  test(`tsclients refresh only invalidates its installed copy (${layout})`, () => {
    const root = mkdtempSync(join(tmpdir(), 'pantheon-client-refresh-'));
    try {
      const modules = join(root, 'node_modules');
      const source = join(root, 'Common/tsclients');
      const registry = join(modules, 'registry-package');
      const target =
        layout === 'virtual-store'
          ? join(modules, '.pnpm/tsclients@file+client/node_modules/tsclients')
          : layout === 'source-link'
            ? source
            : join(modules, 'tsclients');
      for (const directory of [modules, source, registry, target])
        mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(root, 'package.json'),
        JSON.stringify({ dependencies: { tsclients: 'file:./Common/tsclients' } })
      );
      writeFileSync(join(source, 'source.js'), 'keep source');
      writeFileSync(join(registry, 'index.js'), 'keep registry');
      if (layout !== 'hoisted') symlinkSync(target, join(modules, 'tsclients'));
      const result = spawnSync(process.execPath, [helper, root], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(readFileSync(join(source, 'source.js'), 'utf8'), 'keep source');
      assert.equal(readFileSync(join(registry, 'index.js'), 'utf8'), 'keep registry');
      assert.throws(() => statSync(join(modules, 'tsclients')), { code: 'ENOENT' });
      if (layout === 'virtual-store') assert.throws(() => statSync(target), { code: 'ENOENT' });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
}

test(
  'warm startup refreshes tsclients while using cached registry contents and metadata',
  { skip: !hasPnpm, timeout: 30000 },
  async () => {
    const root = mkdtempSync(join(tmpdir(), 'pantheon-dev-cache-'));
    const server = createServer();
    try {
      const app = join(root, 'Test');
      const client = join(root, 'client');
      const bin = join(root, 'bin');
      const runtime = join(root, 'Common/ContainerRuntime');
      const packed = join(root, 'packed/package');
      for (const directory of [app, client, bin, runtime, packed])
        mkdirSync(directory, { recursive: true });
      writeFileSync(
        join(packed, 'package.json'),
        JSON.stringify({ name: 'cache-fixture', version: '1.0.0' })
      );
      writeFileSync(join(packed, 'index.js'), 'cached registry package');
      await execute('tar', [
        '-czf',
        join(root, 'package.tgz'),
        '-C',
        join(root, 'packed'),
        'package',
      ]);
      const tarball = readFileSync(join(root, 'package.tgz'));
      let downloads = 0;
      server.on('request', (request, response) => {
        if (request.url === '/package.tgz') {
          downloads++;
          response.end(tarball);
        } else {
          response.setHeader('Content-Type', 'application/json');
          response.end(
            JSON.stringify({
              name: 'cache-fixture',
              'dist-tags': { latest: '1.0.0' },
              time: { '1.0.0': '2000-01-01T00:00:00.000Z' },
              versions: {
                '1.0.0': {
                  name: 'cache-fixture',
                  version: '1.0.0',
                  dist: {
                    tarball: `http://127.0.0.1:${server.address().port}/package.tgz`,
                    integrity: `sha512-${createHash('sha512').update(tarball).digest('base64')}`,
                  },
                },
              },
            })
          );
        }
      });
      await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
      });
      writeFileSync(
        join(app, 'pnpm-workspace.yaml'),
        `registry: http://127.0.0.1:${server.address().port}/\nfetchRetries: 0\nfetchTimeout: 1000\nminimumReleaseAge: 0\n`
      );
      writeFileSync(
        join(client, 'package.json'),
        JSON.stringify({ name: 'tsclients', version: '1.0.0' })
      );
      writeFileSync(join(client, 'index.js'), 'first client');
      writeFileSync(join(client, 'obsolete.js'), 'old generated file');
      writeFileSync(
        join(app, 'package.json'),
        JSON.stringify({
          name: 'app',
          version: '1.0.0',
          dependencies: { tsclients: 'file:../client', 'cache-fixture': '1.0.0' },
        })
      );
      writeFileSync(join(runtime, 'refresh-development-client.mjs'), readFileSync(helper));
      writeFileSync(join(root, 'install.sh'), installer.replaceAll('/var/www/html', root));
      writeFileSync(join(bin, 'su-exec'), '#!/bin/sh\nshift\nexec "$@"\n', { mode: 0o755 });
      writeFileSync(join(bin, 'chown'), '#!/bin/sh\nexit 0\n', { mode: 0o755 });
      const store = join(root, 'store');
      const env = {
        ...process.env,
        PATH: `${bin}:${process.env.PATH}`,
        CI: 'true',
        XDG_CACHE_HOME: join(store, 'cache'),
        npm_config_store_dir: store,
        npm_config_registry: `http://127.0.0.1:${server.address().port}/`,
        npm_config_fetch_retries: '0',
        npm_config_fetch_timeout: '1000',
      };
      await execute('pnpm', ['install', '--lockfile-only', '--store-dir', store], {
        cwd: app,
        env,
      });
      const lock = readFileSync(join(app, 'pnpm-lock.yaml'), 'utf8');
      await execute('/bin/sh', [join(root, 'install.sh'), 'Test'], { env });
      assert.equal(downloads, 1);
      const registry = join(app, 'node_modules/cache-fixture/index.js');
      const registryInode = statSync(registry).ino;
      await new Promise((resolve) => {
        server.close(resolve);
      });
      // Replace the source inode: an already hard-linked old file must be refreshed.
      rmSync(join(client, 'index.js'));
      writeFileSync(join(client, 'index.js'), 'second client');
      rmSync(join(client, 'obsolete.js'));
      await execute('/bin/sh', [join(root, 'install.sh'), 'Test'], { env });
      assert.equal(
        readFileSync(join(app, 'node_modules/tsclients/index.js'), 'utf8'),
        'second client'
      );
      assert.throws(() => statSync(join(app, 'node_modules/tsclients/obsolete.js')), {
        code: 'ENOENT',
      });
      assert.equal(statSync(registry).ino, registryInode);
      assert.equal(downloads, 1);
      assert.equal(readFileSync(join(app, 'pnpm-lock.yaml'), 'utf8'), lock);
    } finally {
      server.close();
      rmSync(root, { recursive: true, force: true });
    }
  }
);
