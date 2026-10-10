import { jest } from '@jest/globals';
import { MikroORM, SqliteDriver } from '@mikro-orm/sqlite';
import { PlayersGetPlayerStatsResponse } from 'tsclients/proto/mimir.pb.js';
import config from '../../mikro-orm.config.js';
import { JobsQueueEntity } from '../../entities/JobsQueue.entity.js';
import { Repository } from '../../services/Repository.js';
import { Model } from '../Model.js';
import { CronModel } from '../CronModel.js';
import { PlayerStatsModel } from '../PlayerStatsModel.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { AchievementsModel } from '../AchievementsModel.js';
import { rebuildAchievements } from '../../../cron/achievements.js';
import { rebuildPlayerStats } from '../../../cron/player_stats.js';

const afterFlush = jest.fn<() => void>();
const orm = await MikroORM.init({
  ...config(),
  driver: SqliteDriver,
  entities: [JobsQueueEntity],
  entitiesTs: [JobsQueueEntity],
  dbName: ':memory:',
  user: undefined,
  password: undefined,
  host: undefined,
  port: undefined,
  debug: false,
  subscribers: [{ afterFlush }],
});
const repo = Repository.instance({}, orm);
const model = Model.getModel(repo, CronModel);
const stats = Model.getModel(repo, PlayerStatsModel);
const registrations = Model.getModel(repo, EventRegistrationModel);

describe('Explicit model transactions', () => {
  beforeAll(() => orm.schema.createSchema());
  beforeEach(async () => {
    afterFlush.mockReset();
    repo.em.clear();
    await repo.em.nativeDelete(JobsQueueEntity, {});
    jest
      .spyOn(registrations, 'findByPlayerId')
      .mockResolvedValue(
        [19, 20].map((id) => Object.assign(new EventRegisteredPlayersEntity(), { event: { id } }))
      );
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(() => repo.destroy());

  it('commits scheduled jobs with implicit transactions disabled', async () => {
    expect(orm.config.get('implicitTransactions')).toBe(false);
    afterFlush.mockImplementation(() => {
      expect(repo.em.isInTransaction()).toBe(true);
    });

    await stats.invalidatePlayerStats(1);

    expect(afterFlush).toHaveBeenCalled();
    expect(repo.em.isInTransaction()).toBe(false);
    const jobs = await model.getPendingJobs(10);
    expect(jobs.map((job) => JSON.parse(job.jobArguments))).toEqual([
      { eventId: 19, playerId: 1 },
      { eventId: 20, playerId: 1 },
    ]);
  });

  it('rolls back flushed jobs when the model operation fails', async () => {
    afterFlush.mockImplementationOnce(() => {
      expect(repo.em.isInTransaction()).toBe(true);
      throw new Error('Failure after writing jobs');
    });

    await expect(stats.invalidatePlayerStats(1)).rejects.toThrow('Failure after writing jobs');

    repo.em.clear();
    expect(repo.em.isInTransaction()).toBe(false);
    expect(await model.getPendingJobs(10)).toEqual([]);
  });

  it('joins an existing transaction without creating a nested transaction', async () => {
    const begin = jest.spyOn(repo.em.getConnection(), 'begin');

    await repo.em.transactional(async () => {
      await stats.invalidatePlayerStats(1);
      await stats.invalidatePlayerStats(2);
    });

    expect(begin).toHaveBeenCalledTimes(1);
    expect(await model.getPendingJobs(10)).toHaveLength(4);
  });

  it('commits cron results and removes completed jobs together', async () => {
    await repo.em.transactional(() => model.scheduleRecalcAchievements(19));
    jest
      .spyOn(Model.getModel(repo, AchievementsModel), 'precalculateAchievements')
      .mockImplementation((eventId) => model.scheduleRecalcStats(eventId, [1]));

    await rebuildAchievements(repo);

    const jobs = await model.getPendingJobs(10);
    expect(jobs).toHaveLength(1);
    expect(jobs[0].jobName).toBe('playerStats');
    expect(JSON.parse(jobs[0].jobArguments)).toEqual({ eventId: 19, playerId: 1 });
  });

  it.each(['achievements', 'playerStats'] as const)(
    'starts every %s job before waiting for completion',
    async (jobName) => {
      await repo.em.transactional(async () => {
        if (jobName === 'achievements') {
          await Promise.all([
            model.scheduleRecalcAchievements(19),
            model.scheduleRecalcAchievements(20),
          ]);
        } else {
          await model.scheduleRecalcStats(19, [1, 2]);
        }
      });
      let release!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      let started!: () => void;
      const allStarted = new Promise<void>((resolve) => {
        started = resolve;
      });
      let count = 0;
      const waitForCompletion = async () => {
        if (++count === 2) started();
        await pending;
      };
      if (jobName === 'achievements') {
        jest
          .spyOn(Model.getModel(repo, AchievementsModel), 'precalculateAchievements')
          .mockImplementation(waitForCompletion);
      } else {
        jest.spyOn(stats, 'getPlayerStats').mockImplementation(async () => {
          await waitForCompletion();
          return PlayersGetPlayerStatsResponse.initialize();
        });
      }

      const rebuilding =
        jobName === 'achievements' ? rebuildAchievements(repo) : rebuildPlayerStats(repo);
      try {
        await allStarted;
        expect(count).toBe(2);
      } finally {
        release();
        await rebuilding;
      }
      expect(await model.getPendingJobs(10)).toEqual([]);
    }
  );

  it('retains cron jobs and rolls back results when a later job fails', async () => {
    await repo.em.transactional(async () => {
      await model.scheduleRecalcAchievements(19);
      await model.scheduleRecalcAchievements(20);
    });
    jest
      .spyOn(Model.getModel(repo, AchievementsModel), 'precalculateAchievements')
      .mockImplementationOnce((eventId) => model.scheduleRecalcStats(eventId, [1]))
      .mockRejectedValueOnce(new Error('Cron job failed'));

    await expect(rebuildAchievements(repo)).rejects.toThrow('Cron job failed');

    repo.em.clear();
    const jobs = await model.getPendingJobs(10);
    expect(jobs).toHaveLength(2);
    expect(jobs.every((job) => job.jobName === 'achievements')).toBe(true);
  });
});
