import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

build({
  entryPoints: ['app/server.ts'],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: 'dist/server.js',
  plugins: [
    nodeExternalsPlugin({
      allowList: ['tsclients'],
    }),
  ],
})
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.error(err);
  });
