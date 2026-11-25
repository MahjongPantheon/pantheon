import { Repository } from '../../services/Repository.js';
import { init } from '../../tests/initOrm.js';
import { makeEvent, makeRegs } from '../../tests/eventFixtures.js';
import { makePlayer } from '../../tests/playerFixtures.js';
import { Model } from '../Model.js';
import { PlayerModel } from '../PlayerModel.js';
import { RefereeNoteModel } from '../RefereeNoteModel.js';
import { RefereeNoteEntity } from '../../entities/RefereeNote.entity.js';

it('persists notes across referees and retains player links after unregistration without crossing events', async () => {
  const orm = await init();
  try {
    await orm.schema.create();
    const repo = Repository.instance({ 'x-current-person-id': '7' }, orm);
    const otherRepo = Repository.instance({ 'x-current-person-id': '8' }, orm);
    for (const repository of [repo, otherRepo]) {
      const players = Model.getModel(repository, PlayerModel);
      vi.spyOn(players, 'isEventAdmin').mockResolvedValue(false);
      vi.spyOn(players, 'isEventReferee').mockResolvedValue(true);
      vi.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));
    }
    const event = makeEvent(repo.em);
    const otherEvent = makeEvent(repo.em);
    const registrations = makeRegs(repo.em, event);
    await repo.em.flush();
    const notes = Model.getModel(repo, RefereeNoteModel);
    const otherReferee = Model.getModel(otherRepo, RefereeNoteModel);
    await notes.addRefereeNote({ eventId: event.id, content: 'Event-wide' });
    await otherReferee.addRefereeNote({ eventId: event.id, content: 'Player note', playerId: 1 });
    await notes.addRefereeNote({ eventId: otherEvent.id, content: 'Other event' });
    repo.em.remove(registrations[0]);
    await repo.em.flush();
    repo.em.clear();
    otherRepo.em.clear();
    const response = await otherReferee.listRefereeNotes(event.id);
    expect(response.notes.map((note) => note.content).sort()).toEqual([
      'Event-wide',
      'Player note',
    ]);
    expect(response.notes.find((note) => note.playerId === 1)).toMatchObject({ authorId: 8 });
    expect(response.authors.map((author) => author.id).sort((a, b) => a - b)).toEqual([7, 8]);
    expect(response.players.map((player) => player.id)).toEqual([1]);
    expect(await repo.em.count(RefereeNoteEntity, {})).toBe(3);
    expect((await notes.listRefereeNotes(otherEvent.id)).notes.map((note) => note.content)).toEqual(
      ['Other event']
    );
  } finally {
    vi.restoreAllMocks();
    await orm.close();
  }
});
