import { packScript, unpackScript } from './eventPrescript';

describe('EventPrescript', () => {
  it('should pack event script', () => {
    const script = [
      [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ],
      [
        [1, 3, 5, 7],
        [2, 4, 6, 8],
      ],
    ];
    const expected = ['1-2-3-4', '5-6-7-8', '', '1-3-5-7', '2-4-6-8'].join('\n');
    expect(packScript(script)).toEqual(expected);
  });

  it('should unpack event script', () => {
    const expected = [
      [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
      ],
      [
        [1, 3, 5, 7],
        [2, 4, 6, 8],
      ],
    ];
    const script = ['1-2-3-4', '5-6-7-8', '', '1-3-5-7', '2-4-6-8'].join('\n');
    expect(unpackScript(script)).toEqual(expected);
  });
});
