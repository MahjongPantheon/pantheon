import { groupLegacyRounds } from './groupLegacyRounds.js';
import { getLegacyPlayerIds } from './legacySessionState.js';

const multiron = (session_id: number, round = 1, honba = 0, loser_id = 3) => ({
  session_id,
  round,
  honba,
  loser_id,
  multi_ron: 2,
});

describe('groupLegacyRounds', () => {
  it('keeps consecutive multirons from different sessions separate', () => {
    const rounds = [multiron(1), multiron(1), multiron(2), multiron(2)];
    expect(groupLegacyRounds(rounds)).toEqual([rounds.slice(0, 2), rounds.slice(2)]);
  });

  it('keeps consecutive multirons from different hands separate', () => {
    const rounds = [multiron(1), multiron(1), multiron(1, 2), multiron(1, 2)];
    expect(groupLegacyRounds(rounds)).toEqual([rounds.slice(0, 2), rounds.slice(2)]);
  });

  it('distinguishes dealer repeats and different losers', () => {
    const rounds = [multiron(1), multiron(1, 1, 1), multiron(1, 1, 1, 4)];
    expect(groupLegacyRounds(rounds)).toEqual(rounds.map((round) => [round]));
  });

  it('reads honba from real v1 snapshots when there is no honba column', () => {
    const rows = [0, 0, 1, 1].map((honba) => ({
      session_id: 1,
      round: 1,
      loser_id: 3,
      multi_ron: 2,
      last_session_state: JSON.stringify({ _honba: honba }),
    }));
    expect(groupLegacyRounds(rows)).toEqual([rows.slice(0, 2), rows.slice(2)]);
  });

  it('uses the declared winner count to separate repeated records with the same round and honba', () => {
    const rows = Array.from({ length: 4 }, () => multiron(1));
    expect(groupLegacyRounds(rows)).toEqual([rows.slice(0, 2), rows.slice(2)]);
  });

  it('retains a multiron at the end of a batch and separates ordinary rounds', () => {
    const single = { ...multiron(1), multi_ron: null };
    const rounds = [single, single, multiron(1), multiron(1)];
    expect(groupLegacyRounds(rounds)).toEqual([[single], [single], rounds.slice(2)]);
    expect(groupLegacyRounds([])).toEqual([]);
  });
});

describe('legacy seating', () => {
  it('uses source seating rather than sorted numeric score keys', () => {
    const state = { _scores: { 2: 25000, 11: 25000, 24: 25000, 31: 25000 } };
    expect(getLegacyPlayerIds(state, [24, 11, 31, 2])).toEqual([24, 11, 31, 2]);
  });

  it('prefers explicit snapshot seating when present', () => {
    expect(getLegacyPlayerIds({ _playerIds: [4, 3, 2, 1] }, [1, 2, 3, 4])).toEqual([4, 3, 2, 1]);
  });
});
