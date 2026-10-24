import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { EventData, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { YakuSettings } from './YakuSettings';
import { FormFields } from './types';
import { I18nService } from '../../services/i18n';
import { yakuList } from '../../helpers/yaku';

const i18n = { _t: (text: string) => text } as I18nService;

function Fixture({ aggregated = false }) {
  const form = useForm<FormFields>({
    initialValues: {
      event: EventData.initialize(),
      ruleset: {
        ...RulesetConfig.initialize({ useAggregatedYakuhai: aggregated }),
        allowedYaku: Object.fromEntries(yakuList.map(({ id }) => [id, true])),
        yakuWithPao: {},
        doubleYakuman: {},
      },
    },
  });
  return (
    <MantineProvider>
      <YakuSettings form={form} i18n={i18n} />
    </MantineProvider>
  );
}

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
function control(id: string) {
  return container.querySelector<HTMLInputElement>(`[data-testid="forseti-event-settings-${id}"]`);
}

function expectYakuForMode(aggregated: boolean) {
  for (const { id } of yakuList) {
    const hidden = aggregated ? id >= 48 && id <= 58 : id >= 13 && id <= 16;
    expect(control(`yaku-allowed-${id}`) === null).toBe(hidden);
  }
}

it.each([false, true])(
  'shows the matching yakuhai family with aggregated mode %s',
  (aggregated) => {
    act(() => root.render(<Fixture aggregated={aggregated} />));
    expect(control('yakuhai-aggregated')?.checked).toBe(aggregated);
    expectYakuForMode(aggregated);
    for (const input of container.querySelectorAll<HTMLInputElement>(
      '[data-testid^="forseti-event-settings-yaku-allowed-"]'
    )) {
      expect(input.checked).toBe(true);
    }
  }
);

it('updates the list immediately and preserves selections across mode changes', () => {
  act(() => root.render(<Fixture />));
  act(() => control('yaku-allowed-56')!.click());
  act(() => control('yaku-allowed-23')!.click());
  act(() => control('yakuhai-aggregated')!.click());
  expectYakuForMode(true);
  expect(control('yaku-allowed-13')?.checked).toBe(true);
  expect(control('yaku-allowed-23')?.checked).toBe(false);
  act(() => control('yaku-allowed-13')!.click());
  act(() => control('yakuhai-aggregated')!.click());
  expectYakuForMode(false);
  expect(control('yaku-allowed-56')?.checked).toBe(false);
  expect(control('yaku-allowed-57')?.checked).toBe(true);
  expect(control('yaku-allowed-23')?.checked).toBe(false);
  act(() => control('yakuhai-aggregated')!.click());
  expect(control('yaku-allowed-13')?.checked).toBe(false);
  expect(control('yaku-allowed-14')?.checked).toBe(true);
});
