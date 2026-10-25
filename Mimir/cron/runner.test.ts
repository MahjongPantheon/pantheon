import { vi } from 'vitest';
import { MikroORM } from '@mikro-orm/postgresql';
import { Repository } from '../src/services/Repository.js';
import { runWorker } from './runner.js';

afterEach(() => vi.restoreAllMocks());

function mockRepository() {
  const connect = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const destroy = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
  const execute = vi
    .fn<() => Promise<{ acquired: boolean }[]>>()
    .mockResolvedValue([{ acquired: true }]);
  const findAll = vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]);
  const repo = {
    cache: { connect },
    destroy,
    em: {
      execute,
      findAll,
      transactional: async (handler: () => Promise<unknown>) => handler(),
    },
  } as unknown as Repository;
  vi.spyOn(MikroORM, 'init').mockResolvedValue({} as MikroORM);
  vi.spyOn(Repository, 'instance').mockReturnValue(repo);
  return { connect, destroy, execute, findAll };
}

it('closes worker services after successful execution', async () => {
  const mocks = mockRepository();
  await runWorker('achievements');
  expect(mocks.findAll).toHaveBeenCalledTimes(1);
  expect(mocks.destroy).toHaveBeenCalledTimes(1);
});

it('closes worker services after database errors', async () => {
  const mocks = mockRepository();
  mocks.findAll.mockRejectedValue(new Error('Database failed'));
  await expect(runWorker('achievements')).rejects.toThrow('Database failed');
  expect(mocks.destroy).toHaveBeenCalledTimes(1);
});

it('closes worker services when cache initialization fails', async () => {
  const mocks = mockRepository();
  mocks.connect.mockRejectedValue(new Error('Cache failed'));
  await expect(runWorker('achievements')).rejects.toThrow('Cache failed');
  expect(mocks.destroy).toHaveBeenCalledTimes(1);
  expect(mocks.execute).not.toHaveBeenCalled();
});

it('closes skipped workers without processing queued jobs', async () => {
  const mocks = mockRepository();
  mocks.execute.mockResolvedValue([{ acquired: false }]);
  await runWorker('achievements');
  expect(mocks.findAll).not.toHaveBeenCalled();
  expect(mocks.destroy).toHaveBeenCalledTimes(1);
});
