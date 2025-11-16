import { defineConfig } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { ConfigService } from './services/Config.js';
import { SeedManager } from '@mikro-orm/seeder';
import { Migrator } from '@mikro-orm/migrations';

const config = new ConfigService();

export default () =>
  defineConfig({
    dbName: config.test ? 'mimir2_unit' : config.db.dbname,
    user: config.db.username,
    password: config.db.password,
    host: config.db.host,
    port: config.db.port,
    // folder-based discovery setup, using common filename suffix
    entities: ['dist/**/*.entity.js'],
    entitiesTs: ['src/**/*.entity.ts'],
    // we will use the ts-morph reflection, an alternative to the default reflect-metadata provider
    // check the documentation for their differences: https://mikro-orm.io/docs/metadata-providers
    metadataProvider: TsMorphMetadataProvider,
    // enable debug mode to log SQL queries and discovery information
    debug: true,
    extensions: [SeedManager, Migrator],
  });
