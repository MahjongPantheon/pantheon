import { useCallback, useEffect, useState } from 'react';

export function useSizeObserver(containerRef: HTMLDivElement | null) {
  const [size, setSize] = useState<[number | undefined, number | undefined]>([
    undefined,
    undefined,
  ]);

  const updateSize = useCallback((e: ResizeObserverEntry[]) => {
    const { width, height } = e[0].contentRect;

    setSize([width, height]);
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateSize);

    if (containerRef) {
      resizeObserver.observe(containerRef);
    }

    return () => {
      if (containerRef) {
        resizeObserver.unobserve(containerRef);
      }
    };
  }, [containerRef]);

  return size;
}
