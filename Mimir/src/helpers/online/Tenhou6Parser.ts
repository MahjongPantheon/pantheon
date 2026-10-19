/*  Mimir: mahjong games storage
 *  Copyright (C) 2016  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * @Author Steven Vch. <unstatik@staremax.com>
 */

import { SessionEntity } from '../../entities/Session.entity.js';
import { PersonEx, PlatformType, Round } from 'tsclients/proto/atoms.pb.js';
import { Tenhou6Model } from './Tenhou6Model.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { validateAndCreateFromOnlineData } from '../roundValidation.js';
import { Model } from '../../models/Model.js';
import { EventRegistrationModel } from '../../models/EventRegistrationModel.js';
import { Repository } from '../../services/Repository.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { PlayerModel } from '../../models/PlayerModel.js';
import { fromTenhou } from '../yaku.js';

interface TokenUnItem {
  player_name: string;
  account_id?: number;
}

interface TokenAgari {
  who: number;
  fromWho: number;
  paoWho: number;
  openHand: boolean;
  fu: number;
  yaku: any;
  yakuman: any;
  isMangan: boolean;
  sc: string[];
}

interface TokenRyuukyoku {
  type?: string;
  sc: string[];
  hai0: boolean;
  hai1: boolean;
  hai2: boolean;
  hai3: boolean;
}

interface TokenReach {
  who: number;
}

interface TokenGo {
  lobby: string;
}

export class Tenhou6OnlineParser {
  protected _repo: Repository;
  protected _checkScores: string[][] = [];
  protected _roundData: Round[] = [];
  // Player IDs in replay seat order, defined by tokenUN.
  protected _players: number[] = [];
  protected _riichi: number[] = [];
  protected _lastTokenIsAgari = false;

  constructor(repo: Repository) {
    this._repo = repo;
  }

  /**
   * Parse game log and populate session
   */
  async parseToSession(
    event: EventEntity,
    replayHash: string,
    content: string,
    withChips = false,
    platformId: PlatformType = PlatformType.PLATFORM_TYPE_TENHOUNET
  ): Promise<[SessionEntity, Record<number, number>, RoundEntity[], string[]]> {
    const tenhou6Model = new Tenhou6Model(content, platformId);
    const session = new SessionEntity();
    const sessionState = new SessionState(event.ruleset, []);
    session.event = event;
    session.replayHash = replayHash;

    this.validateModel(session, tenhou6Model);

    await this.tokenUN(tenhou6Model, session, sessionState);
    await this.tokenGO(tenhou6Model.getTokenGO(), session);

    if (!tenhou6Model.getRounds() || tenhou6Model.getRounds().length === 0) {
      throw new Error('Rounds were not found in replay: this is critical error.');
    }

    for (const roundData of tenhou6Model.getRounds()) {
      for (const token of roundData.reach_tokens) {
        this.tokenREACH(token);
      }

      if (roundData.type === 'AGARI') {
        this.tokenAGARI(roundData.token, sessionState);
      } else if (roundData.type === 'MULTI_AGARI') {
        for (const tokenAgari of roundData.tokens) {
          this.tokenAGARI(tokenAgari, sessionState);
        }
      } else if (roundData.type === 'RYUUKYOKU') {
        this.tokenRYUUKYOKU(roundData.token, sessionState);
      }
      this.tokenINIT();
    }

    const regModel = Model.getModel(this._repo, EventRegistrationModel);
    const allPlayers = await regModel.fetchRegisteredPlayersByEvent(event.id);
    const scores: Array<Record<number, number>> = [];
    const rounds: RoundEntity[] = [];

    for (const round of this._roundData) {
      const savedRound = validateAndCreateFromOnlineData(
        sessionState.state.playerIds,
        allPlayers.map((player) => player.id),
        session,
        round
      );
      // Tokens are collected before state progression, so assign counters during replay.
      savedRound.round = sessionState.getRound();
      savedRound.honba = sessionState.getHonba();
      rounds.push(savedRound);
      sessionState.update(savedRound);
      scores.push(sessionState.getScores());
    }

    const debug: string[] = [];
    for (let i = 0; i < this._checkScores.length; i++) {
      debug.push(
        `Expected\t${this._checkScores[i].join('\t')}\t:: Got\t${this._players.map((id) => scores[i][id]).join('\t')}`
      );
    }

    if (withChips) {
      throw new Error('Chips in tenhou format6 not supported');
    }

    session.intermediateResults = sessionState.state;
    this._repo.em.persist(session);
    rounds.forEach((round) => {
      this._repo.em.persist(round);
    });

    return [session, this.parseOutcome(tenhou6Model.getOwari()), rounds, debug];
  }

  /**
   * Validate tenhou6 model
   */
  private validateModel(session: SessionEntity, tenhou6Model: Tenhou6Model): void {
    if (session.replayHash !== tenhou6Model.getReplayHash()) {
      throw new Error('Replay hash not equals with session hash');
    }
  }

  /**
   * Much simpler to get final scores by regex :)
   */
  protected parseOutcome(owari: number[]): Record<number, number> {
    const playerIds = this._players;

    const scores = [
      parseInt(String(owari[0])),
      parseInt(String(owari[2])),
      parseInt(String(owari[4])),
      parseInt(String(owari[6])),
    ];

    const result: Record<number, number> = {};
    playerIds.forEach((id, index) => {
      result[id] = scores[index];
    });

    if (Object.keys(result).length === 0) {
      throw new Error('Attempt to combine inequal arrays');
    }

    return result;
  }

  /**
   * Get nagashi scores
   */
  protected _parseNagashi(arrayWithScores: string[]): number[] {
    const [delta1, delta2, delta3, delta4] = arrayWithScores.map((s) => parseInt(s));

    const ids: number[] = [];
    const playersList = this._players;

    [delta1, delta2, delta3, delta4].forEach((val, idx) => {
      if (val > 0) {
        const playerId = playersList[idx];
        if (playerId !== undefined) {
          ids.push(playerId);
        }
      }
    });

    return ids;
  }

  protected _getRiichi(): number[] {
    const riichis = this._riichi;
    this._riichi = [];
    return riichis;
  }

  /**
   * Provide parsed player key specified for game platform
   */
  protected getParsedPlayerKey(tenhou6Model: Tenhou6Model, tokenUnItem: TokenUnItem): string {
    if (tenhou6Model.getPlatformId() === PlatformType.PLATFORM_TYPE_TENHOUNET) {
      return decodeURIComponent(tokenUnItem.player_name);
    } else {
      return `${decodeURIComponent(tokenUnItem.player_name)}-${tokenUnItem.account_id}`;
    }
  }

  /**
   * This actually should be called first, before any round.
   * If game format is not changed, this won't break.
   */
  protected async tokenUN(
    tenhou6Model: Tenhou6Model,
    session: SessionEntity,
    sessionState: SessionState
  ): Promise<void> {
    if (this._players.length === 0) {
      const playerKeys = tenhou6Model
        .getTokenUN()
        .map((token) => this.getParsedPlayerKey(tenhou6Model, token));
      if (
        tenhou6Model.getPlatformId() === PlatformType.PLATFORM_TYPE_TENHOUNET &&
        playerKeys.includes('NoName')
      ) {
        throw new Error('"NoName" players are not allowed in replays');
      }

      const playersByKey = await this.loadPlayers(tenhou6Model, playerKeys);
      const missedPlayers = playerKeys.filter((key) => !playersByKey[key]);
      if (missedPlayers.length > 0) {
        const platformName =
          tenhou6Model.getPlatformId() === PlatformType.PLATFORM_TYPE_MAHJONGSOUL
            ? 'Mahjongsoul'
            : 'Tenhou';
        throw new Error(
          `Not all ${platformName} nicknames were registered in the system: ${missedPlayers.join(', ')}`
        );
      }
      const players = playerKeys.map((key) => playersByKey[key]);

      const regModel = Model.getModel(this._repo, EventRegistrationModel);
      const regs = await regModel.findByEventId([session.event.id]);
      if (session.event.allowPlayerAppend) {
        const registeredPlayers = regs.map((p) => p.playerId);

        for (const player of players) {
          const playerId = player.id;
          if (playerId && !registeredPlayers.includes(playerId)) {
            const reg = new EventRegisteredPlayersEntity();
            reg.event = session.event;
            reg.playerId = playerId;
            this._repo.em.persist(reg);
          }
        }
      }

      // check if some players were replaced and replace them back
      const backreplMap: Record<number, number> = {};

      for (const reg of regs) {
        const replacementId = reg.replacementId;
        const playerId = reg.playerId;
        if (replacementId && playerId) {
          backreplMap[replacementId] = playerId;
        }
      }

      const mapToPlayer: Record<number, PersonEx> = {};
      const playerModel = Model.getModel(this._repo, PlayerModel);
      const originals = await playerModel.findById(
        Object.values(backreplMap).filter((id): id is number => id !== undefined)
      );

      for (const rep of originals) {
        const repId = rep.id;
        if (repId !== undefined) {
          mapToPlayer[repId] = rep;
        }
      }

      const regPlayers = players.map((player) => {
        const playerId = player.id;
        if (playerId !== null && backreplMap[playerId] && mapToPlayer[backreplMap[playerId]]) {
          return mapToPlayer[backreplMap[playerId]];
        }
        return player;
      });

      this._players = regPlayers.map((player) => player.id);
      sessionState.setPlayers(this._players);
    }
  }

  /**
   * Load array of PlayerPrimitive
   */
  private async loadPlayers(
    tenhou6Model: Tenhou6Model,
    playerKeys: string[]
  ): Promise<Record<string, PersonEx>> {
    const playerModel = Model.getModel(this._repo, PlayerModel);

    if (tenhou6Model.getPlatformId() === PlatformType.PLATFORM_TYPE_TENHOUNET) {
      return await playerModel.findByTenhouId(playerKeys);
    }

    if (tenhou6Model.getPlatformId() === PlatformType.PLATFORM_TYPE_MAHJONGSOUL) {
      return await playerModel.findMajsoulAccounts(
        tenhou6Model
          .getTokenUN()
          .map((token) => [decodeURIComponent(token.player_name), token.account_id ?? 0] as const)
      );
    }

    return {};
  }

  /**
   * Process token AGARI
   */
  protected tokenAGARI(tokenAgari: TokenAgari, sessionState: SessionState): void {
    const winner = this._players[tokenAgari.who];
    const loser = this._players[tokenAgari.fromWho];
    const paoPlayer = tokenAgari.paoWho !== -1 ? this._players[tokenAgari.paoWho] : 0;
    const openHand = tokenAgari.openHand;
    const outcomeType = winner === loser ? 'tsumo' : 'ron';

    const fu = tokenAgari.fu;
    const yakuList = tokenAgari.yaku;
    const yakumanList = tokenAgari.yakuman;
    const isMangan = tokenAgari.isMangan;

    const yakuData = fromTenhou(yakuList, yakumanList);

    if (!this._lastTokenIsAgari) {
      let calculatedFu = fu;

      // logic for regular mangan
      if (isMangan) {
        const currentHan = yakuData.han;
        if (currentHan === 4) {
          calculatedFu = 40;
        }
        if (currentHan === 3) {
          calculatedFu = 70;
        }
      }

      const riichiBets = this._getRiichi();
      if (outcomeType === 'ron') {
        this._roundData.push({
          ron: {
            winnerId: winner,
            loserId: loser,
            paoPlayerId: paoPlayer,
            han: yakuData.han,
            fu: calculatedFu,
            dora: yakuData.dora,
            uradora: 0,
            kandora: 0,
            kanuradora: 0,
            yaku: yakuData.yaku,
            riichiBets,
            openHand,
            roundIndex: sessionState.getRound(),
            honba: sessionState.getHonba(),
          },
        });
      } else {
        this._roundData.push({
          tsumo: {
            winnerId: winner,
            paoPlayerId: paoPlayer,
            han: yakuData.han,
            fu: calculatedFu,
            dora: yakuData.dora,
            uradora: 0,
            kandora: 0,
            kanuradora: 0,
            yaku: yakuData.yaku,
            riichiBets,
            openHand,
            roundIndex: sessionState.getRound(),
            honba: sessionState.getHonba(),
          },
        });
      }

      this._checkScores.push(tokenAgari.sc);
    } else {
      // double or triple ron, previous round record should be modified
      let roundRecord = this._roundData.pop()!;

      if (roundRecord.ron) {
        let calculatedFu = roundRecord.ron.fu;

        // logic for regular mangan
        if (isMangan) {
          const currentHan = yakuData.han;
          if (currentHan === 4) {
            calculatedFu = 40;
          }
          if (currentHan === 3) {
            calculatedFu = 70;
          }
        }
        roundRecord = {
          multiron: {
            multiRon: 1,
            loserId: loser,
            riichiBets: roundRecord.ron.riichiBets,
            roundIndex: sessionState.getRound(),
            honba: sessionState.getHonba(),
            wins: [
              {
                winnerId: roundRecord.ron.winnerId,
                paoPlayerId: roundRecord.ron.paoPlayerId,
                han: roundRecord.ron.han,
                fu: calculatedFu,
                dora: roundRecord.ron.dora,
                uradora: roundRecord.ron.uradora,
                kandora: roundRecord.ron.kandora,
                kanuradora: roundRecord.ron.kanuradora,
                yaku: roundRecord.ron.yaku,
                openHand: roundRecord.ron.openHand,
              },
            ],
          },
        };
      }

      if (roundRecord.multiron) {
        roundRecord.multiron.multiRon = roundRecord.multiron.multiRon + 1;
        let calculatedFu = fu;

        // logic for regular mangan
        if (isMangan) {
          const currentHan = yakuData.han;
          if (currentHan === 4) {
            calculatedFu = 40;
          }
          if (currentHan === 3) {
            calculatedFu = 70;
          }
        }
        roundRecord.multiron.wins.push({
          winnerId: winner,
          paoPlayerId: paoPlayer,
          han: yakuData.han,
          fu: calculatedFu,
          dora: yakuData.dora,
          uradora: 0,
          kandora: 0,
          kanuradora: 0,
          yaku: yakuData.yaku,
          openHand,
        });
      }

      this._roundData.push(roundRecord);

      this._checkScores.pop();
      this._checkScores.push(tokenAgari.sc);
    }

    this._lastTokenIsAgari = true;
  }

  /**
   * Round start, reset all needed things
   */
  protected tokenINIT(): void {
    this._lastTokenIsAgari = false;
  }

  /**
   * Process token RYUUKYOKU
   */
  protected tokenRYUUKYOKU(tokenRyuukyoku: TokenRyuukyoku, sessionState: SessionState): void {
    const rkType = tokenRyuukyoku.type;
    this._checkScores.push(tokenRyuukyoku.sc);

    if (rkType && rkType !== 'nm') {
      this._roundData.push({
        abort: {
          riichiBets: this._getRiichi(),
          roundIndex: sessionState.getRound(),
          honba: sessionState.getHonba(),
        },
      });
      return;
    }

    const tempaiBySeat = [
      tokenRyuukyoku.hai0,
      tokenRyuukyoku.hai1,
      tokenRyuukyoku.hai2,
      tokenRyuukyoku.hai3,
    ];
    const tempai = this._players.filter((_, index) => tempaiBySeat[index]);

    // Special case for nagashi, implied that rkType == 'nm'
    if (rkType === 'nm') {
      this._roundData.push({
        nagashi: {
          riichiBets: this._getRiichi(),
          nagashi: this._parseNagashi(tokenRyuukyoku.sc),
          tempai,
          roundIndex: sessionState.getRound(),
          honba: sessionState.getHonba(),
        },
      });
      return;
    }

    this._roundData.push({
      draw: {
        tempai,
        riichiBets: this._getRiichi(),
        roundIndex: sessionState.getRound(),
        honba: sessionState.getHonba(),
      },
    });
  }

  /**
   * Process token REACH
   */
  protected tokenREACH(tokenReach: TokenReach): void {
    const id = this._players[tokenReach.who];
    if (id !== undefined) {
      this._riichi.push(id);
    }
  }

  /**
   * Process token GO
   */
  protected async tokenGO(tokenGO: TokenGo, session: SessionEntity): Promise<void> {
    const eventLobby = session.event.lobbyId;
    const lobby = parseInt(tokenGO.lobby);

    if (eventLobby !== lobby) {
      throw new Error(`Provided replay doesn't belong to the event lobby ${eventLobby}`);
    }
  }
}
