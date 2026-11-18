import { GeneratedCacheAdapter } from '@mikro-orm/core';
import { readFileSync } from 'node:fs';
import { createBaseConfig } from './orm.config.js';

export const createProductionConfig = () => ({
  ...createBaseConfig(),
  metadataCache: {
    enabled: true,
    adapter: GeneratedCacheAdapter,
    options: {
      data: JSON.parse(readFileSync(new URL('./metadata.json', import.meta.url), 'utf8')),
    },
  },
});
