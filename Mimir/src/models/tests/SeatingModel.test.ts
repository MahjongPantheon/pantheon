import { vi } from 'vitest';
import { TournamentGamesStatus, WindShuffleMode } from 'tsclients/proto/atoms.pb.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { PlayerHistoryEntity } from '../../entities/PlayerHistory.entity.js';
import { PenaltyEntity } from '../../entities/Penalty.entity.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { EventPrescriptEntity } from '../../entities/EventPrescript.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { Repository } from '../../services/Repository.js';
import { init } from '../../tests/initOrm.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { Model } from '../Model.js';
import { PenaltyModel } from '../PenaltyModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { PlayerInSessionModel } from '../PlayerInSessionModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { SeatingModel } from '../SeatingModel.js';
import { SessionModel } from '../SessionModel.js';

const orm = await init();
const repo = Repository.instance({}, orm);
repo.mockSkirnir();
const model = Model.getModel(repo, SeatingModel);
const registrations = Model.getModel(repo, EventRegistrationModel);
const sessions = Model.getModel(repo, SessionModel);
const eventId = 19;
const playerIds = [101, 102, 103, 104];
const windShuffleMode = WindShuffleMode.WIND_SHUFFLE_MODE_PRESCRIPTED;
let event: EventEntity;
let regs: EventRegisteredPlayersEntity[];
let ignoredPlayerIds: number[];

const generatedSeatings = [
  {
    name: 'shuffled',
    run: () => model.makeShuffledSeating({ eventId, groupsCount: 1, seed: 42, windShuffleMode }),
    preview: false,
  },
  {
    name: 'Swiss',
    run: () => model.makeSwissSeating({ eventId, windShuffleMode }),
    preview: false,
  },
  {
    name: 'interval',
    run: () => model.makeIntervalSeating({ eventId, step: 1, windShuffleMode }),
    preview: false,
  },
  {
    name: 'Swiss preview',
    run: () =>
      model.generateSwissSeating({ eventId, substituteReplacementPlayers: false, windShuffleMode }),
    preview: true,
  },
];

describe('seating creation', () => {
  beforeEach(() => {
    event = Object.assign(new EventEntity(), {
      id: eventId,
      useTimer: 1,
      gamesStatus: TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED,
    });
    regs = playerIds.map((playerId) =>
      Object.assign(new EventRegisteredPlayersEntity(), { event, playerId, ignoreSeating: 0 })
    );
    ignoredPlayerIds = [];
    // No database writes: retain the in-memory event to detect premature state changes.
    vi.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
    vi.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    vi.spyOn(repo.em, 'persist').mockReturnValue(repo.em);
    vi.spyOn(repo.meta, 'personId', 'get').mockReturnValue(1);
    vi.spyOn(Model.getModel(repo, PlayerModel), 'isEventAdmin').mockResolvedValue(true);
    vi.spyOn(registrations, 'findByEventId').mockImplementation(async () => regs);
    vi.spyOn(registrations, 'findIgnoredPlayersIdsByEvent').mockImplementation(
      async () => ignoredPlayerIds
    );
    vi.spyOn(sessions, 'findByEventAndStatus').mockResolvedValue([]);
    vi.spyOn(sessions, 'startSession').mockReturnValue(new SessionEntity());
    vi.spyOn(Model.getModel(repo, PenaltyModel), 'findByEventId').mockResolvedValue([]);
    vi.spyOn(Model.getModel(repo, PlayerHistoryModel), 'findLastByEvent').mockResolvedValue([]);
    vi.spyOn(
      Model.getModel(repo, PlayerInSessionModel),
      'getPlayersSeatingInEvent'
    ).mockResolvedValue([]);
    vi.spyOn(repo.skirnir, 'messageSeatingReady').mockResolvedValue();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  describe.each(generatedSeatings)('$name', ({ run, preview }) => {
    it.each(['no registrations', 'all players excluded'])(
      'rejects %s without changing event state or starting sessions',
      async (scenario) => {
        if (scenario === 'no registrations') {
          regs = [];
        } else {
          regs.forEach((reg) => (reg.ignoreSeating = 1));
          ignoredPlayerIds = playerIds;
        }

        await expect(run()).rejects.toThrow('Cannot make seating without players');

        expect(event.gamesStatus).toBe(TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED);
        expect(repo.em.persist).not.toHaveBeenCalled();
        expect(sessions.startSession).not.toHaveBeenCalled();
        expect(repo.skirnir.messageSeatingReady).not.toHaveBeenCalled();
      }
    );

    it('creates a table for four eligible players', async () => {
      const result = await run();

      expect(event.gamesStatus).toBe(TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_SEATING_READY);
      expect(repo.em.persist).toHaveBeenCalledWith(event);
      if (preview) {
        expect(result).toEqual({
          tables: [
            { players: expect.arrayContaining(playerIds.map((playerId) => ({ playerId }))) },
          ],
        });
        expect(sessions.startSession).not.toHaveBeenCalled();
        expect(repo.skirnir.messageSeatingReady).not.toHaveBeenCalled();
      } else {
        expect(result).toEqual({ success: true });
        expect(sessions.startSession).toHaveBeenCalledTimes(1);
        expect(sessions.startSession).toHaveBeenCalledWith(
          event,
          expect.arrayContaining(playerIds),
          1
        );
        expect(repo.skirnir.messageSeatingReady).toHaveBeenCalledTimes(1);
        expect(repo.skirnir.messageSeatingReady).toHaveBeenCalledWith(
          expect.arrayContaining(playerIds),
          1,
          eventId
        );
      }
    });
  });

  it('preserves an explicit prescript roster when all players are excluded from generated seating', async () => {
    ignoredPlayerIds = playerIds;
    const prescript = Object.assign(new EventPrescriptEntity(), {
      script: '1-2-3-4',
      nextGame: 0,
    });
    vi.spyOn(repo.em, 'findOne').mockImplementation(async (entity) => {
      return entity === EventPrescriptEntity ? prescript : event;
    });
    vi.spyOn(registrations, 'findLocalIdsMapByEvent').mockResolvedValue(
      new Map(playerIds.map((id, index) => [index + 1, id]))
    );

    await expect(model.makePrescriptedSeating({ eventId, windShuffleMode })).resolves.toEqual({
      success: true,
    });
    expect(sessions.startSession).toHaveBeenCalledWith(event, playerIds, 1);
    expect(repo.skirnir.messageSeatingReady).toHaveBeenCalledWith(playerIds, 1, eventId);
  });
  it.each([undefined, false, true])(
    'enforces seating permissions and finished state (%s)',
    async (referee) => {
      vi.spyOn(Model.getModel(repo, PlayerModel), 'isEventAdmin').mockResolvedValue(false);
      vi.spyOn(Model.getModel(repo, PlayerModel), 'isEventReferee').mockResolvedValue(
        referee ?? false
      );
      if (referee === undefined) vi.spyOn(repo.meta, 'personId', 'get').mockReturnValue(0);
      if (referee) event.finished = 1;
      await expect(model.makeSwissSeating({ eventId })).rejects.toThrow(
        referee ? 'already finished' : 'permissions'
      );
      expect(sessions.startSession).not.toHaveBeenCalled();
    }
  );

  it('rejects missing events, active games and missing or exhausted seating scripts', async () => {
    vi.mocked(repo.em.findOne).mockResolvedValueOnce(null);
    await expect(model.makeSwissSeating({ eventId })).rejects.toThrow('not found');
    vi.mocked(repo.em.findOne).mockResolvedValueOnce(null);
    await expect(
      model.generateSwissSeating({ eventId, substituteReplacementPlayers: false })
    ).rejects.toThrow('not found');
    vi.mocked(sessions.findByEventAndStatus).mockResolvedValueOnce([new SessionEntity()]);
    await expect(model.makeSwissSeating({ eventId })).rejects.toThrow('still in progress');
    vi.mocked(repo.em.findOne).mockResolvedValueOnce(null);
    await expect(model.makePrescriptedSeating({ eventId })).rejects.toThrow('No prescript');
    const prescript = Object.assign(new EventPrescriptEntity(), {
      script: '1-2-3-4',
      nextGame: 10,
    });
    vi.mocked(repo.em.findOne).mockImplementation(async (entity) =>
      entity === EventPrescriptEntity ? prescript : event
    );
    vi.spyOn(registrations, 'findLocalIdsMapByEvent').mockResolvedValue(new Map());
    await expect(model.makePrescriptedSeating({ eventId })).rejects.toThrow(
      'not defined in script'
    );
  });

  it.each([
    WindShuffleMode.WIND_SHUFFLE_MODE_RANDOM,
    WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    WindShuffleMode.WIND_SHUFFLE_MODE_UNSPECIFIED,
  ])('generates replacement-aware previews without a timer (%s)', async (mode) => {
    event.useTimer = 0;
    regs[0].replacementId = 999;
    const result = await model.generateSwissSeating({
      eventId,
      substituteReplacementPlayers: true,
      windShuffleMode: mode,
    });
    expect(
      result.tables.flatMap((table) => table.players.map((p) => p.playerId)).sort((a, b) => a - b)
    ).toEqual([102, 103, 104, 999]);
    expect(event.gamesStatus).toBe(TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED);
    expect(repo.em.persist).not.toHaveBeenCalled();
  });

  it('rates experienced players after penalties and fills the remaining seats from registrations', async () => {
    event.ruleset = RulesetEntity.createRuleset('ema');
    vi.mocked(Model.getModel(repo, PlayerHistoryModel).findLastByEvent).mockResolvedValue([
      Object.assign(new PlayerHistoryEntity(), { playerId: 101, rating: 32000 }),
      Object.assign(new PlayerHistoryEntity(), { playerId: 102, rating: 31000 }),
      Object.assign(new PlayerHistoryEntity(), { playerId: 999, rating: 40000 }),
    ]);
    ignoredPlayerIds = [999];
    vi.mocked(Model.getModel(repo, PenaltyModel).findByEventId).mockResolvedValue([
      Object.assign(new PenaltyEntity(), { playerId: 101, amount: 1000 }),
      Object.assign(new PenaltyEntity(), { playerId: 101, amount: 2000 }),
    ]);
    const result = await model.generateSwissSeating({
      eventId,
      substituteReplacementPlayers: false,
      windShuffleMode,
    });
    expect(result.tables[0].players.map((p) => p.playerId).sort((a, b) => a - b)).toEqual(
      playerIds
    );
  });

  it('rejects resetting a seating that is not ready', async () => {
    await expect(model.resetSeating(eventId)).rejects.toThrow('not in proper state');
  });
});
