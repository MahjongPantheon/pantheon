import { fromTenhou, Yaku } from './yaku.js';

describe('Yaku', () => {
  it('should convert properly from tenhou ids', () => {
    const yakuList = '1,1,2,1,24,2,52,2,53,1,54,3';
    const yakumanList = '45';
    expect(fromTenhou(yakuList, yakumanList)).toEqual({
      yaku: [Yaku.RIICHI, Yaku.IPPATSU, Yaku.ITTSU, Yaku.CHUURENPOUTO],
      yakuman: 1,
      dora: 6,
      han: -1,
    });
  });
});

describe('individual imported yakuhai', () => {
  const awards = [
    Yaku.EAST_SEAT_WIND,
    Yaku.SOUTH_SEAT_WIND,
    Yaku.WEST_SEAT_WIND,
    Yaku.NORTH_SEAT_WIND,
    Yaku.EAST_ROUND_WIND,
    Yaku.SOUTH_ROUND_WIND,
    Yaku.WEST_ROUND_WIND,
    Yaku.NORTH_ROUND_WIND,
    Yaku.WHITE_DRAGON,
    Yaku.GREEN_DRAGON,
    Yaku.RED_DRAGON,
  ];

  it.each(awards.map((yaku, index) => [index + 10, yaku]))(
    'preserves imported ID %s as %s',
    (id, yaku) => {
      expect(fromTenhou(`${id},1`, '')).toEqual({ yaku: [yaku], han: 1, dora: 0, yakuman: 0 });
    }
  );

  it('preserves double winds and three dragon awards without legacy aggregation', () => {
    expect(fromTenhou('10,1,14,1,18,1,19,1,20,1,52,2', '')).toEqual({
      yaku: [
        Yaku.EAST_SEAT_WIND,
        Yaku.EAST_ROUND_WIND,
        Yaku.WHITE_DRAGON,
        Yaku.GREEN_DRAGON,
        Yaku.RED_DRAGON,
      ],
      han: 7,
      dora: 2,
      yakuman: 0,
    });
  });
});
