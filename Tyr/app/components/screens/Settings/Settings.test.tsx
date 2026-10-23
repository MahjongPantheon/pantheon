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

  it('does not show the admin panel button even for eligible users', () => {
    act(() =>
      root.render(
        <Settings
          newyear={false}
          state={{ ...initialState, canAccessAdminPanel: true }}
          dispatch={vi.fn()}
        />
      )
    );
    expect(container.textContent).not.toContain('Go to admin panel');
    expect(container.querySelector('[data-testid="tyr-home-admin-panel"]')).toBeNull();
  });
});
