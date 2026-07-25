import { JobsQueueEntity } from "../entities/JobsQueue.entity.js";
import { Model } from "./Model.js";
import moment from "moment-timezone";
import { EventModel } from "./EventModel.js";
import { PlayerModel } from "./PlayerModel.js";
import {
  EventsGetAchievementsPayload,
  EventsGetAchievementsResponse,
} from "tsclients/proto/mimir.pb.js";
import { AchievementsEntity } from "../entities/Achievements.entity.js";
import { EventEntity } from "../entities/Event.entity.js";
import { getMaxFuHand } from "./achievements/maxFuHand.js";
import { getHonoredDonor } from "./achievements/honoredDonor.js";
import { getMinFeedScore } from "./achievements/minFeedScore.js";
import { getMaxStolenRiichiBetsCount } from "./achievements/maxStolenRiichiBetsCount.js";
import { getMinLostRiichiBetsCount } from "./achievements/minLostRiichiBetsCount.js";
import { getBestTsumoistInSingleSession } from "./achievements/bestTsumoist.js";
import { getBestDealer } from "./achievements/bestDealer.js";
import { getBestHandOfEvent } from "./achievements/bestHandOfEvent.js";
import { getBestShithander } from "./achievements/bestShithander.js";
import { getBraveSapper } from "./achievements/braveSapper.js";
import { getDieHard } from "./achievements/dieHard.js";
import { getDovakin } from "./achievements/dovakin.js";
import { getFavoriteAsapinApprentice } from "./achievements/favoriteAsapinApprentice.js";
import { getFavoriteTsuchidaApprentice } from "./achievements/favoriteTsuchidaApprentice.js";
import { getCatchThemAll } from "./achievements/catchThemAll.js";
import { getImpossibleWait } from "./achievements/impossibleWait.js";
import { getJustAsPlanned } from "./achievements/justAsPlanned.js";
import { getMaxAverageDoraCount } from "./achievements/maxAverageDoraCount.js";
import { getNeedMoreGold } from "./achievements/needMoreGold.js";
import { getNinja } from "./achievements/ninja.js";
import { getRiichiNomi } from "./achievements/riichiNomi.js";
import { getYakumans } from "./achievements/yakumans.js";

export class AchievementsModel extends Model {
  async scheduleRebuildAchievements(eventId: number) {
    const job = new JobsQueueEntity();
    job.createdAt = moment.utc().format("YYYY-MM-DD hh:mm:ss");
    job.jobName = "achievements";
    job.jobArguments = JSON.stringify({ eventId });

    await this.repo.em.persistAndFlush(job);
  }

  async getAchievements(
    payload: EventsGetAchievementsPayload,
  ): Promise<EventsGetAchievementsResponse> {
    const eventModel = this.getModel(EventModel);
    const events = await eventModel.findById([payload.eventId]);
    if (events.length === 0) {
      throw new Error("Event not found");
    }

    const playerModel = this.getModel(PlayerModel);
    const isAdmin =
      this.repo.meta.personId &&
      (await playerModel.isEventAdmin(payload.eventId));

    const results: EventsGetAchievementsResponse["achievements"] = [];
    let lastUpdate = "";

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
        .format("YYYY-MM-DD hh:mm:ss");
      for (const achievement of payload.achievementsList) {
        if (achievementData[achievement as keyof typeof achievementData]) {
          results.push({
            achievementId: achievement,
            achievementData: JSON.stringify(
              achievementData[achievement as keyof typeof achievementData],
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

  async precalculateAchievements(eventId: number) {
    const achievements =
      (await this.repo.em.findOne(AchievementsEntity, {
        event: this.repo.em.getReference(EventEntity, eventId),
      })) ?? new AchievementsEntity();

    const event = await this.repo.em.findOneOrFail(
      EventEntity,
      { id: eventId },
      { populate: ["ruleset"] },
    );

    const bestFu = await getMaxFuHand(eventId, this.repo);
    const honoredDonor = await getHonoredDonor(event, this.repo);
    const carefulPlanning = await getMinFeedScore(event, this.repo);
    const andYourRiichiBet = await getMaxStolenRiichiBetsCount(
      event,
      this.repo,
    );
    const covetousKnight = await getMinLostRiichiBetsCount(event, this.repo);
    const bestTsumoist = await getBestTsumoistInSingleSession(event, this.repo);
    const bestDealer = await getBestDealer(event, this.repo);
    const bestHand = await getBestHandOfEvent(event, this.repo);
    const shithander = await getBestShithander(event, this.repo);
    const braveSapper = await getBraveSapper(event, this.repo);
    const dieHard = await getDieHard(event, this.repo);
    const dovakins = await getDovakin(event, this.repo);
    const favoriteAsapinApprentice = await getFavoriteAsapinApprentice(
      event,
      this.repo,
    );
    const favoriteTsuchidaApprentice = await getFavoriteTsuchidaApprentice(
      event,
      this.repo,
    );
    const catchEmAll = await getCatchThemAll(event, this.repo);
    const impossibleWait = await getImpossibleWait(event, this.repo);
    const justAsPlanned = await getJustAsPlanned(event, this.repo);
    const doraLord = await getMaxAverageDoraCount(event, this.repo);
    const needMoreGold = await getNeedMoreGold(event, this.repo);
    const ninja = await getNinja(event, this.repo);
    const riichiNomi = await getRiichiNomi(event, this.repo);
    const yakumans = await getYakumans(event, this.repo);

    achievements.data = {
      andYourRiichiBet,
      bestDealer,
      bestFu,
      bestHand,
      bestTsumoist,
      braveSapper,
      carefulPlanning,
      catchEmAll,
      covetousKnight,
      dieHard,
      dovakins,
      favoriteAsapinApprentice,
      favoriteTsuchidaApprentice,
      honoredDonor,
      shithander,
      impossibleWait,
      justAsPlanned,
      doraLord,
      needMoreGold,
      ninja,
      riichiNomi,
      yakumans,
    };

    await this.repo.em.persistAndFlush(achievements);
  }
}
