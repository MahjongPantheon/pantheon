import { createProductionConfig } from '../src/productionConfig.js';
import { workerMain } from './workerMain.js';

await workerMain(createProductionConfig());
