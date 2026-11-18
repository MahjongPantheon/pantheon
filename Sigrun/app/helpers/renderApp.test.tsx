import { act, useState } from 'react';
import { renderToString } from 'react-dom/server';
import type { Root } from 'react-dom/client';
import { fireEvent } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { renderApp } from './renderApp';

let container: HTMLDivElement;
let root: Root;
const errors = vi.fn((event: ErrorEvent) => event.preventDefault());

function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>Games: {count}</button>;
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  errors.mockClear();
  window.addEventListener('error', errors);
});

afterEach(async () => {
  await act(async () => root?.unmount());
  container.remove();
  window.removeEventListener('error', errors);
});

it('renders the precached PWA shell without attempting to hydrate its empty root', async () => {
  container.innerHTML = '<!--app-html-->';
  await act(async () => {
    root = renderApp(container, <App />, false);
  });
  const button = container.querySelector('button')!;
  expect(button.textContent).toBe('Games: 0');
  fireEvent.click(button);
  expect(button.textContent).toBe('Games: 1');
  expect(errors).not.toHaveBeenCalled();
});

it('hydrates an SSR response and keeps its existing elements interactive', async () => {
  container.innerHTML = renderToString(<App />);
  const button = container.querySelector('button')!;
  await act(async () => {
    root = renderApp(container, <App />, true);
  });
  expect(container.querySelector('button')).toBe(button);
  fireEvent.click(button);
  expect(button.textContent).toBe('Games: 1');
  expect(errors).not.toHaveBeenCalled();
});
