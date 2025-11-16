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
