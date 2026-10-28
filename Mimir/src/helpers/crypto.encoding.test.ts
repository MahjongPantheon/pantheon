import {
  base64decode,
  base64encode,
  chunks,
  md5,
  sha1,
  sha384,
  randomInt,
  randomSign,
} from './crypto.js';

it('matches stable hash and UTF-8 encoding vectors', () => {
  expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
  expect(sha1('')).toBe('da39a3ee5e6b4b0d3255bfef95601890afd80709');
  expect(sha384('')).toBe(
    '0c63a75b845e4f7d01107d852e4c2485c51a50aaaa94fc61995e71bbee983a2ac3713831264adb47fb6bd1e058d5f004'
  );
  expect(base64decode(base64encode('日本語 🀄'))).toBe('日本語 🀄');
  expect(chunks('')).toEqual([]);
  expect(chunks('x'.repeat(76))).toEqual(['x'.repeat(76)]);
});
it('uses deterministic random values in tests', () => {
  expect(randomInt(1000000)).toBe(123456);
  expect(randomSign()).toBe(1);
});
it('uses bounded random values outside tests', () => {
  vi.stubEnv('NODE_ENV', 'development');
  try {
    for (let i = 0; i < 50; i++) {
      const n = randomInt(10);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(10);
      expect([-1, 1]).toContain(randomSign());
    }
  } finally {
    vi.unstubAllEnvs();
  }
});
