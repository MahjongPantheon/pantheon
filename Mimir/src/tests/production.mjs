import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { copyFile, mkdtemp, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

// Run exactly the deployment artifacts, without access to source files or a tsconfig.
const directory = await mkdtemp(join(tmpdir(), 'mimir-production-'));
let child;
let output = '';
try {
  await Promise.all([
    ...['server.js', 'metadata.json'].map((file) =>
      copyFile(resolve('dist', file), join(directory, file))
    ),
    copyFile('package.json', join(directory, 'package.json')),
    symlink(resolve('node_modules'), join(directory, 'node_modules')),
  ]);
  child = spawn(process.execPath, ['server.js'], {
    cwd: directory,
    env: { ...process.env, NODE_ENV: 'production', TEST: 'true', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const address = await new Promise((resolveAddress, reject) => {
    const timer = setTimeout(() => reject(new Error('Production server did not start')), 30000);
    const capture = (data) => {
      output += data.toString();
      const match = output.match(/Server listening on port (\d+)/);
      if (match) {
        clearTimeout(timer);
        resolveAddress(`http://127.0.0.1:${match[1]}`);
      }
    };
    child.stdout.on('data', capture);
    child.stderr.on('data', capture);
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('exit', (code) => {
      clearTimeout(timer);
      reject(new Error(`Production server exited (${code})`));
    });
  });
  const response = await fetch(`${address}/v2/common.Mimir/GetEventsById`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: [19] }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.text();
  assert.equal(response.status, 200, body);
  const result = JSON.parse(body);
  assert.equal(result.events.length, 1);
  assert.equal(result.events[0].id, 19);
  console.log('Production bundle reads the seeded event without TypeScript sources');
} catch (error) {
  console.error(output);
  throw error;
} finally {
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
  await rm(directory, { recursive: true, force: true });
}
