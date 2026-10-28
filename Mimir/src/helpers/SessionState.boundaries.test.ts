import { SessionState } from './SessionState.js';
import { RulesetEntity } from '../entities/Ruleset.entity.js';
import { RoundEntity } from '../entities/Round.entity.js';
import { HandEntity } from '../entities/Hand.entity.js';
import { RoundOutcome } from 'tsclients/proto/atoms.pb.js';

function fixture() {
  const rules = RulesetEntity.createRuleset('ema');
  Object.assign(rules.rules, {
    withTobi: false,
    withLeadingDealerGameOver: true,
    goalPoints: 30000,
    playAdditionalRounds: true,
  });
  const state = new SessionState(rules, [1, 2, 3, 4]);
  return { rules, state };
}
function round(outcome: RoundOutcome, hand: Partial<HandEntity> = {}) {
  return Object.assign(new RoundEntity(), {
    outcome,
    hands: [Object.assign(new HandEntity(), hand)],
  });
}

it.each(['chombo', 'abort', 'draw'])(
  'only permits a leading dealer finish after a normal oorasu: %s',
  (lastOutcome) => {
    const { state } = fixture();
    Object.assign(state.state, { round: 8, roundJustChanged: false, lastOutcome });
    state.setScores({ 1: 20000, 2: 20000, 3: 20000, 4: 40000 });
    expect(state.isFinished()).toBe(lastOutcome === 'draw');
    state.state.roundJustChanged = true;
    expect(state.isFinished()).toBe(false);
    state.state.round = 7;
    expect(state.isFinished()).toBe(false);
  }
);

it('requires the dealer to meet the goal and distinguishes east-only games', () => {
  const { state, rules } = fixture();
  Object.assign(state.state, { round: 8, roundJustChanged: false, lastOutcome: 'draw' });
  state.setScores({ 1: 40000, 2: 20000, 3: 20000, 4: 20000 });
  expect(state.isFinished()).toBe(false);
  state.setScores({ 1: 25000, 2: 25000, 3: 25000, 4: 25000 });
  expect(state.isFinished()).toBe(false);
  rules.rules.tonpuusen = true;
  state.state.round = 4;
  state.setScores({ 1: 20000, 2: 20000, 3: 20000, 4: 40000 });
  expect(state.isFinished()).toBe(true);
});

it('ends additional rounds at the goal or absolute round limit but not after chombo', () => {
  const { state } = fixture();
  Object.assign(state.state, { round: 9, lastOutcome: 'draw' });
  state.setScores({ 1: 25000, 2: 25000, 3: 25000, 4: 25000 });
  expect(state.isFinished()).toBe(false);
  state.setScores({ 1: 31000, 2: 23000, 3: 23000, 4: 23000 });
  expect(state.isFinished()).toBe(true);
  state.state.lastOutcome = 'chombo';
  expect(state.isFinished()).toBe(false);
  state.state.lastOutcome = 'draw';
  state.state.round = 13;
  expect(state.isFinished()).toBe(true);
});

it('supports tobi, forced completion and explicit last-hand state', () => {
  const { state, rules } = fixture();
  rules.rules.withTobi = true;
  state.setScores({ 1: -100, 2: 30100, 3: 35000, 4: 35000 });
  expect(state.isFinished()).toBe(true);
  rules.rules.withTobi = false;
  expect(state.isFinished()).toBe(false);
  expect(state.setLastHandStarted().lastHandStarted()).toBe(true);
  expect(state.setLastHandStarted(false).lastHandStarted()).toBe(false);
  expect(state.forceFinish()).toBe(state);
  expect(state.isFinished()).toBe(true);
});

it('initializes optional player data and rejects incomplete seating', () => {
  const { state } = fixture();
  expect(() => state.setPlayers([1, 2, 3])).toThrow('Players count is not 4');
  state.setPlayers([5, 6, 7, 8]);
  expect(state.state.playerIds).toEqual([5, 6, 7, 8]);
  expect(state.getChips()).toEqual({});
  expect(state.getYakitori()).toEqual({});
  expect(state.getChombo()).toEqual({});
  expect(state.setChips({ 5: 2 }).getChips()).toEqual({ 5: 2 });
  expect(state.setYakitori({ 5: true }).getYakitori()).toEqual({ 5: true });
  expect(state.setReplacements({ 5: 9 }).getReplacements()).toEqual({ 5: 9 });
  const before = state.getScores()[5];
  state.giveRiichiBetsToPlayer(null, 1000);
  expect(state.getScores()[5]).toBe(before);
  state.giveRiichiBetsToPlayer(5, 1000);
  expect(state.getScores()[5]).toBe(before + 1000);
});

it.each([
  [RoundOutcome.ROUND_OUTCOME_RON, 'Winner and loser'],
  [RoundOutcome.ROUND_OUTCOME_MULTIRON, 'Loser'],
  [RoundOutcome.ROUND_OUTCOME_TSUMO, 'Winner'],
  [RoundOutcome.ROUND_OUTCOME_CHOMBO, 'Loser'],
] as const)('rejects missing participant IDs for %s', (outcome, error) => {
  expect(() => fixture().state.update(round(outcome))).toThrow(new RegExp(error, 'i'));
});

it('rejects unsupported outcomes and disabled abortive draws', () => {
  const { state, rules } = fixture();
  rules.rules.withAbortives = false;
  expect(() => state.update(round(RoundOutcome.ROUND_OUTCOME_ABORT))).toThrow(
    'do not allow abortive'
  );
  expect(() => state.update(round(RoundOutcome.ROUND_OUTCOME_UNSPECIFIED))).toThrow(
    'wrong outcome'
  );
});
