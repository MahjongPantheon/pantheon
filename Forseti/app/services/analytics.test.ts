import { afterEach, expect, it, vi } from 'vitest';

function platform(values: Record<string, unknown>) {
  for (const key of ['opera', 'InstallTrigger', 'safari', 'chrome', 'StyleMedia'])
    vi.stubGlobal(key, undefined);
  for (const [key, value] of Object.entries(values)) vi.stubGlobal(key, value);
}
afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});

it.each([
  ['Win', 'Mozilla/5.0', {}, 'Windows', 'desktop'],
  ['Mac', 'Mozilla/5.0 (iPhone)', { opera: {} }, 'MacOS', 'tablet'],
  ['X11', 'Mozilla/5.0 (iPad)', { InstallTrigger: {} }, 'UNIX', 'tablet'],
  ['Linux', 'Mozilla/5.0', { chrome: { runtime: {} } }, 'Linux', 'desktop'],
  ['Unknown', '1207', { StyleMedia: {} }, 'Unknown OS', 'tablet'],
  ['Unknown', 'Mozilla/5.0 OPR/', {}, 'Unknown OS', 'desktop'],
] as const)(
  'reports %s platform data for %s',
  async (appVersion, userAgent, browser, os, device) => {
    vi.resetModules();
    vi.spyOn(navigator, 'appVersion', 'get').mockReturnValue(appVersion);
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
    platform(browser);
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetch);
    const { Analytics } = await import('./analytics');
    vi.useFakeTimers();
    const analytics = new Analytics();
    analytics.setUserId(7);
    analytics.setEventId(42);
    analytics.setSessionId('session');
    analytics.track('TEST', { custom: 1 }, 43);
    analytics.trackView('/rating');
    await vi.runAllTimersAsync();
    expect(fetch).toHaveBeenCalledTimes(2);
    const payloads = fetch.mock.calls.map((call) => JSON.parse(call[1].body as string));
    expect(
      payloads.find((p: { m: { eventName?: string } }) => p.m.eventName === 'TEST')
    ).toMatchObject({
      o: os,
      d: device,
      si: 'session',
      e: 42,
      m: { eventId: '43', userId: '7', custom: 1, eventName: 'TEST' },
    });
    expect(payloads.find((p: { m: { eventName?: string } }) => !p.m.eventName).m.u).toBe('/rating');
  },
  15000
);

it('marks missing user and event IDs and uses the current event by default', async () => {
  vi.resetModules();
  platform({});
  const fetch = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal('fetch', fetch);
  const { Analytics } = await import('./analytics');
  vi.useFakeTimers();
  const analytics = new Analytics();
  analytics.track('FIRST');
  await vi.runAllTimersAsync();
  expect(JSON.parse(fetch.mock.calls[0][1].body).m).toMatchObject({
    eventId: Analytics.NOT_INITIALIZED,
    userId: Analytics.NOT_INITIALIZED,
  });
  analytics.setEventId(42);
  analytics.track('NEXT');
  await vi.runAllTimersAsync();
  expect(JSON.parse(fetch.mock.calls[1][1].body).m.eventId).toBe('42');
});

it('does not send analytics when the endpoint is absent', async () => {
  vi.resetModules();
  platform({});
  const { env: moduleEnv } = await import('../env');
  const saved = moduleEnv.urls.hugin;
  moduleEnv.urls.hugin = '';
  try {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const { Analytics } = await import('./analytics');
    vi.useFakeTimers();
    const analytics = new Analytics();
    analytics.setUserId(7);
    analytics.setEventId(42);
    analytics.setSessionId('session');
    analytics.track('TEST');
    analytics.trackView('/rating');
    await vi.runAllTimersAsync();
    expect(fetch).not.toHaveBeenCalled();
  } finally {
    moduleEnv.urls.hugin = saved;
  }
});
