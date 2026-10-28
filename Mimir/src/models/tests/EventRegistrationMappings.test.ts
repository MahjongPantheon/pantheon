import { Model } from '../Model.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import type { Repository } from '../../services/Repository.js';

function fixture() {
  const rows = [101, 202, 303].map((playerId, index) =>
    Object.assign(new EventRegisteredPlayersEntity(), {
      id: index + 10,
      playerId,
      localId: index + 1,
      ignoreSeating: 1,
      replacementId: 999,
      teamName: 'Team',
    })
  );
  const snapshots: unknown[] = [];
  const em = {
    flush: vi.fn(async () => {
      snapshots.push(rows.map((row) => ({ ...row })));
    }),
  };
  const model = Model.getModel({ em } as unknown as Repository, EventRegistrationModel);
  vi.spyOn(model, 'findByEventId').mockResolvedValue(rows);
  return { rows, snapshots, em, model };
}

afterEach(() => vi.restoreAllMocks());

it('renumbers and swaps existing registrations without changing their identity or metadata', async () => {
  const { rows, snapshots, model } = fixture();
  const before = rows.map((row) => ({ ...row }));
  await model.updateLocalIds(42, [
    { playerId: 101, localId: 2 },
    { playerId: 202, localId: 1 },
  ]);
  expect(rows).toEqual([{ ...before[0], localId: 2 }, { ...before[1], localId: 1 }, before[2]]);
  expect(snapshots[0]).toEqual([
    { ...before[0], localId: null },
    { ...before[1], localId: null },
    before[2],
  ]);
  await model.updateLocalIds(42, [{ playerId: 101, localId: 10 }]);
  expect(rows).toHaveLength(3);
  expect(rows[0]).toEqual({ ...before[0], localId: 10 });
});

it.each([
  [[{ playerId: 999, localId: 4 }], 'not registered'],
  [
    [
      { playerId: 101, localId: 4 },
      { playerId: 101, localId: 5 },
    ],
    'more than once',
  ],
  [
    [
      { playerId: 101, localId: 4 },
      { playerId: 202, localId: 4 },
    ],
    'more than once',
  ],
  [[{ playerId: 101, localId: 2 }], 'outside the submitted mapping'],
  ...[0, -1, 1.5, NaN, Infinity, 2147483648].map((localId) => [
    [{ playerId: 101, localId }],
    'positive 32-bit integers',
  ]),
])('rejects invalid mapping %j before changing any registration', async (mapping, error) => {
  const { rows, model, em } = fixture();
  const before = rows.map((row) => ({ ...row }));
  await expect(
    model.updateLocalIds(42, mapping as { playerId: number; localId: number }[])
  ).rejects.toThrow(error);
  expect(rows).toEqual(before);
  expect(em.flush).not.toHaveBeenCalled();
});

it('refuses to choose silently between existing duplicate registrations', async () => {
  const { rows, model, em } = fixture();
  rows.push(Object.assign(new EventRegisteredPlayersEntity(), rows[0], { id: 99, localId: 4 }));
  await expect(model.updateLocalIds(42, [{ playerId: 101, localId: 5 }])).rejects.toThrow(
    'duplicate registrations'
  );
  expect(em.flush).not.toHaveBeenCalled();
});

it('updates and clears team names without changing registrations or other fields', async () => {
  const { rows, model } = fixture();
  const before = rows.map((row) => ({ ...row }));
  await model.updateTeamNames(42, [
    { playerId: 101, teamName: 'East' },
    { playerId: 202, teamName: 'East' },
  ]);
  expect(rows).toEqual([
    { ...before[0], teamName: 'East' },
    { ...before[1], teamName: 'East' },
    before[2],
  ]);
  await model.updateTeamNames(42, [{ playerId: 101, teamName: '' }]);
  expect(rows[0]).toEqual({ ...before[0], teamName: '' });
});

it.each([[{ playerId: 999, teamName: 'Unknown' }], [{ playerId: 101, teamName: 'Duplicate' }]])(
  'validates the whole team mapping before changing registration data: %j',
  async (invalid) => {
    const { rows, model } = fixture();
    const before = rows.map((row) => ({ ...row }));
    await expect(
      model.updateTeamNames(42, [{ playerId: 101, teamName: 'East' }, invalid])
    ).rejects.toThrow();
    expect(rows).toEqual(before);
  }
);

it('rejects team assignments when duplicate registrations already exist', async () => {
  const { rows, model } = fixture();
  rows.push(Object.assign(new EventRegisteredPlayersEntity(), rows[0], { id: 99 }));
  await expect(model.updateTeamNames(42, [{ playerId: 101, teamName: 'East' }])).rejects.toThrow(
    'duplicate registrations'
  );
});
