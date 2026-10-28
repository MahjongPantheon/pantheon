import { act } from 'react';
import { componentHarness } from '../../../tests/componentHarness';
import { FourSidedScreen } from './FourSidedScreen';

const view = componentHarness();
it('reports current dimensions to the current callback and releases observers', () => {
  let resize!: () => void;
  const disconnect = vi.fn();
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    }
  );
  let width = 200;
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    () => ({ width, height: 100 }) as DOMRect
  );
  const first = vi.fn(),
    second = vi.fn();
  const tree = (callback: typeof first) => (
    <FourSidedScreen
      sideUp={<></>}
      sideLeft={<></>}
      sideDown={<></>}
      sideRight={<></>}
      center={<></>}
      onDimensionChange={callback}
    />
  );
  view.render(tree(first));
  expect(first).toHaveBeenLastCalledWith({ width: 200, height: 100 });
  view.render(tree(second));
  width = 300;
  act(() => resize());
  expect(second).toHaveBeenLastCalledWith({ width: 300, height: 100 });
  expect(first).toHaveBeenCalledTimes(1);
  view.unmount();
  expect(disconnect).toHaveBeenCalledTimes(2);
  act(() => window.dispatchEvent(new Event('resize')));
  expect(second).toHaveBeenCalledTimes(2);
});
