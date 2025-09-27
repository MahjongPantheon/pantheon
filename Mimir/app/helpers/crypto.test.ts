import { chunks } from './crypto';

describe('Crypto functions', () => {
  it('should split string to chunks with selected length', () => {
    const str = '1234567890123456789012345';
    expect(chunks(str, 10)).toEqual(['1234567890', '1234567890', '12345']);
  });
});
