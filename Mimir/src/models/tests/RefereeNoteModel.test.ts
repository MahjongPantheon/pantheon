import { mimirServer } from '../../mimir.js';
import { Model } from '../Model.js';
import { RefereeNoteModel } from '../RefereeNoteModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { RefereeNoteEntity } from '../../entities/RefereeNote.entity.js';
import type { Repository } from '../../services/Repository.js';
import { makePlayer } from '../../tests/playerFixtures.js';

function fixture(personId: number | null = 7) {
  const em = {
    transactional: vi.fn((work: () => Promise<unknown>) => work()),
    findOne: vi.fn().mockResolvedValue({ id: 42 }),
    findAll: vi.fn().mockResolvedValue([]),
    create: vi.fn((entity, values) => Object.assign(new entity(), values)),
    getReference: vi.fn((_entity, id: number) => ({ id })),
    persist: vi.fn(),
  };
  const repo = { em, meta: { personId } } as unknown as Repository;
  const model = Model.getModel(repo, RefereeNoteModel);
  const players = Model.getModel(repo, PlayerModel);
  vi.spyOn(players, 'isEventAdmin').mockResolvedValue(false);
  vi.spyOn(players, 'isEventReferee').mockResolvedValue(false);
  vi.spyOn(players, 'findById').mockResolvedValue([]);
  return { em, model, players, context: { repository: repo } };
}

afterEach(() => vi.restoreAllMocks());

it.each([null, 7])('rejects reading and adding notes for unauthorized caller %s', async (id) => {
  const f = fixture(id);
  await expect(mimirServer.ListRefereeNotes({ eventId: 42 }, f.context)).rejects.toThrow(
    'permissions'
  );
  await expect(
    mimirServer.AddRefereeNote({ eventId: 42, content: 'Private' }, f.context)
  ).rejects.toThrow('permissions');
  expect(f.em.findOne).not.toHaveBeenCalled();
  expect(f.em.findAll).not.toHaveBeenCalled();
  expect(f.em.persist).not.toHaveBeenCalled();
});

it.each(['isEventAdmin', 'isEventReferee'] as const)(
  'allows %s to append an event-wide note with server-owned author and time',
  async (role) => {
    const f = fixture();
    vi.mocked(f.players[role]).mockResolvedValue(true);
    await expect(
      mimirServer.AddRefereeNote(
        { eventId: 42, content: '  Watch table 3\nNext session  ' },
        f.context
      )
    ).resolves.toEqual({ success: true });
    expect(f.em.persist).toHaveBeenCalledWith(
      expect.objectContaining({
        event: { id: 42 },
        authorId: 7,
        content: 'Watch table 3\nNext session',
        playerId: undefined,
        createdAt: expect.any(String),
      })
    );
    expect(new Date(f.em.create.mock.calls[0][1].createdAt).getTime()).toBeGreaterThan(0);
    expect(f.em.findOne).toHaveBeenCalledExactlyOnceWith(EventEntity, 42);
  }
);

it.each(['', ' \n ', 'x'.repeat(5001)])('rejects an empty or oversized note', async (content) => {
  const f = fixture();
  vi.mocked(f.players.isEventReferee).mockResolvedValue(true);
  await expect(f.model.addRefereeNote({ eventId: 42, content })).rejects.toThrow('5000');
  expect(f.em.persist).not.toHaveBeenCalled();
});

it.each([0, -1, 1.5, 999])('rejects invalid or unregistered linked player %s', async (playerId) => {
  const f = fixture();
  vi.mocked(f.players.isEventReferee).mockResolvedValue(true);
  f.em.findOne.mockImplementation(async (entity) => (entity === EventEntity ? { id: 42 } : null));
  await expect(f.model.addRefereeNote({ eventId: 42, content: 'Note', playerId })).rejects.toThrow(
    'registered in this event'
  );
  expect(f.em.persist).not.toHaveBeenCalled();
});

it('accepts a registered player and the maximum note length', async () => {
  const f = fixture();
  vi.mocked(f.players.isEventReferee).mockResolvedValue(true);
  await f.model.addRefereeNote({ eventId: 42, content: 'x'.repeat(5000), playerId: 12 });
  expect(f.em.findOne).toHaveBeenCalledWith(EventRegisteredPlayersEntity, {
    event: 42,
    playerId: 12,
  });
  expect(f.em.persist).toHaveBeenCalledWith(expect.objectContaining({ playerId: 12 }));
});

it('rejects missing events for both reading and writing', async () => {
  const f = fixture();
  vi.mocked(f.players.isEventAdmin).mockResolvedValue(true);
  f.em.findOne.mockResolvedValue(null);
  await expect(f.model.listRefereeNotes(42)).rejects.toThrow('Event not found');
  await expect(f.model.addRefereeNote({ eventId: 42, content: 'Note' })).rejects.toThrow(
    'Event not found'
  );
});

it('scopes notes to the event, newest first, with public display fields for authors and players', async () => {
  const f = fixture();
  vi.mocked(f.players.isEventReferee).mockResolvedValue(true);
  const note = {
    id: 99,
    event: { id: 42 },
    authorId: 7,
    playerId: 12,
    content: 'Private note',
    createdAt: '2026-11-25T00:00:00.000Z',
  };
  f.em.findAll.mockResolvedValue([
    note,
    { ...note, id: 98, playerId: undefined, createdAt: '2026-11-25 00:00:00.000' },
  ]);
  vi.mocked(f.players.findById).mockResolvedValue([makePlayer(7), makePlayer(12)]);
  const response = await mimirServer.ListRefereeNotes({ eventId: 42 }, f.context);
  expect(f.em.findAll).toHaveBeenCalledExactlyOnceWith(RefereeNoteEntity, {
    where: { event: 42 },
    orderBy: { createdAt: 'DESC', id: 'DESC' },
  });
  expect(response.notes).toEqual([
    { ...note, event: undefined },
    { ...note, id: 98, event: undefined, playerId: undefined },
  ]);
  expect(f.players.findById).toHaveBeenCalledExactlyOnceWith([7, 12]);
  expect(response.authors).toEqual([expect.objectContaining({ id: 7 })]);
  expect(response.players).toEqual([expect.objectContaining({ id: 12 })]);
  expect(response.authors[0]).not.toHaveProperty('email');
  expect(response.players[0]).not.toHaveProperty('phone');
});
