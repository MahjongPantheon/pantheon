import { MikroORM } from '@mikro-orm/core';
import config from '../mikro-orm.config.js';
import { SqliteDriver } from '@mikro-orm/sqlite';

process.env.TEST = 'true';

// For tests that do not require full postgres setup

export async function init() {
  return await MikroORM.init({
    ...config(),
    driver: SqliteDriver,
    entities: [import.meta.dirname + '/../../dist/**/*.entity.js'],
    entitiesTs: [import.meta.dirname + '/../../src/**/*.entity.ts'],
    debug: false,
    dbName: ':memory:',
    user: undefined,
    password: undefined,
    host: undefined,
    port: undefined,
    connect: false,
    preferTs: true,
  });
}
