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
} from 'tsclients/proto/frey.pb';
import { GenericSuccessResponse } from 'tsclients/proto/atoms.pb';
import { Rights } from '../helpers/rights';
import { IRedisClient } from '../helpers/cache/RedisClient';
import { getSuperadminCacheKey } from '../helpers/cache/schema';
import { Context } from '../context';
import { ActionNotAllowedError, ExistsError, NotFoundError } from '../helpers/errors';
import { verifyHash } from '../helpers/auth';

export async function addRuleForPerson(
  db: Database,
  redisClient: IRedisClient,
  context: Context,
  payload: AccessAddRuleForPersonPayload
): Promise<AccessAddRuleForPersonResponse> {
  const eventAdmins = await getEventAdmins(db, { eventId: payload.eventId });
  const isSuperadmin =
    context.personId &&
    (await getSuperadminFlag(db, redisClient, { personId: context.personId })).isAdmin;
  const isEventAdmin =
    context.personId &&
    eventAdmins.admins.filter((admin) => admin.personId === context.personId).length > 0;

  const regData = await db
    .selectFrom('person')
    .where('id', '=', context.personId)
    .selectAll()
    .execute();
  if (regData.length === 0) {
    throw new NotFoundError('Person is not known ot the system');
  }
  await verifyHash(context.authToken ?? '', regData[0].auth_hash);

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

  const existingRules = await db
    .selectFrom('person_access')
    .selectAll()
    .where((qb) =>
      qb.and([qb('event_id', '=', payload.eventId), qb('person_id', '=', payload.personId)])
    )
    .execute();

  if (existingRules.filter((rule) => rule.acl_name === payload.ruleName).length > 0) {
    throw new ExistsError('This rule already exists');
  }

  const value: RowPersonAccess = {
    acl_name: payload.ruleName,
    acl_value: payload.ruleValue,
    event_id: payload.eventId,
    person_id: payload.personId,
  };
  const result = await db.insertInto('person_access').values(value).returning('id').execute();
  return { ruleId: result[0].id };
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
    context.personId &&
    (await getSuperadminFlag(db, redisClient, { personId: context.personId })).isAdmin;
  const isEventAdmin =
    context.personId &&
    eventAdmins.admins.filter((admin) => admin.personId === context.personId).length > 0;

  const regData = await db
    .selectFrom('person')
    .where('id', '=', context.personId)
    .selectAll()
    .execute();
  if (regData.length === 0) {
    throw new NotFoundError('Person is not known ot the system');
  }
  await verifyHash(context.authToken ?? '', regData[0].auth_hash);

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
    .leftJoin('person', 'person.id', 'person_access.person_id')
    .where((qb) =>
      qb.and([
        qb('event_id', '=', payload.eventId),
        qb('acl_name', '=', Rights.ADMIN_EVENT),
        qb('acl_value', '=', 1),
      ])
    )
    .selectAll('person_access')
    .select(['person.last_update', 'person.has_avatar', 'person.title'])
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
    .leftJoin('person', 'person.id', 'person_access.person_id')
    .where((qb) =>
      qb.and([
        qb('event_id', '=', payload.eventId),
        qb('acl_name', '=', Rights.REFEREE_FOR_EVENT),
        qb('acl_value', '=', 1),
      ])
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
  redisClient: IRedisClient,
  context: Context,
  accessGetOwnedEventIdsPayload: AccessGetOwnedEventIdsPayload
): Promise<AccessGetOwnedEventIdsResponse> {
  const isSuperAdmin = (
    await getSuperadminFlag(db, redisClient, {
      personId: context.personId ?? 0,
    })
  ).isAdmin;

  const result = isSuperAdmin
    ? await db.selectFrom('person_access').select('event_id').distinct().execute()
    : await db
        .selectFrom('person_access')
        .where((qb) =>
          qb.and([
            qb('person_id', '=', accessGetOwnedEventIdsPayload.personId),
            qb('acl_name', 'in', [Rights.ADMIN_EVENT, Rights.REFEREE_FOR_EVENT]),
            qb('acl_value', '=', 1),
          ])
        )
        .select('event_id')
        .execute();
  const isNumber: (n: number | null) => n is number = (n) => typeof n === 'number';
  return {
    eventIds: result.map((e) => e.event_id).filter(isNumber),
  };
}
