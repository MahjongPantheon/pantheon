import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { EventData, EventType, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { BasicSettings } from './BasicSettings';
import { YakuSettings } from './YakuSettings';
import { FormFields } from './types';
import { I18nService } from '../../services/i18n';

const i18n = { _t: (text: string) => text } as I18nService;

function Fixture({
  newEvent = true,
  aggregated = false,
  type = EventType.EVENT_TYPE_LOCAL,
}: {
  newEvent?: boolean;
  aggregated?: boolean;
  type?: EventType;
}) {
  const form = useForm<FormFields>({
    initialValues: {
      event: EventData.initialize({ type }),
      ruleset: {
        ...RulesetConfig.initialize({ useAggregatedYakuhai: aggregated }),
        allowedYaku: {},
        yakuWithPao: {},
        doubleYakuman: {},
      },
    },
  });
  return (
    <MantineProvider>
      <BasicSettings
        form={form}
        i18n={i18n}
        newEvent={newEvent}
        rulesets={[]}
        timezones={[]}
        setFormValues={vi.fn()}
      />
      <YakuSettings form={form} i18n={i18n} />
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

function aggregationCheckbox() {
  return container.querySelector<HTMLInputElement>(
    '[data-testid="forseti-event-settings-yakuhai-aggregated"]'
  )!;
}

function selectType(type: EventType) {
  act(() =>
    container
      .querySelector<HTMLInputElement>(`[data-testid="forseti-event-settings-event-type-${type}"]`)!
      .click()
  );
}

it('defaults new local events to separate yakuhai', () => {
  act(() => root.render(<Fixture />));
  expect(aggregationCheckbox().checked).toBe(false);
});

it('updates the yakuhai checkbox each time the new event type changes', () => {
  act(() => root.render(<Fixture />));
  for (const type of [
    EventType.EVENT_TYPE_TOURNAMENT,
    EventType.EVENT_TYPE_ONLINE,
    EventType.EVENT_TYPE_TOURNAMENT,
    EventType.EVENT_TYPE_LOCAL,
  ]) {
    selectType(type);
    expect(aggregationCheckbox().checked).toBe(type === EventType.EVENT_TYPE_TOURNAMENT);
  }
});

it('allows a manual choice until another event type is selected', () => {
  act(() => root.render(<Fixture />));
  selectType(EventType.EVENT_TYPE_TOURNAMENT);
  act(() => aggregationCheckbox().click());
  expect(aggregationCheckbox().checked).toBe(false);
  selectType(EventType.EVENT_TYPE_LOCAL);
  act(() => aggregationCheckbox().click());
  expect(aggregationCheckbox().checked).toBe(true);
  selectType(EventType.EVENT_TYPE_ONLINE);
  expect(aggregationCheckbox().checked).toBe(false);
});

it('preserves the saved yakuhai mode when editing a tournament', () => {
  act(() => root.render(<Fixture newEvent={false} type={EventType.EVENT_TYPE_TOURNAMENT} />));
  expect(aggregationCheckbox().checked).toBe(false);
  expect(container.querySelector('[data-testid^="forseti-event-settings-event-type-"]')).toBeNull();
});

it('preserves a copied local event mode until its type changes', () => {
  act(() => root.render(<Fixture aggregated />));
  expect(aggregationCheckbox().checked).toBe(true);
  selectType(EventType.EVENT_TYPE_ONLINE);
  expect(aggregationCheckbox().checked).toBe(false);
});
