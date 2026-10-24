import { YakuId as Y } from './yaku';

export const windYaku = [
  [Y.EAST_SEAT_WIND, Y.EAST_ROUND_WIND],
  [Y.SOUTH_SEAT_WIND, Y.SOUTH_ROUND_WIND],
  [Y.WEST_SEAT_WIND, Y.WEST_ROUND_WIND],
  [Y.NORTH_SEAT_WIND, Y.NORTH_ROUND_WIND],
];

export const dragonYaku = [Y.RED_DRAGON, Y.GREEN_DRAGON, Y.WHITE_DRAGON];
export const yakuhai = [...windYaku.flat(), ...dragonYaku];

export function getYakuhaiToAdd(selected: Y[], added: Y[], allowed: Y[]): Y[] | undefined {
  const combined = new Set([...selected, ...added]);
  // Completing the dragons replaces ordinary yaku, even at the yakuhai limit.
  if (dragonYaku.every((id) => combined.has(id))) {
    return allowed.includes(Y.DAISANGEN) ? [Y.DAISANGEN] : undefined;
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
