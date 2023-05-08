import { useState, useContext } from 'react';
import { Isomorphic } from './isomorphic';

export const useIsomorphicState = <I, R>(initial: I, key: string, effect: () => Promise<R>) => {
  const context = useContext(Isomorphic) as Record<string, any> & { requests: any[] };
  const [data, setData] = useState(context[key] || initial);
  if (context.requests) {
    context.requests.push(effect().then((res) => (context[key] = res)));
  }
  return [data, setData] as [R, (newData: R) => void];
};
