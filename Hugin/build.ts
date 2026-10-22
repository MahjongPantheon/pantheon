import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

await build({
  entryPoints: { server: 'src/server.ts', jobs: 'src/jobs.ts', migrate: 'src/migrate.ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outdir: 'dist',
  plugins: [nodeExternalsPlugin({ allowList: ['tsclients'] })],
});
