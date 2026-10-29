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
