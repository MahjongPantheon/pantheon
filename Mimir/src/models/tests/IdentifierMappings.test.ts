import { jest } from '@jest/globals';
import { PlatformType } from 'tsclients/proto/atoms.pb.js';
import { Repository } from '../../services/Repository.js';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { SessionPlayerEntity } from '../../entities/SessionPlayer.entity.js';
import { SessionResultsEntity } from '../../entities/SessionResults.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { makeReplayLink } from '../../helpers/formatters.js';
import { Model } from '../Model.js';
import { PlayerModel } from '../PlayerModel.js';
import { PlayerStatsModel } from '../PlayerStatsModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { PlayerInSessionModel } from '../PlayerInSessionModel.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { EventModel } from '../EventModel.js';
import { EventGameSeriesModel } from '../EventGameSeriesModel.js';
import { SeatingModel } from '../SeatingModel.js';
import { SessionModel } from '../SessionModel.js';

class SeriesModelForTest extends EventGameSeriesModel {
  public formatSeries(
    sessionIds: number[],
    playerId: number,
    hashes: Record<number, string>,
    places: Record<number, Record<number, number>>
  ) {
    return super.formatSeries(sessionIds, playerId, hashes, places);
  }
}

const orm = await init();
const repo = Repository.instance({}, orm);
const players = Model.getModel(repo, PlayerModel);
const registrations = Model.getModel(repo, EventRegistrationModel);
const sessions = Model.getModel(repo, SessionModel);
const event = Object.assign(new EventEntity(), {
  id: 19,
  ruleset: RulesetEntity.createRuleset('ema'),
  isPrescripted: 1,
  isTeam: 0,
});
const session = Object.assign(new SessionEntity(), {
  id: 501,
  event,
  representationalHash: 'session-501',
});
const registration = Object.assign(new EventRegisteredPlayersEntity(), {
  id: 901,
  event,
  playerId: 101,
  localId: 7,
  replacementId: 202,
  ignoreSeating: 0,
});

describe('Identifier mappings', () => {
  beforeEach(() => {
    jest.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it('keeps player and session IDs in the correct positions in score history', async () => {
    jest
      .spyOn(repo.em, 'findAll')
      .mockResolvedValue([Object.assign(new SessionPlayerEntity(), { session, playerId: 101 })]);
    const playerBySession = await players.findPlayerIdsForSessions([session.id]);
    const stats = Model.getModel(repo, PlayerStatsModel);
    const playerInfo = new Map([[101, makePlayer(101)]]);
    jest.spyOn(stats, '_fetchPlayerInfo').mockResolvedValue(playerInfo);
    const result = Object.assign(new SessionResultsEntity(), {
      session,
      playerId: 101,
      score: 30000,
      ratingDelta: 10,
      place: 1,
    });

    const history = await stats._getScoreHistoryAndPlayers(
      event.ruleset,
      playerBySession,
      new Map([[session.id, { session, results: new Map([[101, result]]) }]]),
      playerInfo
    );

    expect(history.scores).toEqual([
      [expect.objectContaining({ playerId: 101, sessionHash: 'session-501', score: 30000 })],
    ]);
  });

  it('associates a substitute with the original player rather than their registration', async () => {
    jest.spyOn(sessions, 'findByRepresentationalHash').mockResolvedValue([session]);
    jest.spyOn(players, 'findPlayerIdsForSessions').mockResolvedValue([[101, session.id]]);
    jest.spyOn(registrations, 'fetchPlayersRegDataByIds').mockResolvedValue([registration]);
    jest.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));

    const { playersData } = await players.findPlayersForSessions(['session-501'], true);

    expect(players.substituteReplacements(playersData.players, playersData.replaceMap)).toEqual([
      makePlayer(202),
    ]);
  });

  it('loads seating details using player IDs rather than registration IDs', async () => {
    jest.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    jest.spyOn(repo.em, 'findAll').mockResolvedValue([registration]);
    jest.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));
    jest.spyOn(Model.getModel(repo, PlayerHistoryModel), 'findLastByEvent').mockResolvedValue([]);
    jest
      .spyOn(Model.getModel(repo, PlayerInSessionModel), 'getPlayersSeatingInEvent')
      .mockResolvedValue([{ player_id: 101, session_id: session.id, table_index: 1, order: 0 }]);

    const result = await Model.getModel(repo, SeatingModel).getCurrentSeating(event.id);

    expect(result.seating).toEqual([
      expect.objectContaining({ playerId: 101, playerTitle: 'Player 101' }),
    ]);
  });

  it('returns local IDs even when they differ from global player IDs', async () => {
    const events = Model.getModel(repo, EventModel);
    jest.spyOn(events, 'findById').mockResolvedValue([event]);
    jest.spyOn(players, 'findPlayersForEvents').mockResolvedValue({
      players: [makePlayer(101)],
      replaceMap: new Map(),
    });
    jest.spyOn(registrations, 'findIgnoredPlayersIdsByEvent').mockResolvedValue([]);
    jest.spyOn(registrations, 'findByEventId').mockResolvedValue([registration]);

    const result = await events.getAllRegisteredPlayers({ eventIds: [event.id] });

    expect(result.players).toEqual([expect.objectContaining({ id: 101, localId: 7 })]);
  });

  it('uses each session hash when formatting a player series', () => {
    const series = Model.getModel(repo, SeriesModelForTest).formatSeries(
      [501, 502],
      101,
      { 101: 'unrelated-session', 501: 'session-501', 502: 'session-502' },
      { 501: { 101: 2 }, 502: { 101: 1 } }
    );

    expect(series).toEqual([
      { sessionHash: 'session-501', place: 2 },
      { sessionHash: 'session-502', place: 1 },
    ]);
  });

  it('includes all event IDs in the ignored-player query', async () => {
    jest.spyOn(repo.em, 'findAll').mockImplementation(async (entity, options) => {
      const query = repo.em
        .createQueryBuilder(entity)
        .select('*')
        .where(options?.where ?? {});
      expect(query.getParams()).toEqual([19, 20, 1]);
      return [];
    });

    await registrations.findIgnoredPlayersIdsByEvent([19, 20]);
  });

  it.each([
    [PlatformType.PLATFORM_TYPE_TENHOUNET, 'http://tenhou.net/0/?log=replay-hash'],
    [
      PlatformType.PLATFORM_TYPE_MAHJONGSOUL,
      'https://mahjongsoul.game.yo-star.com/?paipu=replay-hash',
    ],
  ])('links platform %s replays to the correct site', (platform, expected) => {
    expect(makeReplayLink('replay-hash', platform as PlatformType)).toBe(expected);
  });
});
