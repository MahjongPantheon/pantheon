// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { expect, it, vi } from 'vitest';
import { Isomorphic } from './isomorphic';
import { useIsomorphicState } from './useIsomorphicState';

it.each([false, 0, '', null])('renders preloaded %s without starting a request', (value) => {
  const effect = vi.fn();
  function Content() {
    const [data] = useIsomorphicState('Loading', 'event', effect, []);
    return <output>{JSON.stringify(data)}</output>;
  }
  expect(
    renderToString(
      <Isomorphic.Provider value={{ event: value }}>
        <Content />
      </Isomorphic.Provider>
    )
  ).toBe(renderToString(<output>{JSON.stringify(value)}</output>));
  expect(effect).not.toHaveBeenCalled();
});

it('reports a missing server loader instead of silently starting work during rendering', () => {
  function Content() {
    useIsomorphicState(null, 'missing', async () => 'value', []);
    return null;
  }
  expect(() => renderToString(<Content />)).toThrow('Missing SSR data loader for missing');
});
