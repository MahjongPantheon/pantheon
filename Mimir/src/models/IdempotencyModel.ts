import { createHash } from 'node:crypto';
import { TwirpError } from 'twirpscript';
import { TransactionPropagation } from '@mikro-orm/core';
import { RpcOperationEntity } from '../entities/RpcOperation.entity.js';
import { Model } from './Model.js';

function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, canonical(item)])
    );
  }
  return value;
}

function digest(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex');
}

export class IdempotencyModel extends Model {
  // Validate credentials before looking up a caller's saved response.
  async authenticate() {
    if (this.repo.meta.isInternalQuery) return;
    const personId = this.repo.meta.personId;
    const authToken = this.repo.meta.authToken;
    if (
      !personId ||
      !authToken ||
      !(await this.repo.frey.QuickAuthorize({ personId, authToken })).authSuccess
    ) {
      throw new TwirpError({ code: 'unauthenticated', msg: 'Authentication required' });
    }
  }

  async execute<T extends object>(
    scope: string,
    method: string,
    key: string | null | undefined,
    request: unknown,
    action: () => Promise<T>
  ): Promise<T> {
    if (!key || key.length > 200)
      throw new TwirpError({
        code: 'invalid_argument',
        msg: 'A valid idempotency key is required',
      });
    const id = digest([scope, method, key]);
    const requestHash = digest(request);
    return this.repo.em.transactional(
      async () => {
        // Serialize identical operations across processes. A rollback releases the claim;
        // a commit publishes the business writes and saved response together.
        await this.repo.em.execute('select pg_advisory_xact_lock(hashtextextended(?, 0))', [id]);
        const saved = await this.repo.em.findOne(RpcOperationEntity, { id });
        if (saved) {
          if (saved.requestHash !== requestHash) {
            throw new TwirpError({
              code: 'already_exists',
              msg: 'Idempotency key was already used with different parameters',
            });
          }
          return saved.response as T;
        }
        const response = await action();
        this.repo.em.persist(
          this.repo.em.create(RpcOperationEntity, {
            id,
            requestHash,
            response,
            createdAt: new Date(),
          })
        );
        return response;
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }
}
