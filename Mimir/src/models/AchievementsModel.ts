import { JobsQueueEntity } from '../entities/JobsQueue.entity.js';
import { Model } from './Model.js';
import moment from 'moment-timezone';
import { EventModel } from './EventModel.js';
import { PlayerModel } from './PlayerModel.js';
import {
  EventsGetAchievementsPayload,
  EventsGetAchievementsResponse,
} from 'tsclients/proto/mimir.pb.js';
import { AchievementsEntity } from '../entities/Achievements.entity.js';
import { EventEntity } from '../entities/Event.entity.js';
import { getMaxFuHand } from './achievements/maxFuHand.js';
import { getHonoredDonor } from './achievements/honoredDonor.js';
import { getMinFeedScore } from './achievements/minFeedScore.js';
import { getMaxStolenRiichiBetsCount } from './achievements/maxStolenRiichiBetsCount.js';
import { getMinLostRiichiBetsCount } from './achievements/minLostRiichiBetsCount.js';
import { getBestTsumoistInSingleSession } from './achievements/bestTsumoist.js';
import { getBestDealer } from './achievements/bestDealer.js';
import { getBestHandOfEvent } from './achievements/bestHandOfEvent.js';
import { getBestShithander } from './achievements/bestShithander.js';
import { getBraveSapper } from './achievements/braveSapper.js';
import { getDieHard } from './achievements/dieHard.js';
import { getDovakin } from './achievements/dovakin.js';
import { getFavoriteAsapinApprentice } from './achievements/favoriteAsapinApprentice.js';
import { getFavoriteTsuchidaApprentice } from './achievements/favoriteTsuchidaApprentice.js';
import { getCatchThemAll } from './achievements/catchThemAll.js';
import { getImpossibleWait } from './achievements/impossibleWait.js';
import { getJustAsPlanned } from './achievements/justAsPlanned.js';
import { getMaxAverageDoraCount } from './achievements/maxAverageDoraCount.js';
import { getNeedMoreGold } from './achievements/needMoreGold.js';
import { getNinja } from './achievements/ninja.js';
import { getRiichiNomi } from './achievements/riichiNomi.js';
import { getYakumans } from './achievements/yakumans.js';
import { runWithLimit } from '../helpers/promises.js';
import { filterPersonalData } from '../helpers/filterPersonalData.js';

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
    let players: EventsGetAchievementsResponse['players'] = [];
    let lastUpdate = '';

    if (!events[0].hideAchievements || isAdmin) {
      const achievements = await this.repo.em.findAll(AchievementsEntity, {
        where: {
          event: this.repo.em.getReference(EventEntity, payload.eventId),
        },
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
      const playersIds = achievements[0].getAllPlayersIds();
      players = filterPersonalData(await playerModel.findById(playersIds));
    }

    return {
      achievements: results,
      lastUpdate,
      players,
    };
  }

  async precalculateAchievements(eventId: number) {
    const achievements =
      (await this.repo.em.findOne(AchievementsEntity, {
        event: this.repo.em.getReference(EventEntity, eventId),
      })) ?? new AchievementsEntity();

    const event = await this.repo.em.findOneOrFail(
      EventEntity,
      { id: eventId },
      { populate: ['ruleset'] }
    );

    const { values, errors } = await runWithLimit(
      {
        bestFu: () => getMaxFuHand(eventId, this.repo),
        honoredDonor: () => getHonoredDonor(event, this.repo),
        carefulPlanning: () => getMinFeedScore(event, this.repo),
        andYourRiichiBet: () => getMaxStolenRiichiBetsCount(event, this.repo),
        covetousKnight: () => getMinLostRiichiBetsCount(event, this.repo),
        bestTsumoist: () => getBestTsumoistInSingleSession(event, this.repo),
        bestDealer: () => getBestDealer(event, this.repo),
        bestHand: () => getBestHandOfEvent(event, this.repo),
        shithander: () => getBestShithander(event, this.repo),
        braveSapper: () => getBraveSapper(event, this.repo),
        dieHard: () => getDieHard(event, this.repo),
        dovakins: () => getDovakin(event, this.repo),
        favoriteAsapinApprentice: () => getFavoriteAsapinApprentice(event, this.repo),
        favoriteTsuchidaApprentice: () => getFavoriteTsuchidaApprentice(event, this.repo),
        catchEmAll: () => getCatchThemAll(event, this.repo),
        impossibleWait: () => getImpossibleWait(event, this.repo),
        justAsPlanned: () => getJustAsPlanned(event, this.repo),
        doraLord: () => getMaxAverageDoraCount(event, this.repo),
        needMoreGold: () => getNeedMoreGold(event, this.repo),
        ninja: () => getNinja(event, this.repo),
        riichiNomi: () => getRiichiNomi(event, this.repo),
        yakumans: () => getYakumans(event, this.repo),
      },
      3,
      500
    );

    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, value]) => {
        console.error(`[${key} @ #${event.id}]: Error: ${value}`);
      });
    }

    achievements.data = values;
    achievements.event = event;
    achievements.lastUpdate = new Date().toISOString();

    await this.repo.em.persistAndFlush(achievements);
  }
}
