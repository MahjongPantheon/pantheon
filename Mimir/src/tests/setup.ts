import { spawn } from 'child_process';

export default async function setup() {
  return new Promise<void>((resolve) => {
    const child = spawn('/usr/bin/pnpm', ['exec', 'tsx', 'app/tests/testserver.ts'], {
      shell: true,
      stdio: 'pipe',
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

          if (str.includes('Test server listening on port 4301')) {
            resolve();
          }
        });
    });
    child.stderr.on('data', (data) => {
      if (process.env.NODE_ENV === 'test' && process.env.TEST_VERBOSE === 'true') {
        console.error(data.toString());
      }
    });
  });
}
