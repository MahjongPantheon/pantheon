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

function Fixture({ aggregated = false, allowedYaku = {} as Record<string, boolean> }) {
  const form = useForm<FormFields>({
    initialValues: {
      event: EventData.initialize(),
      ruleset: {
        ...RulesetConfig.initialize({ useAggregatedYakuhai: aggregated }),
        allowedYaku: {
          ...Object.fromEntries(yakuList.map(({ id }) => [id, true])),
          ...allowedYaku,
        },
        yakuWithPao: {},
        doubleYakuman: {},
      },
    },
  });
  return (
    <MantineProvider>
      <YakuSettings form={form} i18n={i18n} />
      <output data-testid='allowed-yaku-values'>
        {JSON.stringify(form.values.ruleset.allowedYaku)}
      </output>
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
    const hidden =
      [49, 51, 53, 55].includes(id) || (aggregated ? id >= 48 && id <= 58 : id >= 13 && id <= 16);
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

function allowedValues(): Record<string, boolean> {
  return JSON.parse(container.querySelector('[data-testid="allowed-yaku-values"]')!.textContent);
}

it.each([
  [48, 49, 'East wind'],
  [50, 51, 'South wind'],
  [52, 53, 'West wind'],
  [54, 55, 'North wind'],
] as const)(
  'uses one checkbox to update both wind yaku %s and %s',
  (seat: number, round: number, label: string) => {
    act(() => root.render(<Fixture />));
    const before = allowedValues();
    const checkbox = control(`yaku-allowed-${seat}`)!;
    expect(checkbox.labels?.[0]?.textContent).toBe(label);
    expect(control(`yaku-allowed-${round}`)).toBeNull();
    act(() => checkbox.click());
    expect(allowedValues()).toEqual({ ...before, [seat]: false, [round]: false });
    act(() => control('yakuhai-aggregated')!.click());
    act(() => control('yakuhai-aggregated')!.click());
    expect(control(`yaku-allowed-${seat}`)?.checked).toBe(false);
    act(() => control(`yaku-allowed-${seat}`)!.click());
    expect(allowedValues()).toEqual(before);
  }
);

it.each([true, false])(
  'shows a partial wind setting as indeterminate (seat=%s)',
  (seatEnabled: boolean) => {
    act(() => root.render(<Fixture allowedYaku={{ 48: seatEnabled, 49: !seatEnabled }} />));
    const checkbox = control('yaku-allowed-48')!;
    expect(checkbox.checked).toBe(false);
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed');
    expect(allowedValues()[48]).toBe(seatEnabled);
    expect(allowedValues()[49]).toBe(!seatEnabled);
    act(() => checkbox.click());
    expect(allowedValues()[48]).toBe(true);
    expect(allowedValues()[49]).toBe(true);
    expect(control('yaku-allowed-48')?.getAttribute('aria-checked')).toBe('true');
  }
);
