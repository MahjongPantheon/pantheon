import { build } from 'esbuild';

await build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outfile: 'dist/server.js',
});
