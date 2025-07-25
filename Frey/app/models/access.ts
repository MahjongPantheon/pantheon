import { RowPersonAccess } from '../database/schema';
import { Database } from '../database/db';
import {
  AccessAddRuleForPersonPayload,
  AccessAddRuleForPersonResponse,
  AccessDeleteRuleForPersonPayload,
  AccessGetEventAdminsPayload,
  AccessGetEventAdminsResponse,
  AccessGetEventRefereesPayload,
  AccessGetEventRefereesResponse,
  AccessGetOwnedEventIdsPayload,
  AccessGetOwnedEventIdsResponse,
  AccessGetSuperadminFlagPayload,
  AccessGetSuperadminFlagResponse,
} from '../clients/proto/frey.pb';
import { GenericSuccessResponse } from '../clients/proto/atoms.pb';
import { Rights } from '../helpers/rights';
import { IRedisClient } from '../helpers/cache/RedisClient';
import { getSuperadminCacheKey } from '../helpers/cache/schema';
import { Context } from '../context';
import { ActionNotAllowedError, NotFoundError } from '../helpers/errors';

export async function addRuleForPerson(
  db: Database,
  redisClient: IRedisClient,
  context: Context,
  payload: AccessAddRuleForPersonPayload
): Promise<AccessAddRuleForPersonResponse> {
  const eventAdmins = await getEventAdmins(db, { eventId: payload.eventId });
  const isSuperadmin =
    context.personId && (await getSuperadminFlag(db, redisClient, { personId: context.personId }));
  const isEventAdmin =
    context.personId &&
    eventAdmins.admins.filter((admin) => admin.personId === context.personId).length > 0;

  // Separate checks for add admin in the event
  if (
    payload.ruleName === Rights.ADMIN_EVENT &&
    context.personId !== null &&
    payload.eventId !== -1
  ) {
    if (context.personId === payload.personId) {
      // Throw if we already have admins in this event; otherwise it's a bootstrapping of first admin
      if (eventAdmins.admins.length > 0) {
        throw new ActionNotAllowedError(
          'You are not allowed to add yourself to administrators in this event'
        );
      }
    } else {
      if (!isEventAdmin && !isSuperadmin) {
        throw new ActionNotAllowedError('You are not allowed to add administrators in this event');
      }
    }
  } else if (payload.ruleName === Rights.REFEREE_FOR_EVENT) {
    if (!isEventAdmin && !isSuperadmin) {
      throw new ActionNotAllowedError('You are not allowed to add referees in this event');
    }
  } else {
    if (!isSuperadmin) {
      throw new ActionNotAllowedError('Unknown rule to add');
    }
  }

  const value: RowPersonAccess = {
    acl_name: payload.ruleName,
    acl_value: payload.ruleValue.boolValue === true ? 1 : 0,
    event_id: payload.eventId,
    person_id: payload.personId,
  };
  const result = await db
    .insertInto('person_access')
    .values(value)
    .onConflict((oc) =>
      oc.constraint('person_access_person_id_acl_name_event_id').doUpdateSet(value)
    )
    .execute();
  return { ruleId: Number(result[0].insertId) };
}

export async function deleteRuleForPerson(
  db: Database,
  redisClient: IRedisClient,
  context: Context,
  payload: AccessDeleteRuleForPersonPayload
): Promise<GenericSuccessResponse> {
  const rule = await db
    .selectFrom('person_access')
    .selectAll()
    .where('id', '=', payload.ruleId)
    .execute();
  if (rule.length === 0) {
    throw new NotFoundError('Rule does not exist');
  }

  const eventAdmins =
    rule[0].event_id === -1
      ? { admins: [] }
      : await getEventAdmins(db, { eventId: rule[0].event_id });
  const isSuperadmin =
    context.personId && (await getSuperadminFlag(db, redisClient, { personId: context.personId }));
  const isEventAdmin =
    context.personId &&
    rule[0].event_id === -1 &&
    eventAdmins.admins.filter((admin) => admin.personId === context.personId).length > 0;

  // Separate checks for add admin in the event
  if (
    rule[0].acl_name === Rights.ADMIN_EVENT &&
    context.personId !== null &&
    rule[0].event_id !== -1
  ) {
    if (context.personId === rule[0].person_id) {
      throw new ActionNotAllowedError(
        'You are not allowed to remove yourself from administrators in this event'
      );
    } else {
      if (!isEventAdmin && !isSuperadmin) {
        throw new ActionNotAllowedError(
          'You are not allowed to remove administrators from this event'
        );
      }
    }
  } else if (rule[0].acl_name === Rights.REFEREE_FOR_EVENT) {
    if (!isEventAdmin && !isSuperadmin) {
      throw new ActionNotAllowedError('You are not allowed to remove referees from this event');
    }
  } else {
    if (!isSuperadmin) {
      throw new ActionNotAllowedError('Unknown rule to remove');
    }
  }

  await db.deleteFrom('person_access').where('id', '=', payload.ruleId).execute();
  return { success: true };
}

export async function getSuperadminFlag(
  db: Database,
  redisClient: IRedisClient,
  payload: AccessGetSuperadminFlagPayload
): Promise<AccessGetSuperadminFlagResponse> {
  const cached = await redisClient.get<boolean | null>(
    getSuperadminCacheKey(payload.personId),
    null
  );
  if (cached !== null) {
    return { isAdmin: cached };
  }

  const result = await db
    .selectFrom('person')
    .where('id', '=', payload.personId)
    .select(['is_superadmin', 'auth_hash'])
    .execute();

  const response = result.length > 0 && !!result[0].is_superadmin;
  if (result.length > 0) {
    await redisClient.set<boolean>(getSuperadminCacheKey(payload.personId), response);
  }
  return { isAdmin: response };
}

export async function getEventAdmins(
  db: Database,
  payload: AccessGetEventAdminsPayload
): Promise<AccessGetEventAdminsResponse> {
  const result = await db
    .selectFrom('person_access')
    .leftJoin('person', 'person_id', 'person_access.person_id')
    .where((qb) =>
      qb.and([qb('event_id', '=', payload.eventId), qb('acl_name', '=', Rights.ADMIN_EVENT)])
    )
    .selectAll()
    .execute();
  return {
    admins: result.map((r) => ({
      ruleId: r.id ?? 0,
      personId: r.person_id,
      personName: r.title ?? '',
      lastUpdate: (r.last_update ? new Date(r.last_update) : new Date()).toISOString(),
      hasAvatar: r.has_avatar === 1,
    })),
  };
}

export async function getEventReferees(
  db: Database,
  payload: AccessGetEventRefereesPayload
): Promise<AccessGetEventRefereesResponse> {
  const result = await db
    .selectFrom('person_access')
    .leftJoin('person', 'person_id', 'person_access.person_id')
    .where((qb) =>
      qb.and([qb('event_id', '=', payload.eventId), qb('acl_name', '=', Rights.REFEREE_FOR_EVENT)])
    )
    .selectAll()
    .execute();
  return {
    referees: result.map((r) => ({
      ruleId: r.id ?? 0,
      personId: r.person_id,
      personName: r.title ?? '',
      lastUpdate: (r.last_update ? new Date(r.last_update) : new Date()).toISOString(),
      hasAvatar: r.has_avatar === 1,
    })),
  };
}

export async function getOwnedEventIds(
  db: Database,
  accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload
): Promise<AccessGetOwnedEventIdsResponse> {
  const result = await db
    .selectFrom('person_access')
    .where((qb) =>
      qb.and([
        qb('person_id', '=', accessGetOwnedEventIdsPayload.personId),
        qb('acl_name', 'in', [Rights.ADMIN_EVENT, Rights.REFEREE_FOR_EVENT]),
      ])
    )
    .selectAll()
    .execute();
  const isNumber: (n: number | null) => n is number = (n) => typeof n === 'number';
  return {
    eventIds: result.map((e) => e.event_id).filter(isNumber),
  };
}
