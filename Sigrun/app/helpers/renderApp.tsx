import { ReactNode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';

export function renderApp(container: HTMLElement, app: ReactNode, hasServerData: boolean) {
  // The PWA's cached HTML shell has no server markup or hydration data.
  if (hasServerData) return hydrateRoot(container, app);
  const root = createRoot(container);
  root.render(app);
  return root;
}
