import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { auth, authCtx, PrivilegesLevel } from '../hooks/auth';
import { SystemStats } from './SystemStats';

const { api, show } = vi.hoisted(() => ({
  api: { getLastYearStats: vi.fn(), getLastMonthStats: vi.fn(), getLastDayStats: vi.fn() },
  show: vi.fn(),
}));
const i18n = { _t: (text: string) => text };
const storage = { getPersonId: () => 1 };
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('../components/LineGraph', () => ({ default: () => <div>Chart</div> }));
vi.mock('@mantine/notifications', () => ({ notifications: { show } }));
vi.mock('wouter', () => ({
  Redirect: () => <div>Redirected</div>,
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.clearAllMocks();
  api.getLastDayStats.mockResolvedValue([]);
  api.getLastMonthStats.mockResolvedValue([]);
  api.getLastYearStats.mockResolvedValue([]);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

async function render(
  privilegesLevel: PrivilegesLevel,
  privilegesLoading = false,
  period = 'lastday'
) {
  await act(async () => {
    root.render(
      <MantineProvider env='test'>
        <authCtx.Provider value={{ ...auth, privilegesLevel, privilegesLoading }}>
          <SystemStats params={{ period }} />
        </authCtx.Provider>
      </MantineProvider>
    );
  });
}

it('waits for privileges and can transition between access states without changing hook order', async () => {
  await render(PrivilegesLevel.NOBODY, true);
  expect(api.getLastDayStats).not.toHaveBeenCalled();
  expect(container.textContent).not.toContain('Redirected');
  await render(PrivilegesLevel.SUPERADMIN);
  expect(api.getLastDayStats).toHaveBeenCalledOnce();
  expect(container.textContent).toContain('Chart');
  await render(PrivilegesLevel.NOBODY);
  expect(container.textContent).toContain('Redirected');
});

it('reports request failures and allows loading a different period', async () => {
  api.getLastDayStats.mockRejectedValue(new Error('Offline'));
  await render(PrivilegesLevel.SUPERADMIN);
  expect(show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Offline' }));
  expect(container.querySelector('.mantine-LoadingOverlay-root')).toBeNull();
  await render(PrivilegesLevel.SUPERADMIN, false, 'lastmonth');
  expect(api.getLastMonthStats).toHaveBeenCalledOnce();
  expect(container.textContent).toContain('Chart');
});

it('shows totals matching the aggregated chart data', async () => {
  api.getLastDayStats.mockResolvedValue([
    { datetime: '01', siteId: 'Tyr', uniqCount: 2 },
    { datetime: '01', siteId: 'Forseti', uniqCount: 3 },
    { datetime: '02', siteId: 'Tyr', uniqCount: 4 },
  ]);
  await render(PrivilegesLevel.SUPERADMIN);
  expect(container.textContent).toContain('Total by uniqCount: 9');
  const row = container.querySelector('tbody tr');
  expect(row?.textContent).toBe('uniqCount9');
});
