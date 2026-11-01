import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

test('initialization prepares cache and separate main/dist subdirectories without replacing contents', () => {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-shared-volume-'));
  const script = fileURLToPath(new URL('./init-dependencies.sh', import.meta.url));
  try {
    assert.equal(spawnSync('/bin/sh', [script, root]).status, 0);
    assert.equal(existsSync(join(root, 'store')), true);
    for (const name of [
      'Frey',
      'Mimir',
      'Frey-dist',
      'Mimir-dist',
      'Hugin-dist',
      'Gullveig-dist',
      'Meili-dist',
      'Hermod-dist',
      'Skirnir-dist',
      'Sigrun-dist',
      'Bragi-dist',
    ]) {
      assert.equal(existsSync(join(root, 'modules', name)), true, name);
    }
    writeFileSync(join(root, 'modules/Mimir/keep'), 'existing packages');
    assert.equal(spawnSync('/bin/sh', [script, root]).status, 0);
    assert.equal(readFileSync(join(root, 'modules/Mimir/keep'), 'utf8'), 'existing packages');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
