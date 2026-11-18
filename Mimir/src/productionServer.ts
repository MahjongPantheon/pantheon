import { createProductionConfig } from './productionConfig.js';
import { startServer } from './startServer.js';

await startServer(createProductionConfig());
