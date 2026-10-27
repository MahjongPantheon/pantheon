import { act } from 'react';
import { componentHarness } from '../../../tests/componentHarness';
import { ScrollableSwitch } from './ScrollableSwitch';

const view = componentHarness();
beforeEach(() => {
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
it('handles no selection and scrolls each instance to its own selected option', () => {
  const select = vi.fn();
  view.render(
    <>
      <ScrollableSwitch options={[{ id: 'a', label: 'A', onSelect: select, selected: true }]} />
      <ScrollableSwitch options={[{ id: 'b', label: 'B', onSelect: select, selected: true }]} />
      <ScrollableSwitch options={[]} />
    </>
  );
  const scroll = vi.mocked(HTMLElement.prototype.scrollIntoView);
  expect(scroll).toHaveBeenCalledTimes(2);
  expect(scroll.mock.contexts.map((node: HTMLElement) => node.textContent)).toEqual(['A', 'B']);
});
it('keeps drag state across renders and distinguishes a drag from a click at a scrolled position', () => {
  const select = vi.fn();
  const options = [{ id: 'a', label: 'A', onSelect: select }];
  view.render(<ScrollableSwitch options={options} />);
  const button = view.container.querySelector('button')!;
  const scroller = button.parentElement!;
  scroller.scrollLeft = 200;
  act(() => button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 })));
  view.render(<ScrollableSwitch options={options} />);
  act(() => scroller.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 70 })));
  expect(scroller.scrollLeft).toBe(230);
  act(() => button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })));
  act(() => button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })));
  expect(select).not.toHaveBeenCalled();
  // Keyboard activation has no mouse click count and must still work after a drag.
  view.click('button');
  expect(select).toHaveBeenCalledOnce();
  act(() => button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 })));
  act(() => button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true })));
  act(() => button.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 })));
  expect(select).toHaveBeenCalledTimes(2);
});
