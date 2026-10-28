import { componentHarness } from '../../../tests/componentHarness';
import { NumberSelect } from './NumberSelect';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});
const view = componentHarness();
const options = [
  { value: 10, label: 'Ten' },
  { value: 20, label: 'Twenty' },
];
it('uses replacement callbacks and native disabled controls, including the dropdown', () => {
  const oldChange = vi.fn(),
    newChange = vi.fn();
  view.render(<NumberSelect options={options} selectedIndex={0} onChange={oldChange} />);
  view.render(<NumberSelect options={options} selectedIndex={0} onChange={newChange} />);
  view.click('[aria-label="Increase"]');
  expect(newChange).toHaveBeenCalledExactlyOnceWith(1);
  expect(oldChange).not.toHaveBeenCalled();
  view.render(<NumberSelect options={options} selectedIndex={0} disabled onChange={newChange} />);
  const buttons = [...view.container.querySelectorAll<HTMLButtonElement>('button')];
  expect(buttons.slice(0, 3).every((button) => button.disabled)).toBe(true);
  view.click('[aria-expanded]');
  expect(view.container.querySelector('[aria-expanded]')?.getAttribute('aria-expanded')).toBe(
    'false'
  );
});
it('handles removed selected options and preserves item identity when options reorder', () => {
  view.render(<NumberSelect options={options} selectedIndex={0} />);
  view.click('[aria-expanded]');
  const ten = [...view.container.querySelectorAll('button')].find(
    (b) => b.textContent === 'Ten' && !b.hasAttribute('aria-expanded')
  )!;
  view.render(<NumberSelect options={[...options].reverse()} selectedIndex={1} />);
  expect(
    [...view.container.querySelectorAll('button')].find(
      (b) => b.textContent === 'Ten' && !b.hasAttribute('aria-expanded')
    )
  ).toBe(ten);
  view.render(<NumberSelect options={[]} selectedIndex={0} />);
  expect(view.container.querySelector('[aria-expanded]')?.textContent).toBe('--');
});
