import { RulesetEntity } from 'src/entities/Ruleset.entity.js';
import { SessionState } from './SessionState.js';
import { RoundEntity } from 'src/entities/Round.entity.js';
import { HandEntity } from 'src/entities/Hand.entity.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { SessionEntity } from 'src/entities/Session.entity.js';
import { EventEntity } from 'src/entities/Event.entity.js';

type Vals = {
  outcome: RoundOutcome;
  sessionId: number;
  eventId: number;
  roundIndex: number;
  riichi: number[];
  rounds: {
    han?: number;
    tempai?: number[];
    fu?: number;
    dora?: number;
    yaku?: number[];
    winnerId?: number;
    loserId?: number;
    openHand?: number;
    paoPlayerId?: number;
  }[];
};

function makeRoundWithDefaults(vals: Vals): RoundEntity {
  const round = new RoundEntity();
  round.outcome = vals.outcome;
  round.session = { id: vals.sessionId } as SessionEntity;
  round.event = { id: vals.eventId } as EventEntity;
  round.round = vals.roundIndex;
  round.riichi = vals.riichi;
  round.hands = vals.rounds.map((hand) => {
    const h = new HandEntity();
    h.han = hand.han;
    h.fu = hand.fu;
    h.dora = hand.dora;
    h.yaku = hand.yaku;
    h.winnerId = hand.winnerId;
    h.loserId = hand.loserId;
    h.tempai = hand.tempai;
    h.openHand = !!hand.openHand;
    h.paoPlayerId = hand.paoPlayerId;
    return h;
  });
  return round;
}

describe('Session state', () => {
  const ruleset = RulesetEntity.createRuleset('ema');
  const playerIds = [1, 2, 3, 4];
  const sessionId = 1234;
  const eventId = 321;

  it('updates after basic ron', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_RON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: [9, 21], // pinfu, tanyao
          winnerId: 2,
          loserId: 1,
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 - 3900,
      2: 30000 + 3900 + 1000,
      3: 30000 - 1000,
      4: 30000,
    });
  });

  it('updates after dealer ron', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_RON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: [9, 21], // pinfu, tanyao
          winnerId: 1,
          loserId: 2,
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 + 5800 + 1000,
      2: 30000 - 5800,
      3: 30000 - 1000,
      4: 30000,
    });
  });

  it('updates after pao ron', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_RON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: [1], // daisangen
          winnerId: 2,
          loserId: 1,
          openHand: 1,
          paoPlayerId: 3,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 - 16000,
      2: 30000 + 32000 + 1000,
      3: 30000 - 1000 - 16000,
      4: 30000,
    });
  });

  it('updates after pao dealer ron', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_RON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: [1], // daisangen
          winnerId: 1,
          loserId: 2,
          openHand: 1,
          paoPlayerId: 3,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 + 48000 + 1000,
      2: 30000 - 24000,
      3: 30000 - 1000 - 24000,
      4: 30000,
    });
  });

  it('updates after multi ron', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_MULTIRON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [2, 3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: [9, 21], // pinfu, tanyao
          winnerId: 2,
          loserId: 1,
          openHand: 0,
        },
        {
          han: 2,
          fu: 40,
          dora: 1,
          yaku: [21], // tanyao
          winnerId: 4,
          loserId: 1,
          openHand: 1,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 - 3900 - 2600,
      2: 30000 + 3900 - 1000 + 1000 + 1000,
      3: 30000 - 1000,
      4: 30000 + 2600,
    });
  });

  it('updates after multi ron with pao', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_MULTIRON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [2, 3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 1,
          yaku: [1], // daisangen
          winnerId: 2,
          loserId: 1,
          openHand: 0,
          paoPlayerId: 4,
        },
        {
          han: 2,
          fu: 40,
          dora: 1,
          yaku: [21], // tanyao
          winnerId: 4,
          loserId: 1,
          openHand: 1,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 - 16000 - 2600,
      2: 30000 + 32000 - 1000 + 1000 + 1000,
      3: 30000 - 1000,
      4: 30000 - 16000 + 2600,
    });
  });

  it('updates after multi ron with riichi on table', () => {
    const state = new SessionState(ruleset, playerIds);
    state.update(
      makeRoundWithDefaults({
        outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
        sessionId: sessionId,
        eventId: eventId,
        roundIndex: 1,
        riichi: [2, 3],
        rounds: [
          {
            tempai: [],
            openHand: 0,
          },
        ],
      })
    );
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(2);
    expect(state.getScores()).toEqual({
      1: 30000,
      2: 30000 - 1000,
      3: 30000 - 1000,
      4: 30000,
    });

    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_MULTIRON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [2, 3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: [9, 21], // pinfu, tanyao
          winnerId: 1,
          loserId: 2,
          openHand: 0,
        },
        {
          han: 2,
          fu: 40,
          dora: 1,
          yaku: [21], // tanyao
          winnerId: 4,
          loserId: 2,
          openHand: 1,
        },
      ],
    });

    state.update(round);
    expect(state.getCurrentDealer()).toEqual(3);
    expect(state.getRound()).toEqual(3);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 + 3900 + 300,
      2: 29000 - 1000 - 3900 - 2600 - 600,
      3: 29000 - 1000,
      4: 30000 + 2600 + 1000 + 1000 + 300 + 2000 /* by atamahane from prev round */,
    });
  });

  it('updates after basic tsumo', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: [9, 21], // pinfu, tanyao
          winnerId: 2,
          loserId: 1,
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 - 2000,
      2: 30000 + 4000 + 1000,
      3: 30000 - 1000 - 1000,
      4: 30000 - 1000,
    });
  });

  it('updates after dealer tsumo', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: [9, 21], // pinfu, tanyao
          winnerId: 1,
          loserId: 2,
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 + 6000 + 1000,
      2: 30000 - 2000,
      3: 30000 - 2000 - 1000,
      4: 30000 - 2000,
    });
  });

  it('updates after pao tsumo', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: [1], // daisangen
          winnerId: 2,
          loserId: 1,
          openHand: 1,
          paoPlayerId: 1,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 - 32000,
      2: 30000 + 32000 + 1000,
      3: 30000 - 1000,
      4: 30000,
    });
  });

  it('updates after pao dealer tsumo', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_TSUMO,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: [1], // daisangen
          winnerId: 1,
          loserId: 2,
          openHand: 1,
          paoPlayerId: 2,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000 + 48000 + 1000,
      2: 30000 - 48000,
      3: 30000 - 1000,
      4: 30000,
    });
  });

  it('updates after draw dealer noten', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          tempai: [2],
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(1);
    expect(state.getScores()).toEqual({
      1: 30000 - 1000,
      2: 30000 + 3000,
      3: 30000 - 1000 - 1000,
      4: 30000 - 1000,
    });
  });

  it('updates after draw dealer tempai', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          tempai: [1, 2],
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(1);
    expect(state.getScores()).toEqual({
      1: 30000 + 1500,
      2: 30000 + 1500,
      3: 30000 - 1500 - 1000,
      4: 30000 - 1500,
    });
  });

  it('updates after draw everybody noten', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [],
      rounds: [
        {
          tempai: [],
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(2);
    expect(state.getRound()).toEqual(2);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000,
      2: 30000,
      3: 30000,
      4: 30000,
    });
  });

  it('updates after abort', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_ABORT,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          openHand: 0,
        },
      ],
    });

    const ruleset2 = RulesetEntity.createRuleset('ema');
    ruleset2.rules.withAbortives = true;
    const state = new SessionState(ruleset2, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(1);
    expect(state.getScores()).toEqual({
      1: 30000,
      2: 30000,
      3: 30000 - 1000,
      4: 30000,
    });
  });

  it('fails to update after abort if not allowed', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_ABORT,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          openHand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    expect(() => state.update(round)).toThrow();
  });

  it('updates after chombo without payments', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_CHOMBO,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          loserId: 2,
          openHand: 0,
        },
      ],
    });

    const ruleset2 = RulesetEntity.createRuleset('ema');
    ruleset2.rules.chomboAmount = 20000;
    ruleset2.rules.extraChomboPayments = false;
    const state = new SessionState(ruleset2, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getChombo()).toEqual({ 2: -20000 });
    expect(state.getScores()).toEqual({
      1: 30000,
      2: 30000,
      3: 30000,
      4: 30000,
    });
  });

  it('updates after chombo with payments', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_CHOMBO,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [3],
      rounds: [
        {
          loserId: 2,
          openHand: 0,
        },
      ],
    });

    const ruleset2 = RulesetEntity.createRuleset('ema');
    ruleset2.rules.chomboAmount = 0;
    ruleset2.rules.extraChomboPayments = true;
    const state = new SessionState(ruleset2, playerIds);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(1);
    expect(state.getRound()).toEqual(1);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getChombo()).toEqual({});
    expect(state.getScores()).toEqual({
      1: 30000 + 4000,
      2: 30000 - 8000,
      3: 30000 + 2000,
      4: 30000 + 2000,
    });
  });

  it('properly gives riichi bets after draw and ron', () => {
    const state = new SessionState(ruleset, playerIds);
    state.update(
      makeRoundWithDefaults({
        outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
        sessionId: sessionId,
        eventId: eventId,
        roundIndex: 1,
        riichi: [4],
        rounds: [
          {
            tempai: [4],
            openHand: 0,
          },
        ],
      })
    );
    expect(state.getHonba()).toEqual(1);
    expect(state.getRiichiBets()).toEqual(1);
    expect(state.getScores()).toEqual({
      1: 30000 - 1000,
      2: 30000 - 1000,
      3: 30000 - 1000,
      4: 30000 + 3000 - 1000,
    });

    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_RON,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1,
      riichi: [1],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: [9, 21], // pinfu, tanyao
          winnerId: 1,
          loserId: 2,
          openHand: 0,
        },
      ],
    });

    state.update(round);
    expect(state.getHonba()).toEqual(0);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 29000 + 3900 + 1000 + 300 - 1000 + 1000,
      2: 29000 - 3900 - 300,
      3: 29000,
      4: 33000 - 1000,
    });
  });

  it('updates several times with draw', () => {
    const round: RoundEntity = makeRoundWithDefaults({
      outcome: RoundOutcome.ROUND_OUTCOME_DRAW,
      sessionId: sessionId,
      eventId: eventId,
      roundIndex: 1, // TODO убрать тут round_index, он не проверяется и только непонятно зачем болтается
      riichi: [],
      rounds: [
        {
          openHand: 0, // TODO убрать open_hand тут, оно странно выглядит
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    state.update(round);
    state.update(round);
    state.update(round);
    state.update(round);
    state.update(round);
    state.update(round);
    state.update(round);
    expect(state.getCurrentDealer()).toEqual(4);
    expect(state.getRound()).toEqual(8);
    expect(state.getHonba()).toEqual(7);
    expect(state.getRiichiBets()).toEqual(0);
    expect(state.getScores()).toEqual({
      1: 30000,
      2: 30000,
      3: 30000,
      4: 30000,
    });
  });
});
