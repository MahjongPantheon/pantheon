import { YakuId as Y } from './yaku';

export const windYaku = [
  [Y.EAST_SEAT_WIND, Y.EAST_ROUND_WIND],
  [Y.SOUTH_SEAT_WIND, Y.SOUTH_ROUND_WIND],
  [Y.WEST_SEAT_WIND, Y.WEST_ROUND_WIND],
  [Y.NORTH_SEAT_WIND, Y.NORTH_ROUND_WIND],
];

export const aggregatedYakuhai = [Y.YAKUHAI1, Y.YAKUHAI2, Y.YAKUHAI3, Y.YAKUHAI4];

export const dragonYaku = [Y.RED_DRAGON, Y.GREEN_DRAGON, Y.WHITE_DRAGON];
export const yakuhai = [...windYaku.flat(), ...dragonYaku];

export function getYakuhaiToAdd(selected: Y[], added: Y[]): Y[] | undefined {
  const combined = new Set([...selected, ...added]);
  if (dragonYaku.every((id) => combined.has(id))) {
    return undefined;
  }
  return [...combined].filter((id) => yakuhai.includes(id)).length <= 4 ? added : undefined;
}

// playerIndex is SessionPlayer.order - 1; roundIndex is one-based.
export function getWindYaku(id: Y, roundIndex: number, playerIndex: number): Y[] | undefined {
  const wind = windYaku.findIndex((pair) => pair.includes(id));
  if (wind === -1) {
    return undefined;
  }
  const seatWind = (((playerIndex - (roundIndex - 1)) % 4) + 4) % 4;
  const roundWind = Math.floor((roundIndex - 1) / 4) % 4;
  return [
    ...(wind === seatWind ? [windYaku[wind][0]] : []),
    ...(wind === roundWind ? [windYaku[wind][1]] : []),
  ];
}

// Aggregated entry records han, not dragon identities. Two or more may contain
// the required dragon pons; named entry can check them precisely.
export function canSelectShosangen(selected: Y[]): boolean {
  return (
    dragonYaku.filter((id) => selected.includes(id)).length >= 2 ||
    selected.some((id) => [Y.YAKUHAI2, Y.YAKUHAI3, Y.YAKUHAI4].includes(id))
  );
}

export function yakuhaiCount(selected: Y[]): number {
  return (
    selected.filter((id) => yakuhai.includes(id)).length +
    aggregatedYakuhai.reduce(
      (count, id, index) => count + (selected.includes(id) ? index + 1 : 0),
      0
    )
  );
}
