import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { YakuAdviceDialog } from './YakuAdviceDialog';
import { YakuId as Y } from '../../../helpers/yaku';
import { RESOLVE_YAKU_ADVICE } from '../../../store/actions/interfaces';

vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});
let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

it.each([
  ['primary', true],
  ['secondary', false],
  ['', false],
] as const)('resolves once through %s', (suffix: string, approve: boolean) => {
  const dispatch = vi.fn();
  const advice = { winner: 2, lastYaku: Y.TOITOI, expectedYaku: Y.SUUANKOU as const };
  act(() => root.render(<YakuAdviceDialog advice={advice} dispatch={dispatch} />));
  const target = container.querySelector(
    `[data-testid="tyr-yaku-advice-dialog${suffix ? '-' + suffix : ''}"]`
  )!;
  act(() => target.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(dispatch).toHaveBeenCalledExactlyOnceWith({
    type: RESOLVE_YAKU_ADVICE,
    payload: { approve, advice },
  });
});

it('keeps the dialog open when its content is clicked and shows sanankou guidance', () => {
  const dispatch = vi.fn();
  const advice = { winner: 2, lastYaku: Y.TOITOI, expectedYaku: Y.SANANKOU as const };
  act(() => root.render(<YakuAdviceDialog advice={advice} dispatch={dispatch} />));
  expect(container.textContent).toContain('Sanankou');
  const overlay = container.querySelector('[data-testid="tyr-yaku-advice-dialog"]')!;
  act(() => overlay.firstElementChild!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  expect(dispatch).not.toHaveBeenCalled();
});
