import { componentHarness } from '../../../tests/componentHarness';
import { ModalDialog } from './ModalDialog';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});
const view = componentHarness();
it('restores focus when React removes the dialog before passive cleanup', () => {
  const tree = (open: boolean) => (
    <>
      <button id='opener'>Open</button>
      {open && (
        <ModalDialog actionPrimary={vi.fn()} actionPrimaryLabel='Dismiss'>
          Notice
        </ModalDialog>
      )}
    </>
  );
  view.render(tree(false));
  const opener = view.container.querySelector<HTMLButtonElement>('#opener')!;
  opener.focus();
  view.render(tree(true));
  const dialog = view.container.querySelector('dialog')!;
  dialog.querySelector('button')!.focus();
  view.render(tree(false));
  expect(dialog.isConnected).toBe(false);
  expect(document.activeElement).toBe(opener);
});
