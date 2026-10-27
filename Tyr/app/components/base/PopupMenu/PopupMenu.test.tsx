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
