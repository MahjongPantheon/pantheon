import { Seating } from './Seating';
import { PlayersMap } from 'mahjong-seatings-rs-node';

const toList = (players: PlayersMap) =>
  Object.entries(players).map(([key, value]) => [+key, value]);

describe('Seating Rust', () => {
  describe('shuffledSeating - single group', () => {
    it('should create initial random seating', async () => {
      const players: PlayersMap = {
        1: 1500,
        2: 1500,
        3: 1500,
        4: 1500,
        5: 1500,
        6: 1500,
        7: 1500,
        8: 1500,
        9: 1500,
        10: 1500,
        11: 1500,
        12: 1500,
      };

      const seating = new Seating().shuffledSeating(players, [], 1, 123123);

      expect(seating).toBeDefined();
      expect(seating).toHaveLength(12);
      expect(JSON.stringify(seating)).not.toBe(JSON.stringify(players));
      expect(seating?.sort(([a], [b]) => a - b)).toEqual(toList(players));
    });

    it('should not intersect after first game', async () => {
      const players: PlayersMap = {
        1: 1500,
        2: 1500,
        3: 1500,
        4: 1500,
        5: 1500,
        6: 1500,
        7: 1500,
        8: 1500,
        9: 1500,
        10: 1500,
        11: 1500,
        12: 1500,
        13: 1500,
        14: 1500,
        15: 1500,
        16: 1500,
      };

      const previousSeating = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];

      const seating = new Seating().shuffledSeating(players, previousSeating, 1, 2134163);
      const intersections = new Seating().makeIntersectionsTable(seating, previousSeating);

      Object.values(intersections).forEach((intersection) => {
        expect(intersection).toBe(1);
      });
    });

    it('should handle seating after several games', async () => {
      const players: PlayersMap = {
        1: 1500,
        2: 1500,
        3: 1500,
        4: 1500,
        5: 1500,
        6: 1500,
        7: 1500,
        8: 1500,
        9: 1500,
        10: 1500,
        11: 1500,
        12: 1500,
        13: 1500,
        14: 1500,
        15: 1500,
        16: 1500,
      };

      const previousSeating = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [4, 8, 12, 16],
      ];

      const seating = new Seating().shuffledSeating(players, previousSeating, 1, 9486370);
      const intersections = new Seating().makeIntersectionsTable(seating, previousSeating);

      Object.values(intersections).forEach((intersection) => {
        // shuffled seating is not as good as swiss and may produce intersections even in second game
        expect(intersection).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('shuffledSeating - two groups', () => {
    it('should separate winners and losers', async () => {
      const players: PlayersMap = {
        1: 1508,
        2: 1507,
        3: 1506,
        4: 1505,
        5: 1504,
        6: 1503,
        7: 1502,
        8: 1501,
        9: 1499,
        10: 1498,
        11: 1497,
        12: 1496,
        13: 1495,
        14: 1494,
        15: 1493,
        16: 1492,
      };

      const previousSeating = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];

      const seating = new Seating().shuffledSeating(players, previousSeating, 2, 3462352);

      const seatingValues = Object.values(seating);
      const winners = seatingValues.slice(0, 8);
      const losers = seatingValues.slice(8);

      winners.forEach((score) => {
        expect(score[1]).toBeGreaterThan(1500);
      });

      losers.forEach((score) => {
        expect(score[1]).toBeLessThan(1500);
      });

      const intersections = new Seating().makeIntersectionsTable(seating, previousSeating);
      Object.values(intersections).forEach((intersection) => {
        expect(intersection).toBeLessThanOrEqual(2); // may be 2, as of stricter conditions
      });
    });
  });

  describe('swissSeating', () => {
    it('should handle swiss seating after several games', async () => {
      const players: PlayersMap = {
        1: -1200,
        2: 9200,
        3: -13700,
        4: 4400,
        5: -27400,
        6: 10500,
        7: -29500,
        8: -8000,
        9: -23700,
        10: -9000,
        11: 1900,
        12: -38200,
        13: -1000,
        14: 13400,
        15: -34900,
        16: -19200,
        17: 8500,
        18: 11700,
        19: -32100,
        20: -4700,
        21: -15100,
        22: -2000,
        23: -25700,
        24: 21400,
        25: 40000,
        26: 64200,
        27: -14700,
        28: 49500,
        29: 35400,
        30: 1900,
        31: 59400,
        32: -31300,
      };

      const previousSeating = [
        // session 1
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
        [17, 18, 19, 20],
        [21, 22, 23, 24],
        [25, 26, 27, 28],
        [29, 30, 31, 32],

        // session 2
        [1, 5, 9, 13],
        [2, 6, 10, 14],
        [3, 7, 11, 15],
        [4, 8, 12, 16],
        [17, 21, 25, 29],
        [18, 22, 26, 30],
        [19, 23, 27, 31],
        [20, 24, 28, 32],

        // session 3
        [26, 14, 31, 24],
        [29, 28, 18, 6],
        [25, 11, 30, 2],
        [4, 22, 13, 17],
        [20, 1, 8, 10],
        [27, 16, 21, 3],
        [7, 9, 23, 32],
        [5, 12, 19, 15],

        // session 4
        [13, 26, 29, 2],
        [11, 28, 17, 31],
        [18, 24, 4, 25],
        [1, 27, 30, 14],
        [9, 6, 15, 22],
        [21, 12, 20, 7],
        [3, 32, 8, 19],
        [16, 5, 10, 23],

        // session 5
        [26, 17, 6, 1],
        [25, 13, 31, 20],
        [4, 14, 28, 21],
        [29, 11, 5, 24],
        [2, 18, 9, 8],
        [23, 12, 3, 30],
        [16, 19, 7, 22],
        [32, 15, 27, 10],

        // session 6
        [26, 20, 11, 4],
        [31, 21, 1, 18],
        [28, 30, 16, 9],
        [12, 25, 32, 6],
        [29, 8, 23, 15],
        [24, 19, 13, 10],
        [3, 5, 22, 14],
        [2, 17, 7, 27],

        // session 7
        [11, 26, 8, 21],
        [30, 4, 31, 6],
        [12, 2, 22, 28],
        [25, 9, 19, 14],
        [29, 24, 16, 1],
        [10, 3, 13, 18],
        [5, 23, 17, 20],
        [32, 15, 27, 7],

        // session 8
        [26, 7, 10, 31],
        [23, 1, 25, 28],
        [20, 22, 27, 29],
        [30, 8, 17, 24],
        [32, 18, 14, 11],
        [13, 21, 19, 6],
        [16, 2, 4, 5],
        [12, 3, 9, 15],
      ];

      const s = new Seating();
      const seating = s.swissSeating(players, previousSeating, 12345);
      const intersections = new Seating().makeIntersectionsTable(seating, previousSeating);

      Object.values(intersections).forEach((intersection) => {
        // Swiss seating should produce seating of 32 players in 8 games with no more than 2 intersections of each pair
        expect(intersection).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('makeIntervalSeating', () => {
    const players: PlayersMap = {
      1: 100000,
      2: 90000,
      3: 80000,
      4: 70000,
      5: 60000,
      6: 50000,
      7: 40000,
      8: 30000,
      9: 20000,
      10: 10000,
      11: 0,
      12: -10000,
      13: -20000,
      14: -30000,
      15: -40000,
      16: -50000,
      17: -60000,
      18: -70000,
      19: -80000,
      20: -90000,
    };

    it('should create interval seating with step 2', () => {
      const s = new Seating();
      const seating = s.intervalSeating(players, 2, 12345);
      const expected = [
        [7, 40000],
        [1, 100000],
        [3, 80000],
        [5, 60000],
        [4, 70000],
        [6, 50000],
        [8, 30000],
        [2, 90000],
        [15, -40000],
        [9, 20000],
        [11, 0],
        [13, -20000],
        [12, -10000],
        [14, -30000],
        [16, -50000],
        [10, 10000],
        [20, -90000],
        [17, -60000],
        [18, -70000],
        [19, -80000],
      ];
      expect(seating).toEqual(expected);
    });

    it('should create interval seating with step 3', () => {
      const s = new Seating();
      const seating = s.intervalSeating(players, 3, 12345);
      const expected = [
        [10, 10000],
        [1, 100000],
        [4, 70000],
        [7, 40000],

        [5, 60000],
        [8, 30000],
        [11, 0],
        [2, 90000],

        [12, -10000],
        [3, 80000],
        [6, 50000],
        [9, 20000],

        [14, -30000],
        [15, -40000],
        [16, -50000],
        [13, -20000],

        [20, -90000],
        [17, -60000],
        [18, -70000],
        [19, -80000],
      ];
      expect(seating).toEqual(expected);
    });

    it('should create interval seating with step 4', () => {
      const s = new Seating();
      const seating = s.intervalSeating(players, 4, 12345);
      const expected = [
        [13, -20000],
        [1, 100000],
        [5, 60000],
        [9, 20000],

        [6, 50000],
        [10, 10000],
        [14, -30000],
        [2, 90000],

        [15, -40000],
        [3, 80000],
        [7, 40000],
        [11, 0],

        [8, 30000],
        [12, -10000],
        [16, -50000],
        [4, 70000],

        [20, -90000],
        [17, -60000],
        [18, -70000],
        [19, -80000],
      ];
      expect(seating).toEqual(expected);
    });

    it('should create interval seating with step 5', () => {
      const s = new Seating();
      const seating = s.intervalSeating(players, 5, 12345);
      const expected = [
        [16, -50000],
        [1, 100000],
        [6, 50000],
        [11, 0],

        [7, 40000],
        [12, -10000],
        [17, -60000],
        [2, 90000],

        [18, -70000],
        [3, 80000],
        [8, 30000],
        [13, -20000],

        [9, 20000],
        [14, -30000],
        [19, -80000],
        [4, 70000],

        [20, -90000],
        [5, 60000],
        [10, 10000],
        [15, -40000],
      ];
      expect(seating).toEqual(expected);
    });
  });

  describe('makePrescriptedSeating', () => {
    it('should create prescripted seating from arrangement', () => {
      const prescriptForSession = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ];
      const players = new Map([
        [1, 101],
        [2, 102],
        [3, 103],
        [4, 104],
        [5, 105],
        [6, 106],
        [7, 107],
        [8, 108],
      ]);

      const result = new Seating().makePrescriptedSeating(prescriptForSession, players);

      expect(result).toHaveLength(8);
      expect(result).toEqual([
        [101, 1],
        [102, 2],
        [103, 3],
        [104, 4],
        [105, 5],
        [106, 6],
        [107, 7],
        [108, 8],
      ]);
    });
  });
});
