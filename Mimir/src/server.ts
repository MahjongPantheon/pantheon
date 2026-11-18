import config from './mikro-orm.config.js';
import { startServer } from './startServer.js';

await startServer(config());
