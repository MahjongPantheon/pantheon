import { vi } from 'vitest';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
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
    vi.restoreAllMocks();
    repo.em.clear();
  });
  afterAll(() => repo.destroy());

  it.each([1, 2])(
    'persists parsed content type %i, results and history, then schedules achievements and statistics',
    async (contentType) => {
      const { event, session, rounds } = fixture();
      const parser = vi
        .spyOn(
          contentType === 1 ? OnlineParser.prototype : Tenhou6OnlineParser.prototype,
          'parseToSession'
        )
        .mockResolvedValue([session, {}, rounds, []]);
      const persist = vi.spyOn(repo.em, 'persist');
      const histories = ids.map((playerId) =>
        Object.assign(new PlayerHistoryEntity(), {
          playerId,
          rating: 1500,
          gamesPlayed: 2,
          avgPlace: 2.5,
          chips: 0,
        })
      );
      vi.spyOn(playerHistory, 'findAllLastByEventAndPlayer').mockResolvedValue(histories);
      vi.spyOn(playersModel, 'findById').mockResolvedValue(ids.map(makePlayer));
      const schedule = vi.spyOn(cron, 'scheduleRecalcAchievements').mockResolvedValue();
      const stats = vi.spyOn(cron, 'scheduleRecalcStats').mockResolvedValue();
      const result = await model.addGameContent(
        event,
        'replay-hash',
        'replay-content',
        link,
        contentType
      );
      expect(parser).toHaveBeenCalledTimes(1);
      expect(parser).toHaveBeenCalledWith(
        ...(contentType === 1
          ? [event, 'replay-content', false]
          : [event, 'replay-hash', 'replay-content', false, PlatformType.PLATFORM_TYPE_TENHOUNET])
      );
      expect(result.game.sessionHash).toBe(session.representationalHash);
      expect(result.game.sessionHash).toMatch(/^[a-f0-9]{40}$/);
      expect(session.origLink).toBe(link);
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
      expect(stats).toHaveBeenCalledWith(event.id, ids);
    }
  );

  it.each([
    [true, 41000],
    [false, 40000],
  ])(
    'gives riichi bets left at the end to the winner when riichiGoesToWinner is %s',
    async (riichiGoesToWinner, winnerScore) => {
      const { event, session, rounds } = fixture();
      event.ruleset.rules.riichiGoesToWinner = riichiGoesToWinner;
      session.intermediateResults.scores[4] = 19000;
      session.intermediateResults.riichiBets = 1;
      vi.spyOn(OnlineParser.prototype, 'parseToSession').mockResolvedValue([
        session,
        {},
        rounds,
        [],
      ]);
      vi.spyOn(playerHistory, 'findAllLastByEventAndPlayer').mockResolvedValue([]);
      vi.spyOn(playersModel, 'findById').mockResolvedValue(ids.map(makePlayer));
      vi.spyOn(cron, 'scheduleRecalcAchievements').mockResolvedValue();
      vi.spyOn(cron, 'scheduleRecalcStats').mockResolvedValue();

      const result = await model.addGameContent(event, 'replay-hash', 'replay-content', link);

      expect(result.game.finalResults.find((r) => r.place === 1)).toMatchObject({
        playerId: 1,
        score: winnerScore,
      });
      expect(session.intermediateResults?.scores[1]).toBe(winnerScore);
    }
  );

  it('downloads a validated replay and passes its content to the importer', async () => {
    const { event } = fixture();
    event.isOnline = 1;
    vi.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    vi.spyOn(model, '_checkReplayHash').mockResolvedValue();
    vi.spyOn(Downloader.prototype, 'getReplay').mockResolvedValue({
      decodedHash: 'decoded-hash',
      content: 'xml-content',
    });
    const importer = vi.spyOn(model, 'addGameContent').mockResolvedValue({
      game: { sessionHash: 'hash', replayLink: '', players: [], finalResults: [], rounds: [] },
      players: [],
    });
    await model.addGame({ eventId: event.id, link });
    expect(model._checkReplayHash).toHaveBeenCalledWith(
      event.id,
      '2026010100gm-0001-0000-12345678'
    );
    expect(importer).toHaveBeenCalledWith(
      event,
      '2026010100gm-0001-0000-12345678',
      'xml-content',
      link
    );
  });

  it('passes typed replay content and its platform to the importer', async () => {
    const { event } = fixture();
    vi.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    vi.spyOn(model, '_checkReplayHash').mockResolvedValue();
    const importer = vi.spyOn(model, 'addGameContent').mockResolvedValue({
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
    expect(model._checkReplayHash).toHaveBeenCalledWith(event.id, 'hash');
    expect(importer).toHaveBeenCalledWith(
      event,
      'hash',
      '{}',
      '',
      2,
      PlatformType.PLATFORM_TYPE_MAHJONGSOUL
    );
  });

  it('rejects a missing link before accessing storage', async () => {
    const find = vi.spyOn(repo.em, 'findOne');
    await expect(model.addGame({ eventId: 19, link: '' })).rejects.toThrow(
      'Link to replay is required'
    );
    expect(find).not.toHaveBeenCalled();
  });

  it.each([
    [null, 'not found'],
    [Object.assign(new EventEntity(), { id: 19, isOnline: 0 }), 'not online'],
    [Object.assign(new EventEntity(), { id: 19, isOnline: 1, finished: 1 }), 'already finished'],
  ])('rejects an unavailable event', async (event, error) => {
    vi.spyOn(repo.em, 'findOne').mockResolvedValue(event);
    await expect(model.addGame({ eventId: 19, link })).rejects.toThrow(error);
    if (event) {
      // Typed replays are imported into offline events.
      event.isOnline = event.finished ? 0 : 1;
    }
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

  it('rejects a replay hash in the same event but allows it in another event', async () => {
    vi.spyOn(repo.em, 'findOne').mockResolvedValue(new SessionEntity());
    await expect(model._checkReplayHash(19, 'duplicate')).rejects.toThrow('already added');
    expect(repo.em.findOne).toHaveBeenLastCalledWith(SessionEntity, {
      event: repo.em.getReference(EventEntity, 19),
      replayHash: 'duplicate',
    });
    vi.mocked(repo.em.findOne).mockResolvedValue(null);
    await expect(model._checkReplayHash(20, 'duplicate')).resolves.toBeUndefined();
    expect(repo.em.findOne).toHaveBeenLastCalledWith(SessionEntity, {
      event: repo.em.getReference(EventEntity, 20),
      replayHash: 'duplicate',
    });
  });

  describe.each(['link', 'typed'] as const)('%s replay errors', (source) => {
    const importReplay = () =>
      source === 'link'
        ? model.addGame({ eventId: 19, link })
        : model.addTypedGame({
            eventId: 19,
            replayHash: 'hash',
            content: '{}',
            contentType: 2,
            platformId: PlatformType.PLATFORM_TYPE_TENHOUNET,
            logTimestamp: 0,
          });

    it('reports a duplicate detected when the transaction flushes', async () => {
      const error = new UniqueConstraintViolationException(
        Object.assign(new Error('duplicate key'), { constraint: 'session_replay_hash_index' })
      );
      vi.spyOn(repo.em, 'transactional').mockRejectedValue(error);
      await expect(importReplay()).rejects.toThrow('This game is already added to the system');
    });

    it.each([
      new Error('storage unavailable'),
      new UniqueConstraintViolationException(
        Object.assign(new Error('another duplicate'), { constraint: 'session_pkey' })
      ),
    ])('preserves unrelated storage errors: %s', async (error) => {
      vi.spyOn(repo.em, 'transactional').mockRejectedValue(error);
      await expect(importReplay()).rejects.toBe(error);
    });

    it('awaits the duplicate check before importing content', async () => {
      const { event } = fixture();
      event.isOnline = source === 'link' ? 1 : 0;
      vi.spyOn(repo.em, 'findOne').mockResolvedValue(event);
      vi.spyOn(model, '_checkReplayHash').mockRejectedValue(
        new Error('This game is already added to the system')
      );
      const download = vi.spyOn(Downloader.prototype, 'getReplay');
      const importer = vi.spyOn(model, 'addGameContent');
      await expect(importReplay()).rejects.toThrow('already added');
      expect(download).not.toHaveBeenCalled();
      expect(importer).not.toHaveBeenCalled();
    });
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
