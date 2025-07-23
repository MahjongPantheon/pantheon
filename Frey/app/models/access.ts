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

export async function addRuleForPerson(
  db: Database,
  payload: AccessAddRuleForPersonPayload
): Promise<AccessAddRuleForPersonResponse> {
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
  payload: AccessDeleteRuleForPersonPayload
): Promise<GenericSuccessResponse> {
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
    .select('is_superadmin')
    .execute();
  const response = result.length > 0 && !!result[0].is_superadmin;
  await redisClient.set<boolean>(getSuperadminCacheKey(payload.personId), response);
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
