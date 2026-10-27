import { componentHarness } from '../../../tests/componentHarness';
import { Penalties } from './Penalties';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});
const view = componentHarness();
it('keeps penalty rows attached to their API identity when the list changes', () => {
  const penalties = [
    { id: 11, amount: 1000, reason: 'One', isCancelled: false },
    { id: 12, amount: 2000, reason: 'Two', isCancelled: false },
  ];
  view.render(<Penalties penaltiesList={penalties} isLoading={false} onBackClick={vi.fn()} />);
  const first = view.container.querySelector('[data-testid="tyr-penalties-item-0"]');
  view.render(
    <Penalties
      penaltiesList={[penalties[1], { ...penalties[0], isCancelled: true }]}
      isLoading={false}
      onBackClick={vi.fn()}
    />
  );
  expect(view.container.querySelector('[data-testid="tyr-penalties-item-1"]')).toBe(first);
  expect(first?.textContent).toContain('One');
});
