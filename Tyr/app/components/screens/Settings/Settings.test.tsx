import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Settings } from './Settings';
import { initialState } from '../../../store/state';

vi.mock('../../../helpers/env', () => ({
  env: { urls: { forseti: 'https://admin.example.test' } },
}));
vi.mock('../../i18n', async () => {
  const { createContext } = await import('react');
  return { i18n: createContext({ _t: (message: string) => message }) };
});

describe('Settings admin panel button', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    Element.prototype.scrollIntoView = vi.fn();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('hides the button until permission is granted', () => {
    const dispatch = vi.fn();
    act(() => root.render(<Settings newyear={false} state={initialState} dispatch={dispatch} />));
    expect(container.querySelector('[data-testid="tyr-settings-admin-panel"]')).toBeNull();
  });

  it('opens the configured Forseti owned events page', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    act(() =>
      root.render(
        <Settings
          newyear={false}
          state={{ ...initialState, canAccessAdminPanel: true }}
          dispatch={vi.fn()}
        />
      )
    );
    const button = container.querySelector<HTMLButtonElement>(
      '[data-testid="tyr-settings-admin-panel"]'
    );
    expect(button?.textContent).toBe('Go to admin panel');
    act(() => button?.click());
    expect(open).toHaveBeenCalledWith('https://admin.example.test/ownedEvents');
  });
});
