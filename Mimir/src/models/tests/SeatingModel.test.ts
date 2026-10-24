import { jest } from '@jest/globals';
import { TournamentGamesStatus, WindShuffleMode } from 'tsclients/proto/atoms.pb.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
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
      ruleset: RulesetEntity.createRuleset('ema'),
      useTimer: 1,
      gamesStatus: TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED,
    });
    regs = playerIds.map((playerId) =>
      Object.assign(new EventRegisteredPlayersEntity(), { event, playerId, ignoreSeating: 0 })
    );
    ignoredPlayerIds = [];
    // No database writes: retain the in-memory event to detect premature state changes.
    jest.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
    jest.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    jest.spyOn(repo.em, 'persist').mockReturnValue(repo.em);
    jest.spyOn(repo.meta, 'personId', 'get').mockReturnValue(1);
    jest.spyOn(Model.getModel(repo, PlayerModel), 'isEventAdmin').mockResolvedValue(true);
    jest.spyOn(registrations, 'findByEventId').mockImplementation(async () => regs);
    jest
      .spyOn(registrations, 'findIgnoredPlayersIdsByEvent')
      .mockImplementation(async () => ignoredPlayerIds);
    jest.spyOn(sessions, 'findByEventAndStatus').mockResolvedValue([]);
    jest.spyOn(sessions, 'startSession').mockReturnValue(new SessionEntity());
    jest.spyOn(Model.getModel(repo, PenaltyModel), 'findByEventId').mockResolvedValue([]);
    jest.spyOn(Model.getModel(repo, PlayerHistoryModel), 'findLastByEvent').mockResolvedValue([]);
    jest
      .spyOn(Model.getModel(repo, PlayerInSessionModel), 'getPlayersSeatingInEvent')
      .mockResolvedValue([]);
    jest.spyOn(repo.skirnir, 'messageSeatingReady').mockResolvedValue();
  });
  afterEach(() => {
    jest.restoreAllMocks();
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
    jest.spyOn(repo.em, 'findOne').mockImplementation(async (entity) => {
      return entity === EventPrescriptEntity ? prescript : event;
    });
    jest
      .spyOn(registrations, 'findLocalIdsMapByEvent')
      .mockResolvedValue(new Map(playerIds.map((id, index) => [index + 1, id])));

    await expect(model.makePrescriptedSeating({ eventId, windShuffleMode })).resolves.toEqual({
      success: true,
    });
    expect(sessions.startSession).toHaveBeenCalledWith(event, playerIds, 1);
    expect(repo.skirnir.messageSeatingReady).toHaveBeenCalledWith(playerIds, 1, eventId);
  });
});
