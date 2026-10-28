import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { MikroORM } from '@mikro-orm/postgresql';
import { createConfig } from './src/mikro-orm.config.js';

// Reflect source entities once during the build, without connecting to the database.
const orm = await MikroORM.init({
  ...createConfig(false),
  metadataCache: {
    enabled: true,
    options: { cacheDir: './dist', combined: 'metadata.json' },
  },
});
await orm.close();

await build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: 'dist/server.js',
  plugins: [
    nodeExternalsPlugin({
      allowList: ['tsclients'],
    }),
  ],
});
