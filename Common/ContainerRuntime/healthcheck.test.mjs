import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createServer } from 'node:net';
import { healthy, listening, servicePorts } from './healthcheck.mjs';

test('health remains false until preparation and every listener are ready', async () => {
  const root = mkdtempSync(join(tmpdir(), 'pantheon-health-'));
  const readyPath = join(root, 'ready');
  const calls = [];
  try {
    const probe = async (port) => {
      calls.push(port);
      return true;
    };
    const supervisor = () => 'ready';
    assert.equal(await healthy('Mimir', { readyPath, probe, supervisor }), false);
    assert.deepEqual(calls, []);
    writeFileSync(readyPath, '');
    assert.equal(await healthy('Mimir', { readyPath, probe, supervisor }), true);
    assert.deepEqual(calls, servicePorts.Mimir);
    assert.equal(
      await healthy('Mimir', { readyPath, supervisor, probe: async (port) => port !== 41016 }),
      false
    );
    assert.equal(await healthy('Tyr', { readyPath, probe: async (port) => port === 80 }), true);
    assert.equal(await healthy('Mimir', { readyPath, probe, supervisor: () => 'starting' }), false);
    assert.equal(await healthy('Mimir', { readyPath, probe, supervisor: () => 'failed' }), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

for (const host of ['127.0.0.1', '::1']) {
  test(`readiness connects to workers listening on ${host}`, async () => {
    const server = createServer((socket) => socket.end());
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen({ host, port: 0 }, resolve);
    });
    try {
      assert.equal(await listening(server.address().port), true);
    } finally {
      await new Promise((resolve) => server.close(resolve));
    }
  });
}

test('healthcheck worker ports match the owning Supervisor configurations', () => {
  for (const [service, ports] of Object.entries(servicePorts)) {
    if (['Tyr', 'Forseti'].includes(service)) continue;
    const file =
      service === 'Hermod' ? 'Hermod/configs/supervisord.conf' : `${service}/supervisord.conf`;
    const source = readFileSync(new URL(`../../${file}`, import.meta.url), 'utf8');
    const configured = [...source.matchAll(/PORT=(\d+)/g)].map((match) => Number(match[1]));
    assert.deepEqual(ports.slice(1), configured, service);
  }
});
