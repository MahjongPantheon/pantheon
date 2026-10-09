import { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import teardown from './teardown';

describe('Test server coverage teardown', () => {
  let child: ChildProcess;
  let fetchMock: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    child = Object.assign(new EventEmitter(), {
      exitCode: null,
      signalCode: null,
      kill: jest.fn(() => {
        queueMicrotask(() => child.emit('exit', null, 'SIGTERM'));
        return true;
      }),
    }) as unknown as ChildProcess;
    globalThis.freyTestServer = child;
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchMock.mockRestore();
    globalThis.freyTestServer = undefined;
  });

  it('flushes coverage before stopping the server and waits for its exit', async () => {
    fetchMock.mockImplementation(async () => {
      expect(child.kill).not.toHaveBeenCalled();
      return new Response(null, { status: 204 });
    });

    await teardown({ collectCoverage: true });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:4304/__test__/coverage',
      expect.objectContaining({ method: 'POST' })
    );
    expect(child.kill).toHaveBeenCalledTimes(1);
    expect(globalThis.freyTestServer).toBeUndefined();
  });

  it('stops the server without requesting coverage for a normal Jest run', async () => {
    await teardown({ collectCoverage: false });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(child.kill).toHaveBeenCalledTimes(1);
  });

  it('stops the server and reports a failed coverage flush', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 500 }));

    await expect(teardown({ collectCoverage: true })).rejects.toThrow(
      'Could not flush test server coverage: 500'
    );

    expect(child.kill).toHaveBeenCalledTimes(1);
    expect(globalThis.freyTestServer).toBeUndefined();
  });

  it('reports when the test server has already exited', async () => {
    Object.assign(child, { exitCode: 1 });

    await expect(teardown({ collectCoverage: true })).rejects.toThrow(
      'Test server is no longer running'
    );

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
