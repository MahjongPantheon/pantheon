import { PlayersMap, Seating_ts } from './Seating_ts';

describe.skip('Seating', () => {
  describe('makeIntersectionsTable', () => {
    it('should correctly calculate intersection table', () => {
      const players: PlayersMap = [
        [1, 1500],
        [2, 1500],
        [3, 1500],
        [4, 1500],
        [5, 1500],
        [6, 1500],
        [7, 1500],
        [8, 1500],
        [9, 1500],
        [10, 1500],
        [11, 1500],
        [12, 1500],
        [13, 1500],
        [14, 1500],
        [15, 1500],
        [16, 1500],
      ];

      const previousSeating = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];

      const table = new Seating_ts().makeIntersectionsTable(players, previousSeating);
      const check = [
        '1+++2',
        '1+++3',
        '1+++4',
        '2+++3',
        '2+++4',
        '3+++4',

        '5+++6',
        '5+++7',
        '5+++8',
        '6+++7',
        '6+++8',
        '7+++8',

        '9+++10',
        '9+++11',
        '9+++12',
        '10+++11',
        '10+++12',
        '11+++12',

        '13+++14',
        '13+++15',
        '13+++16',
        '14+++15',
        '14+++16',
        '15+++16',
      ];

      check.forEach((intersection) => {
        expect(table[intersection]).toBe(2); // last seating is exactly same as previous -> expect 2 everywhere
      });
      expect(Object.keys(table)).toHaveLength(check.length);
    });
  });

  describe('shuffledSeating - single group', () => {
    it('should create initial random seating', async () => {
      const players: PlayersMap = [
        [1, 1500],
        [2, 1500],
        [3, 1500],
        [4, 1500],
        [5, 1500],
        [6, 1500],
        [7, 1500],
        [8, 1500],
        [9, 1500],
        [10, 1500],
        [11, 1500],
        [12, 1500],
      ];

      const seating = await new Seating_ts().shuffledSeating(players, [], 1, 3464752);

      expect(seating).toBeDefined();
      expect(seating).toHaveLength(12);
      expect(JSON.stringify(seating)).not.toBe(JSON.stringify(players));
      expect(seating?.sort(([a], [b]) => a - b)).toEqual(players);
    });

    it('should not intersect after first game', async () => {
      const players: PlayersMap = [
        [1, 1500],
        [2, 1500],
        [3, 1500],
        [4, 1500],
        [5, 1500],
        [6, 1500],
        [7, 1500],
        [8, 1500],
        [9, 1500],
        [10, 1500],
        [11, 1500],
        [12, 1500],
        [13, 1500],
        [14, 1500],
        [15, 1500],
        [16, 1500],
      ];

      const previousSeating = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];

      const seating = await new Seating_ts().shuffledSeating(players, previousSeating, 1, 3462352);
      const intersections = new Seating_ts().makeIntersectionsTable(seating!, previousSeating);

      Object.values(intersections).forEach((intersection) => {
        expect(intersection).toBe(1);
      });
    });

    it('should handle seating after several games', async () => {
      const players: PlayersMap = [
        [1, 1500],
        [2, 1500],
        [3, 1500],
        [4, 1500],
        [5, 1500],
        [6, 1500],
        [7, 1500],
        [8, 1500],
        [9, 1500],
        [10, 1500],
        [11, 1500],
        [12, 1500],
        [13, 1500],
        [14, 1500],
        [15, 1500],
        [16, 1500],
      ];

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

      const seating = await new Seating_ts().shuffledSeating(players, previousSeating, 1, 9486370);
      const intersections = new Seating_ts().makeIntersectionsTable(seating!, previousSeating);

      Object.values(intersections).forEach((intersection) => {
        // shuffled seating is not as good as swiss and may produce intersections even in second game
        expect(intersection).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('shuffledSeating - two groups', () => {
    it('should separate winners and losers', async () => {
      const players: PlayersMap = [
        [1, 1508],
        [2, 1507],
        [3, 1506],
        [4, 1505],
        [5, 1504],
        [6, 1503],
        [7, 1502],
        [8, 1501],
        [9, 1499],
        [10, 1498],
        [11, 1497],
        [12, 1496],
        [13, 1495],
        [14, 1494],
        [15, 1493],
        [16, 1492],
      ];

      const previousSeating = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16],
      ];

      const seating = await new Seating_ts().shuffledSeating(players, previousSeating, 2, 3462352);

      const seatingValues = Object.values(seating!);
      const winners = seatingValues.slice(0, 8);
      const losers = seatingValues.slice(8);

      winners.forEach((score) => {
        expect(score[1]).toBeGreaterThan(1500);
      });

      losers.forEach((score) => {
        expect(score[1]).toBeLessThan(1500);
      });

      const intersections = new Seating_ts().makeIntersectionsTable(seating!, previousSeating);
      Object.values(intersections).forEach((intersection) => {
        expect(intersection).toBeLessThanOrEqual(2); // may be 2, as of stricter conditions
      });
    });
  });

  describe('swissSeating', () => {
    it('should handle swiss seating after several games', async () => {
      const players: PlayersMap = [
        [1, -1200],
        [2, 9200],
        [3, -13700],
        [4, 4400],
        [5, -27400],
        [6, 10500],
        [7, -29500],
        [8, -8000],
        [9, -23700],
        [10, -9000],
        [11, 1900],
        [12, -38200],
        [13, -1000],
        [14, 13400],
        [15, -34900],
        [16, -19200],
        [17, 8500],
        [18, 11700],
        [19, -32100],
        [20, -4700],
        [21, -15100],
        [22, -2000],
        [23, -25700],
        [24, 21400],
        [25, 40000],
        [26, 64200],
        [27, -14700],
        [28, 49500],
        [29, 35400],
        [30, 1900],
        [31, 59400],
        [32, -31300],
      ];

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

        // session 6 (commented out in original)
        /*[26, 20, 11, 4],
        [31, 21, 1, 18],
        [28, 30, 16, 9],
        [12, 25, 32, 6],
        [29, 8, 23, 15],
        [24, 19, 13, 10],
        [3, 5, 22, 14],
        [2, 17, 7, 27],*/

        // session 7 (commented out in original)
        /*[11, 26, 8, 21],
        [30, 4, 31, 6],
        [12, 2, 22, 28],
        [25, 9, 19, 14],
        [29, 24, 16, 1],
        [10, 3, 13, 18],
        [5, 23, 17, 20],
        [32, 15, 27, 7],*/

        // session 8 (commented out in original)
        /*[26, 7, 10, 31],
        [23, 1, 25, 28],
        [20, 22, 27, 29],
        [30, 8, 17, 24],
        [32, 18, 14, 11],
        [13, 21, 19, 6],
        [16, 2, 4, 5],
        [12, 3, 9, 15]*/
      ];

      const s = new Seating_ts();
      const seating = await s.swissSeating(players, previousSeating);
      const intersections = new Seating_ts().makeIntersectionsTable(seating, previousSeating);

      Object.values(intersections).forEach((intersection) => {
        // Swiss seating should produce seating of 32 players in 8 games with no more than 2 intersections of each pair
        expect(intersection).toBeLessThanOrEqual(2);
      });
    });
  });

  describe('makeIntervalSeating', () => {
    const players: PlayersMap = [
      [1, 100000],
      [2, 90000],
      [3, 80000],
      [4, 70000],
      [5, 60000],
      [6, 50000],
      [7, 40000],
      [8, 30000],
      [9, 20000],
      [10, 10000],
      [11, 0],
      [12, -10000],
      [13, -20000],
      [14, -30000],
      [15, -40000],
      [16, -50000],
      [17, -60000],
      [18, -70000],
      [19, -80000],
      [20, -90000],
    ];

    it('should create interval seating with step 2', () => {
      const s = new Seating_ts();
      s.shuffle = function (arr) {
        // mock to preserve order
        return arr;
      };
      const seating = s.makeIntervalSeating(players, 2);
      const expected = [
        [1, 100000],
        [3, 80000],
        [5, 60000],
        [7, 40000],
        [2, 90000],
        [4, 70000],
        [6, 50000],
        [8, 30000],
        [9, 20000],
        [11, 0],
        [13, -20000],
        [15, -40000],
        [10, 10000],
        [12, -10000],
        [14, -30000],
        [16, -50000],
        [17, -60000],
        [18, -70000],
        [19, -80000],
        [20, -90000],
      ];
      expect(seating).toEqual(expected);
    });

    it('should create interval seating with step 3', () => {
      const s = new Seating_ts();
      s.shuffle = function (arr) {
        // mock to preserve order
        return arr;
      };
      const seating = s.makeIntervalSeating(players, 3);
      const expected = [
        [1, 100000],
        [4, 70000],
        [7, 40000],
        [10, 10000],

        [2, 90000],
        [5, 60000],
        [8, 30000],
        [11, 0],

        [3, 80000],
        [6, 50000],
        [9, 20000],
        [12, -10000],

        [13, -20000],
        [14, -30000],
        [15, -40000],
        [16, -50000],

        [17, -60000],
        [18, -70000],
        [19, -80000],
        [20, -90000],
      ];
      expect(seating).toEqual(expected);
    });

    it('should create interval seating with step 4', () => {
      const s = new Seating_ts();
      s.shuffle = function (arr) {
        // mock to preserve order
        return arr;
      };
      const seating = s.makeIntervalSeating(players, 4);
      const expected = [
        [1, 100000],
        [5, 60000],
        [9, 20000],
        [13, -20000],

        [2, 90000],
        [6, 50000],
        [10, 10000],
        [14, -30000],

        [3, 80000],
        [7, 40000],
        [11, 0],
        [15, -40000],

        [4, 70000],
        [8, 30000],
        [12, -10000],
        [16, -50000],

        [17, -60000],
        [18, -70000],
        [19, -80000],
        [20, -90000],
      ];
      expect(seating).toEqual(expected);
    });

    it('should create interval seating with step 5', () => {
      const s = new Seating_ts();
      s.shuffle = function (arr) {
        // mock to preserve order
        return arr;
      };
      const seating = s.makeIntervalSeating(players, 5);
      const expected = [
        [1, 100000],
        [6, 50000],
        [11, 0],
        [16, -50000],

        [2, 90000],
        [7, 40000],
        [12, -10000],
        [17, -60000],

        [3, 80000],
        [8, 30000],
        [13, -20000],
        [18, -70000],

        [4, 70000],
        [9, 20000],
        [14, -30000],
        [19, -80000],

        [5, 60000],
        [10, 10000],
        [15, -40000],
        [20, -90000],
      ];
      expect(seating).toEqual(expected);
    });
  });

  describe('shuffle', () => {
    it('should randomize array while maintaining elements', () => {
      const ordered: PlayersMap = [
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
        [5, 5],
        [6, 6],
        [7, 7],
        [8, 8],
      ];
      const seating = new Seating_ts();
      seating.shuffleSeed();
      const shuffled = seating.shuffle(ordered);

      expect(Object.keys(shuffled)).toHaveLength(8);
      expect(JSON.stringify(shuffled)).not.toBe(JSON.stringify(ordered));
      expect(shuffled.sort(([a], [b]) => a - b)).toEqual(ordered);
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

      const result = new Seating_ts().makePrescriptedSeating(prescriptForSession, players);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual([
        { id: 101, local_id: 1 },
        { id: 102, local_id: 2 },
        { id: 103, local_id: 3 },
        { id: 104, local_id: 4 },
      ]);
      expect(result[1]).toEqual([
        { id: 105, local_id: 5 },
        { id: 106, local_id: 6 },
        { id: 107, local_id: 7 },
        { id: 108, local_id: 8 },
      ]);
    });
  });
});
