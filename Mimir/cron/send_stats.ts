import { Repository } from 'src/services/Repository.js';
import { raw, EntityManager } from '@mikro-orm/postgresql';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { JobsQueueEntity } from 'src/entities/JobsQueue.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';

export async function sendStats(repo: Repository) {
  const em: EntityManager = repo.db.em.fork({ useContext: true }) as EntityManager;

  const [playedGames, staleGames, jobsQueueSize, eventsCount, emptyEventsCount, achievementsCount] =
    await Promise.all([
      em.count(SessionEntity, {
        status: SessionStatus.SESSION_STATUS_INPROGRESS,
      }),
      em.count(SessionEntity, {
        status: SessionStatus.SESSION_STATUS_INPROGRESS,
        startDate: { $lt: raw("NOW() - INTERVAL '1' DAY") },
      }),
      em.count(JobsQueueEntity),
      em.count(EventEntity),
      em.execute(
        em
          .getKnex()
          .raw(
            `SELECT COUNT(DISTINCT event.id) as cnt from event LEFT JOIN session ON session.event_id = event.id WHERE session.id IS NULL`
          )
      ),
      em.execute(
        em
          .getKnex()
          .raw(
            `SELECT COUNT(DISTINCT achievements.id) as cnt from achievements JOIN session ON session.event_id = achievements.event_id`
          )
      ),
    ]);

  await fetch(repo.config.huginUrl + '/addMetric', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([
      { m: 'played_games', v: playedGames, s: 'mimir' },
      { m: 'stale_games', v: staleGames, s: 'mimir' },
      { m: 'jobs_queue', v: jobsQueueSize, s: 'mimir' },
      { m: 'events_total_count', v: eventsCount, s: 'mimir' },
      { m: 'events_empty_count', v: +emptyEventsCount[0].cnt, s: 'mimir' },
      { m: 'achievement_entries', v: +achievementsCount[0].cnt, s: 'mimir' },
    ]),
  });
}
