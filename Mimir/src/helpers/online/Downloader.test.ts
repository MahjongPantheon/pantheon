import { jest } from '@jest/globals';
import { Downloader } from './Downloader.js';

describe('Tenhou replay downloader', () => {
  const downloader = new Downloader();
  const hash = '2026010100gm-0001-0000-12345678';
  const link = `https://tenhou.net/0/?log=${hash}&tw=0`;

  afterEach(() => jest.restoreAllMocks());

  it('validates replay links and extracts only the log parameter', () => {
    expect(downloader.validateUrl(link)).toBe(true);
    expect(downloader.getReplayHash(link)).toBe(hash);
    expect(() => downloader.validateUrl('https://example.com/?log=123')).toThrow(
      'Invalid replay link'
    );
    expect(() => downloader.validateUrl('https://tenhou.net/0/')).toThrow('Invalid replay link');
  });

  it.each(['not a URL', 'https://tenhou.net/0/', 'https://tenhou.net/0/?log='])(
    'rejects missing or malformed log URLs: %s',
    (url) => {
      expect(() => downloader.getReplayHash(url)).toThrow('not valid URL');
    }
  );

  it('downloads the replay using the decoded hash', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<mjloggm/>'));
    await expect(downloader.getReplay(link)).resolves.toEqual({
      decodedHash: hash,
      content: '<mjloggm/>',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://tenhou.net/0/log/?${hash}`,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it.each([new Response('', { status: 200 }), new Response('not found', { status: 404 })])(
    'rejects empty or unsuccessful responses',
    async (response) => {
      jest.spyOn(globalThis, 'fetch').mockResolvedValue(response);
      await expect(downloader.getReplay(link)).rejects.toThrow('Content fetch failed');
    }
  );

  it('reports transport failures as failed content fetches', async () => {
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('connection refused'));
    await expect(downloader.getReplay(link)).rejects.toThrow('Content fetch failed');
  });

  it.each([
    ['2009010100gm-0001-0000-x000000000000', '2009010100gm-0001-0000-56789b97'],
    ['simple-hash', 'simple-hash'],
  ])('decodes legacy hashes and preserves unencoded hashes', async (encoded, decodedHash) => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('replay'));
    await expect(downloader.getReplay(`https://tenhou.net/0/?log=${encoded}`)).resolves.toEqual({
      decodedHash,
      content: 'replay',
    });
    expect(fetchMock.mock.calls[0][0]).toBe(`https://tenhou.net/0/log/?${decodedHash}`);
  });
});
