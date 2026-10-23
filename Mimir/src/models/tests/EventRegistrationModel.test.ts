import { jest } from '@jest/globals';
import { SessionStatus, TournamentGamesStatus } from 'tsclients/proto/atoms.pb.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { Repository } from '../../services/Repository.js';
import { init } from '../../tests/initOrm.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { Model } from '../Model.js';
import { PlayerModel } from '../PlayerModel.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const registrations = Model.getModel(repo, EventRegistrationModel);
const players = Model.getModel(repo, PlayerModel);

const eventId = 19;
const playerId = 101;
let event: EventEntity;
let registration: EventRegisteredPlayersEntity;
let statuses: SessionStatus[];

// Model this query against current session statuses, including historical finished sessions.
function mockActiveSessions() {
  return jest.spyOn(repo.em, 'count').mockImplementation(async (entity, where) => {
    expect(entity).toBe(SessionEntity);
    expect(where).toEqual({
      event: eventId,
      status: {
        $in: [SessionStatus.SESSION_STATUS_INPROGRESS, SessionStatus.SESSION_STATUS_PREFINISHED],
      },
    });
    return statuses.filter((status) => status !== SessionStatus.SESSION_STATUS_FINISHED).length;
  });
}

async function toggle(ignoreSeating: boolean) {
  return registrations.updatePlayerSeatingFlag({ eventId, playerId, ignoreSeating });
}

describe('player seating flag lifecycle', () => {
  beforeEach(() => {
    event = Object.assign(new EventEntity(), { id: eventId, syncStart: 1, isOnline: 0 });
    registration = Object.assign(new EventRegisteredPlayersEntity(), {
      event,
      playerId,
      ignoreSeating: 0,
    });
    statuses = [];
    jest.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
    jest.spyOn(repo.meta, 'personId', 'get').mockReturnValue(1);
    jest.spyOn(players, 'isEventAdmin').mockResolvedValue(true);
    jest.spyOn(registrations, 'findByPlayerAndEvent').mockResolvedValue([registration]);
    jest.spyOn(repo.em, 'findOneOrFail').mockResolvedValue(event);
    jest.spyOn(repo.em, 'persist').mockReturnValue(repo.em);
    mockActiveSessions();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it('allows exclusion before seating, then rejects reinclusion until seating is reset', async () => {
    await expect(toggle(true)).resolves.toEqual({ success: true });
    event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY;
    statuses = [SessionStatus.SESSION_STATUS_INPROGRESS];
    await expect(toggle(false)).rejects.toThrow('Cannot change seating flags');
    expect(registration.ignoreSeating).toBe(1);

    statuses = [];
    event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED;
    await expect(toggle(false)).resolves.toEqual({ success: true });
    expect(registration.ignoreSeating).toBe(0);
  });

  it.each([SessionStatus.SESSION_STATUS_INPROGRESS, SessionStatus.SESSION_STATUS_PREFINISHED])(
    'rejects inclusion and exclusion with a %s session',
    async (status) => {
      event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED;
      statuses = [SessionStatus.SESSION_STATUS_FINISHED, status];
      for (const ignoreSeating of [true, false]) {
        registration.ignoreSeating = ignoreSeating ? 0 : 1;
        await expect(toggle(ignoreSeating)).rejects.toThrow('Cannot change seating flags');
        expect(registration.ignoreSeating).toBe(ignoreSeating ? 0 : 1);
      }
      expect(repo.em.persist).not.toHaveBeenCalled();
    }
  );

  it('allows both changes between finalized session batches', async () => {
    event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED;
    statuses = [SessionStatus.SESSION_STATUS_FINISHED];
    await expect(toggle(true)).resolves.toEqual({ success: true });
    await expect(toggle(false)).resolves.toEqual({ success: true });
    expect(registration.ignoreSeating).toBe(0);
  });

  it('locks seating-ready events even before tables are returned', async () => {
    event.gamesStatus = TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY;
    await expect(toggle(true)).rejects.toThrow('Cannot change seating flags');
  });

  it.each([
    { syncStart: 1, isOnline: 1 },
    { syncStart: 0, isOnline: 0 },
  ])('preserves existing behavior for event configuration %j', async (configuration) => {
    Object.assign(event, configuration);
    statuses = [SessionStatus.SESSION_STATUS_INPROGRESS];
    await expect(toggle(true)).resolves.toEqual({ success: true });
    await expect(toggle(false)).resolves.toEqual({ success: true });
    expect(repo.em.count).not.toHaveBeenCalled();
  });

  it('still rejects callers without event administration rights', async () => {
    jest.spyOn(players, 'isEventAdmin').mockResolvedValue(false);
    await expect(toggle(true)).rejects.toThrow('necessary permissions');
    expect(repo.em.persist).not.toHaveBeenCalled();
  });
});
