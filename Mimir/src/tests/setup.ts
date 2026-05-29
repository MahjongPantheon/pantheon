import { spawn } from 'child_process';

export default async function setup() {
  return new Promise<void>((resolve) => {
    if (process.env.NO_SERVER) {
      resolve();
      return;
    }
    const child = spawn('/usr/bin/pnpm', ['exec', 'tsx', 'src/tests/testserver.ts'], {
      shell: true,
      stdio: 'pipe',
      env: {
        ...process.env,
        TEST: 'true',
      },
      // cwd: __dirname + '../../',
    });
    child.stdout.on('data', (data) => {
      data
        .toString()
        .split('\n')
        .forEach((str: string) => {
          if (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE === 'true') {
            console.log(str);
          }

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
