import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { Person } from 'tsclients/proto/atoms.pb';
import { PlayerSelector } from './PlayerSelector';

const { findByTitle } = vi.hoisted(() => ({ findByTitle: vi.fn() }));
const api = { findByTitle };
vi.mock('../../hooks/api', () => ({ useApi: () => api }));

let container: HTMLDivElement;
let root: Root;
const selected = vi.fn();
const people = [
  Person.initialize({ id: 1, title: 'Same Name', city: 'Moscow', tenhouId: 'first' }),
  Person.initialize({
    id: 2,
    title: 'Same Name',
    city: 'London',
    tenhouId: 'second',
    hasAvatar: true,
  }),
  Person.initialize({ id: 3, title: 'Another Player' }),
];

beforeEach(() => {
  vi.useFakeTimers();
  selected.mockClear();
  findByTitle.mockReset().mockResolvedValue(people);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function render(excludePlayers: number[] = []) {
  act(() =>
    root.render(
      <MantineProvider env='test'>
        <PlayerSelector
          eventId={1}
          excludePlayers={excludePlayers}
          onPlayerSelect={selected}
          placeholder='Find a player'
          testId='player-search'
        />
      </MantineProvider>
    )
  );
}

function input() {
  return container.querySelector('input')!;
}

function type(value: string) {
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input(), value);
    input().dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function search(value: string) {
  type(value);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
}

it('debounces search, preserves metadata and selects duplicate names by player ID', async () => {
  render();
  type('Sa');
  await act(async () => {
    await vi.advanceTimersByTimeAsync(200);
  });
  type('Same');
  expect(findByTitle).not.toHaveBeenCalled();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
  expect(findByTitle).toHaveBeenCalledExactlyOnceWith('Same');
  const options = document.querySelectorAll<HTMLElement>('[role="option"]');
  expect(options).toHaveLength(2);
  expect(options[1].textContent).toContain('#2, London, Tenhou nickname: second');
  act(() => options[1].click());
  expect(selected).toHaveBeenCalledWith(
    expect.objectContaining({ id: 2, title: 'Same Name', hasAvatar: true })
  );
  expect(input().value).toBe('');
  expect(document.querySelector('[role="option"]')).toBeNull();
});

it('excludes registered players and supports keyboard selection', async () => {
  render([1]);
  await search('Same');
  expect(document.querySelectorAll('[role="option"]')).toHaveLength(1);
  act(() =>
    input().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', code: 'ArrowDown', bubbles: true })
    )
  );
  act(() =>
    input().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true })
    )
  );
  expect(selected).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
});

it('ignores responses for cleared searches and cancels pending work on unmount', async () => {
  let resolve!: (result: Person[]) => void;
  findByTitle.mockReturnValue(
    new Promise<Person[]>((done) => {
      resolve = done;
    })
  );
  render();
  await search('Same');
  type('');
  await act(async () => {
    resolve(people);
  });
  expect(document.querySelector('[role="option"]')).toBeNull();
  type('Another');
  act(() => root.unmount());
  root = createRoot(container);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(300);
  });
  expect(findByTitle).toHaveBeenCalledTimes(1);
});

it('clears the loading indicator after a failed request', async () => {
  findByTitle.mockRejectedValue(new Error('Network unavailable'));
  render();
  await search('Same');
  expect(document.querySelector('[role="option"]')).toBeNull();
  expect(container.querySelector('.mantine-Loader-root')).toBeNull();
});

it('retains the five-result limit after excluding registered players', async () => {
  findByTitle.mockResolvedValue(
    Array.from({ length: 8 }, (_, index) =>
      Person.initialize({ id: index + 1, title: 'Same Name' })
    )
  );
  render([1]);
  await search('Same');
  const options = document.querySelectorAll('[role="option"]');
  expect(options).toHaveLength(5);
  expect(options[0].textContent).toContain('#2,');
  expect(options[4].textContent).toContain('#6,');
});
