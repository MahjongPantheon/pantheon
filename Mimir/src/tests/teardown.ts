import { once } from 'node:events';

export default async function teardown(config: { collectCoverage: boolean }) {
  if (process.env.NO_SERVER) {
    return;
  }
  const child = globalThis.mimirTestServer;
  if (!child || child.exitCode !== null || child.signalCode !== null) {
    throw new Error('Test server is no longer running');
  }
  try {
    if (config.collectCoverage) {
      const response = await fetch('http://localhost:4301/__test__/coverage', {
        method: 'POST',
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`Could not flush test server coverage: ${response.status}`);
      }
    }
  } finally {
    const exited = once(child, 'exit');
    child.kill();
    await exited;
    globalThis.mimirTestServer = undefined;
  }
}
