import { jest } from '@jest/globals';
import { Model } from '../Model.js';
import { OnlineSessionModel } from '../OnlineSessionModel.js';
import { PlayerHistoryModel } from '../PlayerHistoryModel.js';
import { PlayerModel } from '../PlayerModel.js';
import { CronModel } from '../CronModel.js';
import { Repository } from '../../services/Repository.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { PlayerHistoryEntity } from '../../entities/PlayerHistory.entity.js';
import { RulesetEntity } from '../../entities/Ruleset.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { OnlineParser } from '../../helpers/online/Parser.js';
import { Tenhou6OnlineParser } from '../../helpers/online/Tenhou6Parser.js';
import { Downloader } from '../../helpers/online/Downloader.js';
import { PlatformType, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { roundFixtures } from '../../tests/roundFixtures.js';
import { init } from '../../tests/initOrm.js';
import { makePlayer } from '../../tests/playerFixtures.js';

const orm = await init();
const repo = Repository.instance({}, orm);
const model = Model.getModel(repo, OnlineSessionModel);
const playerHistory = Model.getModel(repo, PlayerHistoryModel);
const playersModel = Model.getModel(repo, PlayerModel);
const cron = Model.getModel(repo, CronModel);
const ids = [1, 2, 3, 4];
const link = 'https://tenhou.net/0/?log=2026010100gm-0001-0000-12345678';

function fixture() {
  const ruleset = RulesetEntity.createRuleset('ema');
  ruleset.rules.withYakitori = true;
  const event = Object.assign(new EventEntity(), { id: 19, isOnline: 0, finished: 0, ruleset });
  const state = new SessionState(ruleset, ids).state;
  state.chips = {};
  state.yakitori = {};
  state.replacements = {};
  state.scores = { 1: 40000, 2: 35000, 3: 25000, 4: 20000 };
  const session = Object.assign(new SessionEntity(), {
    id: 21,
    event,
    representationalHash: 'session-hash',
    replayHash: 'replay-hash',
    endDate: '2026-01-01T00:00:00Z',
    status: SessionStatus.SESSION_STATUS_INPROGRESS,
    intermediateResults: state,
  });
  const rounds = [
    RoundEntity.fromMessage(session, event, roundFixtures[1][1], state),
    RoundEntity.fromMessage(session, event, roundFixtures[2][1], state),
  ];
  return { event, session, rounds };
}

describe('Online replay import', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it.each([1, 2])(
    'persists parsed content type %i, results and history, then schedules achievements',
    async (contentType) => {
      const { event, session, rounds } = fixture();
      const parser = jest
        .spyOn(
          contentType === 1 ? OnlineParser.prototype : Tenhou6OnlineParser.prototype,
          'parseToSession'
        )
        .mockResolvedValue([session, {}, rounds, []]);
      const persist = jest.spyOn(repo.em, 'persist');
      const histories = ids.map((playerId) =>
        Object.assign(new PlayerHistoryEntity(), {
          playerId,
          rating: 1500,
          gamesPlayed: 2,
          avgPlace: 2.5,
          chips: 0,
        })
      );
      jest.spyOn(playerHistory, 'findAllLastByEventAndPlayer').mockResolvedValue(histories);
      jest.spyOn(playersModel, 'findById').mockResolvedValue(ids.map(makePlayer));
      const schedule = jest.spyOn(cron, 'scheduleRecalcAchievements').mockResolvedValue();
      const result = await model.addGameContent(
        event,
        'replay-hash',
        'replay-content',
        contentType
      );
      expect(parser).toHaveBeenCalledTimes(1);
      expect(parser).toHaveBeenCalledWith(
        ...(contentType === 1
          ? [event, 'replay-content', false]
          : [event, 'replay-hash', 'replay-content', false, PlatformType.PLATFORM_TYPE_TENHOUNET])
      );
      expect(result.game.sessionHash).toBe('session-hash');
      expect(result.game.rounds).toHaveLength(2);
      expect(result.players.map((p) => p.id)).toEqual(ids);
      expect(
        result.game.finalResults.map((r) => ({
          playerId: r.playerId,
          place: r.place,
          score: r.score,
        }))
      ).toEqual([
        { playerId: 1, place: 1, score: 40000 },
        { playerId: 2, place: 2, score: 35000 },
        { playerId: 3, place: 3, score: 25000 },
        { playerId: 4, place: 4, score: 20000 },
      ]);
      expect(session.status).toBe(SessionStatus.SESSION_STATUS_FINISHED);
      expect(session.intermediateResults?.yakitori).toEqual({
        1: true,
        2: false,
        3: true,
        4: true,
      });
      expect(rounds.every((r) => r.session === session)).toBe(true);
      expect(persist).toHaveBeenCalledTimes(2);
      const saved = persist.mock.calls[1][0] as object[];
      expect(saved.filter((item) => item instanceof PlayerHistoryEntity)).toHaveLength(4);
      expect(schedule).toHaveBeenCalledWith(event.id);
    }
  );

  it('downloads a validated replay and passes its content to the importer', async () => {
    const { event } = fixture();
    jest.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    jest.spyOn(model, '_checkReplayHash').mockResolvedValue();
    jest
      .spyOn(Downloader.prototype, 'getReplay')
      .mockResolvedValue({ decodedHash: 'decoded-hash', content: 'xml-content' });
    const importer = jest.spyOn(model, 'addGameContent').mockResolvedValue({
      game: { sessionHash: 'hash', replayLink: '', players: [], finalResults: [], rounds: [] },
      players: [],
    });
    await model.addGame({ eventId: event.id, link });
    expect(importer).toHaveBeenCalledWith(event, '2026010100gm-0001-0000-12345678', 'xml-content');
  });

  it('passes typed replay content and its platform to the importer', async () => {
    const { event } = fixture();
    jest.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    jest.spyOn(model, '_checkReplayHash').mockResolvedValue();
    const importer = jest.spyOn(model, 'addGameContent').mockResolvedValue({
      game: { sessionHash: 'hash', replayLink: '', players: [], finalResults: [], rounds: [] },
      players: [],
    });
    await model.addTypedGame({
      eventId: event.id,
      replayHash: 'hash',
      content: '{}',
      contentType: 2,
      platformId: PlatformType.PLATFORM_TYPE_MAHJONGSOUL,
      logTimestamp: Math.floor(Date.now() / 1000),
    });
    expect(importer).toHaveBeenCalledWith(
      event,
      'hash',
      '{}',
      2,
      PlatformType.PLATFORM_TYPE_MAHJONGSOUL
    );
  });

  it('rejects a missing link before accessing storage', async () => {
    const find = jest.spyOn(repo.em, 'findOne');
    await expect(model.addGame({ eventId: 19, link: '' })).rejects.toThrow(
      'Link to replay is required'
    );
    expect(find).not.toHaveBeenCalled();
  });

  it.each([
    [null, 'not found'],
    [Object.assign(new EventEntity(), { id: 19, isOnline: 1 }), 'not online'],
    [Object.assign(new EventEntity(), { id: 19, isOnline: 0, finished: 1 }), 'already finished'],
  ])('rejects an unavailable event', async (event, error) => {
    jest.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    await expect(model.addGame({ eventId: 19, link })).rejects.toThrow(error);
    await expect(
      model.addTypedGame({
        eventId: 19,
        replayHash: 'hash',
        content: '{}',
        contentType: 2,
        platformId: PlatformType.PLATFORM_TYPE_TENHOUNET,
        logTimestamp: 0,
      })
    ).rejects.toThrow(error);
  });

  it('rejects an already imported replay hash', async () => {
    jest.spyOn(repo.em, 'findOne').mockResolvedValue(new SessionEntity());
    await expect(model._checkReplayHash(19, 'duplicate')).rejects.toThrow('already added');
    jest.mocked(repo.em.findOne).mockResolvedValue(null);
    await expect(model._checkReplayHash(19, 'new')).resolves.toBeUndefined();
  });

  it('checks expiration only when the rules require it', () => {
    const { event } = fixture();
    expect(() => model._checkGameExpired('invalid-hash', event.ruleset.rules)).not.toThrow();
    expect(() => model._checkGameTimestampExpired(0, event.ruleset.rules)).not.toThrow();
    event.ruleset.rules.gameExpirationTime = 1;
    expect(() => model._checkGameExpired('invalid-hash', event.ruleset.rules)).toThrow(
      'Replay is older'
    );
    const now = new Date();
    const dateParts = [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours()];
    const currentHash =
      dateParts.map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0')).join('') +
      'gm';
    expect(() => model._checkGameExpired(currentHash, event.ruleset.rules)).not.toThrow();
    expect(() =>
      model._checkGameTimestampExpired(Math.floor(Date.now() / 1000), event.ruleset.rules)
    ).not.toThrow();
    expect(() => model._checkGameTimestampExpired(0, event.ruleset.rules)).toThrow(
      'Replay is older'
    );
  });
});
