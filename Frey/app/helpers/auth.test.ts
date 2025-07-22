import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { makeClientHash, makeHashes, verifyHash } from './auth';

describe('Auth hashing', () => {
  it('should create hash and verify it', async () => {
    const password = 'testpassword';
    const { hash, salt, clientHash } = await makeHashes(password);
    const clientHashVerify = makeClientHash(password, salt);
    assert.equal(clientHashVerify, clientHash);
    await verifyHash(clientHash, hash); // should not throw
  });
});
