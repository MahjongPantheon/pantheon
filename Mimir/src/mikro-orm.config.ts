import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { SeedManager } from '@mikro-orm/seeder';
import { Migrator } from '@mikro-orm/migrations';
import { ConfigService } from './services/Config.js';
import { createBaseConfig } from './orm.config.js';

// Source discovery belongs to development, migration CLIs and the build only.
export const createConfig = () => ({
  ...createBaseConfig(),
  metadataProvider: TsMorphMetadataProvider,
  extensions: [SeedManager, Migrator],
  seeder: new ConfigService().test
    ? {
        path: import.meta.dirname + '/seeders',
        pathTs: import.meta.dirname + '/seeders',
        defaultSeeder: 'TestSeeder',
        glob: '!(*.d).{js,ts}',
        emit: 'ts' as const,
        fileName: (className: string) => className,
      }
    : undefined,
});

export default createConfig;
