import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { auth, authCtx, PrivilegesLevel } from '../hooks/auth';
import { ProfileManageAdmin } from './ProfileManageAdmin';

const { api, show } = vi.hoisted(() => ({
  api: {
    setEventId: vi.fn(),
    getCountries: vi.fn(),
    getPersonalInfo: vi.fn(),
    updatePersonalInfo: vi.fn(),
    createAccount: vi.fn(),
  },
  show: vi.fn(),
}));
const i18n = { _t: (text: string) => text };
const storage = { getPersonId: () => 1 };
vi.mock('../hooks/api', () => ({ useApi: () => api }));
vi.mock('../hooks/i18n', () => ({ useI18n: () => i18n }));
vi.mock('../hooks/storage', () => ({ useStorage: () => storage }));
vi.mock('../hooks/pageTitle', () => ({ usePageTitle: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show } }));

let container: HTMLDivElement;
let root: Root;

async function render(id?: string, privilegesLevel = PrivilegesLevel.SUPERADMIN) {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => {
    root.render(
      <MantineProvider env='test'>
        <authCtx.Provider value={{ ...auth, isLoggedIn: true, privilegesLevel }}>
          <ProfileManageAdmin params={{ id }} />
        </authCtx.Provider>
      </MantineProvider>
    );
  });
}

function input(testId: string) {
  return container.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`)!;
}

async function type(testId: string, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(
      input(testId),
      value
    );
    input(testId).dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function save() {
  await act(async () => {
    container
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}

function fieldText(testId: string) {
  return input(testId).closest('.mantine-InputWrapper-root')?.textContent ?? '';
}

beforeEach(() => {
  vi.resetAllMocks();
  api.getCountries.mockResolvedValue({ countries: [] });
  api.getPersonalInfo.mockResolvedValue({
    id: 9,
    email: 'a@b.test',
    title: 'Alice',
    city: '',
    country: 'DE',
    phone: '',
    tenhouId: '',
    roninId: 'alice',
    hasAvatar: false,
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

it('shows a taken Ronin nickname on its field when editing a player', async () => {
  api.updatePersonalInfo.mockRejectedValue({
    code: 'already_exists',
    msg: 'Ronin ID is already taken',
  });
  await render('9');

  await save();

  expect(api.updatePersonalInfo.mock.calls[0][12]).toBe('alice');
  expect(fieldText('forseti-profile-manage-admin-ronin-id')).toContain(
    'This Ronin nickname is already taken'
  );
  expect(show).not.toHaveBeenCalled();
});

it('reports a registered e-mail as a failed registration, not a taken Ronin nickname', async () => {
  api.createAccount.mockRejectedValue({
    code: 'already_exists',
    msg: 'This account is already registered',
  });
  await render();
  await type('forseti-profile-manage-admin-email', 'b@c.test');
  await type('forseti-profile-manage-admin-title', 'Bob');
  await type('forseti-profile-manage-admin-ronin-id', ' bob ');

  await save();

  expect(api.createAccount.mock.calls[0][7]).toBe('bob');
  expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'red' }));
  expect(fieldText('forseti-profile-manage-admin-ronin-id')).not.toContain('already taken');
});

it('confirms saved player details', async () => {
  api.updatePersonalInfo.mockResolvedValue(true);
  await render('9');

  await save();

  expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'green' }));
  expect(input('forseti-profile-manage-admin-ronin-id').value).toBe('alice');
});

it('confirms a registered player and clears the form', async () => {
  api.createAccount.mockResolvedValue(7);
  await render();
  await type('forseti-profile-manage-admin-email', 'b@c.test');
  await type('forseti-profile-manage-admin-title', 'Bob');
  await type('forseti-profile-manage-admin-ronin-id', 'bob');

  await save();

  expect(show).toHaveBeenCalledWith(expect.objectContaining({ color: 'green' }));
  expect(input('forseti-profile-manage-admin-ronin-id').value).toBe('');
});

it('refuses to register a player without a valid e-mail and a title', async () => {
  await render();

  await save();

  expect(api.createAccount).not.toHaveBeenCalled();
  expect(fieldText('forseti-profile-manage-admin-email')).toContain('Invalid email');
  expect(fieldText('forseti-profile-manage-admin-title')).toContain('Invalid title');
});

it('sends a non-superadmin away without loading the player', async () => {
  await render('9', PrivilegesLevel.ADMIN);

  expect(container.querySelector('form')).toBeNull();
  expect(api.getPersonalInfo).not.toHaveBeenCalled();
});
