// Validate Compose JSON rendered by bin/pantheon infra-test; runs inside Node's container.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const directory = process.argv[2];
const read = (name) => readFileSync(join(directory, name), 'utf8');
const load = (name) => JSON.parse(read(`${name}.json`));
const applications =
  'tyr forseti sigrun bragi frey mimir hugin gullveig meili hermod skirnir'.split(' ');
const ports = Object.fromEntries(
  'mimir sigrun tyr frey forseti bragi hermod hugin gullveig skirnir fenrir meili'
    .split(' ')
    .map((name, i) => [name, 4001 + i])
);
Object.assign(ports, {
  db: 5532,
  redis: 6379,
  pgadmin: 5632,
  grafana: 3000,
  cadvisor: 8080,
  dbwatcher: 9187,
  dozzle: 8050,
});
const sorted = (value) => {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sorted(value[key])])
    );
  return value;
};
for (const mode of ['dev', 'source', 'image']) {
  for (const arch of ['amd64', 'arm64']) {
    const data = load(`${mode}-${arch}`);
    assert.equal(data.name, 'pantheon');
    for (const [name, port] of Object.entries(ports)) {
      assert.ok(
        data.services[`${name}.pantheon.internal`].ports.some((p) => p.published === String(port)),
        `${mode}: ${name}:${port}`
      );
    }
    for (const name of applications) {
      const service = data.services[`${name}.pantheon.internal`];
      assert.equal(service.labels['io.pantheon.mode'], mode);
      const sources = (service.volumes ?? []).filter(
        (mount) => mount.type === 'bind' && mount.target.startsWith('/var/www/html/')
      );
      if (mode === 'image') {
        assert.ok(
          sources.every((mount) => mount.target.endsWith('/.well-known')),
          name
        );
        assert.equal(service.build, undefined);
        assert.equal(service.environment.PANTHEON_PRODUCTION_WORKERS, 'true');
        assert.equal(service.environment.PANTHEON_MODE, 'production');
      } else {
        assert.ok(sources.some((mount) => mount.target === '/var/www/html/Common'));
        assert.equal(service.build.target, 'development');
        assert.equal(service.environment.PANTHEON_DEV_WATCH, mode === 'dev' ? 'true' : 'false');
      }
    }
    for (const name of [
      'datavolume02',
      'backupvolume01',
      'configvolume01',
      'gullveigstorage01',
      'grafanastorage01',
      'pfspool01',
      'pfetc01',
      'prometheusdata',
      'pgadmindata',
    ]) {
      assert.equal(data.volumes[name].name, `pantheon_${name}`);
    }
    for (const [service, profile] of [
      ['fenrir', 'e2e'],
      ['pgadmin', 'tools'],
      ['grafana', 'monitoring'],
    ]) {
      assert.deepEqual(data.services[`${service}.pantheon.internal`].profiles, [profile]);
    }
  }
  assert.equal(
    JSON.stringify(sorted(load(`${mode}-amd64`))).replaceAll('amd64', 'ARCH'),
    JSON.stringify(sorted(load(`${mode}-arm64`))).replaceAll('arm64', 'ARCH'),
    `${mode}: architecture drift`
  );
}
for (const name of applications) {
  const env = load('source-production').services[`${name}.pantheon.internal`].environment;
  assert.equal(env.NODE_ENV, 'production');
  assert.equal(env.PANTHEON_MODE, 'production');
  assert.equal(env.PANTHEON_PRODUCTION_WORKERS, 'true');
  assert.equal(load('local').services[`${name}.pantheon.internal`].build.target, 'production');
}
assert.equal(load('local').services['reverse-proxy'].ports[0].published, '80');
for (const arch of ['amd64', 'arm64'])
  assert.ok(read(`compatibility-${arch}.txt`).includes(`pantheon-frey-${arch}:`));
console.log(
  'Compose modes, architectures, ports, source boundaries and persistent volumes verified.'
);
