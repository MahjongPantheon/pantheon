import { ChildProcess, spawn } from 'child_process';
import { mkdir, rm } from 'node:fs/promises';
import { resolve as resolvePath } from 'node:path';

declare global {
  var mimirTestServer: ChildProcess | undefined;
}

export default async function setup(config: {
  collectCoverage: boolean;
  coverageDirectory: string;
}) {
  const coverageDirectory = resolvePath(config.coverageDirectory, 'server-v8');
  if (config.collectCoverage && !process.env.NO_SERVER) {
    await rm(coverageDirectory, { recursive: true, force: true });
    await mkdir(coverageDirectory, { recursive: true });
  }
  return new Promise<void>((resolve, reject) => {
    if (process.env.NO_SERVER) {
      resolve();
      return;
    }
    const child = spawn(process.execPath, ['--import', 'tsx', 'src/tests/testserver.ts'], {
      stdio: 'pipe',
      env: {
        ...process.env,
        TEST: 'true',
        NODE_V8_COVERAGE: config.collectCoverage ? coverageDirectory : '',
      },
    });
    globalThis.mimirTestServer = child;
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      reject(new Error(`Test server exited before becoming ready (${signal ?? code})`));
    });
    child.stdout.on('data', (data) => {
      data
        .toString()
        .split('\n')
        .forEach((str: string) => {
          //if (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE === 'true') {
          console.log(str);
          // }

          if (str.includes('Test server listening on port')) {
            console.log('Test server spawned successfully');
            resolve();
          }
        });
    });
    child.stderr.on('data', (data) => {
      // if (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE === 'true') {
      console.error(data.toString());
      // }
    });
  });
}
