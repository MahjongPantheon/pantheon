import { useState, useContext, useEffect, DependencyList } from 'react';
import { Isomorphic } from './isomorphic';

// Note: there should be no nested calls to useIsomorphicState. The render cycle happens only twice:
// 1) Collect isomorphic state effects,
// 2) Render components using settled data from isomorphic state effects.
// If a component depending on some data fetched with useIsomorphicState on upper level, tries to use
// useIsomorphicState itself, it won't work.
export const useIsomorphicState = <I, R, E extends Error>(
  initial: I,
  key: string,
  effect: () => Promise<R>,
  dependencies?: DependencyList
) => {
  const context = useContext(Isomorphic) as Record<string, any> & { requests: any[] };
  const [data, setData] = useState(context[key] || initial);
  const [error, setError] = useState(context[key + '__err'] || null);
  if (context.requests) {
    context.requests.push(
      effect()
        .then((res) => (context[key] = res))
        .catch((err: E) => (context[key + '__err'] = err))
    );
  }
  useEffect(() => {
    if (context[key]) {
      setData(context[key]);
    } else {
      effect()
        .then((res) => {
          setData(res);
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, dependencies);
  return [data, error] as [R, E | null];
};
