import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useSwipeToClose } from './useSwipeToClose';

let container: HTMLDivElement;
let root: Root;
const close = vi.fn();
const clicked = vi.fn();

function Fixture() {
  const handlers = useSwipeToClose(close);
  return (
    <div {...handlers}>
      <div role='dialog'>
        <button onClick={clicked}>Menu item</button>
      </div>
    </div>
  );
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  close.mockClear();
  clicked.mockClear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() => root.render(<Fixture />));
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function pointer(type: string, x: number, y: number, primary = true) {
  const event = new MouseEvent(type, {
    clientX: x,
    clientY: y,
    button: 0,
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperties(event, {
    pointerId: { value: primary ? 1 : 2 },
    isPrimary: { value: primary },
  });
  act(() => container.querySelector('button')!.dispatchEvent(event));
}

it('closes on a deliberate left swipe and prevents activating the menu item underneath', () => {
  pointer('pointerdown', 250, 100);
  pointer('pointermove', 160, 105);
  pointer('pointerup', 150, 105);
  expect(close).toHaveBeenCalledOnce();
  act(() =>
    container
      .querySelector('button')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
  );
  expect(clicked).not.toHaveBeenCalled();
  pointer('pointerdown', 100, 100);
  pointer('pointerup', 100, 100);
  act(() =>
    container
      .querySelector('button')!
      .dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }))
  );
  expect(clicked).toHaveBeenCalledOnce();
});

it.each([
  [220, 105],
  [350, 105],
  [150, 250],
])('ignores a short, rightward, or vertical gesture ending at %s, %s', (x, y) => {
  pointer('pointerdown', 250, 100);
  pointer('pointermove', x, y);
  pointer('pointerup', x, y);
  expect(close).not.toHaveBeenCalled();
});

it('does not turn a vertical scroll into a closing swipe', () => {
  pointer('pointerdown', 250, 100);
  pointer('pointermove', 245, 130);
  pointer('pointermove', 100, 135);
  pointer('pointerup', 100, 135);
  expect(close).not.toHaveBeenCalled();
});

it('ignores canceled and multi-touch gestures', () => {
  pointer('pointerdown', 250, 100);
  pointer('pointermove', 150, 100);
  pointer('pointercancel', 150, 100);
  pointer('pointerup', 150, 100);
  expect(close).not.toHaveBeenCalled();
  pointer('pointerdown', 250, 100);
  pointer('pointerdown', 230, 100, false);
  pointer('pointerup', 100, 100);
  expect(close).not.toHaveBeenCalled();
});
