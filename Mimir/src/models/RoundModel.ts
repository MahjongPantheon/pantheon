import { checkRound } from 'src/helpers/roundValidation.js';
import { Ruleset } from 'src/rulesets/ruleset.js';
import { Model } from './Model.js';
import { RoundEntity } from 'src/entities/db/Round.entity.js';
import { SessionEntity } from 'src/entities/db/Session.entity.js';
import { EventEntity } from 'src/entities/db/Event.entity.js';

/** @deprecated */
export interface Round {
  outcome: 'ron' | 'multiron' | 'tsumo' | 'draw' | 'abort' | 'chombo' | 'nagashi';
  session_id: number;
  event_id: number;
  round_index: number;
  riichi: number[];
  end_date: string | null;
  last_session_state: string | null;
  rounds: Array<
    Omit<
      DBRound,
      | 'id'
      | 'outcome'
      | 'session_id'
      | 'multi_ron'
      | 'event_id'
      | 'round'
      | 'riichi'
      | 'end_date'
      | 'last_session_state'
    >
  >;
}

/** @deprecated */
export type PartialRound = Omit<Round, 'rounds' | 'end_date' | 'last_session_state'> & {
  end_date?: Round['end_date'];
  last_session_state?: Round['last_session_state'];
  rounds: Array<
    Partial<
      Omit<
        DBRound,
        | 'id'
        | 'outcome'
        | 'session_id'
        | 'multi_ron'
        | 'event_id'
        | 'round'
        | 'riichi'
        | 'end_date'
        | 'last_session_state'
        | 'open_hand'
      >
    > & { open_hand: number }
  >;
};

const defRound = {
  han: null,
  fu: null,
  dora: null,
  uradora: null,
  kandora: null,
  kanuradora: null,
  yaku: null,
  tempai: null,
  nagashi: null,
  winner_id: null,
  loser_id: null,
  pao_player_id: null,
};

// TODO: should be a domain entity partially
export class RoundModel extends Model {
  makeRoundWithDefaults(input: PartialRound): Round {
    return {
      end_date: null,
      last_session_state: null,
      ...input,
      rounds: input.rounds.map((r) => ({
        ...defRound,
        ...r,
      })),
    };
  }

  async findBySessionIds(sessionIds: number[]): Promise<Map<number, Round[]>> {
    const rounds = await this.repo.db.em.findAll(RoundEntity, {
      where: { session: this.repo.db.em.getReference(SessionEntity, sessionIds) },
    });
    return this.convertAndRegroup(rounds);
  }

  async findChomboInEvent(eventId: number): Promise<Map<number, Round[]>> {
    const rounds = await this.repo.db.em.findAll(RoundEntity, {
      where: { event: this.repo.db.em.getReference(EventEntity, eventId) },
    });
    return this.convertAndRegroup(rounds);
  }

  convertAndRegroup(rounds: RoundEntity[]): Map<number, Round[]> {
    const sessionMap = new Map<number, RoundEntity[]>();
    for (const r of rounds) {
      if (!sessionMap.has(r.session.id)) {
        sessionMap.set(r.session.id, []);
      }
      sessionMap.get(r.session.id)!.push(r);
    }
    sessionMap.forEach((rList) => {
      rList.sort((r1, r2) => r1.id - r2.id);
    });

    const result = new Map<number, Round[]>();
    sessionMap.forEach((rList, sessionId) => {
      if (!result.has(sessionId)) {
        result.set(sessionId, []);
      }
      rList.forEach((r, idx) => {
        if (r.outcome !== 'multiron') {
          result.get(sessionId)!.push({
            outcome: r.outcome as Round['outcome'],
            session_id: r.session.id,
            event_id: r.event.id,
            round_index: r.round,
            riichi: r.riichi ?? [],
            end_date: r.endDate ?? null,
            last_session_state: JSON.stringify(r.lastSessionState ?? null),
            rounds: [r],
          });
        } else {
          if (r.multiRon === 1) {
            result.get(sessionId)!.push({
              outcome: r.outcome as Round['outcome'],
              session_id: r.session.id,
              event_id: r.event.id,
              round_index: r.round,
              riichi: r.riichi ?? [],
              end_date: r.endDate ?? null,
              last_session_state: JSON.stringify(r.lastSessionState ?? null),
              rounds: [],
            });
            for (let i = 0; i < 4; i++) {
              if (rList[idx + i].session.id !== r.session.id) {
                break;
              }
              result
                .get(sessionId)!
                .at(-1)
                ?.rounds.push(rList[idx + i]);
            }
          }
        }
      });
    });

    return result;
  }

  async saveRound(
    players: number[],
    allRegisteredPlayersIds: number[],
    ruleset: Ruleset,
    round: Round
  ) {
    checkRound(players, allRegisteredPlayersIds, ruleset, round);

    let ronIndex = 1;
    for (const dbr of round.rounds) {
      const r = new RoundEntity();
      r.outcome = dbr.outcome;
      r.multiRon = round.outcome === 'multiron' ? ronIndex++ : undefined;
      r.session = this.repo.db.em.getReference(SessionEntity, round.session_id);
      r.event = this.repo.db.em.getReference(EventEntity, round.event_id);
      r.round = round.round_index;
      r.riichi = dbr.riichi.join(',');
      r.endDate = dbr.endDate;
      r.lastSessionState = dbr.lastSessionState;
      this.repo.db.em.persist(r);
    }

    await this.repo.db.em.flush();
  }
}
