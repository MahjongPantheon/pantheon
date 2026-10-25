import { watchServiceWorkerUpdates } from '../../../Common/serviceWorkerUpdates';

describe('service worker update checks', () => {
  let listeners: (() => void)[];

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    listeners = [];
    vi.spyOn(window, 'addEventListener').mockImplementation(
      (_event: string, callback: EventListenerOrEventListenerObject | null) => {
        listeners.push(callback as () => void);
      }
    );
    vi.spyOn(document, 'addEventListener').mockImplementation(
      (_event: string, callback: EventListenerOrEventListenerObject | null) => {
        listeners.push(callback as () => void);
      }
    );
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function registration(update = vi.fn().mockResolvedValue(undefined), installing = null) {
    return { update, installing } as unknown as ServiceWorkerRegistration;
  }

  it('checks on startup, periodically, and after reconnecting or resuming a tab', async () => {
    const worker = registration();
    watchServiceWorkerUpdates(worker);
    expect(worker.update).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(worker.update).toHaveBeenCalledTimes(2);
    for (const listener of listeners) {
      listener();
      await Promise.resolve();
    }
    expect(worker.update).toHaveBeenCalledTimes(4);
  });

  it('does nothing if service workers are unavailable', () => {
    watchServiceWorkerUpdates(undefined);
    expect(vi.getTimerCount()).toBe(0);
    expect(listeners).toHaveLength(0);
  });

  it('skips offline and hidden tabs, then checks when visible and online', async () => {
    const worker = registration();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    watchServiceWorkerUpdates(worker);
    expect(worker.update).not.toHaveBeenCalled();
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(worker.update).not.toHaveBeenCalled();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    listeners[1]();
    expect(worker.update).toHaveBeenCalledTimes(1);
  });

  it('does not overlap update checks', async () => {
    let finish!: () => void;
    const worker = registration(
      vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          })
      )
    );
    watchServiceWorkerUpdates(worker);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(worker.update).toHaveBeenCalledTimes(1);
    finish();
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(worker.update).toHaveBeenCalledTimes(2);
    finish();
  });

  it('retries after an update check fails', async () => {
    const worker = registration(vi.fn().mockRejectedValue(new Error('Server unavailable')));
    watchServiceWorkerUpdates(worker);
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(worker.update).toHaveBeenCalledTimes(2);
  });

  it('waits for an installing worker before checking again', async () => {
    const worker = registration();
    Object.defineProperty(worker, 'installing', { value: {}, configurable: true });
    watchServiceWorkerUpdates(worker);
    expect(worker.update).not.toHaveBeenCalled();
    Object.defineProperty(worker, 'installing', { value: null });
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(worker.update).toHaveBeenCalledTimes(1);
  });
});
