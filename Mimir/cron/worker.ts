import config from '../src/mikro-orm.config.js';
import { workerMain } from './workerMain.js';

await workerMain(config());
