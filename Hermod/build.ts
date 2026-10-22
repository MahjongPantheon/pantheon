import { build } from 'esbuild';

await build({
  entryPoints: { server: 'src/server.ts', 'dump-mail': 'src/dump-mail.ts' },
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  target: 'node22',
  outdir: 'dist',
});
