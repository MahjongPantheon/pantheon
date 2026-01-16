import expat from 'node-expat';
import { fromTenhou } from '../yaku.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { RoundEntity } from 'src/entities/Round.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';
import { SessionState } from 'src/aggregates/SessionState.js';
import { EventRegistrationModel } from 'src/models/EventRegistrationModel.js';
import { Model } from 'src/models/Model.js';
import { EventRegisteredPlayersEntity } from 'src/entities/EventRegisteredPlayers.entity.js';
import { Repository } from 'src/services/Repository.js';
import { PlayerModel } from 'src/models/PlayerModel.js';
import { validateAndCreateFromOnlineData } from '../roundValidation.js';
import { Round } from 'tsclients/proto/atoms.pb.js';

export class OnlineParser {
  protected _repo: Repository;
  protected _checkScores: string[][] = [];
  protected _roundData: Round[] = [];
  protected _players: Record<string, number> = {}; // tenhouNickname -> userId
  protected _riichi: number[] = [];
  protected _lastTokenIsAgari = false;
  protected _ankanCache: string[][] = [];

  constructor(repo: Repository) {
    this._repo = repo;
  }

  /**
   * Parse XML game log to session
   */
  public async parseToSession(
    event: EventEntity,
    content: string,
    withChips = false
  ): Promise<[SessionEntity, Record<number, number>, RoundEntity[], string[]]> {
    const parser = new expat.Parser('UTF-8');

    const kanNakiCache: { m: string; who: string } = { m: '', who: '' };
    this._ankanCache = [[], [], [], []];

    const session = new SessionEntity();
    const sessionState = new SessionState(event.ruleset, []);
    session.event = event;

    // Process XML nodes
    await this._processXMLNodes(parser, content, session, sessionState, kanNakiCache);

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
      rounds.push(savedRound);
      sessionState.update(savedRound);
      scores.push(sessionState.getScores());
    }

    const debug: string[] = [];
    for (let i = 0; i < this._checkScores.length; i++) {
      debug.push(
        `Expected\t${this._checkScores[i].join('\t')}\t:: Got\t${Object.values(scores[i]).join('\t')}`
      );
    }

    if (withChips) {
      sessionState.setChips(this._parseChipsOutcome(content));
    }

    session.intermediateResults = sessionState.state;
    this._repo.db.em.persist(session);
    rounds.forEach((round) => {
      this._repo.db.em.persist(round);
    });

    return [session, this._parseOutcome(content), rounds, debug];
  }

  /**
   * Process XML nodes recursively
   */
  protected async _processXMLNodes(
    parser: expat.Parser,
    xmlContent: string,
    session: SessionEntity,
    sessionState: SessionState,
    kanNakiCache: { m: string; who: string }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      parser.on('startElement', (name: string, attrs: any) => {
        // Handle N elements (melds)
        if (name === 'N') {
          for (const elem of attrs) {
            if (elem['m'] && elem['who']) {
              kanNakiCache.m = elem['m'];
              kanNakiCache.who = elem['who'];
            }
          }
        }

        // Handle DORA elements
        if (name === 'DORA') {
          if (kanNakiCache) {
            const who = parseInt(kanNakiCache.who);
            this._ankanCache[who].push(kanNakiCache.m);
          }
        }

        // Handle other elements
        if (name === 'UN') {
          parser.pause();
          this._tokenUN(attrs, session, sessionState)
            .then(() => {
              parser.resume();
            })
            .catch((err) => {
              reject(err);
            });
        } else if (name === 'AGARI') {
          this._tokenAGARI(attrs, sessionState);
        } else if (name === 'INIT') {
          this._tokenINIT();
        } else if (name === 'RYUUKYOKU') {
          this._tokenRYUUKYOKU(attrs, sessionState);
        } else if (name === 'REACH') {
          this._tokenREACH(attrs);
        } else if (name === 'GO') {
          this._tokenGO(attrs, session);
        }
      });
      parser.on('endElement', (name: string) => {
        if (name === 'mjloggm') {
          resolve();
        }
      });
      parser.on('error', (err: Error) => reject(err));
      parser.write(xmlContent);
    });
  }

  /**
   * Get final scores by regex
   */
  protected _parseOutcome(content: string): Record<number, number> {
    const regex = /owari="([^"]*)"/;
    const matches = content.match(regex);

    if (matches) {
      const parts = matches[1].split(',');
      const playerIds = Object.values(this._players);

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
      const playerIds = Object.values(this._players);

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
        const playerId = Object.values(this._players)[idx];
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
    if (Object.keys(this._players).length === 0) {
      const parsedPlayers: Record<string, number> = {
        [decodeURIComponent(attributes['n0'] ?? '')]: 1,
        [decodeURIComponent(attributes['n1'] ?? '')]: 1,
        [decodeURIComponent(attributes['n2'] ?? '')]: 1,
        [decodeURIComponent(attributes['n3'] ?? '')]: 1,
      };

      if (parsedPlayers['NoName']) {
        throw new Error('"NoName" players are not allowed in replays');
      }

      const playerModel = Model.getModel(this._repo, PlayerModel);
      const players = await playerModel.findByTenhouId(Object.keys(parsedPlayers));

      if (Object.keys(players).length !== Object.keys(parsedPlayers).length) {
        const registeredPlayers = Object.keys(players);
        const missedPlayers = Object.keys(parsedPlayers)
          .filter((p) => !registeredPlayers.includes(p))
          .join(', ');
        throw new Error(`Not all tenhou nicknames were registered in the system: ${missedPlayers}`);
      }

      if (session.event.allowPlayerAppend) {
        const regModel = Model.getModel(this._repo, EventRegistrationModel);
        const regs = await regModel.findByEventId([session.event.id]);
        const registeredPlayers = regs.map((p) => p.playerId);

        for (const player of Object.values(players)) {
          const playerId = player.id;
          if (playerId && !registeredPlayers.includes(playerId)) {
            const reg = new EventRegisteredPlayersEntity();
            reg.event = session.event;
            reg.playerId = playerId;
            this._repo.db.em.persist(reg);
          }
        }
      }

      sessionState.setPlayers(Object.values(players).map((player) => player.id));

      const playerKeys = Object.keys(parsedPlayers);
      const playersMap: Record<string, number> = {};
      playerKeys.forEach((key, idx) => {
        playersMap[key] = Object.values(players)[idx].id;
      });
      this._players = playersMap;
    }
  }

  /**
   * Token handler: AGARI (win)
   */
  protected _tokenAGARI(attributes: any, sessionState: SessionState): void {
    const who = parseInt(attributes['who'] ?? '0');
    const playerKeys = Object.keys(this._players);
    const winner = playerKeys[who];
    const loser = playerKeys[parseInt(attributes['fromWho'] ?? '0')];
    const paoWho = attributes['paoWho'];
    const paoPlayer = paoWho ? playerKeys[parseInt(paoWho)] : null;

    let openHand = false;
    const winnerId = this._players[winner];
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

    const yakuData = fromTenhou(yakuList, yakumanList);

    if (!this._lastTokenIsAgari) {
      // Single ron, or first ron in sequence
      const riichiBets = this._getRiichi();
      if (outcomeType === 'ron') {
        this._roundData.push({
          ron: {
            winnerId: this._players[winner],
            loserId: this._players[loser],
            paoPlayerId: paoPlayer ? this._players[paoPlayer] : 0,
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
            winnerId: this._players[winner],
            paoPlayerId: paoPlayer ? this._players[paoPlayer] : 0,
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
            loserId: this._players[loser],
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
          winnerId: this._players[winner],
          paoPlayerId: paoPlayer ? this._players[paoPlayer] : 0,
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
    const playerIds = Object.values(this._players);

    const tempaiStatuses = [
      !!attributes['hai0'],
      !!attributes['hai1'],
      !!attributes['hai2'],
      !!attributes['hai3'],
    ];

    if (playerIds.length !== tempaiStatuses.length) {
      throw new Error('Attempt to combine inequal arrays');
    }

    const tempaiMap: Record<number, boolean> = {};
    playerIds.forEach((id, idx) => {
      tempaiMap[id] = tempaiStatuses[idx];
    });

    const tempai = Object.entries(tempaiMap)
      .filter(([, status]) => status)
      .map(([id]) => +id);

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

    const playerKeys = Object.keys(this._players);
    const id = this._players[playerKeys[player]];
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
