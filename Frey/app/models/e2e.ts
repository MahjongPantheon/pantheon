import {
  E2eCreateAccountsPayload,
  E2eCreateAccountsResponse,
  E2eEventPlayersPayload,
} from 'tsclients/proto/frey.pb';
import { GenericSuccessResponse } from 'tsclients/proto/atoms.pb';
import { RegisterPlayer, UnregisterPlayer } from 'tsclients/proto/mimir.pb';
import { Context } from '../context';
import { env } from '../helpers/env';
import { verifyHash } from '../helpers/auth';
import { ActionNotAllowedError, DataMalformedError } from '../helpers/errors';
import { createAccount } from './persons';

async function requireE2eSuperadmin(context: Context): Promise<void> {
  if (!env.e2eTestMode || !context.personId || !context.authToken) {
    throw new ActionNotAllowedError(
      'E2e helpers are only available to an authenticated e2e superadmin'
    );
  }

  const person = await context.db
    .selectFrom('person')
    .select(['auth_hash', 'is_superadmin'])
    .where('id', '=', context.personId)
    .executeTakeFirst();
  if (!person || person.is_superadmin !== 1) {
    throw new ActionNotAllowedError('E2e helpers require a superadmin');
  }
  await verifyHash(context.authToken, person.auth_hash);
}

export async function e2eCreateAccounts(
  context: Context,
  payload: E2eCreateAccountsPayload
): Promise<E2eCreateAccountsResponse> {
  await requireE2eSuperadmin(context);
  if (payload.people.length === 0 || payload.people.length > 100) {
    throw new DataMalformedError('Provide between 1 and 100 people');
  }
  if (
    new Set(payload.people.map((person) => person.email.toLowerCase())).size !==
    payload.people.length
  ) {
    throw new DataMalformedError('Email addresses in a batch must be unique');
  }

  const personIds: number[] = [];
  for (const person of payload.people) {
    const created = await createAccount(context.db, context.redisClient, person, {
      ...context,
      isInternalQuery: false,
    });
    personIds.push(created.personId);
  }
  return { personIds };
}

async function e2eChangeEventPlayers(
  context: Context,
  payload: E2eEventPlayersPayload,
  register: boolean
): Promise<GenericSuccessResponse> {
  await requireE2eSuperadmin(context);
  if (
    !Number.isInteger(payload.eventId) ||
    payload.eventId <= 0 ||
    payload.personIds.length === 0 ||
    payload.personIds.length > 100 ||
    payload.personIds.some((id) => !Number.isInteger(id) || id <= 0) ||
    new Set(payload.personIds).size !== payload.personIds.length
  ) {
    throw new DataMalformedError('Provide an event ID and 1 to 100 distinct person IDs');
  }

  const people = await context.db
    .selectFrom('person')
    .select('id')
    .where('id', 'in', payload.personIds)
    .execute();
  if (people.length !== payload.personIds.length) {
    throw new DataMalformedError('All person IDs must exist in Frey');
  }

  const config = {
    baseURL: env.mimirUrl,
    prefix: '/v2',
    headers: {
      'X-Current-Person-Id': String(context.personId),
      'X-Auth-Token': context.authToken!,
    },
  };
  for (const playerId of payload.personIds) {
    const request = { eventId: payload.eventId, playerId };
    if (register) {
      await RegisterPlayer(request, config);
    } else {
      await UnregisterPlayer(request, config);
    }
  }
  return { success: true };
}

export function e2eRegisterPlayers(
  context: Context,
  payload: E2eEventPlayersPayload
): Promise<GenericSuccessResponse> {
  return e2eChangeEventPlayers(context, payload, true);
}

export function e2eUnregisterPlayers(
  context: Context,
  payload: E2eEventPlayersPayload
): Promise<GenericSuccessResponse> {
  return e2eChangeEventPlayers(context, payload, false);
}
