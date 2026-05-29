import { spawn } from 'child_process';

export default async function teardown() {
  if (process.env.NO_SERVER) {
    return;
  }
  spawn("ps ax | grep src/tests/testserver.ts | awk '{ print $1 }' | xargs kill", [], {
    shell: true,
    stdio: 'ignore',
  });
}
