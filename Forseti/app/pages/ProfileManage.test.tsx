import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { ProfileManage } from './ProfileManage';

const { api, show } = vi.hoisted(() => ({
  api: {
    setEventId: vi.fn(),
    getCountries: vi.fn(),
    getPersonalInfo: vi.fn(),
    updatePersonalInfo: vi.fn(),
  },
  show: vi.fn(),
}));
const i18n = { _t: (text: string) => text };
const storage = { getPersonId: () => 7 };
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('../hooks/pageTitle', () => ({ usePageTitle: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show } }));
vi.mock('@mantine/nprogress', () => ({
  nprogress: { reset: vi.fn(), start: vi.fn(), complete: vi.fn() },
}));

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  vi.resetAllMocks();
  api.getCountries.mockResolvedValue({ countries: [], preferredByIp: 'DE' });
  api.getPersonalInfo.mockResolvedValue({
    email: 'a@b.test',
    title: 'Alice',
    city: '',
    phone: '',
    tenhouId: '',
    roninId: 'alice',
    country: 'DE',
    hasAvatar: false,
  });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MantineProvider env='test'>
        <ProfileManage />
      </MantineProvider>
    );
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function save() {
  await act(async () => {
    container
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

it('shows a taken Ronin nickname as an error on its field', async () => {
  api.updatePersonalInfo.mockRejectedValue({
    code: 'already_exists',
    msg: 'Ronin ID is already taken',
  });

  await save();

  expect(api.updatePersonalInfo.mock.calls[0][12]).toBe('alice');
  const field = container.querySelector('[data-testid="forseti-profile-manage-ronin-id"]')!;
  expect(field.closest('.mantine-InputWrapper-root')?.textContent).toContain(
    'This Ronin nickname is already taken'
  );
  expect(show).not.toHaveBeenCalled();
});

it('reports any other failed save', async () => {
  api.updatePersonalInfo.mockRejectedValue(new Error('offline'));

  await save();

  expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'red' }));
});

it('saves the trimmed Ronin nickname and reports a refused save', async () => {
  api.updatePersonalInfo.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
  const input = container.querySelector<HTMLInputElement>(
    '[data-testid="forseti-profile-manage-ronin-id"]'
  )!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input,
      '  bob  '
    );
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });

  await save();
  expect(api.updatePersonalInfo.mock.calls[0][12]).toBe('bob');
  expect(show).not.toHaveBeenCalled();

  await save();
  expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'red' }));
});
