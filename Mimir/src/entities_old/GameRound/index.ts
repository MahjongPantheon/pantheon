import { Round as _Round } from '../../database/schema';
import { checkRound } from '../../helpers/roundValidation';
import { Ruleset } from '../../rulesets/ruleset';
import { EntityBase } from 'entities/EntityBase';

type DBRound = Omit<_Round, 'id'> & {
  id: number;
};

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

export class GameRoundEntity extends EntityBase {
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
    const rounds = await this.repo.db.client
      .selectFrom('round')
      .where('session_id', 'in', sessionIds)
      .selectAll()
      .execute();
    return this.convertAndRegroup(rounds);
  }

  async findChomboInEvent(eventId: number): Promise<Map<number, Round[]>> {
    const rounds = await this.repo.db.client
      .selectFrom('round')
      .where('event_id', '=', eventId)
      .selectAll()
      .execute();
    return this.convertAndRegroup(rounds);
  }

  convertAndRegroup(rounds: DBRound[]): Map<number, Round[]> {
    const sessionMap = new Map<number, DBRound[]>();
    for (const r of rounds) {
      if (!sessionMap.has(r.session_id)) {
        sessionMap.set(r.session_id, []);
      }
      sessionMap.get(r.session_id)!.push(r);
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
            session_id: r.session_id,
            event_id: r.event_id,
            round_index: r.round,
            riichi: (r.riichi ?? '').split(',').map((i) => parseInt(i)),
            end_date: r.end_date,
            last_session_state: r.last_session_state,
            rounds: [r],
          });
        } else {
          if (r.multi_ron === 1) {
            result.get(sessionId)!.push({
              outcome: r.outcome as Round['outcome'],
              session_id: r.session_id,
              event_id: r.event_id,
              round_index: r.round,
              riichi: (r.riichi ?? '').split(',').map((i) => parseInt(i)),
              end_date: r.end_date,
              last_session_state: r.last_session_state,
              rounds: [],
            });
            for (let i = 0; i < 4; i++) {
              if (rList[idx + i].session_id !== r.session_id) {
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
    const rounds: Omit<DBRound, 'id'>[] = [];
    let ronIndex = 1;
    for (const dbr of round.rounds) {
      rounds.push({
        ...dbr,
        outcome: round.outcome,
        multi_ron: round.outcome === 'multiron' ? ronIndex++ : null,
        session_id: round.session_id,
        event_id: round.event_id,
        round: round.round_index,
        riichi: round.riichi.join(','),
        end_date: round.end_date,
        last_session_state: round.last_session_state,
      });
    }
    return await this.repo.db.client.insertInto('round').values(rounds).execute();
  }
}
