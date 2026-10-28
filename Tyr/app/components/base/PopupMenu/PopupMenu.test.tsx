import { act, StrictMode } from 'react';
import { componentHarness } from '../../../tests/componentHarness';
import { PopupMenu } from './PopupMenu';
import { PopupMenuItem } from './PopupMenuItem';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});
const view = componentHarness();
it('owns a native modal lifecycle and handles cancellation with the current callback', () => {
  const oldClose = vi.fn(),
    newClose = vi.fn();
  const tree = (open: boolean, close: typeof oldClose) => (
    <StrictMode>
      <PopupMenu isOpen={open} onClose={close}>
        <PopupMenuItem label='First' />
        <PopupMenuItem label='Last' />
      </PopupMenu>
    </StrictMode>
  );
  view.render(tree(false, oldClose));
  const dialog = view.container.querySelector('dialog')!;
  expect(dialog.open).toBe(false);
  view.render(tree(true, oldClose));
  expect(dialog.open).toBe(true);
  view.render(tree(true, newClose));
  const cancel = new Event('cancel', { cancelable: true });
  act(() => dialog.dispatchEvent(cancel));
  expect(cancel.defaultPrevented).toBe(true);
  expect(newClose).toHaveBeenCalledOnce();
  expect(oldClose).not.toHaveBeenCalled();
  view.render(tree(false, newClose));
  expect(dialog.open).toBe(false);
  view.render(tree(true, newClose));
  view.unmount();
  expect(dialog.open).toBe(false);
});

it('keeps a bounded popup nonmodal and tracks table resizing and touch dismissal', () => {
  const close = vi.fn();
  const disconnect = vi.fn();
  let resize!: () => void;
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
  const tree = (open: boolean) => (
    <div>
      <PopupMenu withinParent isOpen={open} onClose={close}>
        <PopupMenuItem label='Ron' />
      </PopupMenu>
    </div>
  );
  view.render(tree(false));
  const parent = view.container.firstElementChild!;
  const dialog = view.container.querySelector('dialog')!;
  const showModal = vi.spyOn(dialog, 'showModal').mockClear();
  const show = vi.spyOn(dialog, 'show').mockClear();
  const bounds = vi
    .spyOn(parent, 'getBoundingClientRect')
    .mockReturnValue(new DOMRect(20, 10, 360, 585));
  view.render(tree(true));
  expect(showModal).not.toHaveBeenCalled();
  expect(show).toHaveBeenCalledOnce();
  act(() => (dialog.firstElementChild as HTMLElement).click());
  expect(close).toHaveBeenCalledOnce();
  expect(dialog.style.top).toBe('10px');
  expect(dialog.style.left).toBe('20px');
  expect(dialog.style.width).toBe('360px');
  expect(dialog.style.height).toBe('585px');
  bounds.mockReturnValue(new DOMRect(0, 0, 640, 305));
  act(() => resize());
  expect(dialog.style.height).toBe('305px');
  act(() => window.dispatchEvent(new Event('resize')));
  expect(dialog.style.width).toBe('640px');
  view.render(tree(false));
  expect(disconnect).toHaveBeenCalledOnce();
  // Retain bounds during the closing transition as the dialog leaves the top layer.
  expect(dialog.style.height).toBe('305px');
});
