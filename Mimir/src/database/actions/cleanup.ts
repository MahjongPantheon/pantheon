import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config.js';

export async function cleanup() {
  // ensure we deal with test db and don't erase production db accidentally lol
  process.env.TEST = 'true';
  const orm = await MikroORM.init(config());
  await orm.schema.clearDatabase();
}
