import { makeClientHash, makeHashes, verifyHash } from './auth';

describe('Auth hashing', () => {
  it('should create hash and verify it', async () => {
    const password = 'testpassword';
    const { hash, salt, clientHash } = await makeHashes(password);
    const clientHashVerify = makeClientHash(password, salt);
    expect(clientHashVerify).toEqual(clientHash);
    await verifyHash(clientHash, hash); // should not throw
  });
});

it('rejects an incorrect password', async () => {
  const { hash } = await makeHashes('correct');
  await expect(verifyHash('incorrect', hash)).rejects.toMatchObject({
    code: 'invalid_argument',
    msg: 'Password check failed',
  });
});

it('accepts legacy PHP bcrypt hashes', async () => {
  const { hash, clientHash } = await makeHashes('legacy');
  await expect(verifyHash(clientHash, hash.replace('$2b$', '$2y$'))).resolves.toBeUndefined();
});
