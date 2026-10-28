import {
  base64decode,
  base64encode,
  calcPasswordStrength,
  chunks,
  md5,
  sha1,
  sha384,
} from './crypto';

describe('text encoding and hashes', () => {
  it('matches published empty-input hash vectors', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(sha1('')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
    expect(sha384('')).toBe(
      '0c63a75b845e4f7d01107d852e4c2485c51a50aaaa94fc61995e71bbee983a2ac3713831264adb47fb6bd1e058d5f004'
    );
  });

  it.each(['', 'plain ASCII', '日本語 🀄', 'first\nsecond'])('round-trips UTF-8: %s', (text) => {
    expect(base64decode(base64encode(text))).toBe(text);
  });

  it('uses standard base64 encoding', () => {
    expect(base64encode('hello')).toBe('aGVsbG8=');
    expect(base64decode('aGVsbG8=')).toBe('hello');
  });

  it('splits MIME data at 76 characters without adding an empty trailing chunk', () => {
    expect(chunks('')).toEqual([]);
    expect(chunks('x'.repeat(152))).toEqual(['x'.repeat(76), 'x'.repeat(76)]);
    expect(chunks('abcdefg', 3)).toEqual(['abc', 'def', 'g']);
  });
});

describe('password strength', () => {
  it.each([
    ['', 0],
    ['a', 2],
    ['abc', 4],
    ['1234', 4],
    ['ABCD', 8],
    ['----', 4],
    ['日本語', 4],
    ['aA1!', 32],
    ['aA1@', 64],
    ['abcdef', 6],
    ['abcdefg', 8],
  ])('scores %s as %s', (password, expected) => {
    expect(calcPasswordStrength(password)).toBe(expected);
  });
});
