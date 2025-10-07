import { Session } from '../database/schema';
import { Database } from '../database/db';
import { findByEventId } from './db/playerRegistration';
import { EventsGetGameResponse } from 'tsclients/proto/mimir.pb';
import { findPlayersForSession } from './db/player';
import { ClientConfiguration } from 'twirpscript';
import { IRedisClient } from '../helpers/cache/RedisClient';
import { findByRepresentationalHash } from './db/session';
import { PersonEx, PlatformType } from 'tsclients/proto/atoms.pb';
import { substituteReplacements } from '../helpers/players';
import { formatGameResult } from '../helpers/formatters';
import { SessionState } from 'helpers/SessionState';
import { createRuleset } from 'rulesets/ruleset';

export type SessionItem = Omit<Session, 'id'> & { id: number };

export async function getSubstitutionPlayers(db: Database, eventId: number) {
  const replacements: Record<number, number> = {};
  const regs = await findByEventId(db, [eventId]);
  for (const reg of regs) {
    if (!reg.player_id || !reg.replacement_id) {
      continue;
    }
    replacements[reg.player_id] = reg.replacement_id;
  }
  return replacements;
}

export async function getFinishedGame(
  db: Database,
  freyConfig: ClientConfiguration,
  cache: IRedisClient,
  representationalHash: string,
  substituteReplacementPlayers = false
): Promise<EventsGetGameResponse> {
  const [session, players] = await Promise.all([
    findByRepresentationalHash(db, [representationalHash]),
    findPlayersForSession(db, freyConfig, cache, representationalHash),
  ]);
  if (session.length === 0) {
    throw new Error('No session found in database');
  }

  const [event, results, rounds, replacements, penalties] = await Promise.all([
    db
      .selectFrom('event')
      .where('id', '=', session[0].event_id)
      .select(['online_platform', 'ruleset_config'])
      .execute(),
    db.selectFrom('session_results').where('session_id', '=', session[0].id).selectAll().execute(),
    db.selectFrom('round').where('session_id', '=', session[0].id).selectAll().execute(),
    substituteReplacementPlayers ? players.replaceMap : new Map<number, PersonEx>(),
    db.selectFrom('penalty').where('session_id', '=', session[0].id).selectAll().execute(),
  ]);

  const ruleset = createRuleset('custom', event[0].ruleset_config);
  const sessionState = SessionState.fromJson(
    ruleset,
    players.players.map((p) => p.id),
    session[0].intermediate_results!
  );

  return {
    players: substituteReplacements(players.players, replacements),
    game: formatGameResult(
      session[0],
      sessionState,
      event[0].online_platform === 'TENHOU'
        ? PlatformType.PLATFORM_TYPE_TENHOUNET
        : event[0].online_platform === 'MAJSOUL'
          ? PlatformType.PLATFORM_TYPE_MAHJONGSOUL
          : PlatformType.PLATFORM_TYPE_UNSPECIFIED,
      players.players.map((p) => p.id),
      results,
      penalties,
      rounds,
      replacements
    ),
  };
}
