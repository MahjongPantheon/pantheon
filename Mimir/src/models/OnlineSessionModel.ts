import {
  GamesAddOnlineReplayPayload,
  GamesAddOnlineReplayResponse,
  TypedGamesAddOnlineReplayPayload,
} from 'tsclients/proto/mimir.pb.js';
import { Model } from './Model.js';
import { Downloader } from 'src/helpers/online/Downloader.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { PlatformType, RulesetConfig, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { OnlineParser } from 'src/helpers/online/Parser.js';
import { Tenhou6OnlineParser } from 'src/helpers/online/Tenhou6Parser.js';
import { RoundEntity } from 'src/entities/Round.entity.js';
import { CronModel } from './CronModel.js';
import { makeReplayLink } from 'src/helpers/formatters.js';
import { SessionResultsModel } from './SessionResultsModel.js';
import { SessionState } from 'src/aggregates/SessionState.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { PlayerHistoryEntity } from 'src/entities/PlayerHistory.entity.js';
import { PlayerModel } from './PlayerModel.js';

enum ContentType {
  Xml = 1,
  Json = 2,
}

export class OnlineSessionModel extends Model {
  async addGame(data: GamesAddOnlineReplayPayload): Promise<GamesAddOnlineReplayResponse> {
    if (!data.link) {
      throw new Error(`Link to replay is required`);
    }
    const event = await this.repo.em.findOne(EventEntity, { id: data.eventId });
    if (!event) {
      throw new Error(`Event ${data.eventId} not found`);
    }
    if (event.isOnline) {
      throw new Error(`Event ${data.eventId} is not online`);
    }
    if (event.finished) {
      throw new Error(`Event ${data.eventId} is already finished`);
    }

    const downloader = new Downloader();
    downloader.validateUrl(data.link);
    const replayHash = downloader.getReplayHash(data.link);

    this._checkGameExpired(replayHash, event.ruleset.rules);
    this._checkReplayHash(event.id, replayHash);

    const replay = await downloader.getReplay(data.link);
    return this.addGameContent(event, replayHash, replay.content);
  }

  async addTypedGame(
    data: TypedGamesAddOnlineReplayPayload
  ): Promise<GamesAddOnlineReplayResponse> {
    const event = await this.repo.em.findOne(EventEntity, { id: data.eventId });
    if (!event) {
      throw new Error(`Event ${data.eventId} not found`);
    }
    if (event.isOnline) {
      throw new Error(`Event ${data.eventId} is not online`);
    }
    if (event.finished) {
      throw new Error(`Event ${data.eventId} is already finished`);
    }

    this._checkGameTimestampExpired(data.logTimestamp, event.ruleset.rules);
    this._checkReplayHash(event.id, data.replayHash);

    return this.addGameContent(
      event,
      data.replayHash,
      data.content,
      data.contentType,
      data.platformId
    );
  }

  async addGameContent(
    event: EventEntity,
    replayHash: string,
    content: string,
    contentType: ContentType = ContentType.Xml,
    platformId: PlatformType = PlatformType.PLATFORM_TYPE_TENHOUNET
  ): Promise<GamesAddOnlineReplayResponse> {
    const withChips = event.ruleset.rules.chipsValue > 0;

    let session: SessionEntity;
    let rounds: RoundEntity[];

    if (contentType === ContentType.Xml) {
      const parser = new OnlineParser(this.repo);
      [session, , rounds] = await parser.parseToSession(event, content, withChips);
    } else {
      const parser = new Tenhou6OnlineParser(this.repo);
      [session, , rounds] = await parser.parseToSession(
        event,
        content,
        replayHash,
        withChips,
        platformId
      );
    }

    const yakitori: Record<number, boolean> = {};
    for (const id of session.intermediateResults?.playerIds ?? []) {
      yakitori[id] = true;
    }

    for (const round of rounds) {
      round.session = session;
      round.hands.forEach((hand) => {
        if (hand.winnerId) {
          yakitori[hand.winnerId] = false;
        }
      });
    }

    if (event.ruleset.rules.withYakitori && session.intermediateResults) {
      session.intermediateResults.yakitori = yakitori;
    }

    await this.repo.em.persistAndFlush([session, ...rounds]);

    const playerIds = session.intermediateResults?.playerIds ?? [];
    const sessionResultsModel = this.getModel(SessionResultsModel);
    const sessionResults = sessionResultsModel.calc(
      event.ruleset,
      new SessionState(event.ruleset, playerIds, session.intermediateResults),
      playerIds,
      event.id,
      session.id
    );
    const playerHistoryModel = this.getModel(PlayerHistoryModel);
    const lastResults = (await playerHistoryModel.findAllLastByEventAndPlayer(event.id))
      .filter((histItem) => playerIds.includes(histItem.playerId))
      .reduce(
        (acc, histItem) => {
          acc[histItem.playerId] = histItem;
          return acc;
        },
        {} as Record<number, PlayerHistoryEntity>
      );
    const playerHistoryItems = Object.values(
      playerHistoryModel.makeNewHistoryItemsForSession(
        lastResults,
        event.ruleset,
        event.id,
        session.id,
        sessionResults.reduce(
          (acc, res) => {
            acc[res.playerId] = {
              ratingDelta: res.ratingDelta,
              place: res.place,
              chips: res.chips,
            };
            return acc;
          },
          {} as Record<number, { ratingDelta: number; place: number; chips?: number }>
        )
      )
    );

    session.status = SessionStatus.SESSION_STATUS_FINISHED;
    await this.repo.em.persistAndFlush([session, ...playerHistoryItems, ...sessionResults]);

    const playerModel = this.getModel(PlayerModel);
    const players = await playerModel.findById(playerIds);

    const cronModel = this.getModel(CronModel);
    await cronModel.scheduleRecalcAchievements(event.id);

    return {
      game: {
        sessionHash: session.representationalHash,
        date: session.endDate,
        replayLink: makeReplayLink(session.replayHash!, platformId),
        players: session.intermediateResults?.playerIds ?? [],
        finalResults: sessionResults,
        rounds, // TODO: to Round atom
      },
      players,
    };
  }

  async _checkReplayHash(eventId: number, replayHash: string) {
    const session = await this.repo.em.findOne(SessionEntity, {
      event: this.repo.em.getReference(EventEntity, eventId),
      replayHash,
    });
    if (session) {
      throw new Error(`This game is already added to the system`);
    }
  }

  _checkGameTimestampExpired(logTimestamp: number, rules: RulesetConfig) {
    if (!rules.gameExpirationTime) {
      return;
    }

    const currentTime = Date.now();
    const expirationTimeMs = rules.gameExpirationTime * 60 * 60 * 1000;

    if (currentTime - logTimestamp < expirationTimeMs) {
      return;
    }

    throw new Error(
      `Replay is older than ${rules.gameExpirationTime} hours (within JST timezone), so it can't be accepted.`
    );
  }

  _checkGameExpired(gameLink: string, rules: RulesetConfig) {
    if (!rules.gameExpirationTime) {
      return;
    }

    const regex = /(?<year>\d{4})(?<month>\d{2})(?<day>\d{2})(?<hour>\d{2})gm/is;
    const matches = regex.exec(gameLink);

    if (matches && matches.groups) {
      const { year, month, day, hour } = matches.groups;
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1, // JavaScript months are 0-indexed
        parseInt(day),
        parseInt(hour),
        0,
        0
      );

      const currentTime = Date.now();
      const gameTime = date.getTime();
      const expirationTimeMs = rules.gameExpirationTime * 60 * 60 * 1000;

      if (currentTime - gameTime < expirationTimeMs) {
        return;
      }
    }

    throw new Error(
      `Replay is older than ${rules.gameExpirationTime} hours (within JST timezone), so it can't be accepted.`
    );
  }
}
