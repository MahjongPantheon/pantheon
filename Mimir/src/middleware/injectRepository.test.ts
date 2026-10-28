import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IncomingMessage } from 'http';
import type { MikroORM } from '@mikro-orm/postgresql';
import { Repository } from '../services/Repository.js';
import { injectRepository } from './injectRepository.js';

afterEach(() => vi.restoreAllMocks());

function fixture(personId: number | null, authToken: string | null) {
  const repo = {
    meta: { personId, authToken, isInternalQuery: false },
    frey: {
      QuickAuthorize: vi.fn(async () => {
        if (authToken !== 'valid') throw new Error('Invalid token');
        return { authSuccess: true };
      }),
    },
    cache: { connect: vi.fn() },
    mockCache: vi.fn(),
    mockFrey: vi.fn(),
    mockSkirnir: vi.fn(),
  } as unknown as Repository;
  vi.spyOn(Repository, 'instance').mockReturnValue(repo);
  const context: Parameters<ReturnType<typeof injectRepository>>[1] = {
    repository: repo,
    contentType: 'JSON',
    service: undefined,
    method: undefined,
  };
  const next = vi.fn(async () => ({ body: '', headers: {}, statusCode: 200 }));
  const run = () =>
    injectRepository({} as MikroORM)({ headers: {} } as IncomingMessage, context, next);
  return { run, next, repo };
}

describe('Request identity authentication', () => {
  it.each([null, '', 'wrong'])(
    'rejects a claimed person ID with token %s before invoking the handler',
    async (token) => {
      const { run, next } = fixture(1, token);
      await expect(run()).rejects.toThrow();
      expect(next).not.toHaveBeenCalled();
    }
  );

  it('reports rejected identity credentials as unauthenticated', async () => {
    const { run, next, repo } = fixture(1, 'wrong');
    vi.mocked(repo.frey.QuickAuthorize).mockRejectedValue({
      code: 'invalid_argument',
      msg: 'Password check failed',
    });
    await expect(run()).rejects.toMatchObject({ code: 'unauthenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  it('preserves identity-service failures instead of treating them as anonymous access', async () => {
    const { run, next, repo } = fixture(1, 'valid');
    vi.mocked(repo.frey.QuickAuthorize).mockRejectedValue(new Error('Service unavailable'));
    await expect(run()).rejects.toThrow('Service unavailable');
    expect(next).not.toHaveBeenCalled();
  });

  it('allows anonymous reads without calling the identity service', async () => {
    const { run, next, repo } = fixture(null, null);
    await run();
    expect(next).toHaveBeenCalled();
    expect(repo.frey.QuickAuthorize).not.toHaveBeenCalled();
  });

  it('allows a verified caller', async () => {
    const { run, next, repo } = fixture(1, 'valid');
    await run();
    expect(next).toHaveBeenCalled();
    expect(repo.frey.QuickAuthorize).toHaveBeenCalledWith({ personId: 1, authToken: 'valid' });
  });
});
