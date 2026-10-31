import { createRequire } from 'node:module';
import { setTimeout } from 'node:timers/promises';

const service = process.argv[2];
const directory = service === 'Hugin' ? 'Hugin-dist' : service;
const require = createRequire(`/var/www/html/${directory}/package.json`);
const { Client } = require('pg');
const prefix = service === 'Hugin' ? 'PHINX_DB_HUGIN' : `DB_${service.toUpperCase()}`;
const defaults = service === 'Hugin' ? 'hugin' : `${service.toLowerCase()}2`;
const options = {
  host: process.env[`${prefix}_HOST`] ?? 'db.pantheon.internal',
  port: Number(process.env[`${prefix}_PORT`] ?? 5432),
  user: process.env[`${prefix}_USER`] ?? defaults,
  password: process.env[`${prefix}_${service === 'Hugin' ? 'PASS' : 'PASSWORD'}`] ?? 'pgpass',
  database: process.env[`${prefix}_NAME`] ?? defaults,
  connectionTimeoutMillis: 3000,
};
for (let attempt = 1; ; attempt++) {
  const client = new Client(options);
  try {
    await client.connect();
    await client.query('select 1');
    break;
  } catch {
    if (attempt >= 30) throw new Error(`${service}: database unavailable after 30 attempts`);
    console.log(`${service}: waiting for database (${attempt}/30)`);
    await setTimeout(2000);
  } finally {
    await client.end();
  }
}
