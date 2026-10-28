import { alignServerCoverage } from './alignCoverage.mjs';
import { sourceWithoutRuntimeHelpers } from './runtimeHelpers.mjs';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

/** Use Vitest's AST converter for both processes so source locations can be merged. */
export async function mergeServerCoverage(root, sourceDirectories) {
  const require = createRequire(resolve(root, 'package.json'));
  const { V8CoverageProvider } = await import(
    pathToFileURL(require.resolve('@vitest/coverage-v8/dist/provider.js'))
  );
  const converter = new V8CoverageProvider();
  converter.options = { ignoreClassMethods: [] };
  converter.ctx = { logger: console };
  const directory = resolve(root, 'coverage/vitest/server-v8');
  const sources = JSON.parse(readFileSync(resolve(directory, 'sources.json'), 'utf8'));
  const result = converter.createCoverageMap();
  for (const filename of readdirSync(directory).filter(
    (name) => name.startsWith('coverage-') && name.endsWith('.json')
  )) {
    const raw = JSON.parse(readFileSync(resolve(directory, filename), 'utf8'));
    for (const entry of raw.result) {
      if (!entry.url.startsWith('file:')) continue;
      const path = fileURLToPath(entry.url);
      if (
        !sourceDirectories.some((dir) => path.startsWith(resolve(root, dir) + '/')) ||
        path.includes('/tests/') ||
        path.includes('/node_modules/')
      )
        continue;
      if (sources[entry.url] === undefined)
        throw new Error(`Missing executed source for ${entry.url}`);
      const sourceMap = raw['source-map-cache']?.[entry.url]?.data;
      if (!sourceMap) throw new Error(`Missing source map for ${entry.url}`);
      result.merge(
        await converter.remapCoverage(
          entry.url,
          0,
          { code: await sourceWithoutRuntimeHelpers(sources[entry.url]), map: sourceMap },
          entry.functions
        )
      );
    }
  }
  if (result.files().length === 0) throw new Error('No test server coverage was collected');
  const serverCoverage = result.toJSON();
  const unitCoverage = JSON.parse(
    readFileSync(resolve(root, 'coverage/vitest/coverage-final.json'), 'utf8')
  );
  writeFileSync(resolve(root, 'coverage/server/coverage-raw.json'), JSON.stringify(serverCoverage));
  writeFileSync(
    resolve(root, 'coverage/server/coverage-final.json'),
    JSON.stringify(alignServerCoverage(unitCoverage, serverCoverage))
  );
}
