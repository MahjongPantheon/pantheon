import { JobsQueueEntity } from 'src/entities/JobsQueue.entity.js';
import { Model } from './Model.js';
import moment from 'moment-timezone';
import { EventModel } from './EventModel.js';
import { PlayerModel } from './PlayerModel.js';
import {
  EventsGetAchievementsPayload,
  EventsGetAchievementsResponse,
} from 'tsclients/proto/mimir.pb.js';
import { AchievementsEntity } from 'src/entities/Achievements.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';

export class AchievementsModel extends Model {
  async scheduleRebuildAchievements(eventId: number) {
    const job = new JobsQueueEntity();
    job.createdAt = moment.utc().format('YYYY-MM-DD hh:mm:ss');
    job.jobName = 'achievements';
    job.jobArguments = JSON.stringify({ eventId });

    await this.repo.em.persistAndFlush(job);
  }

  async getAchievements(
    payload: EventsGetAchievementsPayload
  ): Promise<EventsGetAchievementsResponse> {
    const eventModel = this.getModel(EventModel);
    const events = await eventModel.findById([payload.eventId]);
    if (events.length === 0) {
      throw new Error('Event not found');
    }

    const playerModel = this.getModel(PlayerModel);
    const isAdmin = this.repo.meta.personId && (await playerModel.isEventAdmin(payload.eventId));

    const results: EventsGetAchievementsResponse['achievements'] = [];
    let lastUpdate = '';

    if (!events[0].hideAchievements || isAdmin) {
      const achievements = await this.repo.db.em.findAll(AchievementsEntity, {
        where: { event: this.repo.db.em.getReference(EventEntity, payload.eventId) },
      });
      const achievementData = achievements[0].data;
      lastUpdate = moment
        .utc(achievements[0].lastUpdate)
        .tz(events[0].timezone)
        .format('YYYY-MM-DD hh:mm:ss');
      for (const achievement of payload.achievementsList) {
        if (achievementData[achievement as keyof typeof achievementData]) {
          results.push({
            achievementId: achievement,
            achievementData: JSON.stringify(
              achievementData[achievement as keyof typeof achievementData]
            ),
          });
        }
      }
    }

    return {
      achievements: results,
      lastUpdate,
    };
  }
}
