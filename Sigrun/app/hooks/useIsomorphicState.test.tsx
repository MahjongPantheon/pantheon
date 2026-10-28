import { StrictMode, type PropsWithChildren } from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Isomorphic } from './isomorphic';
import { useIsomorphicState } from './useIsomorphicState';

const { progress } = vi.hoisted(() => ({
  progress: { reset: vi.fn(), start: vi.fn(), complete: vi.fn() },
}));
vi.mock('@mantine/nprogress', () => ({ nprogress: progress }));

let context: Record<string, unknown> & { __running: number };
function Wrapper({ children }: PropsWithChildren) {
  return (
    <StrictMode>
      <Isomorphic.Provider value={context}>{children}</Isomorphic.Provider>
    </StrictMode>
  );
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  context = { __running: 0 };
  vi.clearAllMocks();
});
afterEach(cleanup);

it.each([false, 0, '', null])(
  'reuses settled server data %s without requesting it again',
  (value) => {
    context.event = value;
    const fetch = vi.fn();
    const { result } = renderHook(() => useIsomorphicState(undefined, 'event', fetch, []), {
      wrapper: Wrapper,
    });
    expect(result.current).toEqual([value, null, false]);
    expect(fetch).not.toHaveBeenCalled();
  }
);

it('ignores obsolete responses and clears the previous key data while loading', async () => {
  const old = deferred<string>();
  const next = deferred<string>();
  const fetch = vi.fn((key: string) => (key === 'old' ? old.promise : next.promise));
  const { result, rerender } = renderHook(
    ({ name }) => useIsomorphicState(null, name, () => fetch(name), [name]),
    { initialProps: { name: 'old' }, wrapper: Wrapper }
  );
  rerender({ name: 'next' });
  expect(result.current).toEqual([null, null, true]);
  await act(async () => next.resolve('Current event'));
  await act(async () => old.resolve('Obsolete event'));
  expect(result.current).toEqual(['Current event', null, false]);
  expect(context.__running).toBe(0);
});

it('clears old errors for a new request and releases progress on unmount before a request settles', async () => {
  const failure = deferred<string>();
  const pending = deferred<string>();
  const { result, rerender, unmount } = renderHook(
    ({ revision }) =>
      useIsomorphicState(
        null,
        'event',
        () => (revision === 0 ? failure.promise : pending.promise),
        [revision]
      ),
    { initialProps: { revision: 0 }, wrapper: Wrapper }
  );
  const error = new Error('Offline');
  await act(async () => failure.reject(error));
  expect(result.current).toEqual([null, error, false]);
  rerender({ revision: 1 });
  expect(result.current).toEqual([null, null, true]);
  expect(context.__running).toBe(1);
  unmount();
  expect(context.__running).toBe(0);
  await act(async () => pending.resolve('Late response'));
  expect(context.__running).toBe(0);
});

it('waits for every active request before completing shared progress', async () => {
  const first = deferred<string>();
  const second = deferred<string>();
  const { result } = renderHook(
    () => [
      useIsomorphicState(null, 'first', () => first.promise, []),
      useIsomorphicState(null, 'second', () => second.promise, []),
    ],
    { wrapper: Wrapper }
  );
  progress.complete.mockClear();
  expect(context.__running).toBe(2);
  await act(async () => first.resolve('First'));
  expect(context.__running).toBe(1);
  expect(progress.complete).not.toHaveBeenCalled();
  await act(async () => second.resolve('Second'));
  expect(result.current.map(([data]) => data)).toEqual(['First', 'Second']);
  expect(progress.complete).toHaveBeenCalledOnce();
});

it('retains pagination data only within the requested group and ignores obsolete responses', async () => {
  context['club-1-page-1'] = 'First page';
  const second = deferred<string>();
  const third = deferred<string>();
  const other = deferred<string>();
  const { result, rerender } = renderHook(
    ({ club, page }) =>
      useIsomorphicState(
        null,
        `${club}-page-${page}`,
        () => (club !== 'club-1' ? other.promise : page === 2 ? second.promise : third.promise),
        [club, page],
        { retainDataFor: club }
      ),
    { initialProps: { club: 'club-1', page: 1 }, wrapper: Wrapper }
  );
  rerender({ club: 'club-1', page: 2 });
  expect(result.current).toEqual(['First page', null, true]);
  rerender({ club: 'club-1', page: 3 });
  await act(async () => third.resolve('Third page'));
  await act(async () => second.resolve('Obsolete second page'));
  expect(result.current).toEqual(['Third page', null, false]);
  rerender({ club: 'club-2', page: 1 });
  expect(result.current).toEqual([null, null, true]);
  await act(async () => other.resolve('Other club'));
  expect(result.current).toEqual(['Other club', null, false]);
});
