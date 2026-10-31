import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { configure } from './configure.mjs';
import { runtimeEnvironment } from './vite-runtime-env.mjs';

test('startup config exposes public settings only and refreshes on every restart', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-runtime-'));
  try {
    mkdirSync(join(root, 'Tyr'));
    mkdirSync(join(root, 'Tyr-dist'));
    writeFileSync(join(root, 'Tyr-dist/index.html'), '<html></html>');
    const environment = {
      VITE_TYR_URL: 'https://example.test/"\\</script>',
      VITE_BOT_NICKNAME: '',
      DB_MIMIR_PASSWORD: 'private',
      PORT: '41011',
    };
    configure('Tyr', root, environment);
    const script = readFileSync(join(root, 'Tyr-dist/runtime-env.js'), 'utf8');
    assert.ok(!script.includes('private'));
    assert.ok(!script.includes('</script>'));
    const context = {};
    runInNewContext(script, context);
    assert.equal(context.__PANTHEON_ENV__.VITE_TYR_URL, environment.VITE_TYR_URL);
    assert.equal(context.__PANTHEON_ENV__.VITE_BOT_NICKNAME, '');
    assert.equal(existsSync(join(root, 'Tyr-dist/.env.production')), false);
    configure('Tyr', root, { VITE_TYR_URL: 'https://new.test' });
    assert.ok(readFileSync(join(root, 'Tyr-dist/runtime-env.js'), 'utf8').includes('new.test'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Vite replaces public values at runtime only for image builds', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-vite-'));
  const previousDirectory = process.cwd();
  const previousMode = process.env.PANTHEON_IMAGE_BUILD;
  try {
    mkdirSync(join(root, 'app'));
    writeFileSync(join(root, 'app/env.ts'), 'const x = import.meta.env.VITE_URL;');
    process.chdir(root);
    const plugin = runtimeEnvironment();
    delete process.env.PANTHEON_IMAGE_BUILD;
    assert.equal(plugin.config(), undefined);
    assert.equal(plugin.transformIndexHtml(), undefined);
    process.env.PANTHEON_IMAGE_BUILD = '1';
    assert.deepEqual(plugin.config().define, {
      'import.meta.env.VITE_URL': 'globalThis.__PANTHEON_ENV__.VITE_URL',
    });
    assert.equal(plugin.transformIndexHtml()[0].attrs.src, '/runtime-env.js');
  } finally {
    process.chdir(previousDirectory);
    if (previousMode === undefined) delete process.env.PANTHEON_IMAGE_BUILD;
    else process.env.PANTHEON_IMAGE_BUILD = previousMode;
    rmSync(root, { recursive: true, force: true });
  }
});
