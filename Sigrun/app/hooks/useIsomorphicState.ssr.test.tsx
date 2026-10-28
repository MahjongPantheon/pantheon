// @vitest-environment node
import { renderToString } from 'react-dom/server';
import { expect, it } from 'vitest';
import { Isomorphic } from './isomorphic';
import { useIsomorphicState } from './useIsomorphicState';

it.each([false, 0, '', null])('preserves %s across the two server render passes', async (value) => {
  const context: Record<string, unknown> & { requests?: Promise<unknown>[] } = { requests: [] };
  function Content() {
    const [data] = useIsomorphicState('Loading', 'event', async () => value, []);
    return <output>{JSON.stringify(data)}</output>;
  }
  const render = () =>
    renderToString(
      <Isomorphic.Provider value={context}>
        <Content />
      </Isomorphic.Provider>
    );
  render();
  await Promise.all(context.requests!);
  delete context.requests;
  expect(render()).toBe(renderToString(<output>{JSON.stringify(value)}</output>));
});
