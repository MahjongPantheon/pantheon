import { vi } from 'vitest';
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
import { SessionState } from '../../helpers/SessionState.js';
import { PenaltyModel } from '../PenaltyModel.js';
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
    vi.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => callback(repo.em));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it('keeps player and session IDs in the correct positions in score history', async () => {
    vi.spyOn(repo.em, 'findAll').mockResolvedValue([
      Object.assign(new SessionPlayerEntity(), { session, playerId: 101 }),
    ]);
    const playerBySession = await players.findPlayerIdsForSessions([session.id]);
    const stats = Model.getModel(repo, PlayerStatsModel);
    const playerInfo = new Map([[101, makePlayer(101)]]);
    vi.spyOn(stats, '_fetchPlayerInfo').mockResolvedValue(playerInfo);
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
    vi.spyOn(sessions, 'findByRepresentationalHash').mockResolvedValue([session]);
    vi.spyOn(players, 'findPlayerIdsForSessions').mockResolvedValue([[101, session.id]]);
    vi.spyOn(registrations, 'fetchPlayersRegDataByIds').mockResolvedValue([registration]);
    vi.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));

    const { playersData } = await players.findPlayersForSessions(['session-501'], true);

    expect(players.substituteReplacements(playersData.players, playersData.replaceMap)).toEqual([
      { ...makePlayer(202), id: 101 },
    ]);
  });

  it('uses replacement names in game getters while keeping original score IDs', async () => {
    vi.spyOn(sessions, 'findByRepresentationalHash').mockResolvedValue([session]);
    vi.spyOn(players, 'findPlayerIdsForSessions').mockResolvedValue([
      [101, session.id],
      [102, session.id],
    ]);
    vi.spyOn(registrations, 'fetchPlayersRegDataByIds').mockResolvedValue([registration]);
    vi.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));

    const display = await sessions.getPlayersOfGames([session]);
    const rating = await sessions.getPlayersOfGames([session], false);
    expect(display.players.get(session.id)).toEqual([
      { ...makePlayer(202), id: 101 },
      makePlayer(102),
    ]);
    expect(rating.players.get(session.id)).toEqual([makePlayer(101), makePlayer(102)]);

    vi.spyOn(registrations, 'fetchPlayersRegDataByIds').mockResolvedValue([]);
    expect((await sessions.getPlayersOfGames([session])).players.get(session.id)).toEqual([
      makePlayer(101),
      makePlayer(102),
    ]);
  });

  it('loads seating details using player IDs rather than registration IDs', async () => {
    vi.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    vi.spyOn(repo.em, 'findAll').mockResolvedValue([registration]);
    vi.spyOn(players, 'findById').mockImplementation(async (ids) => ids.map(makePlayer));
    vi.spyOn(Model.getModel(repo, PlayerHistoryModel), 'findLastByEvent').mockResolvedValue([]);
    vi.spyOn(
      Model.getModel(repo, PlayerInSessionModel),
      'getPlayersSeatingInEvent'
    ).mockResolvedValue([{ player_id: 101, session_id: session.id, table_index: 1, order: 0 }]);

    const result = await Model.getModel(repo, SeatingModel).getCurrentSeating(event.id);

    expect(result.seating).toEqual([
      expect.objectContaining({ playerId: 101, playerTitle: 'Player 202' }),
    ]);
  });

  it('keeps original IDs in session state when notifying replacement players of seating', async () => {
    vi.spyOn(repo.meta, 'personId', 'get').mockReturnValue(1);
    vi.spyOn(players, 'isEventAdmin').mockResolvedValue(true);
    vi.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    vi.spyOn(sessions, 'findByEventAndStatus').mockResolvedValue([]);
    vi.spyOn(registrations, 'findByEventId').mockResolvedValue([
      registration,
      ...[102, 103, 104].map((playerId) =>
        Object.assign(new EventRegisteredPlayersEntity(), { playerId })
      ),
    ]);
    vi.spyOn(registrations, 'findIgnoredPlayersIdsByEvent').mockResolvedValue([]);
    vi.spyOn(Model.getModel(repo, PenaltyModel), 'findByEventId').mockResolvedValue([]);
    vi.spyOn(Model.getModel(repo, PlayerHistoryModel), 'findLastByEvent').mockResolvedValue([]);
    vi.spyOn(
      Model.getModel(repo, PlayerInSessionModel),
      'getPlayersSeatingInEvent'
    ).mockResolvedValue([]);
    vi.spyOn(repo.skirnir, 'messageSeatingReady').mockResolvedValue();
    let state: SessionState | undefined;
    vi.spyOn(sessions, 'startSession').mockImplementation((_event, ids) => {
      state = new SessionState(event.ruleset, ids);
      return session;
    });

    await Model.getModel(repo, SeatingModel).makeShuffledSeating({
      eventId: event.id,
      groupsCount: 1,
      seed: 1,
    });

    expect(state?.state.playerIds.slice().sort((a, b) => a - b)).toEqual([101, 102, 103, 104]);
    expect(
      Object.keys(state!.getScores())
        .map(Number)
        .sort((a, b) => a - b)
    ).toEqual([101, 102, 103, 104]);
    expect(repo.skirnir.messageSeatingReady).toHaveBeenCalledWith(
      expect.arrayContaining([202, 102, 103, 104]),
      1,
      event.id
    );
  });

  it('returns local IDs even when they differ from global player IDs', async () => {
    const events = Model.getModel(repo, EventModel);
    vi.spyOn(events, 'findById').mockResolvedValue([event]);
    vi.spyOn(players, 'findPlayersForEvents').mockResolvedValue({
      players: [makePlayer(101)],
      replaceMap: new Map(),
    });
    vi.spyOn(registrations, 'findIgnoredPlayersIdsByEvent').mockResolvedValue([]);
    vi.spyOn(registrations, 'findByEventId').mockResolvedValue([registration]);

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
    vi.spyOn(repo.em, 'findAll').mockImplementation(async (entity, options) => {
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
