import { jest } from '@jest/globals';
import {
  EventType,
  PlatformType,
  PersonEx,
  SessionStatus,
  WindShuffleMode,
} from 'tsclients/proto/atoms.pb.js';
import { Model } from '../Model.js';
import { EventModel } from '../EventModel.js';
import { SessionModel } from '../SessionModel.js';
import { RoundModel } from '../RoundModel.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { SessionResultsEntity } from '../../entities/SessionResults.entity.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { Repository } from '../../services/Repository.js';
import { init } from '../../tests/initOrm.js';

const orm = await init();
const repo = Repository.instance({ 'x-current-person-id': '42' }, orm);
repo.mockFrey();
const model = Model.getModel(repo, EventModel);
const eventData = {
  type: EventType.EVENT_TYPE_LOCAL,
  title: 'Regression test',
  description: '',
  duration: 75,
  timezone: 'UTC',
  lobbyId: 0,
  seriesLength: 0,
  minGames: 0,
  isTeam: false,
  isPrescripted: false,
  rulesetConfig: RulesetEntity.createRuleset('ema').rules,
  isListed: true,
  isRatingShown: true,
  achievementsShown: true,
  allowViewOtherTables: true,
  platformId: PlatformType.PLATFORM_TYPE_UNSPECIFIED,
  allowManualAddReplay: false,
  windShuffleMode: WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
};

describe('Event creation', () => {
  beforeAll(() => orm.schema.createSchema());
  afterAll(() => repo.destroy());
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });

  it('grants the creator admin rights only after the event has been saved and refreshed', async () => {
    let savedEvent: EventEntity | undefined;
    let committed = false;
    let refreshed = false;
    jest.spyOn(repo.em, 'persist').mockImplementation((entity) => {
      savedEvent = entity as EventEntity;
      return repo.em;
    });
    jest.spyOn(repo.em, 'transactional').mockImplementation(async (callback) => {
      const result = await callback(repo.em);
      savedEvent!.id = 123;
      committed = true;
      return result;
    });
    jest.spyOn(repo.em, 'refresh').mockImplementation(async (entity) => {
      expect(committed).toBe(true);
      expect(entity).toBe(savedEvent);
      await Promise.resolve();
      refreshed = true;
      return entity;
    });
    const grant = jest.spyOn(repo.frey, 'AddRuleForPerson').mockImplementation(async () => {
      expect(refreshed).toBe(true);
      return { ruleId: 7 };
    });

    await expect(model.createEvent(eventData)).resolves.toEqual({ eventId: 123 });
    expect(grant).toHaveBeenCalledTimes(1);
    expect(grant).toHaveBeenCalledWith({
      eventId: 123,
      personId: 42,
      ruleName: 'ADMIN_EVENT',
      ruleValue: 1,
    });
  });

  it.each([
    WindShuffleMode.WIND_SHUFFLE_MODE_RANDOM,
    WindShuffleMode.WIND_SHUFFLE_MODE_BALANCED,
    WindShuffleMode.WIND_SHUFFLE_MODE_PRESCRIPTED,
  ])('persists tournament wind shuffle mode %s and returns it after reload', async (mode) => {
    const { eventId } = await model.createEvent({
      ...eventData,
      type: EventType.EVENT_TYPE_TOURNAMENT,
      isPrescripted: mode === WindShuffleMode.WIND_SHUFFLE_MODE_PRESCRIPTED,
      windShuffleMode: mode,
    });
    repo.em.clear();

    const saved = await model.getEventForEdit({ id: eventId });
    expect(saved.event.type).toBe(EventType.EVENT_TYPE_TOURNAMENT);
    expect(saved.event.windShuffleMode).toBe(mode);
  });

  it('returns empty tournament ratings without requesting an empty player list from Frey', async () => {
    const { eventId } = await model.createEvent({
      ...eventData,
      type: EventType.EVENT_TYPE_TOURNAMENT,
    });
    const history = Model.getModel(repo, PlayerHistoryModel);
    jest.spyOn(history, 'getHistoryItems').mockResolvedValue([]);
    const personalInfo = jest
      .spyOn(repo.frey, 'GetPersonalInfo')
      .mockRejectedValue(new Error('Player IDs are required'));

    await expect(
      model.getRatingTable([eventId], 'rating', 'desc', false, false, null, null)
    ).resolves.toEqual({ list: [] });
    expect(personalInfo).not.toHaveBeenCalled();
  });

  it('returns an empty public feed without requesting players when no sessions are eligible', async () => {
    const players = jest.spyOn(Model.getModel(repo, SessionModel), 'getPlayersOfGames');
    await expect(model.getRecentPublicGames()).resolves.toEqual({ games: [] });
    expect(players).not.toHaveBeenCalled();
  });

  it('limits the public feed by completion time with stable ties and uses each owning event', async () => {
    const eventIds = [];
    for (const data of [
      {
        ...eventData,
        title: 'Tenhou public',
        type: EventType.EVENT_TYPE_ONLINE,
        platformId: PlatformType.PLATFORM_TYPE_TENHOUNET,
      },
      {
        ...eventData,
        title: 'Mahjong Soul public',
        timezone: 'Asia/Tokyo',
        type: EventType.EVENT_TYPE_ONLINE,
        platformId: PlatformType.PLATFORM_TYPE_MAHJONGSOUL,
      },
      { ...eventData, isListed: false },
      { ...eventData, isRatingShown: false },
    ]) {
      eventIds.push(await model.createEvent(data));
    }
    const events = await model.findById(eventIds.map(({ eventId }) => eventId));
    const byId = new Map(events.map((event) => [event.id, event]));
    const publicEvents = eventIds.slice(0, 2).map(({ eventId }) => byId.get(eventId)!);
    const sessions = [1, 4, 3, 5, 5, 2].map((day, index) =>
      repo.em.create(SessionEntity, {
        event: publicEvents[index % 2],
        players: [],
        status: SessionStatus.SESSION_STATUS_FINISHED,
        representationalHash: `public-${index}`,
        replayHash: `replay-${index}`,
        endDate: `2026-01-0${day} 12:00:00`,
        extraTime: 0,
      })
    );
    const excluded = [
      { event: byId.get(eventIds[2].eventId)!, status: SessionStatus.SESSION_STATUS_FINISHED },
      { event: byId.get(eventIds[3].eventId)!, status: SessionStatus.SESSION_STATUS_FINISHED },
      { event: publicEvents[0], status: SessionStatus.SESSION_STATUS_INPROGRESS },
      { event: publicEvents[0], status: SessionStatus.SESSION_STATUS_PREFINISHED },
    ].map((data, index) =>
      repo.em.create(SessionEntity, {
        ...data,
        players: [],
        representationalHash: `excluded-${index}`,
        endDate: '2026-02-01 12:00:00',
        extraTime: 0,
      })
    );
    const undated = repo.em.create(SessionEntity, {
      event: publicEvents[0],
      status: SessionStatus.SESSION_STATUS_FINISHED,
      players: [],
      representationalHash: 'undated',
      extraTime: 0,
    });
    repo.em.persist([...sessions, ...excluded, undated]);
    await repo.em.flush();
    repo.em.persist(
      sessions.map((session, index) =>
        repo.em.create(SessionResultsEntity, {
          session,
          event: session.event,
          playerId: index + 1,
          place: 1,
          score: 30000 + index,
          ratingDelta: index,
        })
      )
    );
    await repo.em.flush();
    repo.em.clear();
    jest.spyOn(Model.getModel(repo, SessionModel), 'getPlayersOfGames').mockResolvedValue({
      players: new Map(
        sessions.map((session, index) => [
          session.id,
          [
            {
              id: index + 1,
              title: `Player ${index + 1}`,
              email: 'private@example.invalid',
              tenhouId: 'unused-platform-account',
            } as PersonEx,
          ],
        ])
      ),
      replaceMap: new Map(),
    });
    const rounds = jest.spyOn(Model.getModel(repo, RoundModel), 'findBySessionIds');

    const feed = await model.getRecentPublicGames();
    expect(feed.games.map((game) => game.sessionHash)).toEqual([
      'public-4',
      'public-3',
      'public-1',
      'public-2',
      'public-5',
    ]);
    for (const game of feed.games) {
      const index = Number(game.sessionHash.split('-')[1]);
      expect(game).toEqual({
        sessionHash: `public-${index}`,
        eventId: publicEvents[index % 2].id,
        eventTitle: index % 2 ? 'Mahjong Soul public' : 'Tenhou public',
        date: `2026-01-0${[1, 4, 3, 5, 5, 2][index]} ${index % 2 ? '21' : '12'}:00:00`,
        players: [
          {
            playerId: index + 1,
            title: `Player ${index + 1}`,
            score: 30000 + index,
          },
        ],
      });
    }
    expect(rounds).not.toHaveBeenCalled();
  });

  it('does not grant rights when saving the event fails', async () => {
    jest.spyOn(repo.em, 'transactional').mockRejectedValue(new Error('Save failed'));
    const refresh = jest.spyOn(repo.em, 'refresh');
    const grant = jest.spyOn(repo.frey, 'AddRuleForPerson');

    await expect(model.createEvent(eventData)).rejects.toThrow('Save failed');
    expect(refresh).not.toHaveBeenCalled();
    expect(grant).not.toHaveBeenCalled();
  });
});
