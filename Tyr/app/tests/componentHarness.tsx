import { act, ReactNode } from 'react';
import { createRoot, Root } from 'react-dom/client';

export function componentHarness() {
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
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  return {
    get container() {
      return container;
    },
    render(node: ReactNode) {
      act(() => root.render(node));
    },
    unmount() {
      act(() => root.render(null));
    },
    click(selector: string) {
      const element = container.querySelector<HTMLButtonElement>(selector)!;
      act(() => element.click());
    },
  };
}
