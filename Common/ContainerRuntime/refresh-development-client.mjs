import { lstatSync, readFileSync, realpathSync, rmSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';

// Invalidate only the installed local package. pnpm then rematerializes it from
// the working tree without forcing registry dependencies to be reinstalled.
const directory = resolve(process.argv[2] ?? process.cwd());
const manifest = JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8'));
const specifier = manifest.dependencies?.tsclients ?? manifest.devDependencies?.tsclients;
if (specifier?.startsWith('file:')) {
  const modules = join(directory, 'node_modules');
  const installed = join(modules, 'tsclients');
  let entry;
  try {
    entry = lstatSync(installed);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (entry) {
    if (entry.isSymbolicLink()) {
      let target;
      try {
        target = realpathSync(installed);
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      // Never follow a link into Common/tsclients or remove another package.
      const virtualStore = join(realpathSync(modules), '.pnpm') + sep;
      if (
        target?.startsWith(virtualStore) &&
        target.endsWith(`${sep}node_modules${sep}tsclients`)
      ) {
        rmSync(target, { recursive: true, force: true });
      }
    }
    rmSync(installed, { recursive: true, force: true });
  }
  console.log('tsclients: refreshing the installed local package');
}
