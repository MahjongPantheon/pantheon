import { Model } from '../Model.js';
import { EventModel } from '../EventModel.js';
import { SessionModel } from '../SessionModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { EventRegistrationModel } from '../EventRegistrationModel.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { PlayerHistoryEntity } from '../../entities/PlayerHistory.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import type { Repository } from '../../services/Repository.js';
import { EventData, EventType, PersonEx } from 'tsclients/proto/atoms.pb.js';

function fixture(personId: number | null = 7) {
  const event = Object.assign(new EventEntity(), {
    id: 42,
    ruleset: RulesetEntity.createRuleset('ema'),
    timezone: 'UTC',
    minGamesCount: 4,
    allowViewOtherTables: 1,
    syncStart: 0,
    isPrescripted: 0,
  });
  const em = {
    transactional: vi.fn((work: () => Promise<unknown>) => work()),
    findAll: vi.fn(async (entity: unknown) => (entity === EventEntity ? [event] : [])),
    findOneOrFail: vi.fn().mockResolvedValue(event),
    persist: vi.fn(),
    refresh: vi.fn(),
  };
  const frey = {
    GetPersonalInfo: vi
      .fn()
      .mockResolvedValue({ people: [PersonEx.initialize({ id: 1, title: 'Alice' })] }),
    GetSuperadminFlag: vi.fn().mockResolvedValue({ isAdmin: false }),
    AddRuleForPerson: vi.fn().mockResolvedValue({ ruleId: 1 }),
  };
  const repo = {
    em,
    frey,
    meta: { personId },
    config: { sigrunUrl: 'https://ratings.test' },
  } as unknown as Repository;
  const model = Model.getModel(repo, EventModel);
  const history = Model.getModel(repo, PlayerHistoryModel);
  const session = Model.getModel(repo, SessionModel);
  const player = Model.getModel(repo, PlayerModel);
  const registration = Model.getModel(repo, EventRegistrationModel);
  vi.spyOn(model, 'findById').mockResolvedValue([event]);
  vi.spyOn(player, 'isEventAdmin').mockResolvedValue(false);
  vi.spyOn(player, 'isEventReferee').mockResolvedValue(false);
  return { model, history, session, player, registration, event, em, frey };
}
afterEach(() => vi.restoreAllMocks());
function line(id: number, gamesPlayed = 4): PlayerHistoryEntity {
  return Object.assign(new PlayerHistoryEntity(), {
    playerId: id,
    event: { id: 42 } as EventEntity,
    rating: 100000,
    gamesPlayed,
  });
}

it.each([false, true])(
  'formats sparse rating data and honors minimum-game filtering: %s',
  async (onlyMinGames) => {
    const f = fixture();
    const data = [line(1), line(2, 1)];
    vi.spyOn(f.history, 'getHistoryItems').mockResolvedValue(data);
    vi.spyOn(f.history, 'mergeSeveralEvents').mockImplementation((items) => items);
    vi.spyOn(f.history, 'mergeData').mockImplementation((items) => items);
    vi.spyOn(f.history, 'sortItems').mockImplementation((_order, _players, items) => items);
    const result = await f.model.getRatingTable(
      [42],
      'rating',
      'asc',
      false,
      onlyMinGames,
      null,
      null
    );
    expect(result.list).toHaveLength(onlyMinGames ? 1 : 2);
    expect(result.list[0]).toMatchObject({
      id: 1,
      tenhouId: '',
      chips: 0,
      avgPlace: 0,
      avgScore: 0,
      gamesPlayed: 4,
      teamName: '',
      hasAvatar: false,
      lastUpdate: '',
      penaltiesAmount: 0,
      penaltiesCount: 0,
    });
    expect(f.frey.GetPersonalInfo).toHaveBeenCalledWith({ ids: [1, 2] });
  }
);

it('uses provisional results for admins, reverses descending order, and handles an empty table', async () => {
  const f = fixture();
  vi.spyOn(f.session, 'getPrefinishedItems').mockResolvedValue([line(1)]);
  vi.spyOn(f.history, 'getHistoryItems').mockResolvedValue([]);
  const result = await f.model.getRatingTable([42], 'rating', 'desc', true, false, null, null);
  expect(result.list[0].title).toBe('Alice');
  expect(f.history.getHistoryItems).not.toHaveBeenCalled();
  f.frey.GetPersonalInfo.mockClear();
  expect(await f.model.getRatingTable([42], 'rating', 'asc', false, false, null, null)).toEqual({
    list: [],
  });
  expect(f.frey.GetPersonalInfo).not.toHaveBeenCalled();
  f.em.findAll.mockResolvedValueOnce([]);
  await expect(
    f.model.getRatingTable([42], 'rating', 'asc', false, false, null, null)
  ).rejects.toThrow('Main event not found');
});

it('rejects invalid last-games filters before querying game history', async () => {
  const f = fixture();
  const valid = { eventIdList: [42], limit: 10, offset: 0, orderBy: 'id', order: 'desc' };
  await expect(f.model.getLastGames({ ...valid, eventIdList: [] })).rejects.toThrow('empty');
  await expect(f.model.getLastGames({ ...valid, eventIdList: [42, 99] })).rejects.toThrow(
    'not found'
  );
  await expect(f.model.getLastGames({ ...valid, orderBy: 'invalid' })).rejects.toThrow(
    'Invalid orderBy'
  );
  await expect(f.model.getLastGames({ ...valid, order: 'invalid' })).rejects.toThrow(
    'Invalid order'
  );
  vi.spyOn(f.model, 'getLastFinishedGames').mockResolvedValue({ games: [], totalGames: 0 });
  expect(await f.model.getLastGames(valid)).toEqual({ games: [], totalGames: 0 });
  expect(f.model.getLastFinishedGames).toHaveBeenCalledWith([f.event], 10, 0, 'id', 'desc');
  await expect(f.model.getAllRegisteredPlayers({ eventIds: [] })).rejects.toThrow('required');
  await expect(f.model.getAllRegisteredPlayers({ eventIds: [42, 99] })).rejects.toThrow(
    'not found'
  );
});

it.each([null, 7])(
  'enforces table visibility while allowing spectators: person=%s',
  async (personId) => {
    const f = fixture(personId);
    f.event.allowViewOtherTables = 0;
    vi.spyOn(f.session, 'findByPlayerAndEvent').mockResolvedValue([]);
    vi.spyOn(f.session, 'findByEventAndStatus').mockResolvedValue([]);
    vi.spyOn(f.registration, 'findByEventId').mockResolvedValue([]);
    expect(await f.model.getTablesState({ eventId: 42, omitLastRound: true })).toEqual({
      tables: [],
    });
    if (personId) {
      vi.mocked(f.session.findByPlayerAndEvent).mockResolvedValue([new SessionEntity()]);
      await expect(f.model.getTablesState({ eventId: 42, omitLastRound: true })).rejects.toThrow(
        'not allowed'
      );
      vi.mocked(f.player.isEventReferee).mockResolvedValue(true);
      expect(await f.model.getTablesState({ eventId: 42, omitLastRound: true })).toEqual({
        tables: [],
      });
    }
  }
);

it('omits ignored and unnumbered prescribed registrations when counting tables', async () => {
  const f = fixture();
  f.event.syncStart = 1;
  f.event.isPrescripted = 1;
  vi.spyOn(f.session, 'findByPlayerAndEvent').mockResolvedValue([]);
  const sessions = vi.spyOn(f.session, 'findByEventAndStatus').mockResolvedValue([]);
  vi.spyOn(f.registration, 'findByEventId').mockResolvedValue([
    { ignoreSeating: 1, localId: 1 },
    { ignoreSeating: 0 },
    ...[1, 2, 3, 4].map((localId) => ({ ignoreSeating: 0, localId })),
  ] as EventRegisteredPlayersEntity[]);
  await f.model.getTablesState({ eventId: 42, omitLastRound: false });
  expect(sessions.mock.calls[0][3]).toBe(1);
  vi.mocked(f.model.findById).mockResolvedValue([]);
  await expect(f.model.getTablesState({ eventId: 42, omitLastRound: false })).rejects.toThrow(
    'not found'
  );
  await expect(f.model.getCurrentGames({ eventId: 42, playerId: 7 })).rejects.toThrow(
    'Event not found'
  );
});

it.each([EventType.EVENT_TYPE_LOCAL, EventType.EVENT_TYPE_ONLINE, EventType.EVENT_TYPE_TOURNAMENT])(
  'updates event flags for %s',
  async (type) => {
    const f = fixture();
    vi.mocked(f.player.isEventAdmin).mockResolvedValue(true);
    f.event.syncStart = type === EventType.EVENT_TYPE_TOURNAMENT ? 1 : 0;
    f.event.isOnline = type === EventType.EVENT_TYPE_ONLINE ? 1 : 0;
    for (const enabled of [false, true]) {
      const event = EventData.initialize({
        type,
        title: 'Updated',
        isListed: enabled,
        isRatingShown: enabled,
        achievementsShown: enabled,
        allowViewOtherTables: enabled,
        allowManualAddReplay: enabled,
        isPrescripted: enabled,
        isTeam: enabled,
      });
      expect(await f.model.updateEvent({ id: 42, event })).toEqual({ success: true });
      expect(f.event).toMatchObject({
        title: 'Updated',
        isListed: enabled ? 1 : 0,
        hideResults: enabled ? 0 : 1,
        hideAchievements: enabled ? 0 : 1,
      });
      if (f.event.syncStart) expect(f.event.isPrescripted).toBe(enabled ? 1 : 0);
    }
  }
);
