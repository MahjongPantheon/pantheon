import { vi } from 'vitest';
import { Context } from '../context';
import { env } from '../helpers/env';
import { ActionNotAllowedError, DataMalformedError, InvalidInputError } from '../helpers/errors';
import { verifyHash } from '../helpers/auth';
import { createAccount } from './persons';
import { RegisterPlayer, UnregisterPlayer } from 'tsclients/proto/mimir.pb';
import { e2eCreateAccounts, e2eRegisterPlayers, e2eUnregisterPlayers } from './e2e';

vi.mock('../helpers/auth', () => ({ verifyHash: vi.fn() }));
vi.mock('./persons', () => ({ createAccount: vi.fn() }));
vi.mock('tsclients/proto/mimir.pb', () => ({
  RegisterPlayer: vi.fn(),
  UnregisterPlayer: vi.fn(),
}));

const originalE2eMode = env.e2eTestMode;

function context(isSuperadmin = 1): Context {
  const query = {
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    executeTakeFirst: vi.fn().mockResolvedValue({ auth_hash: 'hash', is_superadmin: isSuperadmin }),
    execute: vi.fn().mockResolvedValue([{ id: 10 }, { id: 11 }]),
  };
  return {
    personId: 1,
    authToken: 'token',
    isInternalQuery: false,
    db: { selectFrom: vi.fn().mockReturnValue(query) },
  } as unknown as Context;
}

beforeEach(() => {
  vi.clearAllMocks();
  env.e2eTestMode = true;
});

afterAll(() => {
  env.e2eTestMode = originalE2eMode;
});

it('denies every helper when e2e mode is off, even with superadmin credentials', async () => {
  env.e2eTestMode = false;
  const admin = context();
  await expect(e2eCreateAccounts(admin, { people: [] })).rejects.toBeInstanceOf(
    ActionNotAllowedError
  );
  await expect(e2eRegisterPlayers(admin, { eventId: 1, personIds: [10] })).rejects.toBeInstanceOf(
    ActionNotAllowedError
  );
  await expect(e2eUnregisterPlayers(admin, { eventId: 1, personIds: [10] })).rejects.toBeInstanceOf(
    ActionNotAllowedError
  );
  expect(admin.db.selectFrom).not.toHaveBeenCalled();
});

it('requires a real superadmin and validates the authentication token', async () => {
  await expect(e2eCreateAccounts(context(0), { people: [] })).rejects.toBeInstanceOf(
    ActionNotAllowedError
  );
  expect(verifyHash).not.toHaveBeenCalled();
  await expect(e2eCreateAccounts(context(), { people: [] })).rejects.toBeInstanceOf(
    DataMalformedError
  );
  expect(verifyHash).toHaveBeenCalledWith('token', 'hash');

  vi.mocked(verifyHash).mockRejectedValueOnce(new InvalidInputError('Password check failed'));
  await expect(e2eCreateAccounts(context(), { people: [] })).rejects.toBeInstanceOf(
    InvalidInputError
  );
  expect(createAccount).not.toHaveBeenCalled();
});

it('creates a batch and returns person IDs in input order', async () => {
  vi.mocked(createAccount)
    .mockResolvedValueOnce({ personId: 10 })
    .mockResolvedValueOnce({ personId: 11 });
  const admin = context();
  const people = [
    {
      email: 'one@test.example',
      password: 'password',
      title: 'One',
      city: '',
      phone: '',
      tenhouId: '',
      country: '',
    },
    {
      email: 'two@test.example',
      password: 'password',
      title: 'Two',
      city: '',
      phone: '',
      tenhouId: '',
      country: '',
    },
  ];
  await expect(e2eCreateAccounts(admin, { people })).resolves.toEqual({ personIds: [10, 11] });
  expect(createAccount).toHaveBeenCalledTimes(2);
  expect(vi.mocked(createAccount).mock.calls[0][3].isInternalQuery).toBe(false);
});

it('registers and unregisters each person through Mimir with the admin identity', async () => {
  const admin = context();
  const payload = { eventId: 7, personIds: [10, 11] };
  await expect(e2eRegisterPlayers(admin, payload)).resolves.toEqual({ success: true });
  await expect(e2eUnregisterPlayers(admin, payload)).resolves.toEqual({ success: true });
  expect(RegisterPlayer).toHaveBeenCalledTimes(2);
  expect(UnregisterPlayer).toHaveBeenCalledTimes(2);
  expect(RegisterPlayer).toHaveBeenCalledWith(
    { eventId: 7, playerId: 10 },
    expect.objectContaining({
      headers: { 'X-Current-Person-Id': '1', 'X-Auth-Token': 'token' },
    })
  );
});

it('rejects duplicate IDs before changing event registrations', async () => {
  await expect(
    e2eRegisterPlayers(context(), { eventId: 7, personIds: [10, 10] })
  ).rejects.toBeInstanceOf(DataMalformedError);
  expect(RegisterPlayer).not.toHaveBeenCalled();
});
