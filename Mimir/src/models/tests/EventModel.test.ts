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
  it('creates a sanma event with three-player rules', async () => {
    const { eventId } = await model.createEvent({
      ...eventData,
      rulesetConfig: RulesetEntity.createRuleset('sanma').rules,
    });
    const [event] = await model.findById([eventId]);
    expect(event.ruleset.playerCount).toBe(3);
    expect(event.ruleset.rules.startPoints).toBe(35000);
  });

  it.each([
    { sanmaNoTsumoLoss: true },
    { sanmaDrawPayments: -200 },
    { sanmaDrawPayments: 3100 },
    { sanmaChomboPayments: -100 },
    { sanmaChomboPayments: 6050 },
  ])('rejects unsupported sanma settings %j', async (overrides) => {
    await expect(
      model.createEvent({
        ...eventData,
        rulesetConfig: { ...RulesetEntity.createRuleset('sanma').rules, ...overrides },
      })
    ).rejects.toThrow('Sanma');
  });

  beforeAll(() => orm.schema.createSchema());
  afterAll(() => repo.destroy());
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });

  describe.each([
    ['local', EventType.EVENT_TYPE_LOCAL],
    ['tournament', EventType.EVENT_TYPE_TOURNAMENT],
    ['online', EventType.EVENT_TYPE_ONLINE],
  ] as const)('%s event penalties', (_name, type) => {
    it('enables penalties on creation and returns them after reload', async () => {
      const { eventId } = await model.createEvent({ ...eventData, type });
      await repo.em.flush();
      repo.em.clear();

      const saved = await repo.em.findOneOrFail(EventEntity, { id: eventId });
      expect(saved.usePenalty).toBe(1);
      expect((await model.getGameConfig({ eventId })).usePenalty).toBe(true);
    });

    it.each([0, 1])(
      'preserves persisted usePenalty=%s when editing the event',
      async (usePenalty) => {
        const { eventId } = await model.createEvent({ ...eventData, type });
        await repo.em.nativeUpdate(EventEntity, { id: eventId }, { usePenalty });
        repo.em.clear();
        const { event } = await model.getEventForEdit({ id: eventId });
        const title = `Edited ${type} event with usePenalty=${usePenalty}`;

        await expect(
          model.updateEvent({ id: eventId, event: { ...event, title } })
        ).resolves.toEqual({ success: true });
        await repo.em.flush();
        repo.em.clear();

        const saved = await repo.em.findOneOrFail(EventEntity, { id: eventId });
        expect(saved.title).toBe(title);
        expect(saved.usePenalty).toBe(usePenalty);
        expect((await model.getGameConfig({ eventId })).usePenalty).toBe(Boolean(usePenalty));
      }
    );
  });

  it('returns only requested event states, including finished and unlisted events', async () => {
    const first = await model.createEvent({ ...eventData, isListed: false });
    const second = await model.createEvent(eventData);
    await repo.em.nativeUpdate(EventEntity, { id: second.eventId }, { finished: 1 });
    repo.em.clear();
    expect(await model.getEventStates({ ids: [first.eventId, second.eventId, 999999] })).toEqual({
      events: [
        { id: second.eventId, finished: true },
        { id: first.eventId, finished: false },
      ],
    });
    expect(await model.getEventStates({ ids: [] })).toEqual({ events: [] });
  });

  it('filters ongoing events before pagination and counts only matching events', async () => {
    const payload = { filter: '', filterUnlisted: false, limit: 1, offset: 1 };
    const before = await model.getEvents({ ...payload, onlyOngoing: true });
    const listedBefore = await model.getEvents({
      ...payload,
      onlyOngoing: true,
      filterUnlisted: true,
    });
    const allBefore = await model.getEvents(payload);
    const title = 'Ongoing filter regression';
    const first = await model.createEvent({ ...eventData, title, isListed: false });
    const second = await model.createEvent({ ...eventData, title });
    const third = await model.createEvent({ ...eventData, title });
    await repo.em.nativeUpdate(EventEntity, { id: second.eventId }, { finished: 1 });
    repo.em.clear();
    const ongoing = await model.getEvents({ ...payload, onlyOngoing: true });
    expect(ongoing.total).toBe(before.total + 2);
    expect(ongoing.events.map((event) => event.id)).toEqual([first.eventId]);
    const all = await model.getEvents(payload);
    expect(all.total).toBe(allBefore.total + 3);
    expect(all.events.map((event) => event.id)).toEqual([second.eventId]);
    const listed = await model.getEvents({
      ...payload,
      offset: 0,
      filterUnlisted: true,
      onlyOngoing: true,
    });
    expect(listed.total).toBe(listedBefore.total + 1);
    expect(listed.events.map((event) => event.id)).toEqual([third.eventId]);
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

  it('returns only the latest game per event with stable ties and owning event metadata', async () => {
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
        rulesetConfig: { ...eventData.rulesetConfig, startPoints: 25000 },
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
    const sessions = [1, 5, 3, 5, 5, 2].map((day, index) =>
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
    expect(feed.games.map((game) => game.sessionHash)).toEqual(['public-4', 'public-3']);
    for (const game of feed.games) {
      const index = Number(game.sessionHash.split('-')[1]);
      expect(game).toEqual({
        sessionHash: `public-${index}`,
        eventId: publicEvents[index % 2].id,
        eventTitle: index % 2 ? 'Mahjong Soul public' : 'Tenhou public',
        startPoints: index % 2 ? 25000 : 30000,
        date: `2026-01-0${[1, 5, 3, 5, 5, 2][index]} ${index % 2 ? '21' : '12'}:00:00`,
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

  it('fills five distinct event slots even when one event has many newer games', async () => {
    const events: EventEntity[] = [];
    for (let index = 0; index < 7; index++) {
      const { eventId } = await model.createEvent({ ...eventData, title: `Distinct ${index}` });
      events.push((await model.findById([eventId]))[0]);
    }
    const sessions = events.map((event, index) =>
      repo.em.create(SessionEntity, {
        event,
        players: [],
        status: SessionStatus.SESSION_STATUS_FINISHED,
        representationalHash: `distinct-${index}`,
        endDate: `2026-03-0${index + 1} 12:00:00`,
        extraTime: 0,
      })
    );
    const busyEventGames = [1, 2, 3, 4, 5, 6].map((hour) =>
      repo.em.create(SessionEntity, {
        event: events[0],
        players: [],
        status: SessionStatus.SESSION_STATUS_FINISHED,
        representationalHash: `busy-${hour}`,
        endDate: `2026-03-08 0${hour}:00:00`,
        extraTime: 0,
      })
    );
    repo.em.persist([...sessions, ...busyEventGames]);
    await repo.em.flush();
    repo.em.clear();
    jest.spyOn(Model.getModel(repo, SessionModel), 'getPlayersOfGames').mockResolvedValue({
      players: new Map(),
      replaceMap: new Map(),
    });

    const feed = await model.getRecentPublicGames();
    expect(feed.games.map((game) => game.sessionHash)).toEqual([
      'busy-6',
      'distinct-6',
      'distinct-5',
      'distinct-4',
      'distinct-3',
    ]);
    expect(new Set(feed.games.map((game) => game.eventId)).size).toBe(5);
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
