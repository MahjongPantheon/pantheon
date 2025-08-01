import {
  AuthApproveRegistrationPayload,
  AuthApproveRegistrationResponse,
  AuthApproveResetPasswordPayload,
  AuthApproveResetPasswordResponse,
  AuthAuthorizePayload,
  AuthAuthorizeResponse,
  AuthChangePasswordPayload,
  AuthChangePasswordResponse,
  AuthMeResponse,
  AuthQuickAuthorizePayload,
  AuthQuickAuthorizeResponse,
  AuthRequestRegistrationPayload,
  AuthRequestRegistrationResponse,
  AuthRequestResetPasswordPayload,
  AuthRequestResetPasswordResponse,
} from '../clients/proto/frey.pb';
import { makeClientHash, makeHashes, verifyHash } from '../helpers/auth';
import { Database } from '../database/db';
import { emailRe } from '../helpers/email';
import { calcPasswordStrength, sha1 } from '../helpers/crypto';
import { sendAlreadyRegisteredMail, sendPasswordRecovery, sendSignupMail } from '../helpers/mailer';
import { Context } from '../context';
import { getCachedPersonalData } from '../helpers/cache/personalData';
import { IRedisClient } from '../helpers/cache/RedisClient';
import { getPersonalInfoCacheKey } from '../helpers/cache/schema';

import {
  ActionNotAllowedError,
  DataMalformedError,
  ExistsError,
  InvalidInputError,
  NotFoundError,
} from '../helpers/errors';
import { env } from 'helpers/env';

export async function authorize(
  db: Database,
  payload: AuthAuthorizePayload
): Promise<AuthAuthorizeResponse> {
  const personData = await db
    .selectFrom('person')
    .where('email', '=', payload.email)
    .select(['auth_salt', 'auth_hash', 'id'])
    .execute();

  if (personData.length === 0) {
    throw new NotFoundError('Person not found in database');
  }

  const authToken = makeClientHash(payload.password, personData[0].auth_salt);
  await verifyHash(authToken, personData[0].auth_hash);
  return { personId: personData[0].id, authToken };
}

export async function approveRegistration(
  db: Database,
  payload: AuthApproveRegistrationPayload
): Promise<AuthApproveRegistrationResponse> {
  const regData = await db
    .selectFrom('registrant')
    .where('approval_code', '=', payload.approvalCode)
    .selectAll()
    .execute();

  if (regData.length === 0) {
    throw new InvalidInputError('Approval code is invalid');
  }

  const personData = await db
    .selectFrom('person')
    .where('email', '=', regData[0].email)
    .select(['id'])
    .execute();

  if (personData.length > 0) {
    throw new ExistsError('Email is already registered');
  }

  const ret = await db
    .insertInto('person')
    .values({
      email: regData[0].email,
      auth_salt: regData[0].auth_salt,
      auth_hash: regData[0].auth_hash,
      title: regData[0].title,
      disabled: 0,
      country: '',
    })
    .returning('id')
    .execute();

  await db.deleteFrom('registrant').where('approval_code', '=', payload.approvalCode).execute();

  return { personId: ret[0].id };
}

export async function approveResetPassword(
  db: Database,
  redisClient: IRedisClient,
  payload: AuthApproveResetPasswordPayload
): Promise<AuthApproveResetPasswordResponse> {
  const regData = await db
    .selectFrom('person')
    .where('email', '=', payload.email)
    .selectAll()
    .execute();

  if (regData.length === 0) {
    throw new NotFoundError('Email is not known to the system');
  }

  if (payload.resetToken === '' || regData[0].auth_reset_token !== payload.resetToken) {
    throw new InvalidInputError('Password reset approval code is incorrect.');
  }

  const newPassword = sha1(payload.email + Date.now().toString()).slice(0, 8);
  const tokens = await makeHashes(newPassword);

  const promises = [];
  promises.push(
    db
      .updateTable('person')
      .set({
        email: regData[0].email,
        auth_salt: tokens.salt,
        auth_hash: tokens.hash,
      })
      .where('id', '=', regData[0].id)
      .execute()
  );
  promises.push(redisClient.remove(getPersonalInfoCacheKey(regData[0].id)));

  await Promise.all(promises);

  return { newTmpPassword: newPassword };
}

export async function changePassword(
  db: Database,
  redisClient: IRedisClient,
  payload: AuthChangePasswordPayload
): Promise<AuthChangePasswordResponse> {
  const regData = await db
    .selectFrom('person')
    .where('email', '=', payload.email)
    .selectAll()
    .execute();

  if (regData.length === 0) {
    throw new NotFoundError('Email is not known to the system');
  }

  await verifyHash(makeClientHash(payload.password, regData[0].auth_salt), regData[0].auth_hash);

  if (calcPasswordStrength(payload.newPassword) < 14) {
    throw new InvalidInputError('Password is too weak');
  }

  const tokens = await makeHashes(payload.newPassword);

  const promises = [];
  promises.push(
    db
      .updateTable('person')
      .set({
        email: regData[0].email,
        auth_salt: tokens.salt,
        auth_hash: tokens.hash,
      })
      .where('id', '=', regData[0].id)
      .execute()
  );
  promises.push(redisClient.remove(getPersonalInfoCacheKey(regData[0].id)));

  await Promise.all(promises);
  return { authToken: tokens.clientHash };
}

export async function me(
  db: Database,
  redisClient: IRedisClient,
  context: Context
): Promise<AuthMeResponse> {
  if (!context.personId || !context.authToken) {
    throw new ActionNotAllowedError('Should be logged in to use this function');
  }

  const data = await getCachedPersonalData(db, redisClient, context.personId);

  if (data.length === 0) {
    throw new NotFoundError('Person is not known to the system');
  }

  const [personData] = data;

  await verifyHash(context.authToken, personData.auth_hash);

  return {
    personId: context.personId,
    country: personData.country,
    city: personData.city ?? '',
    email: personData.email,
    phone: personData.phone ?? '',
    tenhouId: personData.tenhou_id ?? '',
    title: personData.title,
    hasAvatar: !!personData.has_avatar,
    lastUpdate: personData.last_update ?? '',
  };
}

export async function quickAuthorize(
  db: Database,
  redisClient: IRedisClient,
  payload: AuthQuickAuthorizePayload
): Promise<AuthQuickAuthorizeResponse> {
  const personData = await getCachedPersonalData(db, redisClient, payload.personId);
  if (personData.length === 0) {
    throw new NotFoundError('Person is not known to the system');
  }
  await verifyHash(payload.authToken, personData[0].auth_hash);
  return { authSuccess: true };
}

export async function requestRegistration(
  db: Database,
  payload: AuthRequestRegistrationPayload
): Promise<AuthRequestRegistrationResponse> {
  if (!emailRe.test(payload.email)) {
    throw new DataMalformedError('Email address is malformed');
  }

  if (calcPasswordStrength(payload.password) < 14) {
    throw new InvalidInputError('Password is too weak');
  }

  const alreadyRegistered =
    (await db.selectFrom('person').where('email', '=', payload.email).select('id').execute())
      .length > 0;

  if (alreadyRegistered) {
    if (env.development) {
      throw new ExistsError('Already registered');
    } else {
      await sendAlreadyRegisteredMail(payload.email);
      return { approvalCode: '' };
    }
  }

  const tokens = await makeHashes(payload.password);
  const approvalCode = sha1(payload.email + Date.now().toString());
  await db
    .insertInto('registrant')
    .values({
      email: payload.email,
      auth_salt: tokens.salt,
      auth_hash: tokens.hash,
      title: payload.title,
      approval_code: approvalCode,
    })
    .execute();

  if (!env.development) {
    await sendSignupMail(payload.email, '/profile/confirm/' + approvalCode);
    return { approvalCode: '' };
  }

  return { approvalCode };
}

export async function requestResetPassword(
  db: Database,
  redisClient: IRedisClient,
  payload: AuthRequestResetPasswordPayload
): Promise<AuthRequestResetPasswordResponse> {
  const result = await db
    .selectFrom('person')
    .where('email', '=', payload.email)
    .select('id')
    .execute();

  if (result.length === 0) {
    throw new NotFoundError('Email in not known to auth system');
  }

  const token = sha1(payload.email + Date.now().toString());

  const promises = [];
  promises.push(
    db
      .updateTable('person')
      .set({ auth_reset_token: token })
      .where('id', '=', result[0].id)
      .execute()
  );
  promises.push(redisClient.remove(getPersonalInfoCacheKey(result[0].id)));

  if (!env.development) {
    promises.push(sendPasswordRecovery(token, payload.email));
    await Promise.all(promises);
    return { resetToken: '' };
  }

  await Promise.all(promises);
  return { resetToken: token };
}
