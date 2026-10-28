/*  Sigrun: rating tables and statistics frontend
 *  Copyright (C) 2023  o.klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { useState, useContext, useEffect, DependencyList } from 'react';
import { Isomorphic } from './isomorphic';
import { nprogress } from '@mantine/nprogress';

// Note: there should be no nested calls to useIsomorphicState. The render cycle happens only twice:
// 1) Collect isomorphic state effects,
// 2) Render components using settled data from isomorphic state effects.
// Caveats:
// - If a component depending on some data fetched with useIsomorphicState on upper level, tries to use
// useIsomorphicState itself, it won't work on server and will lead to hydration error.
// - If you try to use return value of useIsomorphicState as an argument for another useIsomorphicState,
// it won't work on server and will lead to hydration error.
export const useIsomorphicState = <I, R, E extends Error>(
  initial: I,
  key: string,
  effect: () => Promise<R>,
  dependencies?: DependencyList,
  options?: { retainDataFor: string }
) => {
  const context = useContext(Isomorphic) as Record<string, any> & {
    requests: any[];
    __running: number;
  };
  const retainDataFor = options?.retainDataFor;
  const hasData = Object.prototype.hasOwnProperty.call(context, key);
  const [state, setState] = useState(() => ({
    key,
    retainDataFor,
    data: hasData ? context[key] : initial,
    error: context[key + '__err'] ?? null,
    loading: false,
  }));
  if (context.requests) {
    context.requests.push(
      effect()
        .then((res) => (context[key] = res))
        .catch((err: E) => (context[key + '__err'] = err))
    );
  }
  useEffect(() => {
    let cancelled = false;
    if (Object.prototype.hasOwnProperty.call(context, key)) {
      setState({ key, retainDataFor, data: context[key], error: null, loading: false });
      return;
    }
    setState((previous) => ({
      key,
      retainDataFor,
      data:
        retainDataFor !== undefined && previous.retainDataFor === retainDataFor
          ? previous.data
          : initial,
      error: null,
      loading: true,
    }));
    context.__running = (context.__running ?? 0) + 1;
    if (context.__running === 1) {
      nprogress.reset();
      nprogress.start();
    }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      context.__running--;
      if (context.__running === 0) nprogress.complete();
    };
    effect()
      .then((data) => {
        if (!cancelled) setState({ key, retainDataFor, data, error: null, loading: false });
      })
      .catch((error: E) => {
        if (!cancelled) setState({ key, retainDataFor, data: initial, error, loading: false });
      })
      .finally(finish);
    return () => {
      cancelled = true;
      finish();
    };
  }, dependencies);
  // Keep pagination content mounted during loading, but never carry data across
  // unrelated routes (for example, games belonging to a different event).
  const pendingData =
    retainDataFor !== undefined && state.retainDataFor === retainDataFor ? state.data : initial;
  return (
    state.key === key
      ? [state.data, state.error, state.loading]
      : [hasData ? context[key] : pendingData, context[key + '__err'] ?? null, !hasData]
  ) as [R | undefined, E | null, boolean];
};
