import { Repository } from '../src/services/Repository.js';
import { raw } from '@mikro-orm/postgresql';
import { SessionEntity } from '../src/entities/Session.entity.js';
import { SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { JobsQueueEntity } from '../src/entities/JobsQueue.entity.js';
import { EventEntity } from '../src/entities/Event.entity.js';
import { settleJobs } from './settleJobs.js';

export async function sendStats(repo: Repository) {
  const em = repo.em;

  const [playedGames, staleGames, jobsQueueSize, eventsCount, emptyEventsCount, achievementsCount] =
    await settleJobs([
      () =>
        em.count(SessionEntity, {
          status: SessionStatus.SESSION_STATUS_INPROGRESS,
        }),
      () =>
        em.count(SessionEntity, {
          status: SessionStatus.SESSION_STATUS_INPROGRESS,
          startDate: { $lt: raw("NOW() - INTERVAL '1' DAY") },
        }),
      () => em.count(JobsQueueEntity),
      () => em.count(EventEntity),
      () =>
        em.execute(
          em
            .getKnex()
            .raw(
              `SELECT COUNT(DISTINCT event.id) as cnt from event LEFT JOIN session ON session.event_id = event.id WHERE session.id IS NULL`
            )
        ),
      () =>
        em.execute(
          em
            .getKnex()
            .raw(
              `SELECT COUNT(DISTINCT achievements.id) as cnt from achievements JOIN session ON session.event_id = achievements.event_id`
            )
        ),
    ]);

  const response = await fetch(repo.config.huginUrl + '/addMetric', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify([
      { m: 'played_games', v: playedGames, s: 'mimir' },
      { m: 'stale_games', v: staleGames, s: 'mimir' },
      { m: 'jobs_queue', v: jobsQueueSize, s: 'mimir' },
      { m: 'events_total_count', v: eventsCount, s: 'mimir' },
      { m: 'events_empty_count', v: +emptyEventsCount[0].cnt, s: 'mimir' },
      { m: 'achievement_entries', v: +achievementsCount[0].cnt, s: 'mimir' },
    ]),
  });

  await response.arrayBuffer();
  if (!response.ok) {
    throw new Error(`Metrics request failed: HTTP ${response.status}`);
  }
  return 6;
}
