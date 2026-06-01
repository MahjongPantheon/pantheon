import type { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { EndingPolicy, TournamentGamesStatus } from 'tsclients/proto/atoms.pb.js';

import { EventEntity } from '../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../entities/EventRegisteredPlayers.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { PenaltyEntity } from '../entities/Penalty.entity.js';
import { SessionEntity } from '../entities/Session.entity.js';
import { HandEntity } from '../entities/Hand.entity.js';
import { PlayerHistoryEntity } from '../entities/PlayerHistory.entity.js';
import { SessionStateEntity } from '../entities/SessionState.entity.js';
import { SessionPlayerEntity } from '../entities/SessionPlayer.entity.js';
import { SessionResultsEntity } from '../entities/SessionResults.entity.js';

import { sessions } from './session.js';
import { rounds } from './round.js';
import { THand, hands } from './hand.js';
import { eventRegisteredPlayers } from './event_registered_players.js';
import { playerHistory } from './player_history.js';
import { sessionPlayers } from './session_players.js';
import { sessionResults } from './session_results.js';

/*
  - id=19: test club rating
  - id=889: test tournament
  - id=863: test online tournament
*/

export class TestSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    await this.populateEvents(em);
    // achievements and player stats should be populated by cron
    await this.populateEventRegistrations(em);
    await this.populateSessions(em);
    await this.populateRounds(em);
    await this.populateHands(em);
    await this.populatePenalties(em);
    await this.populatePlayerHistory(em);
    await this.populateSessionPlayers(em);
    await this.populateSessionResults(em);

    await em.flush();

    const tables = [
      'event',
      'event_registered_players',
      'session',
      'round',
      'hand',
      'penalty',
      'player_history',
      'session_players',
      'session_results',
    ];
    for (const table of tables) {
      console.log(`select setval('${table}_id_seq', (select max(id) + 1 from ${table}))`);
      await em
        .getConnection()
        .execute(`select setval('${table}_id_seq', (select max(id) + 1 from ${table}))`);
    }
  }

  protected async populateEvents(em: EntityManager): Promise<void> {
    const ruleset1 = new RulesetEntity('custom', 'Custom', {
      uma: { place1: 15000, place2: 5000, place3: -5000, place4: -15000 },
      umaType: 'UMA_TYPE_UMA_SIMPLE',
      withKazoe: true,
      complexUma: {
        neg1: { place1: 0, place2: 0, place3: 0, place4: 0 },
        neg3: { place1: 0, place2: 0, place3: 0, place4: 0 },
        otherwise: { place1: 0, place2: 0, place3: 0, place4: 0 },
      },
      honbaValue: 300,
      maxPenalty: 40000,
      withKuitan: true,
      allowedYaku: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24, 25, 26,
        27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
      ],
      equalizeUma: true,
      penaltyStep: 2000,
      startPoints: 30000,
      yakuWithPao: [6, 19, 21],
      withMultiYakumans: true,
      extraChomboPayments: true,
      playAdditionalRounds: true,
      replacementPlayerFixedPoints: -15000,
      replacementPlayerOverrideUma: -15000,
      endingPolicy: EndingPolicy.ENDING_POLICY_EP_ONE_MORE_HAND,
      doubleronHonbaAtamahane: true,
      doubleronRiichiAtamahane: true,
      riichiGoesToWinner: true,
      tonpuusen: false,
      withAbortives: true,
      withAtamahane: false,
      withButtobi: false,
      withKiriageMangan: false,
      withLeadingDealerGameOver: false,
      withNagashiMangan: true,
      withWinningDealerHonbaSkipped: false,
      withYakitori: false,
      chipsValue: 0,
      chomboAmount: 0,
      chomboEndsGame: false,
      gameExpirationTime: 0,
      goalPoints: 0,
      minPenalty: 1000,
      oka: 0,
      doubleYakuman: [],
      startRating: 0,
      yakitoriPenalty: 0,
    });
    em.create(EventEntity, {
      id: 19,
      title: 'Club rating',
      description: '-',
      startTime: '2021-10-28 23:27:09',
      endTime: null,
      gameDuration: null,
      lastTimer: null,
      isOnline: 0,
      isTeam: 0,
      syncStart: 0,
      syncEnd: 0,
      autoSeating: 0,
      useTimer: 0,
      usePenalty: 0,
      allowPlayerAppend: 1,
      statHost: 'http://sigrun.pantheon.local/event/##ID##/info',
      lobbyId: null,
      ruleset: ruleset1,
      timezone: 'Europe/Berlin',
      seriesLength: 0,
      gamesStatus: null,
      hideResults: 0,
      hideAchievements: 0,
      isPrescripted: 0,
      minGamesCount: 0,
      finished: 0,
      isListed: 0,
      onlinePlatform: null,
      allowViewOtherTables: 0,
      allowManualAddReplay: 1,
      windShuffleMode: null,
    });
    em.create(EventEntity, {
      id: 863,
      title: 'Online rating',
      description: '',
      startTime: '2026-04-13 03:29:33',
      endTime: null,
      gameDuration: 75,
      lastTimer: null,
      isOnline: 1,
      isTeam: 0,
      syncStart: 0,
      syncEnd: 0,
      autoSeating: 0,
      useTimer: 0,
      usePenalty: 1,
      allowPlayerAppend: 0,
      statHost: 'http://sigrun.pantheon.local/event/##ID##/info',
      lobbyId: 15159,
      ruleset: ruleset1,
      timezone: 'Europe/Berlin',
      seriesLength: 0,
      gamesStatus: null,
      hideResults: 0,
      hideAchievements: 0,
      isPrescripted: 0,
      minGamesCount: 0,
      finished: 0,
      isListed: 1,
      onlinePlatform: 'PLATFORM_TYPE_TENHOUNET',
      allowViewOtherTables: 0,
      allowManualAddReplay: 1,
      windShuffleMode: null,
    });
    em.create(EventEntity, {
      id: 889,
      title: 'Tournament rating',
      description: 'test tournament rating',
      startTime: '2026-05-15 13:43:32',
      endTime: null,
      gameDuration: 75,
      lastTimer: 1779023450,
      isOnline: 0,
      isTeam: 0,
      syncStart: 1,
      syncEnd: 1,
      autoSeating: 1,
      useTimer: 1,
      usePenalty: 1,
      allowPlayerAppend: 0,
      statHost: 'http://sigrun.pantheon.local/event/##ID##/info',
      lobbyId: null,
      ruleset: ruleset1,
      timezone: 'Europe/Berlin',
      seriesLength: 4,
      gamesStatus: TournamentGamesStatus.TOURNAMENT_GAMES_STATUS_STARTED,
      hideResults: 0,
      hideAchievements: 0,
      isPrescripted: 0,
      minGamesCount: 0,
      finished: 0,
      isListed: 1,
      onlinePlatform: null,
      allowViewOtherTables: 0,
      allowManualAddReplay: 1,
      windShuffleMode: null,
    });
  }

  protected async populateEventRegistrations(em: EntityManager): Promise<void> {
    eventRegisteredPlayers(em).map((r) => {
      return em.create(EventRegisteredPlayersEntity, r);
    });
  }

  protected async populateSessions(em: EntityManager): Promise<void> {
    sessions(em).map((r) => {
      const res = new SessionStateEntity();
      res.chips = r.intermediateResults.chips ?? {};
      res.honba = r.intermediateResults.honba ?? 0;
      res.round = r.intermediateResults.round ?? 1;
      res.chombo = (r.intermediateResults.chombo ?? {}) as Record<number, number>;
      res.scores = (r.intermediateResults.scores ?? {}) as Record<number, number>;
      res.yakitori = r.intermediateResults.yakitori ?? {};
      res.playerIds = r.intermediateResults.player_ids ?? [];
      res.riichiBets = r.intermediateResults.riichi_bets ?? 0;
      res.lastOutcome = r.intermediateResults.last_outcome ?? '';
      res.replacements = r.intermediateResults.replacements ?? {};
      res.lastHandStarted = r.intermediateResults.last_hand_started ?? false;
      res.roundJustChanged = r.intermediateResults.round_just_changed ?? false;
      res.prematurelyFinished = r.intermediateResults.prematurely_finished ?? false;
      return em.create(SessionEntity, { ...r, intermediateResults: res, players: [] });
    });
  }

  protected async populateRounds(em: EntityManager): Promise<void> {
    rounds(em).map((r) => {
      const res = new SessionStateEntity();
      res.chips = r.lastSessionState.chips ?? {};
      res.honba = r.lastSessionState.honba ?? 0;
      res.round = r.lastSessionState.round ?? 1;
      res.chombo = r.lastSessionState.chombo;
      res.scores = r.lastSessionState.scores;
      res.yakitori = r.lastSessionState.yakitori;
      res.playerIds = r.lastSessionState.playerIds;
      res.riichiBets = r.lastSessionState.riichiBets ?? 0;
      res.lastOutcome = r.lastSessionState.lastOutcome ?? '';
      res.replacements = r.lastSessionState.replacements ?? {};
      res.lastHandStarted = r.lastSessionState.lastHandStarted ?? false;
      res.roundJustChanged = r.lastSessionState.roundJustChanged ?? false;
      res.prematurelyFinished = r.lastSessionState.prematurelyFinished ?? false;
      return em.create(RoundEntity, { ...r, hands: [], lastSessionState: res });
    });
  }

  protected async populateHands(em: EntityManager): Promise<void> {
    const handsByRound = hands.reduce(
      (acc, h) => {
        acc[h.roundId] = acc[h.roundId] ?? [];
        acc[h.roundId].push(h);
        return acc;
      },
      {} as Record<number, THand[]>
    );
    Object.entries(handsByRound).forEach(([roundId, handsList]) => {
      handsList.forEach((h) => {
        em.create(HandEntity, { ...h, round: em.getReference(RoundEntity, Number(roundId)) });
      });
    });
  }

  protected async populatePenalties(em: EntityManager): Promise<void> {
    [
      {
        id: 151,
        event: em.getReference(EventEntity, 863),
        playerId: 3071,
        amount: 8000,
        assignedBy: 1640,
        cancelled: 0,
        cancelledReason: null,
        createdAt: '2026-04-24 13:46:01',
        reason: 'Неявка на игры 22.04 за столом С6. Позднее вышел на связь, вину признал',
      },
      {
        id: 156,
        event: em.getReference(EventEntity, 863),
        playerId: 50,
        amount: 64000,
        assignedBy: 336,
        cancelled: 1,
        cancelledReason: 'Штраф применен по ошибке',
        createdAt: '2026-05-15 06:29:44',
        reason: 'Неявка за стол с17, две игры с игроком замены',
      },
      {
        id: 157,
        event: em.getReference(EventEntity, 863),
        playerId: 50,
        amount: 120000,
        assignedBy: 1640,
        cancelled: 0,
        cancelledReason: null,
        createdAt: '2026-05-23 06:13:53',
        reason: 'Неявка за стол с17, две игры с игроком замены',
      },
      {
        id: 158,
        event: em.getReference(EventEntity, 863),
        playerId: 1665,
        amount: 240000,
        assignedBy: 1640,
        cancelled: 0,
        cancelledReason: null,
        createdAt: '2026-05-23 06:16:33',
        reason:
          'не явился на запланированные игры со столом С18. 21.05 и 23.05. играл игрок замены',
      },
    ].map((p) => {
      return em.create(PenaltyEntity, p);
    });
  }

  protected async populatePlayerHistory(em: EntityManager): Promise<void> {
    playerHistory(em).forEach((p) => {
      em.create(PlayerHistoryEntity, p);
    });
  }

  protected async populateSessionPlayers(em: EntityManager): Promise<void> {
    sessionPlayers(em).forEach((p) => {
      em.create(SessionPlayerEntity, p);
    });
  }

  protected async populateSessionResults(em: EntityManager): Promise<void> {
    sessionResults(em).forEach((p) => {
      em.create(SessionResultsEntity, p);
    });
  }
}
