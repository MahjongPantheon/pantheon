import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { copyFile, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { Client } from 'pg';

// Run exactly the deployment artifacts, without access to source files or a tsconfig.
const directory = await mkdtemp(join(tmpdir(), 'mimir-production-'));
let child;
let scheduler;
let output = '';
let lock;
try {
  await Promise.all([
    ...['server.js', 'cron.js', 'worker.js', 'metadata.json'].map((file) =>
      copyFile(resolve('dist', file), join(directory, file))
    ),
    copyFile('package.json', join(directory, 'package.json')),
    symlink(resolve('node_modules'), join(directory, 'node_modules')),
  ]);
  await writeFile(
    join(directory, 'runtime-loader.mjs'),
    `
export async function resolve(specifier, context, nextResolve) {
  if (specifier === 'node-cron') {
    // Trigger one tick without waiting for the next wall-clock minute.
    const stub = 'export default { schedule(_expression, callback) { setImmediate(callback); return { stop() {} }; } };';
    return { url: 'data:text/javascript,' + encodeURIComponent(stub), shortCircuit: true };
  }
  if (/(@mikro-orm\\/(reflection|seeder|migrations)|ts-morph|^tsx(?:\\/|$)|^typescript(?:\\/|$))/.test(specifier)) {
    throw new Error('Production loaded source tooling: ' + specifier);
  }
  return nextResolve(specifier, context);
}
`
  );
  const runtimeArguments = ['--experimental-loader', './runtime-loader.mjs'];
  child = spawn(process.execPath, [...runtimeArguments, 'server.js'], {
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
  console.log(
    'Production API reads the seeded event without TypeScript sources or reflection tooling'
  );

  // Exercise the compiled worker without consuming or mutating the seeded queue.
  lock = new Client({
    host: process.env.DB_MIMIR_HOST ?? 'db.pantheon.internal',
    port: Number(process.env.DB_MIMIR_PORT ?? 5432),
    user: process.env.DB_MIMIR_USER ?? 'mimir2',
    password: process.env.DB_MIMIR_PASSWORD ?? 'pgpass',
    database: 'mimir2_unit',
  });
  await lock.connect();
  await lock.query('begin');
  await lock.query('select pg_advisory_xact_lock(1346457172, 1)');
  const worker = spawn(process.execPath, [...runtimeArguments, 'worker.js', 'achievements'], {
    cwd: directory,
    env: { ...process.env, NODE_ENV: 'production', TEST: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30000,
    killSignal: 'SIGKILL',
  });
  let workerOutput = '';
  worker.stdout.on('data', (data) => {
    workerOutput += data.toString();
  });
  worker.stderr.on('data', (data) => {
    workerOutput += data.toString();
  });
  const [code] = await once(worker, 'exit');
  assert.equal(code, 0, workerOutput);
  assert.match(workerOutput, /"status":"skipped","processed":0/);
  console.log(
    'Production cron worker initializes without TypeScript sources or reflection tooling'
  );
  for (const key of [2, 3, 4]) {
    await lock.query('select pg_advisory_xact_lock(1346457172, $1)', [key]);
  }
  scheduler = spawn(process.execPath, [...runtimeArguments, 'cron.js'], {
    cwd: directory,
    env: { ...process.env, NODE_ENV: 'production', TEST: 'true' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolveTick, reject) => {
    let schedulerOutput = '';
    const timer = setTimeout(
      () => reject(new Error('Compiled scheduler did not finish its tick')),
      30000
    );
    const capture = (data) => {
      schedulerOutput += data.toString();
      const exits = schedulerOutput
        .split('\n')
        .filter((line) => line.startsWith('{'))
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return {};
          }
        })
        .filter((record) => record.status === 'exited');
      if (exits.length === 4) {
        clearTimeout(timer);
        try {
          assert.equal(
            exits.every((record) => record.code === 0),
            true,
            schedulerOutput
          );
          resolveTick();
        } catch (error) {
          reject(error);
        }
      }
    };
    scheduler.stdout.on('data', capture);
    scheduler.stderr.on('data', capture);
    scheduler.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    scheduler.once('exit', (exitCode) => {
      clearTimeout(timer);
      reject(new Error(`Compiled scheduler exited early (${exitCode}): ${schedulerOutput}`));
    });
  });
  console.log('Production scheduler launches and reaps all four compiled workers');
} catch (error) {
  console.error(output);
  throw error;
} finally {
  if (scheduler && scheduler.exitCode === null && scheduler.signalCode === null) {
    const exited = once(scheduler, 'exit');
    scheduler.kill();
    await exited;
  }
  await lock?.end();
  if (child && child.exitCode === null && child.signalCode === null) {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
  }
  await rm(directory, { recursive: true, force: true });
}
