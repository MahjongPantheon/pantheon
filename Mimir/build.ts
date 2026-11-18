import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { MikroORM } from '@mikro-orm/postgresql';
import { createConfig } from './src/mikro-orm.config.js';

// Reflect source entities once during the build, without connecting to the database.
const orm = await MikroORM.init({
  ...createConfig(),
  metadataCache: {
    enabled: true,
    options: { cacheDir: './dist', combined: 'metadata.json' },
  },
});
await orm.close();

const result = await build({
  entryPoints: {
    server: 'src/productionServer.ts',
    cron: 'cron/cron.ts',
    worker: 'cron/productionWorker.ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outdir: 'dist',
  metafile: true,
  plugins: [
    nodeExternalsPlugin({
      allowList: ['tsclients'],
    }),
  ],
});

// Production processes must not load source discovery or TypeScript tooling.
for (const output of Object.values(result.metafile.outputs)) {
  for (const dependency of output.imports) {
    if (
      /(@mikro-orm\/reflection|ts-morph|^tsx(?:\/|$)|^typescript(?:\/|$))/.test(dependency.path)
    ) {
      throw new Error(`Unexpected production dependency: ${dependency.path}`);
    }
  }
}
