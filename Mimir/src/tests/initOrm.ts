import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';

export async function init() {
  return await MikroORM.init({
    ...config(),
    entities: [import.meta.dirname + '/../../dist/**/*.entity.js'],
    entitiesTs: [import.meta.dirname + '/../../src/**/*.entity.ts'],
    debug: false,
    dbName: ':memory:',
    connect: false,
    preferTs: true,
    allowGlobalContext: true,
  });
}
