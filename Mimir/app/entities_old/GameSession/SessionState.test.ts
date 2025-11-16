import { makeRoundWithDefaults, Round } from '../models/db/round';
import { createRuleset } from '../rulesets/ruleset';
import { SessionState } from './SessionState';

describe('Session state', () => {
  const ruleset = createRuleset('ema');
  const playerIds = [1, 2, 3, 4];
  const sessionId = 1234;
  const eventId = 321;

  it('updates after basic ron', () => {
    const round: Round = makeRoundWithDefaults({
      outcome: 'ron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 2,
          loser_id: 1,
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'ron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 1,
          loser_id: 2,
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'ron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: '1', // daisangen
          winner_id: 2,
          loser_id: 1,
          open_hand: 1,
          pao_player_id: 3,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'ron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: '1', // daisangen
          winner_id: 1,
          loser_id: 2,
          open_hand: 1,
          pao_player_id: 3,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'multiron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [2, 3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 2,
          loser_id: 1,
          open_hand: 0,
        },
        {
          han: 2,
          fu: 40,
          dora: 1,
          yaku: '21', // tanyao
          winner_id: 4,
          loser_id: 1,
          open_hand: 1,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'multiron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [2, 3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 1,
          yaku: '1', // daisangen
          winner_id: 2,
          loser_id: 1,
          open_hand: 0,
          pao_player_id: 4,
        },
        {
          han: 2,
          fu: 40,
          dora: 1,
          yaku: '21', // tanyao
          winner_id: 4,
          loser_id: 1,
          open_hand: 1,
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
        outcome: 'draw',
        session_id: sessionId,
        event_id: eventId,
        round_index: 1,
        riichi: [2, 3],
        rounds: [
          {
            tempai: '',
            open_hand: 0,
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

    const round: Round = makeRoundWithDefaults({
      outcome: 'multiron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [2, 3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 1,
          loser_id: 2,
          open_hand: 0,
        },
        {
          han: 2,
          fu: 40,
          dora: 1,
          yaku: '21', // tanyao
          winner_id: 4,
          loser_id: 2,
          open_hand: 1,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'tsumo',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 2,
          loser_id: 1,
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'tsumo',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 1,
          loser_id: 2,
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'tsumo',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: '1', // daisangen
          winner_id: 2,
          loser_id: 1,
          open_hand: 1,
          pao_player_id: 1,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'tsumo',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          han: -1,
          fu: 30,
          dora: 0,
          yaku: '1', // daisangen
          winner_id: 1,
          loser_id: 2,
          open_hand: 1,
          pao_player_id: 2,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'draw',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          tempai: '2',
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'draw',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          tempai: '1,2',
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'draw',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [],
      rounds: [
        {
          tempai: '',
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'abort',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          open_hand: 0,
        },
      ],
    });

    const state = new SessionState(
      { ...ruleset, rules: { ...ruleset.rules, withAbortives: true } },
      playerIds
    );
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'abort',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          open_hand: 0,
        },
      ],
    });

    const state = new SessionState(ruleset, playerIds);
    expect(() => state.update(round)).toThrow();
  });

  it('updates after chombo without payments', () => {
    const round: Round = makeRoundWithDefaults({
      outcome: 'chombo',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          loser_id: 2,
          open_hand: 0,
        },
      ],
    });

    const state = new SessionState(
      { ...ruleset, rules: { ...ruleset.rules, chomboAmount: 20000, extraChomboPayments: false } },
      playerIds
    );
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'chombo',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [3],
      rounds: [
        {
          loser_id: 2,
          open_hand: 0,
        },
      ],
    });

    const state = new SessionState(
      { ...ruleset, rules: { ...ruleset.rules, chomboAmount: 0, extraChomboPayments: true } },
      playerIds
    );
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
        outcome: 'draw',
        session_id: sessionId,
        event_id: eventId,
        round_index: 1,
        riichi: [4],
        rounds: [
          {
            tempai: '4',
            open_hand: 0,
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

    const round: Round = makeRoundWithDefaults({
      outcome: 'ron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [1],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 1,
          loser_id: 2,
          open_hand: 0,
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
    const round: Round = makeRoundWithDefaults({
      outcome: 'draw',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1, // TODO убрать тут round_index, он не проверяется и только непонятно зачем болтается
      riichi: [],
      rounds: [
        {
          open_hand: 0, // TODO убрать open_hand тут, оно странно выглядит
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

  it('properly serializes and deserializes state', () => {
    const state = new SessionState(ruleset, playerIds);
    const round: Round = makeRoundWithDefaults({
      outcome: 'multiron',
      session_id: sessionId,
      event_id: eventId,
      round_index: 1,
      riichi: [2, 3],
      rounds: [
        {
          han: 3,
          fu: 30,
          dora: 1,
          yaku: '9,21', // pinfu, tanyao
          winner_id: 1,
          loser_id: 2,
          open_hand: 0,
        },
        {
          han: 2,
          fu: 40,
          dora: 1,
          yaku: '21', // tanyao
          winner_id: 4,
          loser_id: 2,
          open_hand: 1,
        },
      ],
    });
    state.update(round);

    const serialized = state.toJson();
    expect(serialized.length).toBeGreaterThan(0);
    const deserialized = SessionState.fromJson(ruleset, playerIds, serialized);
    expect(JSON.stringify(deserialized)).toEqual(JSON.stringify(state));
  });
});
