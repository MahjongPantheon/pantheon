import { TransactionPropagation } from '@mikro-orm/core';
import {
  GamesAddOnlineReplayPayload,
  GamesAddOnlineReplayResponse,
  TypedGamesAddOnlineReplayPayload,
} from 'tsclients/proto/mimir.pb.js';
import { Model } from './Model.js';
import { Downloader } from '../helpers/online/Downloader.js';
import { EventEntity } from '../entities/Event.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { PlatformType, RulesetConfig, SessionStatus } from 'tsclients/proto/atoms.pb.js';
import { OnlineParser } from '../helpers/online/Parser.js';
import { Tenhou6OnlineParser } from '../helpers/online/Tenhou6Parser.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { CronModel } from './CronModel.js';
import { formatRound, makeReplayLink } from '../helpers/formatters.js';
import { SessionResultsModel } from './SessionResultsModel.js';
import { SessionState } from '../helpers/SessionState.js';
import { PlayerHistoryModel } from './PlayerHistoryModel.js';
import { PlayerHistoryEntity } from '../entities/PlayerHistory.entity.js';
import { PlayerModel } from './PlayerModel.js';
import { sha1 } from '../helpers/crypto.js';
import { SessionPlayerEntity } from '../entities/SessionPlayer.entity.js';
import moment from 'moment-timezone';

enum ContentType {
  Xml = 1,
  Json = 2,
}

export class OnlineSessionModel extends Model {
  async addGame(data: GamesAddOnlineReplayPayload): Promise<GamesAddOnlineReplayResponse> {
    return this.repo.em.transactional(
      async () => {
        if (!data.link) {
          throw new Error(`Link to replay is required`);
        }
        const event = await this.repo.em.findOne(EventEntity, { id: data.eventId });
        if (!event) {
          throw new Error(`Event ${data.eventId} not found`);
        }
        if (!event.isOnline) {
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
        return this.addGameContent(event, replayHash, replay.content, data.link);
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async addTypedGame(
    data: TypedGamesAddOnlineReplayPayload
  ): Promise<GamesAddOnlineReplayResponse> {
    return this.repo.em.transactional(
      async () => {
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
          '',
          data.contentType,
          data.platformId
        );
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async addGameContent(
    event: EventEntity,
    replayHash: string,
    content: string,
    replayLink: string,
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
        replayHash,
        content,
        withChips,
        platformId
      );
    }

    session.extraTime = 0;
    session.replayHash = replayHash;
    session.origLink = replayLink;

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

    const playerIds = session.intermediateResults?.playerIds ?? [];
    session.representationalHash = sha1(playerIds.join(',') + new Date().getTime().toString());
    session.endDate = moment.utc().format('YYYY-MM-DD HH:ii:ss');

    // History stores the session ID as a scalar, so reserve it before the final flush.
    if (!session.id) {
      const [{ id }] = await this.repo.em.execute<{ id: number }[]>(
        "select nextval('session_id_seq')::int as id"
      );
      session.id = id;
    }
    this.repo.em.persist([session, ...rounds]);

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
    const playerIdsInLastResults = Object.keys(lastResults).map(Number);
    const missingPlayerResults = playerIds.filter((id) => !playerIdsInLastResults.includes(id));
    for (const id of missingPlayerResults) {
      lastResults[id] = new PlayerHistoryEntity();
      lastResults[id].avgPlace = 0;
      lastResults[id].event = event;
      lastResults[id].gamesPlayed = 0;
      lastResults[id].playerId = id;
      lastResults[id].rating = event.ruleset.rules.startRating;
      lastResults[id].sessionId = session.id;
      this.repo.em.persist(lastResults[id]);
    }

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

    const playerModel = this.getModel(PlayerModel);
    const cronModel = this.getModel(CronModel);

    const sessionPlayerEntities = playerIds.map((id, idx) => {
      const e = new SessionPlayerEntity();
      e.order = idx + 1;
      e.playerId = id;
      e.session = session;
      return e;
    });

    this.repo.em.persist([
      session,
      ...playerHistoryItems,
      ...sessionResults,
      ...sessionPlayerEntities,
    ]);

    const [players] = await Promise.all([
      playerModel.findById(playerIds),
      cronModel.scheduleRecalcAchievements(event.id),
    ]);

    return {
      game: {
        sessionHash: session.representationalHash ?? '',
        date: session.endDate,
        replayLink: makeReplayLink(session.replayHash ?? null, platformId),
        players,
        finalResults: sessionResults,
        rounds: rounds.map((round) =>
          formatRound(
            round,
            new SessionState(
              event.ruleset,
              session.intermediateResults?.playerIds ?? [],
              round.lastSessionState
            ).state
          )
        ),
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

    const currentTime = Math.floor(Date.now() / 1000);
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

      const currentTime = Math.floor(Date.now() / 1000);
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
