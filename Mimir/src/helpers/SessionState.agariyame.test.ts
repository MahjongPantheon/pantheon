import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';
import { HandEntity } from '../entities/Hand.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { SessionState } from './SessionState.js';

function fixture(roundIndex = 8) {
  const rules = RulesetEntity.createRuleset('tenhounet');
  rules.rules.withTobi = false;
  const state = new SessionState(rules, [1, 2, 3, 4]);
  state.state.round = roundIndex;
  state.state.roundJustChanged = true;
  return { rules, state };
}

function round(outcome: RoundOutcome, ...hands: Partial<HandEntity>[]) {
  return Object.assign(new RoundEntity(), {
    outcome,
    riichi: [],
    hands: hands.map((hand) => Object.assign(new HandEntity(), hand)),
  });
}

const dealerOutcomes = [
  RoundOutcome.ROUND_OUTCOME_RON,
  RoundOutcome.ROUND_OUTCOME_TSUMO,
  RoundOutcome.ROUND_OUTCOME_DRAW,
  RoundOutcome.ROUND_OUTCOME_MULTIRON,
];

function dealerRound(state: SessionState, outcome: RoundOutcome) {
  const dealer = state.getCurrentDealer();
  const other = (dealer % 4) + 1;
  const loser = (other % 4) + 1;
  return round(
    outcome,
    { winnerId: dealer, loserId: loser, han: 1, fu: 30, tempai: [dealer, other] },
    ...(outcome === RoundOutcome.ROUND_OUTCOME_MULTIRON
      ? [{ winnerId: other, loserId: loser, han: 1, fu: 30 }]
      : [])
  );
}

it.each(dealerOutcomes)(
  'ends South 4 after a leading dealer %s when additional rounds are disabled',
  (outcome) => {
    const { state, rules } = fixture();
    rules.rules.playAdditionalRounds = false;
    state.setScores({ 1: 27000, 2: 23000, 3: 22500, 4: 27500 });

    state.update(dealerRound(state, outcome));

    expect(state.getRound()).toBe(8);
    expect(state.getScores()[4]).toBe(29000);
    expect(state.isFinished()).toBe(true);
    expect(new SessionState(rules, [1, 2, 3, 4], state.state).isFinished()).toBe(true);
  }
);

it.each(dealerOutcomes)('requires the goal for a leading dealer %s with extensions', (outcome) => {
  const { state } = fixture();
  state.setScores({ 1: 27000, 2: 23000, 3: 22500, 4: 27500 });
  state.update(dealerRound(state, outcome));
  expect(state.getScores()[4]).toBe(29000);
  expect(state.isFinished()).toBe(false);
});

it.each([8, 9, 10, 11, 12])('gives renchan priority over the goal in round %s', (roundIndex) => {
  const { state } = fixture(roundIndex);
  const dealer = state.getCurrentDealer();
  const other = (dealer % 4) + 1;
  const scores: Record<number, number> = { 1: 20300, 2: 20300, 3: 20300, 4: 20300 };
  scores[dealer] = 29500;
  scores[other] = 29800;
  scores[(other % 4) + 1] = 20400;
  state.setScores(scores);

  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [dealer, other] }));

  expect(state.getScores()[dealer]).toBe(31000);
  expect(state.getScores()[other]).toBe(31300);
  expect(state.getRound()).toBe(roundIndex);
  expect(state.getHonba()).toBe(1);
  expect(state.isFinished()).toBe(false);

  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [other] }));

  expect(state.getRound()).toBe(roundIndex + 1);
  expect(state.isFinished()).toBe(true);
});

it.each([9, 10, 11, 12])('checks the current dealer for agariyame in round %s', (roundIndex) => {
  const { state, rules } = fixture(roundIndex);
  const dealer = state.getCurrentDealer();
  state.setScores({ 1: 23000, 2: 23000, 3: 23000, 4: 23000, [dealer]: 31000 });

  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [1, 2, 3, 4] }));

  expect(state.getRound()).toBe(roundIndex);
  expect(state.isFinished()).toBe(true);
  rules.rules.withLeadingDealerGameOver = false;
  expect(state.isFinished()).toBe(false);
});

it.each([8, 9])('continues renchan when the dealer is tied for first in round %s', (roundIndex) => {
  const { state } = fixture(roundIndex);
  const dealer = state.getCurrentDealer();
  const other = (dealer % 4) + 1;
  state.setScores({ 1: 20000, 2: 20000, 3: 20000, 4: 20000, [dealer]: 30000, [other]: 30000 });
  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [1, 2, 3, 4] }));
  expect(state.getRound()).toBe(roundIndex);
  expect(state.isFinished()).toBe(false);
});

it.each([8, 9, 10, 11, 12])(
  'ends on dealer rotation at exactly the goal in round %s',
  (roundIndex) => {
    const { state, rules } = fixture(roundIndex);
    rules.rules.withLeadingDealerGameOver = false;
    const dealer = state.getCurrentDealer();
    const other = (dealer % 4) + 1;
    state.setScores({ 1: 25000, 2: 25000, 3: 25000, 4: 25000, [other]: 27000, [dealer]: 23000 });

    state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [other] }));

    expect(state.getScores()[other]).toBe(30000);
    expect(state.getRound()).toBe(roundIndex + 1);
    expect(state.isFinished()).toBe(true);
  }
);

it.each([8, 9])('continues below the goal on dealer rotation from round %s', (roundIndex) => {
  const { state } = fixture(roundIndex);
  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [] }));
  expect(state.getRound()).toBe(roundIndex + 1);
  expect(state.isFinished()).toBe(false);
});

it.each([RoundOutcome.ROUND_OUTCOME_ABORT, RoundOutcome.ROUND_OUTCOME_CHOMBO])(
  'does not end after %s even when a player has reached the goal',
  (outcome) => {
    const { state } = fixture(9);
    state.setScores({ 1: 40000, 2: 20000, 3: 20000, 4: 20000 });
    state.update(round(outcome, { loserId: 2 }));
    expect(state.getRound()).toBe(9);
    expect(state.isFinished()).toBe(false);
  }
);

it('ends after the additional wind even if nobody reaches the goal', () => {
  const { state } = fixture(12);
  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [] }));
  expect(state.getRound()).toBe(13);
  expect(state.isFinished()).toBe(true);
});

it.each([false, true])(
  'uses East 4 and South extensions for tonpuusen (extensions=%s)',
  (extensions) => {
    const { state, rules } = fixture(4);
    rules.rules.tonpuusen = true;
    rules.rules.playAdditionalRounds = extensions;
    state.setScores({ 1: 23000, 2: 23000, 3: 23000, 4: 31000 });
    state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [4] }));
    expect(state.isFinished()).toBe(true);

    state.state.round = 5;
    state.setScores({ 1: 29500, 2: 29800, 3: 20300, 4: 20400 });
    state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [1, 2] }));
    expect(state.isFinished()).toBe(!extensions);
  }
);

it('uses the three-player round boundary and current dealer for sanma', () => {
  const rules = RulesetEntity.createRuleset('sanma');
  rules.rules.withLeadingDealerGameOver = true;
  rules.rules.playAdditionalRounds = true;
  const state = new SessionState(rules, [1, 2, 3]);
  state.state.round = 7;
  state.setScores({ 1: 40500, 2: 41000, 3: 23500 });
  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [1, 2, 3] }));
  expect(state.getCurrentDealer()).toBe(1);
  expect(state.isFinished()).toBe(false);

  state.update(round(RoundOutcome.ROUND_OUTCOME_DRAW, { tempai: [1] }));
  expect(state.getCurrentDealer()).toBe(1);
  expect(state.isFinished()).toBe(true);
});
