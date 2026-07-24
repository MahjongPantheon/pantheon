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

    const event = await this.repo.db.em.findOneOrFail(
      EventEntity,
      { id: eventId },
      { populate: ['ruleset'] }
    );

    const maxFu = await getMaxFuHand(eventId, this.repo);
    const honoredDonor = await getHonoredDonor(event, this.repo);
    const minFeedScore = await getMinFeedScore(event, this.repo);
    const maxStolenRiichiBetsCount = await getMaxStolenRiichiBetsCount(event, this.repo);
    const minLostRiichiBetsCount = await getMinLostRiichiBetsCount(event, this.repo);
    const bestTsumoist = await getBestTsumoistInSingleSession(event, this.repo);
    const bestDealer = await getBestDealer(event, this.repo);

    achievements.data = {
      andYourRiichiBet: maxStolenRiichiBetsCount,
      bestDealer,
      bestFu: maxFu,
      bestTsumoist,
      carefulPlanning: minFeedScore,
      covetousKnight: minLostRiichiBetsCount,
      honoredDonor,

      // TODO
    };

    await this.repo.db.em.persistAndFlush(achievements);
  }
}

/*

echo 'Running [bestHand] on event #' . $eventId . PHP_EOL;
$processedData['bestHand'] = getBestHandOfEvent($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [braveSapper] on event #' . $eventId . PHP_EOL;
$processedData['braveSapper'] = getBraveSappers($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [dieHard] on event #' . $eventId . PHP_EOL;
$processedData['dieHard'] = getDieHardData($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [dovakins] on event #' . $eventId . PHP_EOL;
$processedData['dovakins'] = getDovakins($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [yakumans] on event #' . $eventId . PHP_EOL;
$processedData['yakumans'] = getYakumans($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [shithander] on event #' . $eventId . PHP_EOL;
$processedData['shithander'] = getBestShithander($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [impossibleWait] on event #' . $eventId . PHP_EOL;
$processedData['impossibleWait'] = getImpossibleWait($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [justAsPlanned] on event #' . $eventId . PHP_EOL;
$processedData['justAsPlanned'] = getJustAsPlanned($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [doraLord] on event #' . $eventId . PHP_EOL;
$processedData['doraLord'] = getMaxAverageDoraCount($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [catchEmAll] on event #' . $eventId . PHP_EOL;
$processedData['catchEmAll'] = getMaxDifferentYakuCount($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [favoriteAsapinApprentice] on event #' . $eventId . PHP_EOL;
$processedData['favoriteAsapinApprentice'] = getFavoriteAsapinApprentice($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [ninja] on event #' . $eventId . PHP_EOL;
$processedData['ninja'] = getNinja($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [needMoreGold] on event #' . $eventId . PHP_EOL;
$processedData['needMoreGold'] = getNeedMoreGold($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [riichiNomi] on event #' . $eventId . PHP_EOL;
$processedData['riichiNomi'] = getRiichiNomi($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
echo 'Running [favoriteTsuchidaApprentice] on event #' . $eventId . PHP_EOL;
$processedData['favoriteTsuchidaApprentice'] = getFavoriteTsuchidaApprentice($ds->local(), [$eventId], $players);
sleep(ACH_SLEEP_INTERVAL);
*/
