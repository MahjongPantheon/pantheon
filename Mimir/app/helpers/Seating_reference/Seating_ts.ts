// Type definitions
export type PlayersMap = Array<[number, number]>; // id, rating

interface SeatedPlayer {
  id: number;
  local_id: number;
}

interface TableWithRating {
  0: [number, number][]; // Array of [id, rating] pairs
  1: number; // Max rating at table
}

type IntersectionData = Record<string, number>; // "player1+++player2" => count
type SeatingTable = number[]; // [east, south, west, north] player IDs
type PreviousSeatings = SeatingTable[];
type PlayedWithMatrix = Map<number, Map<number, number>>; // [playerId1][playerId2] => games played together

export class Seating_ts {
  /**
   * Swiss seating entry point
   * Wrapper for formats conformity
   */
  public async swissSeating(
    playersMap: PlayersMap,
    previousSeatings: PreviousSeatings
  ): Promise<PlayersMap> {
    const playedWith: PlayedWithMatrix = new Map();
    for (const player1 of playersMap) {
      playedWith.set(player1[0], new Map());
      for (const player2 of playersMap) {
        playedWith.get(player1[0])?.set(player2[0], 0);
      }
    }

    for (const table of previousSeatings) {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (i === j) {
            continue;
          }
          playedWith.get(table[i])?.set(table[j], playedWith.get(table[i])?.get(table[j])! + 1);
        }
      }
    }

    const playerTable = await this._swissSeatingOriginal(
      playersMap.map((v) => v[1]),
      playedWith
    );

    return (
      this._updatePlacesToRandom([...playerTable.entries()].sort(([, a], [, b]) => a - b)) ?? []
    );
  }

  /**
   * Format seating data for better view
   */
  public makeIntersectionsTable(
    seating: PlayersMap,
    previousSeatings: PreviousSeatings
  ): IntersectionData {
    const possibleIntersections = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];

    const newSeatingChunks: SeatingTable[] = [];
    for (let i = 0; i < seating.length; i += 4) {
      newSeatingChunks.push(seating.slice(i, i + 4).map((v) => v[0]));
    }

    const seatings = [...previousSeatings, ...newSeatingChunks];

    const intersectionData: IntersectionData = {};
    for (const game of seatings) {
      for (const intersection of possibleIntersections) {
        // fill intersection data
        const intKey = `${game[intersection[0]]}+++${game[intersection[1]]}`;
        if (!intersectionData[intKey]) {
          intersectionData[intKey] = 1;
        } else {
          intersectionData[intKey]++;
        }
      }
    }

    return intersectionData;
  }

  /**
   * Shuffled seating with random optimization
   *
   * @return array|null [ [id, rating], ... ] flattened players list, each four are a table ordered as eswn.
   */
  public async shuffledSeating(
    playersMap: PlayersMap,
    previousSeatings: PreviousSeatings,
    groupsCount: number,
    randFactor: number
  ): Promise<PlayersMap | null> {
    /*
     * Simple random search. Too many variables for real optimizing methods :(
     *
     * How it works:
     * - 1) Split rating table into $groupsCount independent groups
     * - 2) Init shuffler (with slightly different seed on each iteration)
     * - 3) Shuffle each group
     * - 4) Calculate intersection factor (see functions below)
     * - 5) Remember best factor and its input data
     * - 6) Repeat N times, then return best results.
     */

    const maxIterations = 1000;
    let bestSeating: PlayersMap = [];
    let factor = 100500; // lower is better, so init with very big number;

    if (Object.keys(playersMap).length === 0) {
      return [];
    }

    const prevSeatings = previousSeatings || [];

    // 1) Split into groups
    const groupSize = Math.max(1, Math.ceil(playersMap.length / groupsCount));
    const groups: PlayersMap[] = [];

    for (let i = 0; i < playersMap.length; i += groupSize) {
      const group: PlayersMap = [];
      playersMap.slice(i, i + groupSize).forEach(([id, rating]) => {
        group.push([id, rating]);
      });
      groups.push(group);
    }

    for (let i = 0; i < maxIterations; i++) {
      this._setSeed(randFactor + i * 17); // 2)

      for (let k = 0; k < groups.length; k++) {
        groups[k] = this.shuffle(groups[k]); // 3)
      }

      // Flatten groups
      let flattenedGroups: PlayersMap = [];
      for (const group of groups) {
        flattenedGroups = flattenedGroups.concat(group);
      }

      const newFactor = this._calculateIntersectionFactor(flattenedGroups, prevSeatings); // 4)
      if (newFactor < factor) {
        factor = newFactor;
        bestSeating = flattenedGroups; // 5)
      }
    } // 6)

    return this._updatePlacesAtEachTable(bestSeating, prevSeatings);
  }

  /**
   * Calculate generalized value of seating applicability.
   * Sequential games of same layers add +10 to factor, while simple crossings add only +1.
   * Less factor value is better!
   */
  protected _calculateIntersectionFactor(
    seating: PlayersMap,
    previousSeatings: PreviousSeatings
  ): number {
    let factor = 0;
    const crossings: Record<number, Record<number, number[]>> = {};

    const tablesCount = Math.floor(Object.keys(seating).length / 4);
    const games: SeatingTable[][] = [];

    // Chunk previous seatings into games
    for (let i = 0; i < previousSeatings.length; i += Math.max(1, tablesCount)) {
      games.push(previousSeatings.slice(i, i + Math.max(1, tablesCount)));
    }

    // push only ids from our new seating to our array, but reformat it first
    const newSeating: number[] = [...seating.map((v) => v[0])];
    const newSeatingChunks: SeatingTable[] = [];
    for (let i = 0; i < newSeating.length; i += 4) {
      newSeatingChunks.push(newSeating.slice(i, i + 4));
    }
    games.push(newSeatingChunks);

    games.forEach((tables, gameIdx) => {
      tables.forEach((game) => {
        for (let i = 0; i < game.length; i++) {
          for (let j = 0; j < game.length; j++) {
            if (j === i) {
              continue;
            }
            if (!crossings[game[i]]) {
              crossings[game[i]] = {};
            }
            if (!crossings[game[i]][game[j]]) {
              crossings[game[i]][game[j]] = [];
            }

            crossings[game[i]][game[j]].push(gameIdx); // inject this to count sequential games
          }
        }
      });
    });

    for (const opponentsList of Object.values(crossings)) {
      for (const crossingList of Object.values(opponentsList)) {
        if (crossingList.length <= 1) {
          continue;
        }

        factor++;
        crossingList.sort((a, b) => a - b);
        for (let i = 0; i < crossingList.length - 1; i++) {
          if (crossingList[i + 1] - crossingList[i] === 1) {
            // players will play two sequential games
            factor += 10;
          }
        }
      }
    }

    return factor / 2; // div by 2 because of symmetrical matrix counting
  }

  /**
   * Make sure players will sit on random winds
   */
  protected _updatePlacesToRandom(seating: PlayersMap): PlayersMap | null {
    this.shuffleSeed();

    const tables: PlayersMap[] = [];
    for (let i = 0; i < seating.length; i += 4) {
      const table: PlayersMap = [];
      seating.slice(i, i + 4).forEach(([id, rating]) => {
        table.push([id, rating]);
      });
      tables.push(table);
    }

    let resultSeating: PlayersMap = [];
    for (const tableWithRatings of tables) {
      resultSeating = resultSeating.concat(this.shuffle(tableWithRatings));
    }

    return resultSeating;
  }

  /**
   * Make sure players will initially sit to winds that they did not seat before
   * (or sat less times)
   */
  protected _updatePlacesAtEachTable(
    seating: PlayersMap,
    previousSeatings: PreviousSeatings
  ): PlayersMap | null {
    const possiblePlacements = [
      '0123',
      '1023',
      '2013',
      '3012',
      '0132',
      '1032',
      '2031',
      '3021',
      '0213',
      '1203',
      '2103',
      '3102',
      '0231',
      '1230',
      '2130',
      '3120',
      '0312',
      '1302',
      '2301',
      '3201',
      '0321',
      '1320',
      '2310',
      '3210',
    ];

    const tables: PlayersMap[] = [];
    for (let i = 0; i < seating.length; i += 4) {
      const table: PlayersMap = [];
      seating.slice(i, i + 4).forEach(([id, rating]) => {
        table.push([id, rating]);
      });
      tables.push(table);
    }

    let resultSeating: PlayersMap = [];
    for (const tableWithRatings of tables) {
      let bestResult = 10005000;
      let bestPlacement: PlayersMap = [];

      for (const placement of possiblePlacements) {
        const newResult = this._calcSubSums(
          tableWithRatings[Number(placement[0])][0],
          tableWithRatings[Number(placement[1])][0],
          tableWithRatings[Number(placement[2])][0],
          tableWithRatings[Number(placement[3])][0],
          previousSeatings
        );

        if (newResult < bestResult) {
          bestResult = newResult;
          bestPlacement = [
            tableWithRatings[Number(placement[0])],
            tableWithRatings[Number(placement[1])],
            tableWithRatings[Number(placement[2])],
            tableWithRatings[Number(placement[3])],
          ];
        }
      }

      resultSeating = resultSeating.concat(bestPlacement);
    }

    return resultSeating;
  }

  /**
   * Calculate index of distribution equality for seating at particular
   * winds. Ideally, we want that seating, which produces smallest index.
   */
  protected _calcSubSums(
    player1: number,
    player2: number,
    player3: number,
    player4: number,
    prevData: PreviousSeatings
  ): number {
    let totalsum = 0;

    [player1, player2, player3, player4].forEach((player, idx) => {
      const buckets = [0, 0, 0, 0];
      buckets[idx]++;

      for (const table of prevData) {
        const idxAtTable = table.indexOf(player);
        if (idxAtTable !== -1) {
          buckets[idxAtTable]++;
        }
      }

      totalsum +=
        Math.abs(buckets[0] - buckets[1]) +
        Math.abs(buckets[0] - buckets[2]) +
        Math.abs(buckets[0] - buckets[3]) +
        Math.abs(buckets[1] - buckets[2]) +
        Math.abs(buckets[1] - buckets[3]) +
        Math.abs(buckets[2] - buckets[3]);
    });

    return totalsum;
  }

  /**
   * Swiss seating generator
   * Algorithm was taken from mahjongsoft.ru website.
   * @return map "player -> table number"
   */
  protected async _swissSeatingOriginal(
    playerTotalGamePoints: number[],
    playedWith: PlayedWithMatrix
  ): Promise<Map<number, number>> {
    const isPlaying: boolean[] = [];
    const playerTable: Map<number, number> = new Map(); // map "player -> table number"
    const numPlayers = playerTotalGamePoints.length;

    for (let i = 0; i < numPlayers; i++) {
      isPlaying[i] = false;
      playerTable.set(i, -1);
    }

    let maxCrossings = 0;

    while (
      !(await this._makeSwissSeating(
        isPlaying,
        maxCrossings,
        0,
        numPlayers,
        playerTable, // mutated inside
        playerTotalGamePoints,
        playedWith,
        0
      ))
    ) {
      maxCrossings++;
    }

    return playerTable;
  }

  /**
   * Recursive swiss seating algorithm.
   * Taken from mahjongsoft.ru
   */
  protected async _makeSwissSeating(
    isPlaying: boolean[],
    maxCrossings: number,
    maxCrossingsPrecisionFactor: number,
    numPlayers: number,
    playerTable: Map<number, number>,
    playerTotalGamePoints: number[],
    playedWith: PlayedWithMatrix,
    iteration: number
  ): Promise<boolean> {
    iteration++;
    if (iteration > 15000) {
      maxCrossingsPrecisionFactor++;
      iteration = 0;
    }

    // check if everybody have taken a seat, and quit with success if yes
    let isAllPlaying = true;
    for (let i = 0; i < numPlayers; i++) {
      if (!isPlaying[i]) {
        isAllPlaying = false;
        break;
      }
    }
    if (isAllPlaying) {
      return true;
    }

    // find table with highest index and highest players count already at that table
    let maxTable = 0;
    let numPlayersOnMaxTable = 0;
    const playersOnMaxTable: number[] = [];

    for (let i = 0; i < numPlayers; i++) {
      if ((playerTable.get(i) ?? -1) > maxTable) {
        maxTable = playerTable.get(i)!;
        playersOnMaxTable[0] = i;
        numPlayersOnMaxTable = 1;
      } else if (playerTable.get(i)! === maxTable) {
        playersOnMaxTable[numPlayersOnMaxTable++] = i;
      }
    }

    // if table is already filled, take next table and place there a player with highest rating
    if (numPlayersOnMaxTable === 0 || numPlayersOnMaxTable === 4) {
      if (numPlayersOnMaxTable === 4) {
        maxTable++;
      }

      // find a player with highest rating
      let maxGP = -2147483648;
      let maxRatingPlayer = -1;
      for (let i = 0; i < numPlayers; i++) {
        if (!isPlaying[i]) {
          if (playerTotalGamePoints[i] > maxGP) {
            maxGP = playerTotalGamePoints[i];
            maxRatingPlayer = i;
          }
        }
      }

      // check 'playing' flag and place the player to the table, then call the procedure recursively
      isPlaying[maxRatingPlayer] = true;
      playerTable.set(maxRatingPlayer, maxTable);

      const res = await this._makeSwissSeating(
        isPlaying,
        maxCrossings + maxCrossingsPrecisionFactor,
        maxCrossingsPrecisionFactor,
        numPlayers,
        playerTable,
        playerTotalGamePoints,
        playedWith,
        iteration
      );
      if (res) {
        return true;
      } else {
        // failed to make a seating: falling back
        // eslint-disable-next-line require-atomic-updates
        isPlaying[maxRatingPlayer] = false;
        playerTable.set(maxRatingPlayer, -1);
        return false;
      }
    } else {
      // there are already players at the table: we should take next players with highest ratings
      let numNextPlayers = 0;
      const nextPlayers: number[] = [];
      let curCrossings = 0; // current intersections count; first try to make seating without intersections

      while (true) {
        for (let i = 0; i < numPlayers; i++) {
          if (!isPlaying[i]) {
            // check if players have already played at the same table
            let numCrossings = 0;
            for (let j = 0; j < numPlayersOnMaxTable; j++) {
              numCrossings += playedWith.get(i)?.get(playersOnMaxTable[j]) ?? 0; // TODO check if second index exists
            }

            if (numCrossings <= curCrossings) {
              nextPlayers[numNextPlayers++] = i;
            }
          }
        }

        if (numNextPlayers > 0) {
          break;
        } else if (curCrossings === maxCrossings + maxCrossingsPrecisionFactor) {
          return false;
        } else {
          curCrossings++;
        }
      }

      // sort players by rating
      for (let i = 0; i < numNextPlayers - 1; i++) {
        for (let j = i + 1; j < numNextPlayers; j++) {
          if (playerTotalGamePoints[nextPlayers[i]] < playerTotalGamePoints[nextPlayers[j]]) {
            const t = nextPlayers[i];
            nextPlayers[i] = nextPlayers[j];
            nextPlayers[j] = t;
          }
        }
      }

      // substitute candidates for seating, then make a check
      for (let i = 0; i < numNextPlayers; i++) {
        // check 'playing' flag and place the player to the table, then call the procedure recursively
        isPlaying[nextPlayers[i]] = true;
        playerTable.set(nextPlayers[i], maxTable);

        for (let j = 0; j < numPlayersOnMaxTable; j++) {
          playedWith
            .get(nextPlayers[i])
            ?.set(
              playersOnMaxTable[j],
              playedWith.get(nextPlayers[i])?.get(playersOnMaxTable[j])! + 1
            );
          playedWith
            .get(playersOnMaxTable[j])
            ?.set(nextPlayers[i], playedWith.get(playersOnMaxTable[j])?.get(nextPlayers[i])! + 1);
        }

        // return success if we found a seating, or falling back otherwise
        if (
          await this._makeSwissSeating(
            isPlaying,
            maxCrossings + maxCrossingsPrecisionFactor - curCrossings,
            maxCrossingsPrecisionFactor,
            numPlayers,
            playerTable,
            playerTotalGamePoints,
            playedWith,
            iteration
          )
        ) {
          return true;
        } else {
          // eslint-disable-next-line require-atomic-updates
          isPlaying[nextPlayers[i]] = false;
          playerTable.set(nextPlayers[i], -1);
          for (let j = 0; j < numPlayersOnMaxTable; j++) {
            playedWith
              .get(nextPlayers[i])
              ?.set(
                playersOnMaxTable[j],
                playedWith.get(nextPlayers[i])?.get(playersOnMaxTable[j])! - 1
              );
            playedWith
              .get(playersOnMaxTable[j])
              ?.set(nextPlayers[i], playedWith.get(playersOnMaxTable[j])?.get(nextPlayers[i])! - 1);
          }
        }
      }
      return false;
    }
  }

  /**
   * Set random seed for predictable shuffling
   */
  private _setSeed(seed: number): void {
    // In TypeScript/JavaScript, we use custom PRNG
    // For now, we'll store the seed and use it in our shuffle function
    this._randomSeed = seed;
  }

  private _randomSeed: number = Date.now();

  /**
   * Simple LCG (Linear Congruential Generator) for predictable random numbers
   */
  private _seededRandom(): number {
    this._randomSeed = (this._randomSeed * 1103515245 + 12345) & 0x7fffffff;
    return this._randomSeed / 0x7fffffff;
  }

  /**
   * Run this method before shuffle
   */
  public shuffleSeed(): void {
    this._randomSeed = Date.now() * Math.random();
  }

  /**
   * Shuffle array while maintaining its keys
   * Should rely on seeded RNG
   */
  public shuffle(array: Array<[number, number]>): Array<[number, number]> {
    const result: Array<[number, number]> = [...array];

    // shuffle using Fisher-Yates
    let i = result.length;
    while (--i > 0) {
      const j = Math.floor(this._seededRandom() * (i + 1));
      if (i !== j) {
        // swap items
        const tmp = result[j];
        result[j] = result[i];
        result[i] = tmp;
      }
    }

    return result;
  }

  /**
   * Make interval seating
   * Players from the top are seating with interval of $step, but if table count is
   * not divisible by $step, rest of players are seated with step 1.
   */
  public makeIntervalSeating(currentRatingList: PlayersMap, step: number): PlayersMap {
    this.shuffleSeed();
    const tables: TableWithRating[] = [];
    let currentTable: [number, number][] = [];

    // These guys from bottom could not be placed with desired interval, so they play with interval 1
    const playersToSeatWithNoInterval = 4 * (Math.floor(currentRatingList.length / 4) % step);
    // These guys from top should be placed as required
    const playersPossibleToSeatWithInterval =
      currentRatingList.length - playersToSeatWithNoInterval;

    // Fill tables with interval of $step
    for (let offset = 0; offset < step; offset++) {
      for (let i = 0; i < playersPossibleToSeatWithInterval; i += step) {
        currentTable.push(currentRatingList[offset + i]);
        if (currentTable.length === 4) {
          tables.push([
            currentTable,
            currentTable.reduce((acc, val) => Math.max(acc, val[1]), -1000000),
          ]);
          currentTable = [];
        }
      }
    }

    // Fill rest of tables with interval 1
    for (let i = playersPossibleToSeatWithInterval; i < currentRatingList.length; i++) {
      currentTable.push(currentRatingList[i]);
      if (currentTable.length === 4) {
        tables.push([
          currentTable,
          currentTable.reduce((acc, val) => Math.max(acc, val[1]), -1000000),
        ]);
        currentTable = [];
      }
    }

    // Sort tables by top player score
    tables.sort((table1, table2) => table2[1] - table1[1]);

    const flattenedGroups: PlayersMap = [];
    for (const group of tables) {
      for (const [id, rating] of group[0]) {
        flattenedGroups.push([id, rating]);
      }
    }

    return this._updatePlacesToRandom(flattenedGroups) ?? [];
  }

  /**
   * Make prescripted seating from predefined arrangement
   */
  public makePrescriptedSeating(
    prescriptForSession: number[][],
    players: Map<number, number> // [local_id => player_id]
  ): SeatedPlayer[][] {
    return prescriptForSession.map((table) =>
      table.map((localId) => ({
        id: players.get(localId)!,
        local_id: localId,
      }))
    );
  }
}
