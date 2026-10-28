import { Seating_ts, type PlayersMap } from './Seating_ts.js';

class Seating extends Seating_ts {
  factor(seating: PlayersMap, history: number[][]) {
    return this._calculateIntersectionFactor(seating, history);
  }
  winds(seating: PlayersMap, history: number[][]) {
    return this._updatePlacesAtEachTable(seating, history);
  }
}
const players = (count: number): PlayersMap =>
  Array.from({ length: count }, (_, id) => [id, 100000 - id * 1000]);
const ids = (seating: PlayersMap) => seating.map(([id]) => id).sort((a, b) => a - b);
afterEach(() => vi.restoreAllMocks());

it('counts repeated pairings and penalizes consecutive meetings', () => {
  const seating = new Seating();
  const p = players(4);
  expect(seating.factor(p, [])).toBe(0);
  expect(seating.factor(p, [[0, 1, 2, 3]])).toBe(66);
  expect(
    seating.factor(p, [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
    ])
  ).toBe(6);
  expect(seating.makeIntersectionsTable(p, [[0, 1, 2, 3]])).toEqual({
    '0+++1': 2,
    '0+++2': 2,
    '0+++3': 2,
    '1+++2': 2,
    '1+++3': 2,
    '2+++3': 2,
  });
});

it.each([4, 8, 12])(
  'shuffles %s players without changing IDs, ratings or the input',
  async (count) => {
    const seating = new Seating();
    const p = players(count);
    const before = structuredClone(p);
    const result = await seating.shuffledSeating(p, [[0, 1, 2, 3]], 1, 42);
    expect(ids(result!)).toEqual(ids(p));
    expect(new Map(result)).toEqual(new Map(p));
    expect(p).toEqual(before);
  }
);

it('returns an empty seating for an empty registration list', async () => {
  const seating = new Seating();
  expect(await seating.shuffledSeating([], [], 1, 1)).toEqual([]);
  expect(seating.makeIntervalSeating([], 1)).toEqual([]);
  expect(await seating.swissSeating([], [])).toEqual([]);
});

it('balances winds against previous placements', () => {
  const seating = new Seating();
  const p = players(4);
  const history = [[0, 1, 2, 3]];
  const result = seating.winds(p, history)!;
  expect(ids(result)).toEqual([0, 1, 2, 3]);
  result.forEach(([id], index) => expect(id).not.toBe(history[0][index]));
});

it.each([
  [8, 2],
  [12, 2],
  [16, 3],
])('makes interval seating for %s players at step %s', (count, step) => {
  const seating = new Seating();
  const p = players(count);
  const result = seating.makeIntervalSeating(p, step);
  expect(ids(result)).toEqual(ids(p));
  expect(new Map(result)).toEqual(new Map(p));
  expect(p).toEqual(players(count));
});

it.each([4, 8])('makes Swiss seating for %s players with previous crossings', async (count) => {
  const seating = new Seating();
  const p = players(count);
  const result = await seating.swissSeating(p, [Array.from({ length: 4 }, (_, i) => i)]);
  expect(ids(result)).toEqual(ids(p));
});

it('translates local IDs from a prescript and leaves the script intact', () => {
  const script = [[1, 2, 3, 4]];
  expect(
    new Seating().makePrescriptedSeating(
      script,
      new Map([
        [1, 10],
        [2, 20],
        [3, 30],
        [4, 40],
      ])
    )
  ).toEqual([
    [
      { id: 10, local_id: 1 },
      { id: 20, local_id: 2 },
      { id: 30, local_id: 3 },
      { id: 40, local_id: 4 },
    ],
  ]);
  expect(script).toEqual([[1, 2, 3, 4]]);
});
