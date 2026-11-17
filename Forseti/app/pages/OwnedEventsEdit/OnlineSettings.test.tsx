import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { EventData, EventType, PlatformType, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { OnlineSettings } from './OnlineSettings';
import { FormFields, FormHandle } from './types';
import { auth, authCtx, PrivilegesLevel } from '../../hooks/auth';
import { I18nService } from '../../services/i18n';
import { Storage } from '../../../../Common/storage';

const stored = new Map<string, string | number>();
const storage = new Storage();
storage.setStrategy({
  get: (key) => stored.get(key) ?? null,
  set: (key, _type, value) => {
    stored.set(key, value);
  },
  delete: (key) => {
    stored.delete(key);
  },
  clear: () => {
    stored.clear();
  },
});
const i18n = new I18nService(storage);

beforeAll(
  () =>
    new Promise<string>((resolve, reject) => {
      i18n.init(resolve, reject);
    })
);

let form: FormHandle;

function Fixture({ platformId }: { platformId: PlatformType }) {
  form = useForm<FormFields>({
    initialValues: {
      event: EventData.initialize({ type: EventType.EVENT_TYPE_ONLINE, platformId }),
      ruleset: {
        ...RulesetConfig.initialize(),
        allowedYaku: {},
        yakuWithPao: {},
        doubleYakuman: {},
      },
    },
  });
  return (
    <MantineProvider env='test'>
      <authCtx.Provider value={{ ...auth, privilegesLevel: PrivilegesLevel.SUPERADMIN }}>
        <OnlineSettings form={form} i18n={i18n} />
      </authCtx.Provider>
    </MantineProvider>
  );
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

const field = (name: string) =>
  container.querySelector<HTMLInputElement>(
    `[data-testid="forseti-event-settings-online-settings-event-${name}"]`
  );

it('offers Ronin as a platform to a superadmin', () => {
  act(() => root.render(<Fixture platformId={PlatformType.PLATFORM_TYPE_TENHOUNET} />));
  act(() => field('platform-id')!.click());
  const options = [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent);
  expect(options).toContain('Ronin');
});
