import { spawn } from 'child_process';

export default async function teardown() {
  spawn("ps ax | grep app/tests/testserver.ts | awk '{ print $1 }' | xargs kill", [], {
    shell: true,
    stdio: 'ignore',
  });
}
