import { act, cleanup, render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { TableState, SessionStatus } from 'tsclients/proto/atoms.pb';
import type { EventsGetTablesStateResponse } from 'tsclients/proto/mimir.pb';
import { TablesState } from './TablesState';

const { api } = vi.hoisted(() => ({ api: { getTablesState: vi.fn() } }));
const events = [{ title: 'Tournament' }];
const i18n = {
  _t: (text: string, values?: unknown[]) => (values ? `${text}: ${values.join(', ')}` : text),
};
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/useEvent', () => ({ useEvent: () => events }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../hooks/useIsomorphicState', () => ({
  useIsomorphicState: () => [{ rulesetConfig: { startPoints: 25000 } }],
}));
vi.mock('../components/Meta', () => ({ Meta: () => null }));
vi.mock('../components/EventTypeIcon', () => ({ EventTypeIcon: () => null }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
const tree = (id: string) => (
  <MantineProvider env='test'>
    <TablesState params={{ eventId: id }} />
  </MantineProvider>
);
const response = (index: number): EventsGetTablesStateResponse => ({
  tables: [
    TableState.initialize({
      tableIndex: index,
      currentRoundIndex: 1,
      status: SessionStatus.SESSION_STATUS_INPROGRESS,
    }),
  ],
});

it('counts loaded tables and ignores responses from a previous event', async () => {
  let resolve!: (state: EventsGetTablesStateResponse) => void;
  api.getTablesState
    .mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      })
    )
    .mockResolvedValue(response(2));
  const view = render(tree('1'));
  await act(async () => view.rerender(tree('2')));
  expect(screen.getByRole('heading', { level: 3 }).textContent).toContain('1, 1, 0');
  expect(screen.getByText('2')).toBeTruthy();
  await act(async () => resolve(response(99)));
  expect(screen.queryByText('99')).toBeNull();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
  expect(api.getTablesState).toHaveBeenLastCalledWith(2);
});

it('retries failures, keeps the latest view, and stops polling on unmount', async () => {
  api.getTablesState.mockRejectedValueOnce(new Error('Offline')).mockResolvedValue(response(3));
  const view = render(tree('1'));
  await act(async () => {});
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
  expect(screen.getByText('3')).toBeTruthy();
  view.unmount();
  api.getTablesState.mockClear();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(30000);
  });
  expect(api.getTablesState).not.toHaveBeenCalled();
});
