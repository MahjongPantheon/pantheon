import { defineConfig, GeneratedCacheAdapter } from '@mikro-orm/core';
import { readFileSync } from 'node:fs';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ConfigService } from './services/Config.js';
import { SeedManager } from '@mikro-orm/seeder';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { AchievementsEntity } from './entities/Achievements.entity.js';
import { EventEntity } from './entities/Event.entity.js';
import { EventPrescriptEntity } from './entities/EventPrescript.entity.js';
import { EventRegisteredPlayersEntity } from './entities/EventRegisteredPlayers.entity.js';
import { HandEntity } from './entities/Hand.entity.js';
import { JobsQueueEntity } from './entities/JobsQueue.entity.js';
import { PenaltyEntity } from './entities/Penalty.entity.js';
import { PlayerHistoryEntity } from './entities/PlayerHistory.entity.js';
import { PlayerStatsEntity } from './entities/PlayerStats.entity.js';
import { RoundEntity } from './entities/Round.entity.js';
import { RpcOperationEntity } from './entities/RpcOperation.entity.js';
import { RulesetEntity } from './entities/Ruleset.entity.js';
import { SessionEntity } from './entities/Session.entity.js';
import { SessionPlayerEntity } from './entities/SessionPlayer.entity.js';
import { SessionResultsEntity } from './entities/SessionResults.entity.js';
import { SessionStateEntity } from './entities/SessionState.entity.js';

const config = new ConfigService();

export const createConfig = (useGeneratedCache: boolean) =>
  defineConfig({
    driver: PostgreSqlDriver,
    dbName: config.test ? 'mimir2_unit' : config.db.dbname,
    user: config.db.username,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    implicitTransactions: false,
    // Keep discovery and model queries on the same entity classes in the bundled server.
    entities: [
      AchievementsEntity,
      EventEntity,
      EventPrescriptEntity,
      EventRegisteredPlayersEntity,
      HandEntity,
      JobsQueueEntity,
      PenaltyEntity,
      PlayerHistoryEntity,
      PlayerStatsEntity,
      RoundEntity,
      RpcOperationEntity,
      RulesetEntity,
      SessionEntity,
      SessionPlayerEntity,
      SessionResultsEntity,
      SessionStateEntity,
    ],
    // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
    // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
    metadataProvider: TsMorphMetadataProvider,
    // Production has no TypeScript sources to reflect; the build generates this cache.
    metadataCache: useGeneratedCache
      ? {
          enabled: true,
          adapter: GeneratedCacheAdapter,
          options: {
            data: JSON.parse(readFileSync(new URL('./metadata.json', import.meta.url), 'utf8')),
          },
        }
      : undefined,
    // enable debug mode to log SQL queries and discovery information
    debug: false,
    extensions: [SeedManager, Migrator],
    seeder: config.test
      ? {
          path: import.meta.dirname + '/seeders',
          pathTs: import.meta.dirname + '/seeders',
          defaultSeeder: 'TestSeeder',
          glob: '!(*.d).{js,ts}',
          emit: 'ts',
          fileName: (className: string) => className,
        }
      : undefined,
  });

// CLI commands run from TypeScript sources; the deployed bundle is JavaScript.
export default () => createConfig(import.meta.url.endsWith('.js'));
