import { MikroORM } from '@mikro-orm/postgresql';
import { SessionStatus } from 'tsclients/proto/atoms.pb.js';
import ormConfig from '../mikro-orm.config.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { repairedRiichiScores } from '../helpers/repairRiichiScores.js';

async function main() {
  const args = process.argv.slice(2);
  let apply = false;
  let eventId: number | undefined;
  for (let index = 0; index < args.length; index++) {
    if (args[index] === '--apply') {
      apply = true;
    } else if (args[index] === '--event' && eventId === undefined) {
      eventId = Number(args[++index]);
      if (!Number.isSafeInteger(eventId) || eventId <= 0) {
        throw new Error('--event requires a positive integer');
      }
    } else {
      throw new Error('Usage: pnpm exec tsx src/scripts/fixRiichiScores.ts [--event ID] [--apply]');
    }
  }

  const orm = await MikroORM.init({ ...ormConfig(), preferTs: true });
  try {
    await orm.em.fork().transactional(async (em) => {
      // Lock candidate sessions until the whole repair commits.
      // The only UPDATE below is guarded by --apply.
      const sessions = await em.execute<{ id: number }[]>(
        `select s.id from session s join event e on e.id = s.event_id
         where s.status = ? and s.intermediate_results is not null
           and e.ruleset_config #>> '{rules,riichiGoesToWinner}' = 'true'
           ${eventId === undefined ? '' : 'and e.id = ?'}
         order by s.id for update of s`,
        eventId === undefined
          ? [SessionStatus.SESSION_STATUS_FINISHED]
          : [SessionStatus.SESSION_STATUS_FINISHED, eventId]
      );
      let changed = 0;
      let skipped = 0;
      for (const { id } of sessions) {
        em.clear();
        const session = await em.findOneOrFail(SessionEntity, id, { populate: ['event'] });
        const saved = session.intermediateResults!;
        if (!saved.riichiBets) continue;
        const lastRound = await em.findOne(
          RoundEntity,
          { session: id },
          { orderBy: { id: 'DESC' }, populate: ['hands'] }
        );
        let scores: Record<number, number>;
        try {
          if (!lastRound) throw new Error('No recorded rounds');
          scores = repairedRiichiScores(session.event.ruleset, saved, lastRound);
        } catch (error) {
          skipped++;
          console.error(JSON.stringify({ sessionId: id, skipped: String(error) }));
          continue;
        }
        if (saved.playerIds.every((playerId) => saved.scores[playerId] === scores[playerId])) {
          continue;
        }
        changed++;
        console.log(
          JSON.stringify({
            sessionId: id,
            eventId: session.event.id,
            before: saved.scores,
            after: scores,
            applied: apply,
          })
        );
        if (apply) {
          await em.execute(
            `update session set intermediate_results = jsonb_set(intermediate_results, '{scores}', ?::jsonb)
             where id = ?`,
            [JSON.stringify(scores), id]
          );
        }
      }
      console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', changed, skipped }));
      if (skipped > 0) process.exitCode = 2;
    });
  } finally {
    await orm.close(true);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
