import { jest } from '@jest/globals';
import type { MikroORM } from '@mikro-orm/core';
import { playerInfo } from '../helpers/cache/schema.js';
import { Model } from '../models/Model.js';
import { PlayerModel } from '../models/PlayerModel.js';
import { createWorkerRepository } from './workerRepository.js';

const orm = { em: { fork: () => ({}) } } as unknown as MikroORM;

afterEach(() => jest.restoreAllMocks());

it('loads uncached cron players from the Frey mock without calling external services', async () => {
  const transport = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected HTTP'));
  const repo = await createWorkerRepository(orm);
  const playerId = 987654321;
  await repo.cache.client.remove(playerInfo(playerId));

  const players = await Model.getModel(repo, PlayerModel).findById([playerId]);

  expect(players).toEqual([expect.objectContaining({ id: playerId, title: `title${playerId}` })]);
  expect(await repo.cache.client.get(playerInfo(playerId))).toEqual(
    expect.objectContaining({ id: playerId })
  );
  expect(transport).not.toHaveBeenCalled();
});
