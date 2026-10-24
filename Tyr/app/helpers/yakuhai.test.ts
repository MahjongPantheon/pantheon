import { YakuId as Y } from './yaku';
import { getWindYaku, yakuhai, windYaku } from './yakuhai';
import { addYakuToList, makeYakuGraph, pack, unpack } from './yakuCompatibility';
import { getHan } from './yakuValues';

it('resolves seat and round winds independently for every seat and round', () => {
  for (let round = 1; round <= 16; round++) {
    for (let player = 0; player < 4; player++) {
      for (let wind = 0; wind < 4; wind++) {
        const expected = [
          ...((player - (round - 1) + 16) % 4 === wind ? [windYaku[wind][0]] : []),
          ...(Math.floor((round - 1) / 4) === wind ? [windYaku[wind][1]] : []),
        ];
        expect(getWindYaku(windYaku[wind][0], round, player)).toEqual(expected);
        expect(getWindYaku(windYaku[wind][1], round, player)).toEqual(expected);
      }
    }
  }
});

it('counts every individual yakuhai as one han in open and closed hands', () => {
  for (const yaku of yakuhai) {
    expect(getHan([yaku])).toBe(1);
    expect(getHan([Y.__OPENHAND, yaku])).toBe(1);
  }
  expect(getHan([Y.EAST_SEAT_WIND, Y.EAST_ROUND_WIND])).toBe(2);
});

it('combines individual yakuhai and suppresses them with yakuman', () => {
  const graph = makeYakuGraph();
  expect(addYakuToList(graph, Y.RED_DRAGON, [Y.EAST_ROUND_WIND, Y.TOITOI])).toEqual(
    expect.arrayContaining([Y.RED_DRAGON, Y.EAST_ROUND_WIND, Y.TOITOI])
  );
  expect(addYakuToList(graph, Y.SHOSANGEN, [Y.RED_DRAGON, Y.GREEN_DRAGON])).toEqual(
    expect.arrayContaining([Y.SHOSANGEN, Y.RED_DRAGON, Y.GREEN_DRAGON])
  );
  expect(() => addYakuToList(graph, Y.PINFU, [Y.RED_DRAGON])).toThrow();
  expect(addYakuToList(graph, Y.DAISANGEN, [Y.RED_DRAGON, Y.TOITOI])).toEqual([Y.DAISANGEN]);
});

it('preserves positional packing for legacy hands and round trips new yaku', () => {
  const old = pack([Y.YAKUHAI2]).slice(0, -yakuhai.length);
  expect(unpack(old)).toEqual([Y.YAKUHAI2]);
  expect(unpack(pack(yakuhai))).toEqual(yakuhai);
});
