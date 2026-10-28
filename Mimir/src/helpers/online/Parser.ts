import { SimpleXmlParser, XmlEvent } from './xmlparser.js';
import { fromTenhou } from '../yaku.js';
import { SessionEntity } from '../../entities/Session.entity.js';
import { RoundEntity } from '../../entities/Round.entity.js';
import { EventEntity } from '../../entities/Event.entity.js';
import { SessionState } from '../../helpers/SessionState.js';
import { EventRegistrationModel } from '../../models/EventRegistrationModel.js';
import { Model } from '../../models/Model.js';
import { EventRegisteredPlayersEntity } from '../../entities/EventRegisteredPlayers.entity.js';
import { Repository } from '../../services/Repository.js';
import { PlayerModel } from '../../models/PlayerModel.js';
import { validateAndCreateFromOnlineData } from '../roundValidation.js';
import { Round } from 'tsclients/proto/atoms.pb.js';

export class OnlineParser {
  protected _repo: Repository;
  protected _checkScores: string[][] = [];
  protected _roundData: Round[] = [];
  // Player IDs in replay seat order, defined by UN attributes n0 through n3.
  protected _players: number[] = [];
  protected _riichi: number[] = [];
  protected _lastTokenIsAgari = false;
  protected _ankanCache: string[][] = [[], [], [], []];
  protected _parser: SimpleXmlParser;
  protected _kanNakiCache: { m: string; who: string } = { m: '', who: '' };
  protected _sessionState?: SessionState;
  protected _session?: SessionEntity;

  constructor(repo: Repository) {
    this._repo = repo;
    this._parser = new SimpleXmlParser({
      onEvent: this._handleEvent.bind(this),
    });
  }

  /**
   * Parse XML game log to session
   */
  public async parseToSession(
    event: EventEntity,
    content: string,
    withChips = false
  ): Promise<[SessionEntity, Record<number, number>, RoundEntity[], string[]]> {
    this._session = new SessionEntity();
    this._sessionState = new SessionState(event.ruleset, []);
    this._session.event = event;

    await this._parser.write(content);

    const regModel = Model.getModel(this._repo, EventRegistrationModel);
    const allPlayers = await regModel.fetchRegisteredPlayersByEvent(event.id);

    const scores: Array<Record<number, number>> = [];
    const rounds: RoundEntity[] = [];

    for (const round of this._roundData) {
      const savedRound = validateAndCreateFromOnlineData(
        this._sessionState.state.playerIds,
        allPlayers.map((player) => player.id),
        this._session,
        round
      );
      // Tokens are collected before state progression, so assign counters during replay.
      savedRound.round = this._sessionState.getRound();
      savedRound.honba = this._sessionState.getHonba();
      savedRound.lastSessionState = this._sessionState.state.clone();
      rounds.push(savedRound);
      this._sessionState.update(savedRound);
      scores.push(this._sessionState.getScores());
    }

    const debug: string[] = [];
    for (let i = 0; i < this._checkScores.length; i++) {
      debug.push(
        `Expected\t${this._checkScores[i].join('\t')}\t:: Got\t${this._players.map((id) => scores[i][id]).join('\t')}`
      );
    }

    if (withChips) {
      this._sessionState.setChips(this._parseChipsOutcome(content));
    }

    this._session.intermediateResults = this._sessionState.state;
    this._repo.em.persist(this._session);
    rounds.forEach((round) => {
      this._repo.em.persist(round);
    });

    return [this._session, this._parseOutcome(content), rounds, debug];
  }

  protected async _handleEvent(data: XmlEvent): Promise<void> {
    if (data.type === 'startElement') {
      // Handle N elements (melds)
      if (data.name === 'N') {
        if (data.attributes['m'] && data.attributes['who']) {
          this._kanNakiCache.m = data.attributes['m'];
          this._kanNakiCache.who = data.attributes['who'];
        }
      }

      // Handle DORA elements
      if (data.name === 'DORA') {
        if (this._kanNakiCache) {
          const who = parseInt(this._kanNakiCache.who);
          this._ankanCache[who].push(this._kanNakiCache.m);
        }
      }

      // Handle other elements
      if (data.name === 'UN') {
        await this._tokenUN(data.attributes, this._session!, this._sessionState!);
      } else if (data.name === 'AGARI') {
        this._tokenAGARI(data.attributes, this._sessionState!);
      } else if (data.name === 'INIT') {
        this._tokenINIT();
      } else if (data.name === 'RYUUKYOKU') {
        this._tokenRYUUKYOKU(data.attributes, this._sessionState!);
      } else if (data.name === 'REACH') {
        this._tokenREACH(data.attributes);
      } else if (data.name === 'GO') {
        this._tokenGO(data.attributes, this._session!);
      }
    }
  }

  /**
   * Get final scores by regex
   */
  protected _parseOutcome(content: string): Record<number, number> {
    const regex = /owari="([^"]*)"/;
    const matches = content.match(regex);

    if (matches) {
      const parts = matches[1].split(',');
      const playerIds = this._players;

      const scores = [
        parseInt(parts[0] + '00'),
        parseInt(parts[2] + '00'),
        parseInt(parts[4] + '00'),
        parseInt(parts[6] + '00'),
      ];

      if (playerIds.length !== scores.length) {
        throw new Error('Attempt to combine inequal arrays');
      }

      const result: Record<number, number> = {};
      playerIds.forEach((id, idx) => {
        result[id] = scores[idx];
      });

      return result;
    }

    return {};
  }

  /**
   * Parse chips outcome
   */
  protected _parseChipsOutcome(content: string): Record<number, number> {
    const regex = /owari="([^"]*)"/;
    const matches = content.match(regex);

    if (matches) {
      const parts = matches[1].split(',');
      const playerIds = this._players;

      const chips = [
        parseInt(parts[8]),
        parseInt(parts[10]),
        parseInt(parts[12]),
        parseInt(parts[14]),
      ];

      const result: Record<number, number> = {};
      playerIds.forEach((id, idx) => {
        result[id] = chips[idx];
      });

      return result;
    }

    return {};
  }

  /**
   * Get nagashi scores
   */
  protected _parseNagashi(content: string): number[] {
    const values = content.split(',').map((v) => parseInt(v));
    const [, delta1, , delta2, , delta3, , delta4] = values;

    const ids: number[] = [];
    [delta1, delta2, delta3, delta4].forEach((val, idx) => {
      if (val > 0) {
        const playerId = this._players[idx];
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
   * Make scores array from string
   */
  protected _makeScores(str: string): string[] {
    const parts = str.split(',').map((p) => parseInt(p));
    return [
      parts[0] + parts[1] + '00',
      parts[2] + parts[3] + '00',
      parts[4] + parts[5] + '00',
      parts[6] + parts[7] + '00',
    ];
  }

  /**
   * Token handler: UN (usernames)
   */
  protected async _tokenUN(
    attributes: any,
    session: SessionEntity,
    sessionState: SessionState
  ): Promise<void> {
    if (this._players.length === 0) {
      const playerKeys = [0, 1, 2, 3].map((seat) =>
        decodeURIComponent(attributes[`n${seat}`] ?? '')
      );

      if (playerKeys.includes('NoName')) {
        throw new Error('"NoName" players are not allowed in replays');
      }

      const playerModel = Model.getModel(this._repo, PlayerModel);
      const playersByKey = await playerModel.findByTenhouId(playerKeys);
      const missedPlayers = playerKeys.filter((key) => !playersByKey[key]);
      if (missedPlayers.length > 0) {
        throw new Error(
          `Not all tenhou nicknames were registered in the system: ${missedPlayers.join(', ')}`
        );
      }
      const players = playerKeys.map((key) => playersByKey[key]);

      if (session.event.allowPlayerAppend) {
        const regModel = Model.getModel(this._repo, EventRegistrationModel);
        const regs = await regModel.findByEventId([session.event.id]);
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

      this._players = players.map((player) => player.id);
      sessionState.setPlayers(this._players);
    }
  }

  /**
   * Token handler: AGARI (win)
   */
  protected _tokenAGARI(attributes: any, sessionState: SessionState): void {
    const who = parseInt(attributes['who'] ?? '0');
    const winner = this._players[who];
    const loser = this._players[parseInt(attributes['fromWho'] ?? '0')];
    const paoWho = attributes['paoWho'];
    const paoPlayer = paoWho !== undefined ? this._players[parseInt(paoWho)] : 0;

    let openHand = false;
    const winnerId = winner;
    if (winnerId && !this._riichi.includes(winnerId)) {
      const mAttribute = attributes['m'];
      if (mAttribute) {
        const winnerAnkanCount = this._ankanCache[who].length;
        const mValues = mAttribute.split(',');
        if (winnerAnkanCount > 0) {
          openHand = winnerAnkanCount !== mValues.length;
        } else {
          openHand = true;
        }
      }
    }

    const outcomeType = winner === loser ? 'tsumo' : 'ron';

    const tenAttr = attributes['ten'] ?? '';
    const [fu] = tenAttr.split(',');
    const yakuList = attributes['yaku'] ?? '';
    const yakumanList = attributes['yakuman'] ?? '';

    const yakuData = fromTenhou(
      yakuList,
      yakumanList,
      this._session?.event.ruleset.rules.useAggregatedYakuhai
    );

    if (!this._lastTokenIsAgari) {
      // Single ron, or first ron in sequence
      const riichiBets = this._getRiichi();
      if (outcomeType === 'ron') {
        this._roundData.push({
          ron: {
            winnerId: winner,
            loserId: loser,
            paoPlayerId: paoPlayer,
            han: yakuData.han,
            fu: +fu,
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
            fu: +fu,
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

      this._checkScores.push(this._makeScores(attributes['sc'] ?? ''));
    } else {
      // Double or triple ron, previous round record should be modified
      let roundRecord = this._roundData.pop()!;

      if (roundRecord.ron) {
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
                han: +roundRecord.ron.han,
                fu: +roundRecord.ron.fu,
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
        roundRecord.multiron.wins.push({
          winnerId: winner,
          paoPlayerId: paoPlayer,
          han: yakuData.han,
          fu: +fu,
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
      this._checkScores.push(this._makeScores(attributes['sc'] ?? ''));
    }

    this._lastTokenIsAgari = true;
  }

  /**
   * Token handler: INIT (round start)
   */
  protected _tokenINIT(): void {
    this._ankanCache = [[], [], [], []];
    this._lastTokenIsAgari = false;
  }

  /**
   * Token handler: RYUUKYOKU (draw)
   */
  protected _tokenRYUUKYOKU(attributes: any, sessionState: SessionState): void {
    const rkType = attributes['type'];
    const scoreString = attributes['sc'] ?? '';
    this._checkScores.push(this._makeScores(scoreString));

    if (rkType && rkType !== 'nm') {
      // Abortive draw
      this._roundData.push({
        abort: {
          riichiBets: this._getRiichi(),
          roundIndex: sessionState.getRound(),
          honba: sessionState.getHonba(),
        },
      });
      return;
    }

    // Form array of player id => tempai status
    const playerIds = this._players;

    const tempaiStatuses = [
      !!attributes['hai0'],
      !!attributes['hai1'],
      !!attributes['hai2'],
      !!attributes['hai3'],
    ];

    if (playerIds.length !== tempaiStatuses.length) {
      throw new Error('Attempt to combine inequal arrays');
    }

    const tempai = playerIds.filter((_, seat) => tempaiStatuses[seat]);

    // Special case for nagashi
    if (rkType) {
      this._roundData.push({
        nagashi: {
          riichiBets: this._getRiichi(),
          nagashi: this._parseNagashi(scoreString),
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
   * Token handler: REACH (riichi)
   */
  protected _tokenREACH(attributes: any): void {
    const player = parseInt(attributes['who'] ?? '0');
    if (attributes['step'] === '1') {
      // Unconfirmed riichi, skip
      return;
    }

    const id = this._players[player];
    if (id) {
      this._riichi.push(id);
    }
  }

  /**
   * Token handler: GO (game info)
   */
  protected _tokenGO(attributes: any, session: SessionEntity): void {
    const eventLobby = session.event.lobbyId;
    const lobby = parseInt(attributes['lobby'] ?? '0');

    if (eventLobby !== lobby) {
      throw new Error(`Provided replay doesn't belong to the event lobby ${eventLobby}`);
    }
  }
}
