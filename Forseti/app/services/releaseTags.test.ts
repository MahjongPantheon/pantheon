import { handleReleaseTag } from './releaseTags';

afterEach(() => vi.unstubAllGlobals());
it.each([
  [null, null, false],
  ['v1', null, false],
  ['v1', 'v1', false],
  ['v2', 'v1', true],
] as const)(
  'handles release %s with stored version %s',
  (release: string | null, stored: string | null, reload: boolean) => {
    const values = new Map<string, string>();
    if (stored) values.set('__releaseTag', stored);
    const refresh = vi.fn();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
      location: { reload: refresh },
    });
    const response = new Response(null, { headers: release ? { 'X-Release': release } : {} });
    expect(handleReleaseTag(response)).toBe(response);
    expect(values.get('__releaseTag') ?? null).toBe(release ?? stored);
    expect(refresh.mock.calls.length).toBe(reload ? 1 : 0);
  }
);
