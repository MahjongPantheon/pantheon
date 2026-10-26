import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { GameConfig, RulesetConfig } from 'tsclients/proto/atoms.pb';
import { PenaltyForm } from './PenaltyForm';
import { components } from '../../theme';

const { addPenalty } = vi.hoisted(() => ({ addPenalty: vi.fn() }));
const api = { addPenalty };
vi.mock('../../hooks/api', () => ({ useApi: () => api }));
vi.mock('../../hooks/storage', () => ({ useStorage: () => ({ getPersonId: () => 1 }) }));
vi.mock('../../hooks/i18n', () => ({ useI18n: () => ({ _t: (text: string) => text }) }));

let container: HTMLDivElement;
let root: Root;
const succeeded = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  addPenalty.mockReset().mockResolvedValue(true);
  succeeded.mockClear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root.render(
      <MantineProvider env='test' theme={{ components }}>
        <PenaltyForm
          eventId='42'
          playersList={[{ value: '7', label: 'Selected Player' }]}
          eventConfig={GameConfig.initialize({
            rulesetConfig: RulesetConfig.initialize({
              minPenalty: 0,
              maxPenalty: 20000,
              penaltyStep: 100,
            }),
          })}
          onSuccess={succeeded}
        />
      </MantineProvider>
    )
  );
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function input(testId: string) {
  return container.querySelector<HTMLInputElement>(`[data-testid="${testId}"]`)!;
}

function type(testId: string, value: string) {
  act(() => {
    const element = input(testId);
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

it.each([0, 500])(
  'submits a numeric player ID and amount for a %s-point penalty or notice',
  async (amount) => {
    type('forseti-penalty-player', 'Selected');
    act(() => document.querySelector<HTMLElement>('[role="option"]')!.click());
    // Selecting the same player again must not clear a non-clearable v6 select.
    act(() => input('forseti-penalty-player').click());
    act(() => document.querySelector<HTMLElement>('[role="option"]')!.click());
    type('forseti-penalty-amount', amount.toString());
    type('forseti-penalty-reason', 'Test reason');
    await act(async () => {
      container
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    });
    expect(addPenalty).toHaveBeenCalledExactlyOnceWith(42, 7, amount, 'Test reason');
    expect(succeeded).toHaveBeenCalledOnce();
    expect(input('forseti-penalty-player').value).toBe('');
  }
);

it('requires a selected player and a reason before calling the API', async () => {
  await act(async () => {
    container
      .querySelector('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
  expect(addPenalty).not.toHaveBeenCalled();
  expect(container.textContent).toContain('Please select player');
  expect(container.textContent).toContain('A reason for penalty is mandatory');
});
