import {
  make_seating_interval,
  make_seating_shuffled,
  make_seating_swiss,
  PlayersMap,
  Seating as SeatingResult,
} from 'mahjong-seatings-rs-node';

export class Seating {
  public getRandFactor(): number {
    return Math.round(Math.random() * Number.MAX_SAFE_INTEGER);
  }

  public makeIntersectionsTable(
    seating: SeatingResult,
    previousSeatings: number[][]
  ): Record<string, number> {
    const possibleIntersections = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];

    const newSeatingChunks: number[][] = [];
    for (let i = 0; i < seating.length; i += 4) {
      newSeatingChunks.push(seating.slice(i, i + 4).map((v) => v[0]));
    }

    const seatings = [...previousSeatings, ...newSeatingChunks];

    const intersectionData: Record<string, number> = {};
    for (const game of seatings) {
      for (const intersection of possibleIntersections) {
        // fill intersection data
        const intKey = `${Math.min(game[intersection[0]], game[intersection[1]])}+++${Math.max(game[intersection[0]], game[intersection[1]])}`;
        if (!intersectionData[intKey]) {
          intersectionData[intKey] = 1;
        } else {
          intersectionData[intKey]++;
        }
      }
    }

    return intersectionData;
  }

  public swissSeating(
    playersMap: PlayersMap,
    previousSeatings: number[][],
    randFactor: number
  ): SeatingResult {
    return make_seating_swiss({
      previousSeatings,
      playersMap,
      randFactor,
    });
  }

  public shuffledSeating(
    playersMap: PlayersMap,
    previousSeatings: number[][],
    groupsCount: number,
    randFactor: number
  ): SeatingResult {
    return make_seating_shuffled({
      previousSeatings,
      playersMap,
      groupsCount,
      randFactor,
    });
  }

  public intervalSeating(playersMap: PlayersMap, step: number, randFactor: number): SeatingResult {
    return make_seating_interval({
      playersMap,
      step,
      randFactor,
    });
  }

  /**
   * Make prescripted seating from predefined arrangement
   */
  public makePrescriptedSeating(
    prescriptForSession: number[][],
    players: Map<number, number> // [local_id => player_id]
  ): SeatingResult {
    return prescriptForSession.flatMap((table) =>
      table.map((localId) => [players.get(localId)!, localId] as [number, number])
    );
  }
}
