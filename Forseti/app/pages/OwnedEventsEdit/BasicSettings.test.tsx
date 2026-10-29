import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { EventData, EventType, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { BasicSettings } from './BasicSettings';
import { YakuSettings } from './YakuSettings';
import { FormFields, FormHandle } from './types';
import { I18nService } from '../../services/i18n';

let currentForm: FormHandle;
const renderPage = vi.fn();

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
  renderPage();
  const form = useForm<FormFields>({
    mode: 'uncontrolled',
    cascadeUpdates: true,
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
  currentForm = form;
  return (
    <MantineProvider env='test'>
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

function typeValue(input: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const prototype =
    input instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  act(() => {
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it('keeps current text values for submission without rerendering the page on every keystroke', () => {
  act(() => root.render(<Fixture />));
  const title = container.querySelector<HTMLInputElement>(
    '[data-testid="forseti-event-settings-basic-settings-event-title"]'
  )!;
  const description = container.querySelector<HTMLTextAreaElement>(
    '[data-testid="forseti-event-settings-basic-settings-event-description"]'
  )!;
  // Each field can rerender once as its dirty status changes.
  typeValue(title, 'Test event');
  typeValue(description, 'First line');
  renderPage.mockClear();
  for (const suffix of ['a', 'ab', 'abc']) {
    typeValue(title, `Test event ${suffix}`);
    typeValue(description, `First line\n${suffix}`);
  }
  expect(renderPage).not.toHaveBeenCalled();
  const submit = vi.fn();
  act(() => currentForm.onSubmit(submit)());
  expect(submit.mock.calls[0][0].event).toMatchObject({
    title: 'Test event abc',
    description: 'First line\nabc',
  });
});

it('updates uncontrolled fields when loading data and preserves edits across unrelated updates', () => {
  act(() => root.render(<Fixture />));
  act(() =>
    currentForm.setValues({
      event: {
        ...currentForm.getValues().event,
        title: 'Loaded event',
        description: 'Loaded description',
        isListed: true,
      },
    })
  );
  const title = container.querySelector<HTMLInputElement>(
    '[data-testid="forseti-event-settings-basic-settings-event-title"]'
  )!;
  expect(title.value).toBe('Loaded event');
  expect(container.querySelector<HTMLTextAreaElement>('textarea')!.value).toBe(
    'Loaded description'
  );
  typeValue(title, 'Edited event');
  selectType(EventType.EVENT_TYPE_TOURNAMENT);
  expect(title.value).toBe('Edited event');
  act(() => currentForm.setFieldValue('event.title', 'Programmatic update'));
  expect(
    container.querySelector<HTMLInputElement>(
      '[data-testid="forseti-event-settings-basic-settings-event-title"]'
    )!.value
  ).toBe('Programmatic update');
});
