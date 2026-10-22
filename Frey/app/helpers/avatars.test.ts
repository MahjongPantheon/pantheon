import { getGullveigUrl, uploadAvatar } from './avatars';

afterEach(() => jest.restoreAllMocks());

describe('avatar storage configuration', () => {
  it('supports the development URL and internal URL overrides', () => {
    expect(getGullveigUrl({ GULLVEIG_URL: 'http://gullveig.pantheon.local' }, {})).toBe(
      'http://gullveig.pantheon.local'
    );
    expect(getGullveigUrl({}, {})).toBe('http://gullveig.pantheon.internal');
    expect(
      getGullveigUrl(
        { GULLVEIG_URL_INTERNAL: 'http://file-internal', GULLVEIG_URL: 'http://file-public' },
        { GULLVEIG_URL_INTERNAL: 'http://env-internal', GULLVEIG_URL: 'http://env-public' }
      )
    ).toBe('http://env-internal');
    expect(
      getGullveigUrl(
        { GULLVEIG_URL_INTERNAL: 'http://file-internal' },
        { GULLVEIG_URL: 'http://env-public' }
      )
    ).toBe('http://file-internal');
  });
});

describe('avatar uploads', () => {
  it('keeps the existing image when no replacement was selected', async () => {
    const fetch = jest.spyOn(globalThis, 'fetch');
    await uploadAvatar('http://storage', 42, '');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('waits for storage acknowledgement and sends the target person ID', async () => {
    let acknowledge!: (response: Response) => void;
    const fetch = jest.spyOn(globalThis, 'fetch').mockImplementation(
      () =>
        new Promise<Response>((resolve) => {
          acknowledge = resolve;
        })
    );
    let completed = false;
    const pending = uploadAvatar('http://storage', 42, 'image-data').then(() => {
      completed = true;
    });
    await Promise.resolve();
    expect(completed).toBe(false);
    acknowledge(Response.json({ ok: true }));
    await pending;
    expect(completed).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'http://storage',
      expect.objectContaining({
        body: JSON.stringify({ userId: 42, avatar: 'image-data' }),
      })
    );
  });

  it.each([400, 500])('rejects HTTP %i instead of reporting success', async (status) => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ error: 'Invalid image' }, { status }));
    await expect(uploadAvatar('http://storage', 42, 'bad')).rejects.toThrow('Avatar upload failed');
  });

  it('rejects legacy error responses even with HTTP 200', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json({ error: 'Failed' }));
    await expect(uploadAvatar('http://storage', 42, 'bad')).rejects.toThrow('Avatar upload failed');
  });
});
