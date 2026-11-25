import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { EventData, RulesetConfig, UmaType } from 'tsclients/proto/atoms.pb';
import { RulesetSettings } from './RulesetSettings';
import { FormFields, FormHandle } from './types';
import { I18nService } from '../../services/i18n';

const i18n = { _t: (text: string) => text } as I18nService;
let form: FormHandle;
let container: HTMLDivElement;
let root: Root;

function Fixture() {
  form = useForm<FormFields>({
    mode: 'uncontrolled',
    cascadeUpdates: true,
    initialValues: {
      event: EventData.initialize(),
      ruleset: {
        ...RulesetConfig.initialize({
          startPoints: 25000,
          goalPoints: 30000,
          honbaValuePerPlayer: 100,
          chomboAmount: 8000,
          umaType: UmaType.UMA_TYPE_UMA_SIMPLE,
          uma: { place1: 20000, place2: 10000, place3: -10000, place4: -20000 },
        }),
        allowedYaku: {},
        yakuWithPao: {},
        doubleYakuman: {},
      },
    },
  });
  return (
    <MantineProvider env='test'>
      <RulesetSettings form={form} i18n={i18n} />
    </MantineProvider>
  );
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<Fixture />));
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function input(suffix: string) {
  return container.querySelector<HTMLInputElement>(
    `[data-testid="forseti-event-settings-${suffix}"]`
  );
}

it('loads numeric form values and updates them when a different ruleset is selected', () => {
  expect(input('ruleset-settings-ruleset-honba-value')!.value).toBe('100');
  expect(input('ruleset-settings-ruleset-start-points')!.value).toBe('25000');
  expect(input('uma-select-ruleset-uma-place1')!.value).toBe('20000');
  act(() =>
    form.setValues({
      ruleset: {
        ...form.getValues().ruleset,
        startPoints: 35000,
        uma: { place1: 10000, place2: 5000, place3: -5000, place4: -10000 },
      },
    })
  );
  expect(input('ruleset-settings-ruleset-start-points')!.value).toBe('35000');
  expect(input('uma-select-ruleset-uma-place1')!.value).toBe('10000');
  act(() => form.reset());
  expect(input('ruleset-settings-ruleset-start-points')!.value).toBe('25000');
  expect(input('uma-select-ruleset-uma-place1')!.value).toBe('20000');
});

it('reacts to dependent scoring options and restores the chombo penalty', () => {
  expect(input('ruleset-settings-ruleset-goal-points')).toBeNull();
  act(() => input('ruleset-settings-ruleset-play-additional-rounds')!.click());
  expect(input('ruleset-settings-ruleset-goal-points')!.value).toBe('30000');
  act(() => form.setFieldValue('ruleset.startPoints', 35000));
  act(() =>
    input('ruleset-settings-ruleset-goal-points')!.dispatchEvent(
      new FocusEvent('focusout', { bubbles: true })
    )
  );
  expect(input('ruleset-settings-ruleset-goal-points')!.value).toBe('35000');
  act(() => input('ruleset-settings-ruleset-extra-chombo-payments')!.click());
  expect(input('ruleset-settings-ruleset-chombo-amount')).toBeNull();
  expect(form.getValues().ruleset.chomboAmount).toBe(0);
  act(() => input('ruleset-settings-ruleset-extra-chombo-payments')!.click());
  expect(input('ruleset-settings-ruleset-chombo-amount')!.value).toBe('8000');
  expect(input('ruleset-settings-ruleset-yakitori-penalty')).toBeNull();
  act(() => input('ruleset-settings-ruleset-with-yakitori')!.click());
  expect(input('ruleset-settings-ruleset-yakitori-penalty')).not.toBeNull();
});

it('switches uma editors without losing edited scores', () => {
  act(() => form.setFieldValue('ruleset.uma.place1', 17000));
  act(() => input('uma-complex')!.click());
  expect(input('uma-select-ruleset-uma-place1')).toBeNull();
  expect(input('uma-select-ruleset-complex-uma-neg3-place1')).not.toBeNull();
  act(() => input('uma-simple')!.click());
  expect(input('uma-select-ruleset-uma-place1')!.value).toBe('17000');
});

it('explains why sanma chombo payments are disabled and enables them with extra payments', () => {
  act(() => form.setFieldValue('ruleset.withSanma', true));
  const paymentInput = () => input('ruleset-settings-ruleset-sanma-chombo-payments')!;
  expect(paymentInput().disabled).toBe(true);
  expect(container.textContent).toContain('Requires extra chombo payments to be enabled.');
  act(() => input('ruleset-settings-ruleset-extra-chombo-payments')!.click());
  expect(paymentInput().disabled).toBe(false);
  expect(container.textContent).not.toContain('Requires extra chombo payments to be enabled.');
});

it('keeps all abortive draw modes in sync with selection, preset updates and reset', () => {
  const mode = () => input('ruleset-settings-ruleset-with-abortives')!;
  expect(mode().value).toBe('Disabled');
  for (const [label, withAbortives, allowTripleRonWithAbortives] of [
    ['All', true, false],
    ['All except triple ron', true, true],
    ['Disabled', false, false],
  ] as const) {
    act(() => mode().click());
    act(() => {
      const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find(
        (element) => element.textContent === label
      );
      option!.click();
    });
    expect(form.getValues().ruleset).toMatchObject({ withAbortives, allowTripleRonWithAbortives });
    expect(mode().value).toBe(label);
  }
  act(() =>
    form.setValues({
      ruleset: {
        ...form.getValues().ruleset,
        withAbortives: true,
        allowTripleRonWithAbortives: true,
      },
    })
  );
  expect(mode().value).toBe('All except triple ron');
  act(() => form.setFieldValue('ruleset.allowTripleRonWithAbortives', false));
  expect(mode().value).toBe('All');
  act(() => form.setFieldValue('ruleset.withAbortives', false));
  act(() => form.setFieldValue('ruleset.allowTripleRonWithAbortives', true));
  expect(mode().value).toBe('Disabled');
  act(() => form.reset());
  expect(mode().value).toBe('Disabled');
});
