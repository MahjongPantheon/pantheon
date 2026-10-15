import { jest } from '@jest/globals';
import { EventType, PlatformType, WindShuffleMode } from 'tsclients/proto/atoms.pb.js';
import { Model } from '../Model.js';
import { EventModel } from '../EventModel.js';
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

  it('does not grant rights when saving the event fails', async () => {
    jest.spyOn(repo.em, 'transactional').mockRejectedValue(new Error('Save failed'));
    const refresh = jest.spyOn(repo.em, 'refresh');
    const grant = jest.spyOn(repo.frey, 'AddRuleForPerson');

    await expect(model.createEvent(eventData)).rejects.toThrow('Save failed');
    expect(refresh).not.toHaveBeenCalled();
    expect(grant).not.toHaveBeenCalled();
  });
});
