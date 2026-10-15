import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

Promise.all([
  build({
    entryPoints: ['src/entities/**/*.entity.ts'],
    platform: 'node',
    format: 'esm',
    target: 'node22',
    outdir: 'dist/entities',
  }),
  build({
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
  }),
])
  .then((results) => {
    console.log(results);
  })
  .catch((err) => {
    console.error(err);
  });
