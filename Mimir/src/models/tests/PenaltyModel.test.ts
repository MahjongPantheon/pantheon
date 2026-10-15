import { jest } from '@jest/globals';
import { Model } from '../Model.js';
import { PenaltyModel } from '../PenaltyModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { EventModel } from '../EventModel.js';
import { RoundModel } from '../RoundModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { PlayerStatsModel } from '../PlayerStatsModel.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { SessionResultsEntity } from '../../entities/SessionResults.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { HandEntity } from '../../entities/Hand.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';

const orm = await init();
const repo = Repository.instance({ 'x-current-person-id': '1' }, orm);
const model = Model.getModel(repo, PenaltyModel);
const players = Model.getModel(repo, PlayerModel);
const events = Model.getModel(repo, EventModel);
const history = Model.getModel(repo, PlayerHistoryModel);
const stats = Model.getModel(repo, PlayerStatsModel);
const rounds = Model.getModel(repo, RoundModel);
const playerData = [1, 2, 3, 4].map(makePlayer);

describe('Penalty games', () => {
  beforeEach(() => {
    // Persistence is mocked here; transaction behavior has its own database-backed tests.
    jest.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it('assigns the fixed replacement penalty to all four players and schedules statistics', async () => {
    const event = Object.assign(new EventEntity(), {
      id: 19,
      ruleset: RulesetEntity.createRuleset('ema'),
    });
    event.ruleset.rules.replacementPlayerFixedPoints = -30000;
    jest.spyOn(players, 'isEventAdmin').mockResolvedValue(true);
    jest.spyOn(players, 'findById').mockResolvedValue(playerData);
    jest.spyOn(events, 'findById').mockResolvedValue([event]);
    jest.spyOn(repo.em, 'execute').mockResolvedValue([{ id: 21 }]);
    const persist = jest.spyOn(repo.em, 'persist');
    jest.spyOn(repo.em, 'flush').mockResolvedValue();
    const newHistory = jest.spyOn(history, 'makeNewHistoryItem').mockResolvedValue();
    const schedule = jest.spyOn(stats, 'scheduleRebuildPlayersStats').mockResolvedValue();
    const result = await model.addPenaltyGame({ eventId: 19, players: [1, 2, 3, 4] });
    expect(result.sessionHash).toMatch(/^[a-f0-9]+$/);
    const entities = persist.mock.calls.flatMap(([entity]) =>
      Array.isArray(entity) ? entity : [entity]
    );
    const results = [
      ...new Set(entities.filter((entity) => entity instanceof SessionResultsEntity)),
    ] as SessionResultsEntity[];
    expect(
      results.map((item) => ({
        playerId: item.playerId,
        ratingDelta: item.ratingDelta,
        score: item.score,
      }))
    ).toEqual(
      playerData.map(({ id }) => ({
        playerId: id,
        ratingDelta: -30000,
        score: event.ruleset.rules.startPoints,
      }))
    );
    const session = entities.find((entity) => entity instanceof SessionEntity) as SessionEntity;
    expect(session.status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
    expect(session.endDate).toBeDefined();
    expect(newHistory).toHaveBeenCalledTimes(4);
    expect(newHistory).toHaveBeenCalledWith(event.ruleset, 1, 19, 21, -30000, 1);
    expect(schedule).toHaveBeenCalledWith(19);
  });

  it('requires administrator rights before adding a penalty game', async () => {
    jest.spyOn(players, 'isEventAdmin').mockResolvedValue(false);
    const find = jest.spyOn(events, 'findById');
    await expect(model.addPenaltyGame({ eventId: 19, players: [1, 2, 3, 4] })).rejects.toThrow(
      'necessary permissions'
    );
    expect(find).not.toHaveBeenCalled();
  });

  it('rejects missing events and incomplete player lists', async () => {
    jest.spyOn(players, 'isEventAdmin').mockResolvedValue(true);
    const find = jest.spyOn(events, 'findById').mockResolvedValue([]);
    await expect(model.addPenaltyGame({ eventId: 19, players: [1, 2, 3, 4] })).rejects.toThrow(
      'Event not found'
    );
    find.mockResolvedValue([new EventEntity()]);
    jest.spyOn(players, 'findById').mockResolvedValue(playerData.slice(0, 3));
    await expect(model.addPenaltyGame({ eventId: 19, players: [1, 2, 3, 4] })).rejects.toThrow(
      'Some players were not found'
    );
  });

  it('lists chombo penalties with their configured amount and player details', async () => {
    const event = Object.assign(new EventEntity(), {
      id: 19,
      ruleset: RulesetEntity.createRuleset('ema'),
    });
    jest.spyOn(players, 'isEventAdmin').mockResolvedValue(false);
    jest.spyOn(players, 'isEventReferee').mockResolvedValue(true);
    jest.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    jest.spyOn(rounds, 'findChomboInEvent').mockResolvedValue([
      Object.assign(new RoundEntity(), {
        hands: [Object.assign(new HandEntity(), { loserId: 2 })],
      }),
    ]);
    const findPlayers = jest.spyOn(players, 'findById').mockResolvedValue([playerData[1]]);
    const result = await model.listChombo(19);
    expect(result.chombos).toEqual([{ playerId: 2, amount: event.ruleset.rules.chomboAmount }]);
    expect(result.players).toEqual([
      { id: 2, title: 'Player 2', tenhouId: '', hasAvatar: false, lastUpdate: '' },
    ]);
    expect(findPlayers).toHaveBeenCalledWith([2]);
  });
});
